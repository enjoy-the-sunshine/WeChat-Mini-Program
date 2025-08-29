Page({
  data: {
    keyword: '',
    coffeeList: [
      { name: '美式' },
      { name: '拿铁' },
      { name: '意式浓缩' },
      { name: '摩卡' },
      { name: '卡布奇诺' },
      { name: '白咖啡' },
      { name: '浓缩玛奇朵' },
      { name: '焦糖玛奇朵' },
      { name: '榛果玛奇朵' },
      { name: '法式焦糖拿铁' },
      { name: '熔岩巧克力拿铁' },
      { name: '肉桂拿铁' },
      {name: ' 提拉米苏拿铁 '},
      { name: ' 烟熏奶油糖拿铁 ' },
      { name: ' 烤全麦拿铁 ' },
      { name: ' 海盐焦糖摩卡 ' },
      { name: ' 薄荷摩卡 ' },
      { name: ' 白巧克力摩卡 ' },
      { name: ' 康宝蓝 ' },
      { name: ' 热巧克力 ' },
      { name: ' 白巧克力 ' },
      { name: ' 茶瓦那格雷伯爵红茶拿铁 ' },
      { name: ' 茶瓦那绿茶拿铁 ' },
      { name: ' 茶瓦那皇家英式早餐拿铁 ' },
      { name: ' 茶瓦那格雷伯爵红茶 ' },
      { name: ' 茶瓦那帝王云雾 ' },
      { name: ' 冰拿铁 ' },
      { name: ' 冰美式咖啡 ' },
      { name: ' 冰卡布奇诺 ' },
      { name: ' 冷萃咖啡 ' },
      { name: ' 甄选冷萃咖啡 ' },
      { name: ' 氮气拿铁 ' },
      { name: ' 氮气冷翠咖啡 ' },
      { name: ' 星冰乐 ' },
      { name: ' 浓缩咖啡星冰乐 ' },
      { name: ' 香草星冰乐 ' },
      { name: ' 焦糖星冰乐 ' },
      { name: ' 摩卡星冰乐 ' }
    ],
    filteredList: []
  },

  onLoad() {
    this.setData({ filteredList: this.data.coffeeList });
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    const filtered = this.data.coffeeList.filter(item => item.name.includes(keyword));
    this.setData({ keyword, filteredList: filtered });
  },
  gotoDrinkDetail(e) {
    const name = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: `/pages/drinkdetail/drinkdetail?name=${encodeURIComponent(name)}`
    });
  }  
  
});
