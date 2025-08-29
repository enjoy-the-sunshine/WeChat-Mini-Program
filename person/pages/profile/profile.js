Page({
  data: {
    modalVisible: false,
    modalTitle: '',
    modalInput: '',
    currentItem: '',
    // 添加相应的数据属性以用于更新
    avatar: '',        // 可存储头像URL或标识符
    username: '',
    height: '',
    weight: '',
    age: '',
    caffeineGoal: '',
    caffeineLevelBeforeSleep: '',
    sleepTime: ''
  },
  
  showModal(event) {
    const item = event.currentTarget.dataset.item;
    let title = '';
    let type = '';
    
    switch (item) {
      case '头像':
        title = '请选择头像';
        type = '头像';
        this.setData({ currentItem: 'avatar' });
        break;
      case '用户名':
        title = '请输入用户名';
        type = '输入';
        this.setData({ currentItem: 'username' });
        break;
      case '身高':
        title = '请输入身高';
        type = '输入';
        this.setData({ currentItem: 'height' });
        break;
      case '体重':
        title = '请输入体重';
        type = '输入';
        this.setData({ currentItem: 'weight' });
        break;
      case '年龄':
        title = '请输入年龄';
        type = '输入';
        this.setData({ currentItem: 'age' });
        break;
      case '咖啡因摄入目标':
        title = '请输入咖啡因摄入目标';
        type = '输入';
        this.setData({ currentItem: 'caffeineGoal' });
        break;
      case '睡前咖啡因水平':
        title = '请输入睡前咖啡因水平';
        type = '输入';
        this.setData({ currentItem: 'caffeineLevelBeforeSleep' });
        break;
      case '入睡时间':
        title = '请输入目标入睡时间';
        type = '输入';
        this.setData({ currentItem: 'sleepTime' });
        break;
    }
    
    this.setData({
      modalVisible: true,
      modalTitle: title,
      modalType: type,
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
    // 利用 currentItem 更新具体的值
    const { currentItem, modalInput } = this.data;
    if (currentItem) {
      const update = {};
      update[currentItem] = modalInput;
      this.setData(update);
      console.log(`确认修改 ${currentItem} 为 ${modalInput}`);
    }
    this.hideModal();
  }
});
