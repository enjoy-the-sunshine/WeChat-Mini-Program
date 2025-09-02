// pages/register/register.js
const db = require('../../service/db.js');

Page({
  data: {
    phone: '',
    password: '',
    password2: '',
    isAgree: false
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

  onAgreeChange(e) {
    this.setData({ isAgree: e.detail.value.length > 0 });
  },
  

  async onRegister() {
    if (!this.data.phone) {
      return wx.showToast({ title: '请输入手机号', icon: 'none' });
    }
    if (!this.data.password) {
      return wx.showToast({ title: '请输入密码', icon: 'none' });
    }
    if (!this.data.isAgree) {
      return wx.showToast({ title: '请先同意协议', icon: 'none' });
    }
    if (this.data.password !== this.data.password2) {
      return wx.showToast({ title: '两次密码不一致', icon: 'none' });
    }

    try {
      wx.showLoading({ title: '注册中...' });
      const { user, profile } = await db.registerWithPhone(this.data.phone, this.data.password, {
        display_name: '新用户',             // 对应数据库 display_name
        phone_contact: this.data.phone,    // 对应数据库 phone_contact
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