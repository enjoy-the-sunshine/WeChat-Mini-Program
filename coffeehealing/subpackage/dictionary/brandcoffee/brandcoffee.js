// pages/dictionary/brandcoffee/brandcoffee.js
Page({
  data: {
    brand: '',
    coffeeData: [], // 和 WXML 名称对应
    showModal: false,
    currentModal: {}
  },

  onLoad(options) {
    const brand = decodeURIComponent(options.brand || '');
    this.setData({ brand });

    const brandData = {
      '星巴克': [
        {
          name: '美式',
          isSelected: false,
          modal: {
            title: '美式',
            selectedIndex: -1,
            items: [
              { type: '小杯', volume: '237ml', caffeine: '75mg', isActive: false },
              { type: '中杯', volume: '355ml', caffeine: '150mg', isActive: false }
            ]
          }
        },
        {
          name: '冷萃',
          isSelected: false,
          modal: {
            title: '冷萃',
            selectedIndex: -1,
            items: [
              { type: '中杯', volume: '355ml', caffeine: '155mg', isActive: false },
              { type: '大杯', volume: '473ml', caffeine: '205mg', isActive: false }
            ]
          }
        }
        // TODO: 这里添加你所有的星巴克饮品数据
      ],
      '瑞幸': [
        // TODO: 完整的瑞幸饮品数据
      ],
      '库迪': [
        // TODO: 完整的库迪饮品数据
      ],
      '霸王茶姬': [
        // TODO: 完整的霸王茶姬饮品数据
      ],
      '喜茶': [
        // TODO: 完整的喜茶饮品数据
      ]
    };

    const list = brandData[brand] || [];
    this.setData({ coffeeData: list });

    wx.setNavigationBarTitle({ title: brand });
  },

  // 点击列表项显示弹窗
  handleItemTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.coffeeData[index];

    this.setData({
      showModal: true,
      currentModal: JSON.parse(JSON.stringify(item.modal)) // 深拷贝防止引用污染
    });
  },

  // 选择杯型
  selectCupType(e) {
    const idx = e.currentTarget.dataset.index;
    const modal = this.data.currentModal;

    modal.items.forEach((it, i) => {
      it.isActive = i === idx;
    });
    modal.selectedIndex = idx;

    this.setData({ currentModal: modal });
  },

  // 确认选择
  confirmSelection() {
    this.setData({ showModal: false });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showModal: false });
  }
});
