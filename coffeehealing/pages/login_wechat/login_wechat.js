// pages/login_wechat/login_wechat.js
Page({
  onLogin() {
    wx.showToast({
      title: '微信登录成功',
      icon: 'success'
    })

    setTimeout(() => {
      const bearName = wx.getStorageSync('bearName');
      const hasAnswered = wx.getStorageSync('hasCompletedQuestions');

      if (bearName && hasAnswered) {
        // 已有名字并答过问卷 → 直接进首页
        wx.switchTab({
          url: '/pages/home/home'
        });
      } else {
        // 否则 → 先去命名页
        wx.navigateTo({
          url: '/pages/login_bear/login_bear'
        });
      }
    }, 1500);
  }
});
