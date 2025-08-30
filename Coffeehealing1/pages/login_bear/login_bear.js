// pages/login_bear/login_bear.js
Page({
  data: {
    bearName: ''
  },

  onLoad: function (options) {
    // 页面加载时的初始化
  },

  // 输入框内容变化
  onNameInput(e) {
    this.setData({
      bearName: e.detail.value
    });
  },

  // 确认按钮点击
  onConfirm() {
    const name = this.data.bearName.trim();
    
    if (!name) {
      wx.showToast({
        title: '请输入小熊的名字',
        icon: 'none'
      });
      return;
    }

    // 保存小熊名字到本地存储
    wx.setStorageSync('bearName', name);
    
    wx.showToast({
      title: '设置成功',
      icon: 'success'
    });

    // 延迟跳转到添加咖啡页面（临时）
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/add1_choice/add1_choice'
      });
    }, 1500);
  },

  // 跳过按钮点击
  onSkip() {
    // 设置默认名字为"不困熊"
    const defaultName = '不困熊';
    
    // 保存默认名字到本地存储
    wx.setStorageSync('bearName', defaultName);
    
    wx.showToast({
      title: '已设置默认名字',
      icon: 'success'
    });

    // 延迟跳转到添加咖啡页面（临时）
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/add1_choice/add1_choice'
      });
    }, 1500);
  },

  // 临时跳转到添加咖啡页面
  goToAddChoice() {
    wx.navigateTo({
      url: '/pages/add1_choice/add1_choice'
    });
  }
});
