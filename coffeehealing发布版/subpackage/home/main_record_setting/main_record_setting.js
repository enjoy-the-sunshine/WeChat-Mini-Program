import AV from '../../../libs/av-core-min.js';
const db = require('../../../service/db.js');

const DEFAULTS = {
  sleepTime: '23:00',
  dailyLimit: 300,
  sleepCaffeine: 50
};

Page({
  data: {
    sleepTime: DEFAULTS.sleepTime,
    dailyLimit: DEFAULTS.dailyLimit,
    sleepCaffeine: DEFAULTS.sleepCaffeine,

    showPopup: false,    // 控制弹窗显示
    showSaveSuccess: false
  },

  onShow() {
    this.loadAllSettings();
  },

  async loadAllSettings() {
    const local = {
      sleepTime: wx.getStorageSync('sleepTime') || DEFAULTS.sleepTime,
      dailyLimit: Number(wx.getStorageSync('dailyLimit')) || DEFAULTS.dailyLimit,
      sleepCaffeine: Number(wx.getStorageSync('sleepCaffeine')) || DEFAULTS.sleepCaffeine
    };
    this.setData(local);

    try {
      const user = AV.User.current();
      if (!user) return;

      const p = await db.getProfile(user.id, { ensure: false });
      if (!p) return;

      const merged = {
        sleepTime: String(p.bedtime_target || local.sleepTime || DEFAULTS.sleepTime),
        dailyLimit: Number(p.daily_caffeine_limit_mg || local.dailyLimit || DEFAULTS.dailyLimit),
        sleepCaffeine: Number(p.bedtime_caffeine_threshold_mg || local.sleepCaffeine || DEFAULTS.sleepCaffeine)
      };

      if (!merged.sleepTime) merged.sleepTime = DEFAULTS.sleepTime;
      if (!Number.isFinite(merged.dailyLimit) || merged.dailyLimit <= 0) merged.dailyLimit = DEFAULTS.dailyLimit;
      if (!Number.isFinite(merged.sleepCaffeine) || merged.sleepCaffeine < 0) merged.sleepCaffeine = DEFAULTS.sleepCaffeine;

      this.setData(merged);

      wx.setStorageSync('sleepTime', merged.sleepTime);
      wx.setStorageSync('dailyLimit', merged.dailyLimit);
      wx.setStorageSync('sleepCaffeine', merged.sleepCaffeine);
    } catch (e) {
      console.warn('读取 user_profiles 失败', e);
    }
  },

  /* ====== 事件绑定 ====== */
  onChangeSleepTime(e) {
    this.setData({ sleepTime: e.detail.value || DEFAULTS.sleepTime });
  },
  onInputDailyLimit(e) {
    const n = Number(e.detail.value);
    this.setData({ dailyLimit: Number.isFinite(n) && n > 0 ? n : '' });
  },
  onInputSleepCaffeine(e) {
    const n = Number(e.detail.value);
    this.setData({ sleepCaffeine: Number.isFinite(n) && n >= 0 ? n : '' });
  },

  async saveSettings() {
    const { sleepTime, dailyLimit, sleepCaffeine } = this.data;

    if (!sleepTime || !Number.isFinite(Number(dailyLimit)) || !Number.isFinite(Number(sleepCaffeine))) {
      wx.showToast({ title: '请填写完整的设置', icon: 'none' });
      return;
    }

    wx.setStorageSync('sleepTime', sleepTime);
    wx.setStorageSync('dailyLimit', Number(dailyLimit));
    wx.setStorageSync('sleepCaffeine', Number(sleepCaffeine));

    try {
      const user = AV.User.current();
      if (user) {
        const patch = {
          bedtime_target: String(sleepTime),
          daily_caffeine_limit_mg: Number(dailyLimit),
          bedtime_caffeine_threshold_mg: Number(sleepCaffeine)
        };
        await db.updateUserProfile(user.id, patch);
      }
      this.setData({ showSaveSuccess: true });
      setTimeout(() => {
        this.setData({ showSaveSuccess: false });
        wx.navigateBack({ delta: 1 });
      }, 1200);
    } catch (e) {
      console.error('保存到 user_profiles 失败', e);
      wx.showToast({ title: '云端保存失败', icon: 'none' });
    }
  },

  /** 点击“恢复默认”按钮时调用 */
  showResetPopup() {
    this.setData({ showPopup: true });
  },

  /** 关闭弹窗 */
  closePopup() {
    this.setData({ showPopup: false });
  },

  /** 确认恢复默认 */
  async resetDefaults() {
    this.setData({
      sleepTime: DEFAULTS.sleepTime,
      dailyLimit: DEFAULTS.dailyLimit,
      sleepCaffeine: DEFAULTS.sleepCaffeine,
      showPopup: false
    });
    await this.saveSettings();
    wx.navigateBack({ delta: 1 });
  }
});
