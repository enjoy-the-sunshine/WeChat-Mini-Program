Page({
  data: {
    list: [
      { name: "美式", url: "/pages/gexinghua/gexinghua" },
      { name: "拿铁", url: "/pages/gexinghua/gexinghua" },
      { name: "摩卡", url: "/pages/gexinghua/gexinghua" },
      { name: "卡布奇诺", url: "/pages/gexinghua/gexinghua" },
      { name: "浓缩", url: "/pages/gexinghua/gexinghua" },
      { name: "自定义其他", url: "/pages/gexinghua/gexinghua" }
    ],
    filteredList: []
  },

  onLoad() {
    // 初始时显示全部列表
    this.setData({
      filteredList: this.data.list
    });
  },

  onSearchInput(e) {
    const inputValue = e.detail.value.trim();
    if (inputValue === "") {
      // 输入为空，显示全部列表
      this.setData({
        filteredList: this.data.list
      });
    } else {
      // 根据输入内容过滤列表
      const filtered = this.data.list.filter(item => 
        item.name.includes(inputValue)
      );
      this.setData({
        filteredList: filtered
      });
    }
  },

  // 新增：列表项点击跳转方法
  toDetailPage(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({
        url: url
      });
    }
  }
});
