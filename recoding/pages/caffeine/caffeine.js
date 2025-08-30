// pages/caffeine/caffeine.js
// pages/caffeine/caffeine.js
const AV = require('../../libs/av-core-min.js');
require('../../libs/leancloud-adapters-weapp.js');

Page({
  data: {
    currentYear: 2025,
    currentMonth: 8,
    days: [],
    selectedDate: '',
    selectedDateDisplay: '',
    selectedWeekday: '',
    totalCaffeine: 0,
    drinkRecords: [],
    editIndex: null,
    editRecord: {},  // 新增：保存当前编辑的记录
    showEditPopup: false
  },
  

  onLoad() {
    this.generateCalendar(this.data.currentYear, this.data.currentMonth);
    this.setToday();
  },

  /** 生成日历数据 */
  generateCalendar(year, month) {
    const days = [];
    const firstDay = new Date(year, month - 1, 1).getDay();
    const lastDate = new Date(year, month, 0).getDate();

    // 上个月补位
    let prevLastDate = new Date(year, month - 1, 0).getDate();
    for (let i = firstDay; i > 0; i--) {
      days.push({ date: prevLastDate - i + 1, isCurrentMonth: false, dateString: '' });
    }

    // 当月日期
    for (let i = 1; i <= lastDate; i++) {
      const dateString = `${year}-${month < 10 ? '0' + month : month}-${i < 10 ? '0' + i : i}`;
      days.push({ date: i, isCurrentMonth: true, dateString });
    }

    // 下个月补位
    let nextMonthDay = 1;
    while (days.length % 7 !== 0) {
      days.push({ date: nextMonthDay++, isCurrentMonth: false, dateString: '' });
    }

    this.setData({ days });
  },

  /** 切换月份 */
  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 1) { currentMonth = 12; currentYear--; } else { currentMonth--; }
    this.setData({ currentYear, currentMonth });
    this.generateCalendar(currentYear, currentMonth);
  },
  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 12) { currentMonth = 1; currentYear++; } else { currentMonth++; }
    this.setData({ currentYear, currentMonth });
    this.generateCalendar(currentYear, currentMonth);
  },

  /** 点击日期 */
  selectDate(e) {
    const date = e.currentTarget.dataset.date;
    if (!date) return;

    const weekMap = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekMap[new Date(date).getDay()];

    this.setData({
      selectedDate: date,
      selectedDateDisplay: date,
      selectedWeekday: weekday
    });

    this.fetchDrinkRecords(date);
  },

  /** 默认选中今天 */
  setToday() {
    const t = new Date();
    const dateString = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    this.selectDate({ currentTarget: { dataset: { date: dateString } } });
  },

  /** 弹窗 */
  openEditPopup(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.drinkRecords[index];
    if (!record) return;
  
    this.setData({
      editIndex: index,
      editRecord: {
        ...record,
        date: this.data.selectedDate  // 直接赋值当前选中日期
      },
      showEditPopup: true
    });
  },
  

  closeEditPopup() {
    this.setData({ showEditPopup: false });
  },
  stopTap() {},

  /** 编辑绑定 */
  onDrinkNameInput(e) {
    this.setData({ [`drinkRecords[${this.data.editIndex}].name`]: e.detail.value });
  },
  onDrinkTimeInput(e) {
    this.setData({ [`drinkRecords[${this.data.editIndex}].time`]: e.detail.value });
  },
  onCaffeineInput(e) {
    this.setData({ [`drinkRecords[${this.data.editIndex}].caffeine`]: Number(e.detail.value) });
  },
  onDrinkDateInput(e) {
    const newDate = e.detail.value;
    this.setData({ [`drinkRecords[${this.data.editIndex}].date`]: newDate });
  
    if (newDate !== this.data.selectedDate) {
      // 从当前日期列表移除
      const updated = this.data.drinkRecords.filter((_, i) => i !== this.data.editIndex);
      this.setData({ drinkRecords: updated });
    }
  },
  onDrinkTimeChange(e) {
    const newTime = e.detail.value;
    this.setData({
      'editRecord.time': newTime  // 改 editRecord 里的值
    });
  },
  onDrinkDateChange(e) {
    const newDate = e.detail.value;
    this.setData({
      'editRecord.date': newDate
    });
  },
  

  /** 软删除记录（本地屏蔽） */
  onDeleteRecord() {
    const idx = this.data.editIndex;
    const record = this.data.drinkRecords[idx];
    if (!record || !record.objectId) return;

    wx.showModal({
      title: '提示',
      content: '确定要删除此记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 本地维护已删除ID
          let deletedIds = wx.getStorageSync('deletedIntakeIds') || [];
          if (!deletedIds.includes(record.objectId)) {
            deletedIds.push(record.objectId);
            wx.setStorageSync('deletedIntakeIds', deletedIds);
          }
          // 从当前列表移除
          const updated = this.data.drinkRecords.filter(r => r.objectId !== record.objectId);
          const totalCaffeine = updated.reduce((sum, r) => sum + (Number(r.caffeine) || 0), 0);
          this.setData({ drinkRecords: updated, totalCaffeine, showEditPopup: false });
        }
      }
    });
  },

  /** 跳转品牌选择 */
  goToBrandSelect() {
    wx.navigateTo({ url: '/pages/brandselect/brandselect' });
  },

  /** 页面显示时刷新当前选中日期 */
  onShow() {
    if (this.data.selectedDate) {
      this.fetchDrinkRecords(this.data.selectedDate);
    }
  },

  /** 拉取记录（过滤本地已删除ID） */
  fetchDrinkRecords(dateString) {
    const AV = require('../../libs/av-core-min.js');
    require('../../libs/leancloud-adapters-weapp.js');

    const dateOnly = new Date(`${dateString}T00:00:00`);
    const deletedIds = wx.getStorageSync('deletedIntakeIds') || [];

    const query = new AV.Query('intakes');
    query.equalTo('takenAt', dateOnly);
    query.ascending('takenAt_time'); // 按时间顺序
    query.find().then(list => {
      let records = list.map(obj => ({
        objectId: obj.id,
        brand: obj.get('brand') || '',
        name: obj.get('product') || '',
        caffeine: obj.get('caffeine_total_mg') || 0,
        time: obj.get('takenAt_time') || ''
      }));
      // 过滤掉已删除记录
      records = records.filter(r => !deletedIds.includes(r.objectId));
      this.setData({ drinkRecords: records });
      this.updateTotalCaffeine(records);
    }).catch(err => {
      console.error('查询饮用记录失败：', err);
      this.setData({ drinkRecords: [], totalCaffeine: 0 });
    });
  },

  /** 更新总咖啡因 */
  updateTotalCaffeine(records) {
    const total = records.reduce((sum, r) => sum + (Number(r.caffeine) || 0), 0);
    this.setData({ totalCaffeine: total });
  },

  onSaveRecord() {
    const updated = this.data.editRecord;
    if (!updated || !updated.objectId) {
      wx.showToast({ title: '记录数据无效', icon: 'error' });
      return;
    }
  
    wx.showLoading({ title: '保存中...' });
  
    const query = new AV.Query('intakes');
    query.get(updated.objectId).then(intake => {
      const acl = intake.getACL() || new AV.ACL();
      acl.setPublicReadAccess(true);
      acl.setPublicWriteAccess(true);
      intake.setACL(acl);
  
      // 保证字段和查询一致
      intake.set('brand', updated.brand || '');
      intake.set('product', updated.name || '');
      intake.set('takenAt_time', updated.time || '');
      intake.set('takenAt', new Date(`${updated.date}T00:00:00`));
      intake.set('caffeine_total_mg', Number(updated.caffeine) || 0);
  
      return intake.save();
    }).then(() => {
      wx.hideLoading();
      wx.showToast({ title: '保存成功' });
      this.setData({ showEditPopup: false });
  
      // 重新拉取当天数据
      this.fetchDrinkRecords(this.data.selectedDate);
    }).catch(err => {
      wx.hideLoading();
      console.error('保存失败', err);
      wx.showToast({ title: '保存失败', icon: 'error' });
    });
  }  
  
  
  
  
});
