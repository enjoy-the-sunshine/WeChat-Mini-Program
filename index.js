Page({
  data: {
    starbucksBadge: true, // 控制星巴克徽章显示，根据需求动态修改
  },
  // 自定义饮品跳转（需补充实际页面路径）
  toCustomDrink() {
    wx.navigateTo({
      url: '/pages/choose/choose',
    });
  },
  // 星巴克跳转（需补充实际页面路径）
  toStarbucks() {
    wx.navigateTo({
      url: '/pages/xingbake/xingbake',
    });
  },
  // 瑞幸跳转（需补充实际页面路径）
  toLuckin() {
    wx.navigateTo({
      url: '/pages/ruixing/ruixing',
    });
  },
  // 库迪跳转（需补充实际页面路径）
  toKudi() {
    wx.navigateTo({
      url: '/pages/kudi/kudi',
    });
  },
  // 霸王茶姬跳转（需补充实际页面路径）
  toBawangChaji() {
    wx.navigateTo({
      url: '/pages/bawangChaji/bawangChaji',
    });
  },
  // 茶百道跳转（需补充实际页面路径）
  toChabaidao() {
    wx.navigateTo({
      url: '/pages/chabaidao/chabaidao',
    });
  },
  // 古茗跳转（需补充实际页面路径）
  toGuming() {
    wx.navigateTo({
      url: '/pages/guming/guming',
    });
  },
  // 喜茶跳转（需补充实际页面路径）
  toXicha() {
    wx.navigateTo({
      url: '/pages/xicha/xicha',
    });
  },
  // 底部导航跳转
  toHome() {
    wx.switchTab({
      url: '/pages/home/home',
    });
  },
  toCoffeeRecord() {
    wx.switchTab({
      url: '/pages/coffeeRecord/coffeeRecord',
    });
  },
  toMy() {
    wx.switchTab({
      url: '/pages/my/my',
    });
  },
  onLoad() {
    // 页面加载逻辑可扩展
  },
});