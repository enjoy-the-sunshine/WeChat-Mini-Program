// pages/login_bear/login_bear.js
Page({
  data: {
    bearName: ''
  },

  onLoad() {
    console.log('login_bear 页面加载');
  },

  onNameInput(e) {
    this.setData({
      bearName: e.detail.value
    });
  },

  onConfirm() {
    const name = this.data.bearName.trim();
    if (!name) {
      wx.showToast({
        title: '请输入小熊的名字',
        icon: 'none'
      });
      return;
    }
    wx.setStorageSync('bearName', name);

    wx.showToast({
      title: '设置成功',
      icon: 'success'
    });

    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/questions/questions'
      });
    }, 1500);
  },

  onSkip() {
    const defaultName = '不困熊';
    wx.setStorageSync('bearName', defaultName);

    wx.showToast({
      title: '已设置默认名字',
      icon: 'success'
    });

    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/questions/questions'
      });
    }, 1500);
  }
});
