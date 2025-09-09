// subpackage/mine/xxx/xxx.js  // 修正：
// 分包页面
const AV = require('../../../libs/av-core-min');
const db = require('../../../service/db');


const PLACEHOLDER = '待填写';

Page({
  data: {
    modalVisible: false,
    modalTitle: '',
    modalInput: '',
    currentItem: '',

    // 展示数据
    phoneNumber: PLACEHOLDER,  // 显示手机号
    weChatId: PLACEHOLDER      // 显示微信号
  },

  /* 进入页面：读/建档并填充 */
  async onLoad() {
    try {
      const user = await AV.User.currentAsync();
      if (!user) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      const prof = await db.getOrCreateUserProfile(user.id, {});
      this.setData({
        phoneNumber: prof.phone_contact || PLACEHOLDER,
        weChatId: prof.wechat_id || PLACEHOLDER
      });
    } catch (e) {
      console.error('加载档案失败', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /* 打开编辑弹窗 */
  showModal(event) {
    const item = event.currentTarget.dataset.item; // “手机号” 或 “微信号”
    let title = '';
    let current = '';

    switch (item) {
      case '手机号':
        title = '请输入手机号';
        current = '手机号';
        this.setData({ modalInput: this.data.phoneNumber === PLACEHOLDER ? '' : this.data.phoneNumber });
        break;
      case '微信号':
      case 'weChatId': // 兼容你之前写法
        title = '请输入微信号';
        current = '微信号';
        this.setData({ modalInput: this.data.weChatId === PLACEHOLDER ? '' : this.data.weChatId });
        break;
      default:
        return;
    }

    this.setData({
      currentItem: current,
      modalTitle: title,
      modalVisible: true
    });
  },

  hideModal() {
    this.setData({ modalVisible: false, modalInput: '' });
  },

  updateInput(e) {
    this.setData({ modalInput: e.detail.value });
  },

  /* 点击“确认”提交到 LeanCloud 并更新本地 */
  async confirmModal() {
    const { currentItem } = this.data;
    const val = String((this.data.modalInput || '')).trim();
    if (!currentItem) return this.hideModal();
    if (!val) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    // 简单校验：手机号可只做长度/数字校验；有更复杂的可以自己替换
    if (currentItem === '手机号') {
      const onlyDigits = /^\d{6,20}$/; // 宽松：6-20位数字
      if (!onlyDigits.test(val)) {
        wx.showToast({ title: '手机号格式不正确', icon: 'none' });
        return;
      }
    }

    try {
      const user = await AV.User.currentAsync();
      if (!user) throw new Error('未登录');

      // 构造 patch
      let patch = {};
      if (currentItem === '手机号') {
        patch = { phone_contact: val };
      } else if (currentItem === '微信号') {
        patch = { wechat_id: val };
      }

      await db.updateUserProfile(user.id, patch);

      // 同步本地 UI
      if (currentItem === '手机号') {
        this.setData({ phoneNumber: val });
      } else {
        this.setData({ weChatId: val });
      }

      wx.showToast({ title: '信息已更新', icon: 'success' });
      this.hideModal();
    } catch (e) {
      console.error('保存失败', e);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  }
});