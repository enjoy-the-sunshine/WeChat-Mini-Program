// pages/login_wechat/login_wechat.js
Page({
  onLogin() {
    wx.showToast({
      title: '微信登录成功',
      icon: 'success'
    })
    
    // 延迟跳转到小熊命名页面
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/login_bear/login_bear'
      });
    }, 1500);
  }
})
