Page({
  data: {
    brandList: [
      { name: '星巴克', icon: '/images/星巴克.png' },
      { name: '瑞幸', icon: '/images/瑞幸.png' },
      { name: '库迪', icon: '/images/库迪.png' },
      { name: '霸王茶姬', icon: '/images/霸王茶姬.png' },
      { name: '茶百道', icon: '/images/茶百道.png' },
      { name: '古茗', icon: '/images/古茗.png' },
      { name: '喜茶', icon: '/images/喜茶.png', isLast: true }
    ],

    // 品牌数据直接放这里
    brandData: {
      星巴克: [
        {
          id: 1,
          name: "星巴克 茶瓦那帝王云雾",
          isSelected: false,
          modal: {
            title: "星巴克 茶瓦那帝王云雾",
            selectedIndex: -1,
            items: [
              { type: "小杯", volume: "237ml", caffeine: "0.15mg", isActive: false },
              { type: "中杯", volume: "355ml", caffeine: "0.15mg", isActive: false },
              { type: "大杯", volume: "473ml", caffeine: "15-25mg", isActive: false },
              { type: "超大杯", volume: "592ml", caffeine: "15-25mg", isActive: false }
            ]
          }
        },
        // ... 这里继续放 xingbake.js 里的其他数据
      ],
      瑞幸: [
        // 这里放瑞幸的咖啡数据
      ],
      // 其他品牌...
    }
  },

  toCustomDrink() {
    wx.navigateTo({
      url: '/pages/recording/userdefined/userdefined'
    });
  },

  onBrandTap(e) {
    const brand = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: `/pages/dictionary/brandcoffee/brandcoffee?brand=${encodeURIComponent(brand)}`
    });
  }
});
