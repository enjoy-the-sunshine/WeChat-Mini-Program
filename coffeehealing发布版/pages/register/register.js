// pages/register/register.js
const db = require('../../service/db.js');
import AV from '../../libs/av-core-min.js'; // ✅ 确保引入 LeanCloud SDK

Page({
  data: {
    account: '',
    password: '',
    password2: '',
    isAgree: false,
    showPassword: false,
    showConfirmPassword: false,
    canSubmit: false
  },

  updateCanSubmit() {
    const { account, password, password2, isAgree } = this.data;
    const ok = String(account || '').trim().length > 0
            && String(password || '').length > 0
            && String(password2 || '').length > 0
            && !!isAgree;
    this.setData({ canSubmit: ok });
  },

  onAccountInput(e) {
    this.setData({ account: e.detail.value }, this.updateCanSubmit);
  },
  onPwdInput(e) {
    this.setData({ password: e.detail.value }, this.updateCanSubmit);
  },
  onPwd2Input(e) {
    this.setData({ password2: e.detail.value }, this.updateCanSubmit);
  },

  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },
  toggleConfirmPassword() {
    this.setData({ showConfirmPassword: !this.data.showConfirmPassword });
  },

  onAgreeChange(e) {
    this.setData({ isAgree: e.detail.value.length > 0 }, this.updateCanSubmit);
  },

  async onRegister() {
    const { account, password, password2, isAgree } = this.data;

    if (!String(account).trim()) {
      return wx.showToast({ title: '请输入账号', icon: 'none' });
    }
    if (!password) {
      return wx.showToast({ title: '请输入密码', icon: 'none' });
    }
    if (password !== password2) {
      return wx.showToast({ title: '两次密码不一致', icon: 'none' });
    }
    if (!isAgree) {
      return wx.showToast({ title: '请先同意协议', icon: 'none' });
    }

    try {
      wx.showLoading({ title: '注册中...' });

      const profileDefaults = {
        display_name: account,
        phone_contact: '',
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
      };

      // 注册
      const { user, profile } = await db.registerWithAccount(
        String(account).trim(),
        password,
        profileDefaults
      );

      // ✅ 保存 LeanCloud 登录态
      // 如果 registerWithAccount 已经让 LeanCloud 登录了，这里直接用 currentUser
      AV.User.become(user.sessionToken);

      // 本地缓存
      wx.setStorageSync('userId', user.objectId);
      wx.setStorageSync('profile', profile);

      wx.hideLoading();
      wx.showToast({ title: '注册成功，正在登录中...', icon: 'success' });

      // ✅ 注册完成后直接跳转到首页
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/questions/questions' }); // 这里改成你的首页路径
      }, 800);
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err?.message || '注册失败', icon: 'none' });
    }
  }
});
