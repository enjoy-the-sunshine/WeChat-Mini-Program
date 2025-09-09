// subpackage/home/main_record/main_record.js
import AV from '../../../libs/av-core-min.js';
const db = require('../../../service/db.js');   // 用于读取 user_profiles

const HALF_LIFE = 5; // 半衰期（小时）

Page({
  data: {
    bodyCaffeine: 0,
    dailyCaffeine: 0,
    dailyLimit: 300,          // 将在 onShow 里通过 loadDailyLimit() 覆盖
    timer: '--:--',
    levelText: '',
    levelClass: '',
    fillHeightStr: '0%',
    progressWidthStr: '0%',
    vitalityEndTime: '--:--',
    vitalityProgress: '0%'
  },

  async onShow() {
    // 1) 先加载“每日咖啡因上限”（优先 user_profiles → 本地缓存 → 300）
    await this.loadDailyLimit();
    // 2) 再跑原有查询&计算
    this.fetchTodayIntakes();
  },

  // 读取每日上限
  async loadDailyLimit() {
    let limit = wx.getStorageSync('dailyLimit');
    if (!Number.isFinite(Number(limit)) || Number(limit) <= 0) {
      limit = 300;
    }

    try {
      const user = AV.User.current();
      if (user) {
        const profile = await db.getProfile(user.id, { ensure: false });
        const fromProfile = Number(profile && profile.daily_caffeine_limit_mg);
        if (Number.isFinite(fromProfile) && fromProfile > 0) {
          limit = fromProfile;
          wx.setStorageSync('dailyLimit', limit); // 同步缓存
        }
      }
    } catch (e) {
      console.warn('读取 user_profiles.daily_caffeine_limit_mg 失败，使用本地/默认值', e);
    }

    this.setData({ dailyLimit: Number(limit) });
  },

  async fetchTodayIntakes() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    const currentUser = AV.User.current();
    if (!currentUser) {
      console.warn('未登录用户，跳过查询');
      return;
    }

    const query = new AV.Query('intakes');
    query.equalTo('user', currentUser);
    query.greaterThanOrEqualTo('takenAt', startOfDay);
    query.lessThan('takenAt', endOfDay);
    query.ascending('takenAt');

    try {
      const results = await query.find();
      let totalCaffeine = 0;
      let caffeineNow = 0;

      results.forEach(item => {
        const amount = item.get('caffeine_total_mg') || 0;
        if (amount <= 0) return;

        let takenDate = item.get('takenAt');
        if (!(takenDate instanceof Date)) takenDate = new Date(takenDate);

        const timeStr = item.get('takenAt_time') || '00:00';
        const [hh, mm] = timeStr.split(':').map(n => parseInt(n, 10) || 0);

        const takenDateTime = new Date(
          takenDate.getFullYear(),
          takenDate.getMonth(),
          takenDate.getDate(),
          hh,
          mm
        );

        totalCaffeine += amount;
        const hoursPassed = (now - takenDateTime) / 3600000;
        const remaining = amount * Math.pow(0.5, hoursPassed / HALF_LIFE);
        if (remaining > 0) caffeineNow += remaining;
      });

      this.setData({
        dailyCaffeine: Math.round(totalCaffeine),
        bodyCaffeine: Math.round(caffeineNow)
      });

      this.updateLevel();
      this.updateProgressValues();
      this.updateVitalityInfo();

    } catch (err) {
      console.error('获取咖啡因数据失败', err);
    }
  },

  updateVitalityInfo() {
    const { bodyCaffeine, dailyLimit } = this.data;
    const VITALITY_THRESHOLD = 50; // 提神阈值 mg
    const now = new Date();

    if (bodyCaffeine <= 0) {
      this.setData({ timer: '--:--', vitalityEndTime: '--:--', vitalityProgress: '0%' });
      return;
    }

    // 降到阈值的剩余小时
    const hoursRemaining =
      (Math.log(VITALITY_THRESHOLD / bodyCaffeine) / Math.log(0.5)) * HALF_LIFE;

    if (hoursRemaining <= 0) {
      this.setData({ timer: '00:00', vitalityEndTime: '--:--' });
      return;
    }

    const endTime = new Date(now.getTime() + hoursRemaining * 3600000);
    const hh = endTime.getHours().toString().padStart(2, '0');
    const mm = endTime.getMinutes().toString().padStart(2, '0');

    // 倒计时
    const mins = Math.floor(hoursRemaining * 60);
    const timerStr =
      `${Math.floor(mins / 60).toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}`;

    // 进度条（当前咖啡因/每日上限）
    const vitalityPercent =
      Math.min((bodyCaffeine / dailyLimit) * 100, 100).toFixed(0) + '%';

    this.setData({
      timer: timerStr,
      vitalityEndTime: `${hh}:${mm}`,
      vitalityProgress: vitalityPercent
    });
  },

  updateLevel() {
    const caffeine = this.data.bodyCaffeine;
    let text = '低', cls = 'level-low';
    if (caffeine >= 100 && caffeine < 400) {
      text = '中';
      cls = 'level-mid';
    } else if (caffeine >= 400) {
      text = '高';
      cls = 'level-high';
    }
    this.setData({ levelText: text, levelClass: cls });
  },

  updateProgressValues() {
    const { bodyCaffeine, dailyCaffeine, dailyLimit } = this.data;
    this.setData({
      fillHeightStr: ((bodyCaffeine / dailyLimit) * 100).toFixed(0) + '%',
      progressWidthStr: ((dailyCaffeine / dailyLimit) * 100).toFixed(0) + '%'
    });
  },

  goToSetting() {
    wx.navigateTo({
      url: '/subpackage/home/main_record_setting/main_record_setting'
    });
  }
});
