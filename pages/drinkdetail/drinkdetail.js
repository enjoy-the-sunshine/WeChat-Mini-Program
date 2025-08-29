const caffeineBaseMap = {
  '大杯': 250,
  '中杯': 200,
  '小杯': 150
};
Page({
  data: {
    cupSize: null, // 选择的杯型
    caffeineAmount: 0, // 示例数据
    showModal: false,
    currentCup: '',
    amount: '',
    drinkTime: ''
  },

  // 选择杯型
  selectCup(e) {
    const size = e.currentTarget.dataset.size;
    this.setData({ cupSize: size }, () => {
      this.updateCaffeineAmount();
    });
  },

  

  // 显示输入弹窗
  showInputModal(e) {
    const size = e.currentTarget.dataset.size;
    this.setData({
      showModal: true,
      currentCup: size,
      cupSize: size, // 让 updateCaffeineAmount 可用
      amount: this.data.amount || 100 // 默认100%
    }, () => {
      this.updateCaffeineAmount();
    });
  },
  

  // 关闭弹窗
  closeModal() {
    this.setData({ showModal: false, amount: '' });
  },

  // 输入饮用量
  onAmountInput(e) {
    this.setData({ amount: e.detail.value }, () => {
      this.updateCaffeineAmount();
    });
  },

  // 计算咖啡因方法
  updateCaffeineAmount() {
    const baseCaffeine = caffeineBaseMap[this.data.cupSize] || 0;
    const amountRatio = Number(this.data.amount) / 100; // 百分比
    const actualCaffeine = Math.round(baseCaffeine * amountRatio);
    this.setData({ caffeineAmount: actualCaffeine });
  },

  // 饮用时间输入
  onTimeInput(e) {
    this.setData({ drinkTime: e.detail.value });
  },
  // 确认饮用量
  // 只负责保存百分比并更新咖啡因，不跳转
  confirmAmount() {
    this.updateCaffeineAmount();
    this.closeModal();
  },



  
  goBackToCaffeine() {
    const t = new Date();
    const dateString = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  
    const record = {
      name: this.data.drinkName || '未知饮品',
      caffeine: this.data.caffeineAmount || 0,
      time: this.data.drinkTime || `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`,
      date: dateString
    };
  
    wx.setStorageSync('newDrinkRecord', record);
  
    wx.reLaunch({
      url: '/pages/caffeine/caffeine'
    });
  },
  
  onLoad(options) {
    if (options.name) {
      this.setData({ drinkName: decodeURIComponent(options.name) });
    }
  },
  saveRecord() {
    if (!this.data.name || !this.data.caffeine) {
      wx.showToast({ title: '请填写完整', icon: 'none' });
      return;
    }
  
    const record = {
      name: this.data.name,
      caffeine: this.data.caffeine,
      date: this.data.date,
      time: this.data.time
    };
  
    // 取已有的全部数据
    let allData = wx.getStorageSync('drinkRecords') || {};
    // 取当天已有的
    let recordsForDate = allData[this.data.date] || [];
  
    recordsForDate.push(record); // 添加新记录
    allData[this.data.date] = recordsForDate; // 回写
  
    wx.setStorageSync('drinkRecords', allData);
  
    wx.showToast({ title: '保存成功' });
    wx.navigateBack();
  }
  
  

  

});

