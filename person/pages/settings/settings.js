Page({
  data: {
    modalVisible: false,
    modalTitle: "",
    modalInput: ""
  },

  navigateToAccountSecurity: function() {
        wx.navigateTo({
          url: '/pages/account-security/account-security'
        });
  },
  navigateToProfile: function() {
    wx.navigateTo({
      url: '/pages/profile/profile'
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
  }
});
