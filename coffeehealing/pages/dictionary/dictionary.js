Page({
  data: {
    brandList: [
      { name: '星巴克', icon: '/images/星巴克.png', page: '/pages/dictionary/xingbake/xingbake' },
      { name: '瑞幸', icon: '/images/瑞幸.png', page: '/pages/dictionary/ruixing/ruixing' },
      { name: '库迪', icon: '/images/库迪.png', page: '/pages/dictionary/kudi/kudi' },
      { name: '霸王茶姬', icon: '/images/霸王茶姬.png', page: '/pages/dictionary/bawang/bawang' },
      { name: '茶百道', icon: '/images/茶百道.png', page: '/pages/dictionary/chabaidao/chabaidao' },
      { name: '古茗', icon: '/images/古茗.png', page: '/pages/dictionary/guming/guming' },
      { name: '喜茶', icon: '/images/喜茶.png', page: '/pages/dictionary/xicha/xicha', isLast: true }
    ]
  },

  // 自定义饮品跳转
  toCustomDrink() {
    wx.navigateTo({
      url: '/pages/dictionary/choose/choose'
    });
  },

  // 通用品牌跳转
  onBrandTap(e) {
    const pageUrl = e.currentTarget.dataset.page;
    if (pageUrl) {
      wx.navigateTo({ url: pageUrl });
    }
  }
});
