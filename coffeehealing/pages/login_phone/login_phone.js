// pages/login_phone/login_phone.js
const db = require('../../service/db.js');

Page({
  data: {
    phone: '',
    password: '',
    showPassword: false
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  onPwdInput(e) {
    this.setData({ password: e.detail.value });
  },

  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  async onLogin() {
    const { phone, password } = this.data;
    if (!phone || !password) {
      return wx.showToast({ title: '请输入手机号和密码', icon: 'none' });
    }

    try {
      wx.showLoading({ title: '登录中...' });
      const { user, profile } = await db.loginWithPhone(phone, password);

      wx.setStorageSync('userId', user.objectId);
      wx.setStorageSync('profile', profile);

      wx.hideLoading();
      wx.showToast({ title: '登录成功', icon: 'success' });

      setTimeout(() => {
        const bearName = wx.getStorageSync('bearName');
        const hasAnswered = wx.getStorageSync('hasCompletedQuestions');
        if (bearName && hasAnswered) {
          wx.switchTab({ url: '/pages/home/home' });
        } else {
          wx.navigateTo({ url: '/pages/login_bear/login_bear' });
        }
      }, 1000);

    } catch (err) {
      wx.hideLoading();
      // 根据 LeanCloud 错误码判断
      if (err.code === 211) {
        wx.showToast({ title: '手机号未注册', icon: 'none' });
      } else if (err.code === 210) {
        wx.showToast({ title: '密码错误', icon: 'none' });
      } else {
        wx.showToast({ title: err.message || '登录失败', icon: 'none' });
      }
    }
  }
});
