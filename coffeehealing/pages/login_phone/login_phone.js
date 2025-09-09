// pages/login_phone/login_phone.js
const db = require('../../service/db.js'); // 你说路径没问题，我保持不变

Page({
  data: {
    phone: '',
    password: '',
    showPassword: false // false 表示密码隐藏，true 表示可见
  },
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },
  onPwdInput(e) {
    this.setData({ password: e.detail.value });
  },
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },


  async onLogin() {
    // 去掉首尾空格
    const phone = (this.data.phone || '').trim();
    const password = (this.data.password || '').trim();

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
      // LeanCloud 错误码判断
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
