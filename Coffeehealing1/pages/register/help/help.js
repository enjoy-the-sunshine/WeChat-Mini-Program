// pages/register/help/help.js
Page({
  data: {
    
  },

  onLoad: function (options) {
    
  },

  onShow: function () {
    
  },

  // 复制邮箱
  copyEmail() {
    wx.setClipboardData({
      data: 'support@coffeehealing.com',
      success: function () {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        });
      }
    });
  },

  // 复制微信号
  copyWechat() {
    wx.setClipboardData({
      data: 'CoffeeHealing_Support',
      success: function () {
        wx.showToast({
          title: '微信号已复制',
          icon: 'success'
        });
      }
    });
  }
});
