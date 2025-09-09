// subpackage/mine/profile/profile.js

// 原来：const AV = require('../../libs/av-core-min');
// 修正：
const AV = require('../../../libs/av-core-min');

// 如果你之前写的是 ../../services/db 也会错（没有 services 目录）
// 修正：
const db = require('../../../service/db');

const PLACEHOLDER = '待填写';

Page({
  data: {
    // 展示用数据（进入页面后填充）
    avatar: '',                 // 头像 URL（或空串时用占位图）
    username: PLACEHOLDER,      // display_name
    height: PLACEHOLDER,        // height_cm
    weight: PLACEHOLDER,        // weight_kg
    age: PLACEHOLDER,           // age
    caffeineGoal: PLACEHOLDER,  // caffeine_template_key
    caffeineLevelBeforeSleep: PLACEHOLDER, // bedtime_caffeine_threshold_mg
    sleepTime: PLACEHOLDER,     // bedtime_target (HH:MM)

    // 弹窗状态
    modalVisible: false,
    modalTitle: '',
    modalType: '输入',
    modalInput: '',
    currentItem: '' // 'avatar'|'username'|'height'|'weight'|'age'|'caffeineGoal'|'caffeineLevelBeforeSleep'|'sleepTime'
  },

  /* ========== 生命周期：进入即加载/创建档案并填充 ========== */
  async onLoad() {
    await this.initProfile();
  },

  async initProfile() {
    try {
      const user = await AV.User.currentAsync();
      if (!user) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      // 若不存在则创建（符合 user: Pointer<_User> 规范）
      const prof = await db.getOrCreateUserProfile(user.id, {});
      this.fillFromProfile(prof);
    } catch (e) {
      console.error('初始化用户档案失败:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  fillFromProfile(prof) {
    // avatar 在 toJSON 后一般为 { url: '...' }；有时是 File 对象
    const avatarUrl =
      (prof.avatar && (prof.avatar.url || (prof.avatar.get && prof.avatar.get('url')))) || '';

    this.setData({
      avatar: avatarUrl || '',
      username: prof.display_name || PLACEHOLDER,
      height: prof.height_cm ?? PLACEHOLDER,
      weight: prof.weight_kg ?? PLACEHOLDER,
      age: prof.age ?? PLACEHOLDER,
      caffeineGoal: prof.caffeine_template_key || PLACEHOLDER,
      caffeineLevelBeforeSleep: prof.bedtime_caffeine_threshold_mg ?? PLACEHOLDER,
      sleepTime: prof.bedtime_target || PLACEHOLDER
    });
  },

  /* ========== 打开编辑：头像直接走上传，其它弹输入框 ========== */
  async showModal(event) {
    const item = event.currentTarget.dataset.item;
    switch (item) {
      case '头像':
        this.setData({ currentItem: 'avatar' });
        await this.onTapAvatar();
        return;

      case '用户名':
        this.setData({ currentItem: 'username', modalTitle: '请输入用户名', modalType: '输入', modalVisible: true, modalInput: '' });
        return;

      case '身高':
        this.setData({ currentItem: 'height', modalTitle: '请输入身高（cm）', modalType: '输入', modalVisible: true, modalInput: '' });
        return;

      case '体重':
        this.setData({ currentItem: 'weight', modalTitle: '请输入体重（kg）', modalType: '输入', modalVisible: true, modalInput: '' });
        return;

      case '年龄':
        this.setData({ currentItem: 'age', modalTitle: '请输入年龄（岁）', modalType: '输入', modalVisible: true, modalInput: '' });
        return;

      case '咖啡因摄入目标':
        this.setData({ currentItem: 'caffeineGoal', modalTitle: '请输入目标（可填模板键/备注）', modalType: '输入', modalVisible: true, modalInput: '' });
        return;

      case '睡前咖啡因水平':
        this.setData({ currentItem: 'caffeineLevelBeforeSleep', modalTitle: '请输入阈值（mg）', modalType: '输入', modalVisible: true, modalInput: '' });
        return;

      case '入睡时间':
      case '目标入睡时间':
        this.setData({ currentItem: 'sleepTime', modalTitle: '请输入目标入睡时间（如 23:30）', modalType: '输入', modalVisible: true, modalInput: '' });
        return;

      default:
        return;
    }
  },

  hideModal() {
    this.setData({ modalVisible: false, modalInput: '' });
  },

  updateInput(e) {
    this.setData({ modalInput: e.detail.value });
  },

  /* ========== 头像上传（微信相册/相机 → LeanCloud File） ========== */
  async onTapAvatar() {
    try {
      const choose = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      const path = choose.tempFilePaths[0];

      wx.showLoading({ title: '上传中…', mask: true });
      const user = await AV.User.currentAsync();
      if (!user) throw new Error('未登录');

      // 小程序 SDK：用 blob uri 方式
      const file = new AV.File(`avatar-${user.id}.png`, { blob: { uri: path } });
      await file.save();

      await db.updateUserProfile(user.id, { avatar: file });
      this.setData({ avatar: file.url() });
      wx.hideLoading();
      wx.showToast({ title: '头像已更新', icon: 'success' });
    } catch (e) {
      wx.hideLoading();
      console.error('上传头像失败:', e);
      wx.showToast({ title: '上传失败', icon: 'none' });
    }
  },

  /* ========== 确认保存：把输入映射为档案字段并写回 ========== */
  async confirmModal() {
    const { currentItem, modalInput } = this.data;
    if (!currentItem) return this.hideModal();

    const val = String((modalInput || '')).trim();
    if (!val) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    // 页面字段 → 档案字段映射
    let patch = {};
    switch (currentItem) {
      case 'username': patch = { display_name: val }; break;
      case 'height':   patch = { height_cm: Number(val) }; break;
      case 'weight':   patch = { weight_kg: Number(val) }; break;
      case 'age':      patch = { age: Number(val) }; break;
      case 'caffeineGoal': patch = { caffeine_template_key: val }; break;
      case 'caffeineLevelBeforeSleep': patch = { bedtime_caffeine_threshold_mg: Number(val) }; break;
      case 'sleepTime': patch = { bedtime_target: val }; break;
      default: break;
    }

    // 数值类校验
    const numKeys = ['height_cm', 'weight_kg', 'age', 'bedtime_caffeine_threshold_mg'];
    for (const k of Object.keys(patch)) {
      if (numKeys.includes(k) && !Number.isFinite(patch[k])) {
        wx.showToast({ title: '请输入有效数字', icon: 'none' });
        return;
      }
    }

    try {
      const user = await AV.User.currentAsync();
      if (!user) throw new Error('未登录');

      await db.updateUserProfile(user.id, patch);

      // 本地展示同步（空值显示“待填写”）
      const disp = {};
      if (currentItem === 'height' || currentItem === 'weight' || currentItem === 'age' || currentItem === 'caffeineLevelBeforeSleep') {
        disp[currentItem] = Number(val);
      } else {
        disp[currentItem] = val || PLACEHOLDER;
      }
      this.setData(disp);

      wx.showToast({ title: '已保存', icon: 'success' });
      this.hideModal();
    } catch (e) {
      console.error('保存档案失败:', e);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  }
});