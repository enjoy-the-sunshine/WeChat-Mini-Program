// pages/register/register.js
const db = require('../../service/db.js');

Page({
  data: {
    phone: '',
    password: '',
    password2: '',
    isAgree: false,
    showPassword: false
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  onPwdInput(e) {
    this.setData({ password: e.detail.value });
  },

  onPwd2Input(e) {
    this.setData({ password2: e.detail.value });
  },

  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  onAgreeChange(e) {
    this.setData({ isAgree: e.detail.value.length > 0 });
  },

  // 新增：检测手机号是否已注册
  async checkPhoneRegistered(phone) {
    try {
      const res = await db.queryUserByPhone(phone); // 需要在 db.js 里实现这个方法
      // 如果查到了记录，就说明已注册
      return res && res.length > 0;
    } catch (err) {
      console.error('检测手机号失败', err);
      return false;
    }
  },

  async onRegister() {
    const { phone, password, password2, isAgree } = this.data;

    if (!phone.trim()) {
      return wx.showToast({ title: '请输入手机号', icon: 'none' });
    }
    if (!password) {
      return wx.showToast({ title: '请输入密码', icon: 'none' });
    }
    if (!isAgree) {
      return wx.showToast({ title: '请先同意协议', icon: 'none' });
    }
    if (password !== password2) {
      return wx.showToast({ title: '两次密码不一致', icon: 'none' });
    }

    // 检测手机号是否注册
    const exists = await this.checkPhoneRegistered(phone);
    if (exists) {
      return wx.showToast({ title: '手机号已注册', icon: 'none' });
    }

    try {
      wx.showLoading({ title: '注册中...' });
      const { user, profile } = await db.registerWithPhone(phone, password, {
        display_name: '新用户',
        phone_contact: phone,
        height_cm: null,
        weight_kg: null,
        age: null,
        caffeine_template_key: '',
        bedtime_caffeine_threshold_mg: null,
        bedtime_target: '',
        bear_style: {},
        onboarding_answers1: null,
        onboarding_answers2: null,
        onboarding_answers3: null,
        onboarding_answers4: null,
        onboarding_answers5: null
      });

      wx.setStorageSync('userId', user.objectId);
      wx.setStorageSync('profile', profile);

      wx.hideLoading();
      wx.showToast({ title: '注册成功', icon: 'success' });

      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '注册失败', icon: 'none' });
    }
  }
});
