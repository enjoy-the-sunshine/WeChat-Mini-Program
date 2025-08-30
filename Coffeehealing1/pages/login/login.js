// pages/login/login.js
Page({
  data: {
  isAgree: false // 默认未勾选
  },

  onAgreeChange(e) {
    // checkbox-group 的返回是已选中 value 的数组
    const isChecked = Array.isArray(e.detail?.value) && e.detail.value.length > 0;
    this.setData({ isAgree: isChecked });
    },

  // 微信登录跳转
  onWechatLogin() {
    if (!this.data.isAgree) {
    wx.showToast({
    title: '请先同意协议',
    icon: 'none'
    });
    return;
    }
    wx.navigateTo({
    url: '/pages/login_wechat/login_wechat'
    });
    },

  // 手机号登录跳转
  onPhoneLogin() {
    if (!this.data.isAgree) {
    wx.showToast({
    title: '请先同意协议',
    icon: 'none'
    });
    return;
    }
    wx.navigateTo({
    url: '/pages/login_phone/login_phone'
    });
    },

  // 打开用户协议
  openUserAgreement() {
    wx.navigateTo({
      url: '/pages/protocol/user/user'
    });
  },

  // 打开隐私政策
  openPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/protocol/privacy/privacy'
    });
  }
});
