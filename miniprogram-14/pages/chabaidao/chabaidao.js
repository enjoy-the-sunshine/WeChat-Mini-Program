Page({
  data: {
    coffeeData: 
      [
        {
          id: 145,
          name: "芋圆奶茶",
          isSelected: false,
          modal: {
          title: "芋圆奶茶",
          selectedIndex: -1,
          items: [
          {type: "中杯", volume: "500ml", caffeine: "119mg", isActive: false},
          { type: "大杯", volume: "650ml", caffeine: "154mg", isActive: false }
          ]
          }
          },
          {
          id: 146,
          name: "观音血糯米",
          isSelected: false,
          modal: {
          title: "观音血糯米",
          selectedIndex: -1,
          items: [
          { type: "中杯", volume: "500ml", caffeine: "93mg", isActive: false },
          { type: "大杯", volume: "650ml", caffeine: "120mg", isActive: false }
          ]
          }
          },
          {
          id: 147,
          name: "豆乳玉麒麟",
          isSelected: false,
          modal: {
          title: "豆乳玉麒麟",
          selectedIndex: -1,
          items: [
          { type: "中杯", volume: "500ml", caffeine: "65mg", isActive: false },
          { type: "大杯", volume: "650ml", caffeine: "84mg", isActive: false }
          ]
          }
          },
          {
          id: 148,
          name: "肉桂豆乳奶冻",
          isSelected: false,
          modal: {
          title: "肉桂豆乳奶冻",
          selectedIndex: -1,
          items: [
          { type: "中杯", volume: "500ml", caffeine: "86mg", isActive: false },
          { type: "大杯", volume: "650ml", caffeine: "112mg", isActive: false }
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
