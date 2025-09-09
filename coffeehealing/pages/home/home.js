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

    // ===== 修正：按 UTC 零点计算当天查询范围 =====
   // 本地零点
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    console.log('查询范围(本地零点):', {
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    });


    const query = new AV.Query('intakes');
    query.equalTo('user', AV.User.current());
    query.greaterThanOrEqualTo('takenAt', startOfDay);
    query.lessThan('takenAt', endOfDay);
    query.ascending('takenAt');

    try {
      const results = await query.find();

      // ===== 调试输出，每条数据都打印 =====
      console.log('今日查询到的条数:', results.length);
      results.forEach((item, index) => {
        console.log(`第 ${index + 1} 条:`, {
          id: item.id,
          takenAt: item.get('takenAt'),
          takenAt_time: item.get('takenAt_time'),
          caffeine_total_mg: item.get('caffeine_total_mg')
        });
      });

      let totalCaffeine = 0;
      let caffeineNow = 0;
      let lastEnergyTime = null;

      results.forEach(item => {
        const amount = item.get('caffeine_total_mg') || 0;
        if (amount <= 0) return; // 无效数据跳过

        const takenDate = item.get('takenAt');
        if (!(takenDate instanceof Date) || isNaN(takenDate)) return;

        const takenTimeStr = item.get('takenAt_time') || '00:00';
        const [hh, mm] = takenTimeStr.split(':').map(n => parseInt(n, 10) || 0);

        const takenDateTime = new Date(
          takenDate.getFullYear(),
          takenDate.getMonth(),
          takenDate.getDate(),
          hh,
          mm,
          0
        );

        totalCaffeine += amount;

        const hoursPassed = (now - takenDateTime) / 3600000;
        const remaining = amount * Math.pow(0.5, hoursPassed / HALF_LIFE);
        if (remaining > 0) caffeineNow += remaining;

        if (amount >= THRESHOLD) {
          const hoursToThreshold =
            (Math.log(THRESHOLD / amount) / Math.log(0.5)) * HALF_LIFE;
          const end = new Date(
            takenDateTime.getTime() + hoursToThreshold * 3600000
          );
          if (!lastEnergyTime || end > lastEnergyTime) {
            lastEnergyTime = end;
          }
        }
      });

      console.log('调试-计算结果:', {
        totalCaffeine,
        caffeineNow,
        energyTime: lastEnergyTime
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
  },

  goToSecond() {
    wx.navigateTo({
      url: '/subpackage/home/main_record/main_record'
    });
  },

  goToThird() {
    wx.navigateTo({
      url: '/subpackage/home/main_forecast/main_forecast'
    });
  },

  goToBrandSelect() {
    wx.navigateTo({
      url: '/subpackage/recording/brandselect/brandselect'
    });
  },
  goToIndex() {
    wx.navigateTo({
      url: '/subpackage/home/index/index' // 这里写 index 页面的实际路径
    });
  },
});
