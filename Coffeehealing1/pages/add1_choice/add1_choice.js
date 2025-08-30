// pages/add1_choice/add1_choice.js
Page({
  data: {
    // 页面数据
    selectedCup: '', // 选中的杯型
    drinkingTime: '', // 饮用时间
    caffeineContent: 117, // 咖啡因含量（mg）
    
    // 弹窗相关
    showModal: false,
    percentageInput: '',
    percentageSlider: 100,
    currentCupType: '', // 当前操作的杯型
    
    // 杯型对应的默认咖啡因含量
    cupCaffeineMap: {
      large: 180, // 大杯默认180mg
      medium: 117, // 中杯默认117mg
      small: 80   // 小杯默认80mg
    }
  },

  onLoad: function (options) {
    // 页面加载时的初始化
    this.setData({
      caffeineContent: this.data.cupCaffeineMap.medium // 默认显示中杯的咖啡因含量
    });
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  // 选择杯型
  selectCup: function(e) {
    const cupType = e.currentTarget.dataset.type;
    this.setData({
      selectedCup: cupType,
      caffeineContent: this.data.cupCaffeineMap[cupType]
    });
    
    // 显示选择提示
    wx.showToast({
      title: `已选择${this.getCupName(cupType)}`,
      icon: 'success',
      duration: 1500
    });
  },

  // 获取杯型中文名称
  getCupName: function(cupType) {
    const nameMap = {
      large: '大杯',
      medium: '中杯',
      small: '小杯'
    };
    return nameMap[cupType] || '';
  },

  // 显示百分比输入弹窗
  showPercentageModal: function(e) {
    const cupType = e.currentTarget.dataset.type;
    this.setData({
      showModal: true,
      currentCupType: cupType,
      percentageInput: '100',
      percentageSlider: 100
    });
  },

  // 隐藏弹窗
  hideModal: function() {
    this.setData({
      showModal: false,
      percentageInput: '',
      percentageSlider: 100
    });
  },

  // 阻止事件冒泡
  stopPropagation: function() {
    // 空函数，用于阻止事件冒泡
  },

  // 百分比输入框变化
  onPercentageInput: function(e) {
    let value = parseInt(e.detail.value) || 0;
    
    // 限制输入范围
    if (value > 100) value = 100;
    if (value < 0) value = 0;
    
    this.setData({
      percentageInput: value.toString(),
      percentageSlider: value
    });
  },

  // 滑块变化
  onSliderChange: function(e) {
    const value = e.detail.value;
    this.setData({
      percentageSlider: value,
      percentageInput: value.toString()
    });
  },

  // 确认百分比
  confirmPercentage: function() {
    const percentage = parseInt(this.data.percentageInput) || 0;
    
    if (percentage < 0 || percentage > 100) {
      wx.showToast({
        title: '请输入0-100之间的数值',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 根据百分比调整咖啡因含量
    const baseCaffeine = this.data.cupCaffeineMap[this.data.currentCupType];
    const adjustedCaffeine = Math.round(baseCaffeine * percentage / 100);
    
    this.setData({
      selectedCup: this.data.currentCupType,
      caffeineContent: adjustedCaffeine,
      showModal: false
    });

    wx.showToast({
      title: `已设置${percentage}%`,
      icon: 'success',
      duration: 1500
    });
  },

  // 时间选择变化
  onTimeChange: function(e) {
    this.setData({
      drinkingTime: e.detail.value
    });
  },

  // 添加咖啡
  addCoffee: function() {
    // 验证必填项
    if (!this.data.selectedCup) {
      wx.showToast({
        title: '请选择杯型',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (!this.data.drinkingTime) {
      wx.showToast({
        title: '请选择饮用时间',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 构建咖啡数据
    const coffeeData = {
      cupType: this.data.selectedCup,
      cupName: this.getCupName(this.data.selectedCup),
      drinkingTime: this.data.drinkingTime,
      caffeineContent: this.data.caffeineContent,
      addTime: new Date().toLocaleString(),
      percentage: this.data.percentageSlider
    };

    // 这里可以将数据保存到本地存储或发送到服务器
    this.saveCoffeeData(coffeeData);

    // 显示成功提示
    wx.showToast({
      title: '添加成功！',
      icon: 'success',
      duration: 2000
    });

    // 延迟返回上一页
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      });
    }, 2000);
  },

  // 保存咖啡数据
  saveCoffeeData: function(coffeeData) {
    try {
      // 获取现有的咖啡记录
      let coffeeRecords = wx.getStorageSync('coffeeRecords') || [];
      
      // 添加新记录
      coffeeRecords.push(coffeeData);
      
      // 保存到本地存储
      wx.setStorageSync('coffeeRecords', coffeeRecords);
      
      console.log('咖啡数据已保存:', coffeeData);
    } catch (error) {
      console.error('保存咖啡数据失败:', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 页面显示
  onShow: function() {
    // 页面显示时的逻辑
  },

  // 页面隐藏
  onHide: function() {
    // 页面隐藏时的逻辑
  },

  // 页面卸载
  onUnload: function() {
    // 页面卸载时的清理工作
  }
});
