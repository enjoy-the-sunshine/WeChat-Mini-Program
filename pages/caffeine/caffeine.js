// pages/caffeine/caffeine.js
Page({
  data: {
    currentYear: 2025,
    currentMonth: 8,
    days: [],
    selectedDate: '',
    selectedDateDisplay: '',
    selectedWeekday: '',
    totalCaffeine: 0,

    // 当日咖啡记录数组
    drinkRecords: [],

    // 编辑弹窗绑定
    editIndex: null,
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
  
    // 下个月补位 → 从 1 开始
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

    // 不生成随机数据，初始为空
    this.setData({
      selectedDate: date,
      selectedDateDisplay: date,
      selectedWeekday: weekday,
      drinkRecords: [],
      totalCaffeine: 0
    });
  },


  /** 默认选中今天 */
  setToday() {
    const t = new Date();
    const dateString = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    this.selectDate({ currentTarget: { dataset: { date: dateString } } });
  },
// 保存数据
  saveRecordsForDate(date, records) {
    const allRecords = wx.getStorageSync('caffeineRecords') || {};
    allRecords[date] = records;
    wx.setStorageSync('caffeineRecords', allRecords);
  },

  // 读取数据
  loadRecordsForDate(date) {
    const allRecords = wx.getStorageSync('caffeineRecords') || {};
    return allRecords[date] || [];
  },

  /** 弹窗打开关闭 */
  openEditPopup(e) {
    this.setData({ editIndex: e.currentTarget.dataset.index, showEditPopup: true });
  },
  closeEditPopup() {
    this.setData({ showEditPopup: false });
  },
  stopTap() {},

  /** 弹窗输入绑定 */
  onDrinkNameInput(e) {
    this.setData({ [`drinkRecords[${this.data.editIndex}].name`]: e.detail.value });
  },
  onDrinkDateInput(e) {
    this.setData({ [`drinkRecords[${this.data.editIndex}].date`]: e.detail.value });
  },
  onDrinkTimeInput(e) {
    this.setData({ [`drinkRecords[${this.data.editIndex}].time`]: e.detail.value });
  },
  onCaffeineInput(e) {
    this.setData({ [`drinkRecords[${this.data.editIndex}].caffeine`]: Number(e.detail.value) });
  },

  /** 删除记录 */
  onDeleteRecord() {
    const idx = this.data.editIndex;
    wx.showModal({
      title: '提示',
      content: '确定要删除此记录吗？',
      success: (res) => {
        if (res.confirm) {
          const updated = [...this.data.drinkRecords];
          updated.splice(idx, 1);
          const totalCaffeine = updated.reduce((sum, r) => sum + r.caffeine, 0);
          this.setData({ drinkRecords: updated, totalCaffeine, showEditPopup: false });
        }
      }
    });
  },
  goToBrandSelect(){
    wx.navigateTo({
      url: '/pages/brandselect/brandselect'
    });
  },
  onShow() {
    const newRecord = wx.getStorageSync('newDrinkRecord');
    if (newRecord) {
      if (newRecord.date === this.data.selectedDate) {
        const updatedRecords = [...this.data.drinkRecords, newRecord];
        const totalCaffeine = updatedRecords.reduce((sum, r) => sum + r.caffeine, 0);
        this.setData({
          drinkRecords: updatedRecords,
          totalCaffeine
        });
      }
      wx.removeStorageSync('newDrinkRecord'); // 用完清除
    }
  },
  fetchDrinkRecords(date) {
    const allData = wx.getStorageSync('drinkRecords') || {};
    const list = allData[date] || [];
  
    this.setData({ drinkRecords: list });
    this.updateTotalCaffeine(list);
  }
  
  

});

