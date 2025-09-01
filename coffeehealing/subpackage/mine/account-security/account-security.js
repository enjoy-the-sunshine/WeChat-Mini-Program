Page({
  data: {
    modalVisible: false,
    modalTitle: '',
    modalInput: '',
    currentItem: '',
    phoneNumber: '', // Store the phone number
    weChatId: '', // Store the WeChat ID
  },

  showModal(event) {
    const item = event.currentTarget.dataset.item;
    let title = '';

    switch (item) {
      case '手机号':
        title = '请输入手机号';
        this.setData({ currentItem: '手机号', modalInput: this.data.phoneNumber });
        break;
      case 'weChatId':
        title = '请输入微信号';
        this.setData({ currentItem: 'weChatId', modalInput: this.data.weChatId });
        break;
      // Other cases...
    }

    this.setData({
      modalVisible: true,
      modalTitle: title
    });
  },

  hideModal() {
    this.setData({
      modalVisible: false
    });
  },

  updateInput(e) {
    this.setData({
      modalInput: e.detail.value
    });
  },

  confirmModal() {
    const { currentItem, modalInput } = this.data;

    if (currentItem === '手机号') {
      this.setData({
        phoneNumber: modalInput
      });
    } else if (currentItem === 'weChatId') {
      this.setData({
        weChatId: modalInput
      });
    }

    wx.showToast({
      title: '信息已更新',
      icon: 'success'
    });

    this.hideModal();
  }
});
