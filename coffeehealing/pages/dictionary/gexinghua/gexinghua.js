Page({
  data: {
    // 文档原有数据
    cupSizes: ['超大杯', '大杯', '中杯', '小杯'],
    cupSizeValue: '超大杯',
    // 新增：绑定输入/选择数据
    drinkName: '',       // 饮品名称
    caffeineContent: '', // 咖啡因含量
    sleepTime: ''        // 预计入睡时间
  },

  // 修复：文档原有杯型选择事件（原逻辑错误，需通过索引取真实值）
  onCupSizeChange(e) {
    const index = e.detail.value; // selector模式返回索引，非直接值
    this.setData({
      cupSizeValue: this.data.cupSizes[index]
    });
  },

  // 新增：饮品名称输入事件（绑定文档中的名称输入框）
  onNameInput(e) {
    this.setData({
      drinkName: e.detail.value
    });
  },

  // 新增：咖啡因含量输入事件（绑定文档中的咖啡因输入框）
  onCaffeineInput(e) {
    this.setData({
      caffeineContent: e.detail.value
    });
  },

  // 新增：入睡时间选择事件（绑定文档中的时间选择器）
  onSleepTimeChange(e) {
    this.setData({
      sleepTime: e.detail.value
    });
  },

  // 新增：确认按钮事件（含输入验证和数据保存）
  confirmSetting() {
    // 1. 输入验证（必填项：饮品名称）
    if (!this.data.drinkName.trim()) {
      wx.showToast({
        title: '请输入饮品名称',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 2. 整合所有数据（文档原有杯型 + 新增输入数据）
    const drinkData = {
      name: this.data.drinkName,
      cupSize: this.data.cupSizeValue,
      caffeine: this.data.caffeineContent || '未填写',
      sleepTime: this.data.sleepTime || '未选择',
      createTime: new Date().toLocaleString()
    };

    // 3. 保存数据（示例：存本地存储，可扩展为接口提交）
    wx.setStorageSync('savedDrink', drinkData);
    console.log('保存饮品设置：', drinkData);

    // 4. 保存成功提示
    wx.showToast({
      title: '设置已保存',
      icon: 'success',
      duration: 2000
    });
  },

  // 新增：取消按钮事件（返回上一页）
  cancelSetting() {
    wx.navigateBack({
      delta: 1 // 返回上一级页面
    });
  },

  // 文档原有方法：完全保留，不修改
  openIconPicker() {
    wx.showToast({
      title: '选择图标功能待实现',
      icon: 'none'
    })
  },
  openDetail() {
    wx.navigateTo({
      url: '/pages/detail/detail'
    })
  },
  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  },
  goLog() {
    wx.switchTab({ url: '/pages/log/log' })
  },
  goMine() {
    wx.switchTab({ url: '/pages/mine/mine' })
  }
})