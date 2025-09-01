Page({
  data: {
    coffeeData: 
      [
        {
          id: 1,
          name: "古茗奶茶",
          isSelected: false,
          modal: {
            title: "古茗奶茶",
            selectedIndex: -1,
            items: [
              { type: "中杯", volume: "500ml", caffeine: "99mg", isActive: false },
              { type: "大杯", volume: "630ml", caffeine: "125mg", isActive: false }
            ]
          }
        },
        {
          id: 2,
          name: "古茗桃气乌龙",
          isSelected: false,
          modal: {
            title: "古茗桃气乌龙",
            selectedIndex: -1,
            items: [
              { type: "中杯", volume: "500ml", caffeine: "75mg", isActive: false },
              { type: "大杯", volume: "630ml", caffeine: "95mg", isActive: false }
            ]
          }
        },
        {
          id: 3,
          name: "生椰拿铁冰激凌",
          isSelected: false,
          modal: {
            title: "生椰拿铁冰激凌",
            selectedIndex: -1,
            items: [
              { type: "中杯", volume: "500ml", caffeine: "147mg", isActive: false },
              { type: "大杯", volume: "630ml", caffeine: "185mg", isActive: false }
            ]
          }
        }
      ],
          
    showModal: false,
    currentModal: {}
  },

  handleItemTap(e) {
    const index = e.currentTarget.dataset.index;
    const selectedCoffee = this.data.coffeeData[index];

    // 重置所有咖啡的选中状态
    const updatedList = this.data.coffeeData.map((item, i) => {
      item.isSelected = i === index;
      return item;
    });

    this.setData({
      coffeeData: updatedList,
      currentModal: selectedCoffee.modal,
      showModal: true
    });
  },

  selectCupType(e) {
    const index = e.currentTarget.dataset.index;
    const title = this.data.currentModal.title;
    
    // 找到当前操作的咖啡项
    const coffeeIndex = this.data.coffeeData.findIndex(item => item.modal.title === title);
    if (coffeeIndex !== -1) {
      // 更新当前咖啡项的杯型选中状态
      const updatedCoffeeData = [...this.data.coffeeData];
      updatedCoffeeData[coffeeIndex].modal.items.forEach((item, i) => {
        item.isActive = i === index;
      });
      
      // 更新选中索引
      updatedCoffeeData[coffeeIndex].modal.selectedIndex = index;
      
      // 更新数据
      this.setData({
        coffeeData: updatedCoffeeData,
        currentModal: updatedCoffeeData[coffeeIndex].modal
      });
    }
  },

  closeModal() {
    this.setData({
      showModal: false
    });
  },

  confirmSelection() {
    const { title, selectedIndex, items } = this.data.currentModal;
    if (selectedIndex === -1) {
      wx.showToast({
        title: "请选择一个杯型",
        icon: "none"
      });
      return;
    }
    const selectedCup = items[selectedIndex];
    wx.showToast({
      title: `已选择${title}的${selectedCup.type}杯型`,
      icon: "none"
    });
    this.closeModal();
  },

  toHome() { /* 跳转首页逻辑 */ },
  toCoffeeRecord() { /* 跳转咖啡记录逻辑 */ },
  toMy() { /* 跳转我的逻辑 */ }
});
