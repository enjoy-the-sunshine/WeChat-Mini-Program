// pages/login_phone/login_phone.js
Page({
  data: {
    isChecked: false,
    showPassword: false
  },

  // 密码可见/不可见切换
  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword })
  },

  // 登录按钮
  onLogin() {
    wx.showToast({ title: '手机号登录成功', icon: 'success' })
    
    // 延迟跳转到小熊命名页面
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/login_bear/login_bear'
      });
    }, 1500);
  },

  // 去注册
  onGoRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  }
})
