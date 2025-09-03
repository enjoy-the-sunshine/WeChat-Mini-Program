import AV from '../../libs/av-core-min.js';

const HALF_LIFE = 5; // 半衰期（小时）
const THRESHOLD = 50; // mg 阈值

Page({
  data: {
    caffeineNow: 0,
    caffeineTotal: 0,
    energyTime: '--:--',
    dailyLimit: 300,
    sleepCaffeine: 50
  },

  onShow() {
    const limit = wx.getStorageSync('dailyLimit') || 300;
    const sleepLevel = wx.getStorageSync('sleepCaffeine') || 50;
    this.setData({ dailyLimit: limit, sleepCaffeine: sleepLevel });

    this.fetchTodayIntakes();
  },

  async fetchTodayIntakes() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 3600 * 1000);
  
    const query = new AV.Query('intakes');
    query.equalTo('user', AV.User.current());
    query.greaterThanOrEqualTo('takenAt', startOfDay);
    query.lessThan('takenAt', endOfDay);
    query.ascending('takenAt_time');
  
    try {
      const results = await query.find();
  
      let totalCaffeine = 0;
      let caffeineNow = 0;
      let lastEnergyTime = null;
  
      results.forEach(item => {
        const amount = item.get('caffeine_total_mg') || 0;
        let takenTime = item.get('takenAt_time');
  
        // 兼容 Date / String 两种类型
        if (typeof takenTime === 'string') {
          const dateOnlyStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          takenTime = new Date(`${dateOnlyStr} ${takenTime}`.replace(/-/g, '/'));
        }
  
        if (!(takenTime instanceof Date) || isNaN(takenTime)) return;
  
        totalCaffeine += amount;
  
        const hoursPassed = (now - takenTime) / 3600000;
        const remaining = amount * Math.pow(0.5, hoursPassed / HALF_LIFE);
        if (remaining > 0) caffeineNow += remaining;
  
        if (amount >= THRESHOLD) {
          const hoursToThreshold = (Math.log(THRESHOLD / amount) / Math.log(0.5)) * HALF_LIFE;
          const end = new Date(takenTime.getTime() + hoursToThreshold * 3600000);
          if (!lastEnergyTime || end > lastEnergyTime) {
            lastEnergyTime = end;
          }
        }
      });
  
      this.setData({
        caffeineTotal: Math.round(totalCaffeine),
        caffeineNow: Math.round(caffeineNow),
        energyTime: lastEnergyTime ? this.formatTime(lastEnergyTime) : '--:--'
      });
    } catch (err) {
      console.error('获取 intakes 失败', err);
    }
  },
  
  

  formatTime(dateObj) {
    const h = String(dateObj.getHours()).padStart(2, '0');
    const m = String(dateObj.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
});
