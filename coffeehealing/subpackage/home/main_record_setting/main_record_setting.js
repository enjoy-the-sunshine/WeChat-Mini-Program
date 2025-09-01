Page({
  data: {
    sleepTime: '22:00',      // 入睡时间
    dailyLimit: 300,         // 每日咖啡因上限（毫克）
    sleepCaffeine: 50,       // 入睡时咖啡因水平（毫克）
    halfLife: 5,             // 咖啡因半衰期（小时）
    showPopup: false         // 恢复默认弹窗是否显示
  },

  // 选择入睡时间
  onChangeSleepTime(e) {
    this.setData({
      sleepTime: e.detail.value
    })
  },

  // 输入处理
  onInputDailyLimit(e) {
    this.setData({
      dailyLimit: e.detail.value
    })
  },
  onInputSleepCaffeine(e) {
    this.setData({
      sleepCaffeine: e.detail.value
    })
  },
  onInputHalfLife(e) {
    this.setData({
      halfLife: e.detail.value
    })
  },

  // 显示恢复默认弹窗
  showResetPopup() {
    this.setData({
      showPopup: true
    })
  },

  // 隐藏弹窗
  hideResetPopup() {
    this.setData({
      showPopup: false
    })
  },

  // 确认恢复默认值
  resetDefaults() {
    this.setData({
      sleepTime: '22:00',
      dailyLimit: 300,
      sleepCaffeine: 50,
      halfLife: 5,
      showPopup: false
    })
  }
})
