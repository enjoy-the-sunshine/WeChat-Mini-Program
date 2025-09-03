// pages/caffeine/caffeine.js
// pages/caffeine/caffeine.js
const AV = require('../../libs/av-core-min.js');
require('../../libs/leancloud-adapters-weapp.js');

Page({
  data: {
    currentYear: 2025,
    currentMonth: 9,
    days: [],
    selectedDate: '',
    selectedDateDisplay: '',
    selectedWeekday: '',
    totalCaffeine: 0,
    drinkRecords: [],
    displayDrinkRecords: [], // 新增：显示的记录（最新的3条）
    foldedDrinkRecords: [], // 新增：折叠的记录
    isExpanded: false, // 新增：是否展开
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
          // 重新处理折叠逻辑
          this.processRecordsForDisplay(updated);
        }
      }
    });
  },

  /** 跳转品牌选择 */
  goToBrandSelect() {
    wx.navigateTo({ url: '/subpackage/recording/brandselect/brandselect' });
  },
  /** 跳转状态记录 */
  goToRecordingState() {
    // 如果没有选中日期就用今天
    const selectedDate = this.data.selectedDate || new Date().toISOString().slice(0, 10);
    
    wx.navigateTo({
      url: `/subpackage/recording/recording_state/recording_state?date=${selectedDate}`
    });
  },
  

  /** 页面显示时刷新当前选中日期 */
  onShow() {
    // 检查是否有新添加的饮品记录
    const newDrinkRecord = wx.getStorageSync('newDrinkRecord')
    if (newDrinkRecord) {
      // 清除存储的记录
      wx.removeStorageSync('newDrinkRecord')
      
      // 如果新记录是今天的，刷新数据
      if (newDrinkRecord.date === this.data.selectedDate) {
        this.fetchDrinkRecords(this.data.selectedDate)
      }
    }
    
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

    // 先尝试从LeanCloud获取记录
    const query = new AV.Query('intakes');
    query.equalTo('takenAt', dateOnly);
    query.ascending('takenAt_time'); // 按时间顺序
    query.find().then(list => {
      let records = list.map(obj => ({
        objectId: obj.id,
        brand: obj.get('brand') || '',
        name: obj.get('product') || '',
        caffeine: obj.get('caffeine_total_mg') || 0,
        time: obj.get('takenAt_time') || '',
        isLocal: false
      }));
      // 过滤掉已删除记录
      records = records.filter(r => !deletedIds.includes(r.objectId));
      
      // 合并本地存储的记录
      const localRecords = this.getLocalRecordsForDate(dateString);
      const allRecords = [...records, ...localRecords];
      
      // 按时间排序
      allRecords.sort((a, b) => {
        const timeA = a.time || '';
        const timeB = b.time || '';
        return timeA.localeCompare(timeB);
      });
      
      this.setData({ drinkRecords: allRecords });
      this.updateTotalCaffeine(allRecords);
      // 处理折叠逻辑
      this.processRecordsForDisplay(allRecords);
    }).catch(err => {
      console.error('查询LeanCloud记录失败：', err);
      
      // 如果LeanCloud失败，尝试从本地存储获取记录
      const localRecords = this.getLocalRecordsForDate(dateString);
      this.setData({ drinkRecords: localRecords });
      this.updateTotalCaffeine(localRecords);
      this.processRecordsForDisplay(localRecords);
      
      // 显示网络错误提示
      if (localRecords.length === 0) {
        wx.showToast({ 
          title: '网络连接失败，仅显示本地记录', 
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /** 获取指定日期的本地记录 */
  getLocalRecordsForDate(dateString) {
    try {
      const localRecords = wx.getStorageSync('localDrinkRecords') || [];
      const deletedIds = wx.getStorageSync('deletedIntakeIds') || [];
      
      // 过滤出指定日期的记录，并排除已删除的
      return localRecords
        .filter(record => record.date === dateString && !deletedIds.includes(record.id))
        .map(record => ({
          objectId: record.id,
          brand: record.brand || '',
          name: record.name || '未知饮品',
          caffeine: record.caffeine || 0,
          time: record.time || '',
          isLocal: true
        }));
    } catch (e) {
      console.error('获取本地记录失败:', e);
      return [];
    }
  },

  /** 更新总咖啡因 */
  updateTotalCaffeine(records) {
    const total = records.reduce((sum, r) => sum + (Number(r.caffeine) || 0), 0);
    this.setData({ totalCaffeine: total });
  },

  /** 处理记录显示逻辑（新增） */
  processRecordsForDisplay(records) {
    console.log('处理记录显示逻辑，记录数量:', records.length); // 添加调试日志
    
    if (records.length <= 3) {
      // 如果记录少于等于3条，全部显示
      this.setData({
        displayDrinkRecords: records.map((record, index) => ({ ...record, originalIndex: index })),
        foldedDrinkRecords: [],
        isExpanded: false
      });
      console.log('记录少于等于3条，全部显示');
    } else {
      // 如果记录超过3条，显示最新的3条，其他折叠
      const displayRecords = records.slice(-3).map((record, index) => ({ 
        ...record, 
        originalIndex: records.length - 3 + index 
      }));
      const foldedRecords = records.slice(0, -3).map((record, index) => ({ 
        ...record, 
        originalIndex: index
      }));
      
      console.log('显示记录:', displayRecords.length, '折叠记录:', foldedRecords.length);
      
      this.setData({
        displayDrinkRecords: displayRecords,
        foldedDrinkRecords: foldedRecords,
        isExpanded: false
      });
    }
  },

  /** 切换记录展开/折叠状态（新增） */
  toggleRecords() {
    console.log('切换展开状态，当前状态:', this.data.isExpanded);
    const newExpandedState = !this.data.isExpanded;
    
    this.setData({
      isExpanded: newExpandedState
    });
    
    console.log('新状态:', newExpandedState);
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
