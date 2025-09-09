Page({
    data: {
      modalVisible: false,
      modalTitle: "",
      modalInput: ""
    },
  
    // 个人信息修改
    navigateToProfile() {
      wx.navigateTo({
        url: '/subpackage/mine/profile/profile'
      });
    },
  
    // 通知设置
    navigateToNotification() {
      wx.navigateTo({
        url: '/subpackage/mine/person_setting_message/person_setting_message'
      });
    },
  
    // ★ 退出登录
    onLogout() {
      // 如需清缓存，可打开下一行
      // wx.clearStorageSync();
      wx.reLaunch({ url: '/pages/login/login' });
    },
  
    updateInput(e) {
      this.setData({ modalInput: e.detail.value });
    },
  
    confirmModal() {
      // Confirm modal action
    },
  
    hideModal() {
      this.setData({ modalVisible: false });
    }
  });
  