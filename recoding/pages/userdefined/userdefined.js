Page({
  data: {
    keyword: '',
    drinkList: [
      
    ],
    filteredList: []
  },

  onLoad() {
    this.setData({ filteredList: this.data.drinkList });
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    const filtered = this.data.drinkList.filter(item => item.name.includes(keyword));
    this.setData({ keyword, filteredList: filtered });
  },

  onDrinkTap(e) {
    const drink = e.currentTarget.dataset.name;
    if (drink === '抹茶拿铁') {
      wx.navigateTo({
        url: '/pages/drinkdetail/drinkdetail'
      });
    }
  },

  onAddDrink() {
    wx.showToast({ title: '添加自定义饮品功能开发中', icon: 'none' });
  }
});
