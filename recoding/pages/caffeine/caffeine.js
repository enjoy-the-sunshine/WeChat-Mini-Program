// pages/caffeine/caffeine.js
Page({
  data: {
    currentYear: 2025,
    currentMonth: 8,
    days: [],
    selectedDate: '',
    selectedDateDisplay: '',
    selectedWeekday: '',
    totalCaffeine: 150, // 临时写死数据
    drinkName: '美式',
    drinkDate: '2025年8月25日',
    drinkTime: '9:24',
    caffeineAmount: '150'
  },

  onLoad() {
    this.generateCalendar(this.data.currentYear, this.data.currentMonth);
    this.setToday();
  },

  // 生成日历数据
  generateCalendar(year, month) {
    const days = [];
    const firstDay = new Date(year, month - 1, 1).getDay(); // 当月第一天是星期几
    const lastDate = new Date(year, month, 0).getDate(); // 当月的总天数
    const prevMonthDays = firstDay; // 前面需要补几个空位

    // 上月最后几天
    let prevLastDate = new Date(year, month - 1, 0).getDate();
    for (let i = prevMonthDays; i > 0; i--) {
      days.push({
        date: prevLastDate - i + 1,
        isCurrentMonth: false,
        dateString: ''
      });
    }

    // 当月日期
    for (let i = 1; i <= lastDate; i++) {
      const dateString = `${year}-${month < 10 ? '0' + month : month}-${i < 10 ? '0' + i : i}`;
      days.push({
        date: i,
        isCurrentMonth: true,
        dateString
      });
    }

    // 补下个月空位
    while (days.length % 7 !== 0) {
      days.push({
        date: days.length,
        isCurrentMonth: false,
        dateString: ''
      });
    }

    this.setData({ days });
  },

  // 上一月
  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 1) {
      currentMonth = 12;
      currentYear--;
    } else {
      currentMonth--;
    }
    this.setData({ currentYear, currentMonth });
    this.generateCalendar(currentYear, currentMonth);
  },

  // 下一月
  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 12) {
      currentMonth = 1;
      currentYear++;
    } else {
      currentMonth++;
    }
    this.setData({ currentYear, currentMonth });
    this.generateCalendar(currentYear, currentMonth);
  },

  // 选中日期
  selectDate(e) {
    const date = e.currentTarget.dataset.date;
    if (!date) return; // 空白位置不操作
    const weekMap = ['日', '一', '二', '三', '四', '五', '六'];
    const dateObj = new Date(date);
    const weekday = weekMap[dateObj.getDay()];
    this.setData({
      selectedDate: date,
      selectedDateDisplay: date,
      selectedWeekday: weekday
    });
    // 这里将来可以请求数据库获取该天的咖啡因数据
  },

  // 默认选中今天
  setToday() {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const dateString = `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
    const weekMap = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekMap[today.getDay()];
    this.setData({
      selectedDate: dateString,
      selectedDateDisplay: dateString,
      selectedWeekday: weekday
    });
  },
  // 编辑弹窗
  openEditPopup() {
    this.setData({ showEditPopup: true });
  },
  closeEditPopup() {
    this.setData({ showEditPopup: false });
  },
  stopTap() {},

  // 输入事件
  onDrinkNameInput(e) {
    this.setData({ drinkName: e.detail.value });
  },
  onDrinkDateInput(e) {
    this.setData({ drinkDate: e.detail.value });
  },
  onDrinkTimeInput(e) {
    this.setData({ drinkTime: e.detail.value });
  },
  onCaffeineInput(e) {
    this.setData({ caffeineAmount: e.detail.value });
  },

  // 删除记录
  onDeleteRecord() {
    wx.showModal({
      title: '提示',
      content: '确定要删除此记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 这里执行删除逻辑
          console.log('记录已删除');
          this.closeEditPopup();
        }
      }
    });
  }
  
});
