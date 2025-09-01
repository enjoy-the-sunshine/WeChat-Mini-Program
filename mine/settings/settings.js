Page({
  data: {
    modalVisible: false,
    modalTitle: "",
    modalInput: ""
  },

  navigateToAccountSecurity: function() {
        wx.navigateTo({
          url: '/pages/mine/account-security/account-security'
        });
  },
  navigateToProfile: function() {
    wx.navigateTo({
      url: '/pages/mine/profile/profile'
    });
},

  updateInput: function(e) {
    this.setData({
      modalInput: e.detail.value
    });
  },

  confirmModal: function() {
    // Confirm modal action
  },

  hideModal: function() {
    this.setData({
      modalVisible: false
    });
  },
  navigateToNotification: function() {
    wx.navigateTo({
      url: '/pages/mine/person_setting_message/person_setting_message'
    });
  },
  
});
