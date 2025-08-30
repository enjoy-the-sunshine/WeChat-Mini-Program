Page({
  data: {
    phone: '',
    password: '',
    password2: '',
    showPwd: false,
    showPwd2: false,
    agreed: false,
    showPassword: false,
    showConfirmPassword: false,
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

  togglePwd() {
    this.setData({ showPwd: !this.data.showPwd });
  },

  togglePwd2() {
    this.setData({ showPwd2: !this.data.showPwd2 });
  },

  onAgreeChange(e) {
    const isChecked = Array.isArray(e.detail?.value) && e.detail.value.length > 0;
    this.setData({ isAgree: isChecked });
    },

  onRegister() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先勾选协议', icon: 'none' });
      return;
    }
    if (!this.data.phone) {
      wx.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }
    if (!this.data.password || !this.data.password2) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    if (this.data.password !== this.data.password2) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }
    wx.showToast({ title: '注册成功', icon: 'success' });
  },

  goUserProtocol() {
    wx.navigateTo({ url: '/pages/protocol/user/user' });
  },

  goPrivacy() {
    wx.navigateTo({ url: '/pages/protocol/privacy/privacy' });
  },

  onHelp() {
    wx.showToast({ title: '请联系管理员', icon: 'none' });
  },

  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  toggleConfirmPassword() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword
    });
  },

  onAgreeChange(e) {
    this.setData({
      isAgree: e.detail.value
    });
  },

  onRegister() {
    if (!this.data.isAgree) {
      wx.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none'
      });
      return;
    }
    
    wx.showToast({
      title: '注册成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  openUserAgreement() {
    wx.navigateTo({
      url: '/pages/protocol/user/user'
    });
  },

  openPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/protocol/privacy/privacy'
    });
  },

  onHelp() {
    wx.navigateTo({
      url: '/pages/register/help/help'
    });
  }
});
