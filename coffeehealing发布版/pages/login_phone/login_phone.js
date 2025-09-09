// pages/login_phone/login_phone.js
const db = require('../../service/db');

Page({
  data: {
    account: '',           // 账号/用户名
    password: '',
    showPassword: false,   // 小眼睛：明文/密文
    logging: false,        // 防重复提交
    canLogin: false        // 账号和密码均非空时为 true
  },

  onLoad() {
    // 进入页面时从缓存读取上次账号/密码
    const savedAccount = wx.getStorageSync('lastAccount') || '';
    const savedPassword = wx.getStorageSync('lastPassword') || '';
    this.setData({
      account: savedAccount,
      password: savedPassword,
      canLogin: savedAccount.trim().length > 0 && savedPassword.length > 0
    });
  },

  /* ==== 与 WXML 绑定的事件名保持一致 ==== */
  onAccountInput(e) { this.onAccountChange(e); },
  onPwdInput(e)     { this.onPwdChange(e);     },
  onLogin()         { this.onSubmitLogin();    },
  /* ====================================== */

  onAccountChange(e) {
    const account = String(e.detail.value || '');
    const pwd = String(this.data.password || '');
    this.setData({
      account,
      canLogin: account.trim().length > 0 && pwd.length > 0
    });
  },
  onPwdChange(e) {
    const pwd = String(e.detail.value || '');
    const account = String(this.data.account || '');
    this.setData({
      password: pwd,
      canLogin: account.trim().length > 0 && pwd.length > 0
    });
  },
  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  // 登录处理
  async onSubmitLogin() {
    if (this.data.logging) return;

    const acc = String(this.data.account || '').trim();
    const pwd = String(this.data.password || '');

    if (!acc || !pwd) {
      wx.showToast({ title: '请输入账号和密码', icon: 'none' });
      return;
    }

    this.setData({ logging: true });
    try {
      const resp = await db.loginWithAccount(acc, pwd);

      // ✅ 登录成功后保存账号和密码
      wx.setStorageSync('lastAccount', acc);
      wx.setStorageSync('lastPassword', pwd); // 如果担心安全，可不保存或加密

      const { user, profile } = resp;
      let p = profile;
      try {
        p = p || await db.getOrCreateUserProfile(user.objectId, {});
      } catch (_) {}

      if (db.isOnboardingCompleted(p)) {
        wx.switchTab({ url: '/pages/home/home' });
      } else if (!String((p && p.display_name) || '').trim()) {
        wx.redirectTo({ url: '/pages/login_bear/login_bear' });
      } else {
        wx.redirectTo({ url: '/pages/questions/questions' });
      }
    } catch (err) {
      console.error(err);
      wx.showToast({ title: err.message || '登录失败', icon: 'none' });
    } finally {
      this.setData({ logging: false });
    }
  }
});
