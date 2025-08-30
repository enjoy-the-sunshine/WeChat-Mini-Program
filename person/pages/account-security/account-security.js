Page({
  data: {
    modalVisible: false,
    modalTitle: '',
    modalInput: '',
    currentItem: '',
    oldPassword: 'yourOldPassword', // Set this to the actual old password
    newPassword: '',
    // Other data properties...
  },
  
  showModal(event) {
    const item = event.currentTarget.dataset.item;
    let title = '';
    
    switch (item) {
      case '旧密码':
        title = '请输入旧密码';
        this.setData({ currentItem: '旧密码' });
        break;
      case '新密码':
        title = '请输入新密码';
        this.setData({ currentItem: '新密码' });
        break;
      // Other cases...
    }
    
    this.setData({
      modalVisible: true,
      modalTitle: title,
      modalInput: ''
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
    const { currentItem, modalInput, oldPassword } = this.data;
    
    if (currentItem === '旧密码') {
      if (modalInput === oldPassword) {
        this.setData({
          modalTitle: '请输入新密码',
          currentItem: '新密码',
          modalInput: ''
        });
      } else {
        wx.showToast({
          title: '旧密码错误',
          icon: 'none'
        });
      }
    } else if (currentItem === '新密码') {
      this.setData({
        newPassword: modalInput
      });
      wx.showToast({
        title: '密码修改成功',
        icon: 'success'
      });
      this.hideModal();
    }
  }
});
