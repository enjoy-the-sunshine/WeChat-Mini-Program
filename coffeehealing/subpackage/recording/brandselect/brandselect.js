Page({
  data: {
    keyword: '',
    brandList: [
      { name: '最近',icon: '../images/最近浏览.png' },
      { name: '自定义',icon: '../images/自定义.png' },
      { name: '星巴克',icon: '../images/星巴克.png'},
      { name: '瑞幸',icon: '../images/瑞幸.png' },
      { name: '库迪',icon: '../images/库迪.png' },
      { name: '霸王茶姬',icon: '../images/霸王茶姬.png' },
      { name: '喜茶',icon: '../images/喜茶.png' }
    ],
    filteredList: []
  },

  onLoad() {
    this.setData({ filteredList: this.data.brandList });
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    const filtered = this.data.brandList.filter(item => item.name.includes(keyword));
    this.setData({ keyword, filteredList: filtered });
  },

  onBrandTap(e) {
    const brand = e.currentTarget.dataset.name;
    if (brand === '自定义') {
      wx.navigateTo({
        url: '/subpackage/recording/userdefined/userdefined'
      });
    } else {
      wx.navigateTo({
        url: `/subpackage/recording/brandcoffee/brandcoffee?brand=${encodeURIComponent(brand)}`
      });
    }
  }
  
});
