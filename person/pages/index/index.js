Page({
  data: {
    userInfo: {
      avatarUrl: '/images/avatar.png',
      nickname: '小熊123',
      level: '咖啡小白',
      pointsNeeded: 76
    },
  },

  // 跳转到个人资料页面
  navigateToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile',
    })
  },
  
  // 跳转到设置页面
  navigateToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings',
    })
  },
  
  // 跳转到问题反馈页面
  navigateToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback',
    })
  },
});
