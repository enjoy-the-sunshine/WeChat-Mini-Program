// pages/login/login.js
Page({
  data: {
    isAgree: false // 默认未勾选
  },

  onLoad() {
    // 检查本地是否有记录
    const savedAccount = wx.getStorageSync('lastAccount');
    const savedPassword = wx.getStorageSync('lastPassword');
    if (savedAccount && savedPassword) {
      // 自动勾选协议
      this.setData({ isAgree: true });

      // 延迟一下，避免页面还没准备好就导航
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login_phone/login_phone'
        });
      }, 300);
    }
  },

  onAgreeChange(e) {
    const isChecked = Array.isArray(e.detail?.value) && e.detail.value.length > 0;
    this.setData({ isAgree: isChecked });
  },

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

  openUserAgreement() {
    wx.navigateTo({
      url: '/pages/protocol/user/user'
    });
  },
  openPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/protocol/privacy/privacy'
    });
  }
});
