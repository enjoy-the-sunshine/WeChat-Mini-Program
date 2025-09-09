// pages/login_bear/login_bear.js
const db = require('../../service/db');
const AV = require('../../libs/av-core-min');

Page({
  data: {
    bearName: ''
  },

  onNameInput(e) {
    this.setData({ bearName: e.detail.value });
  },

  async onConfirm() {
    const name = (this.data.bearName || '').trim();
    if (!name) {
      wx.showToast({ title: '请输入小熊名字', icon: 'none' });
      return;
    }
    const user = AV.User.current();
    if (!user) {
      wx.showToast({ title: '尚未登录', icon: 'none' });
      return;
    }
    try {
      await db.saveOnboarding(user.id, { bearName: name });
      wx.showToast({ title: '已保存', icon: 'success' });
      wx.navigateTo({ url: '/pages/questions/questions' });
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  onSkip() {
    wx.navigateTo({ url: '/pages/questions/questions' });
  }
});
