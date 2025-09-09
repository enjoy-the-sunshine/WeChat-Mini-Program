const AV = require('../../../libs/av-core-min.js');
require('../../../libs/leancloud-adapters-weapp.js');

Page({
  data: {
    /* ===== 今日心情（示例） ===== */
    mood: 'happy',
    moodBigMap: {
      happy:   { src: '../assets/mood_happy.png',   text: '开心' },
      cry:     { src: '../assets/mood_cry.png',     text: '哭哭' },
      angry:   { src: '../assets/mood_angry.png',   text: '生气' },
      sleepy:  { src: '../assets/mood_sleepy.png',  text: '困' },
      yawn:    { src: '../assets/mood_yan.png',     text: '难蚌' },
      speech:  { src: '../assets/mood_speechless.png', text: '无语' },
      diss:    { src: '../assets/mood_dissatisfied.png', text: '不满' },
      very:    { src: '../assets/mood_veryhappy.png', text: '很开心' },
    },
    // 右侧 8 只小熊（小图：文件名带 1）
    moodList: [
      { id:'happy',  src:'../assets/mood_happy.png' },
      { id:'diss',  src:'../assets/mood_dissatisfied.png' },
      { id:'angry', src:'../assets/mood_angry.png' },
      { id:'cry',   src:'../assets/mood_cry.png' },
      { id:'sleepy',src:'../assets/mood_sleepy.png' },
      { id:'speech',src:'../assets/mood_speechless.png' },
      { id:'very', src:'../assets/mood_veryhappy.png' },
      { id:'yawn',src:'../assets/mood_yan.png' },
    ],

    /* ===== 睡眠区域 ===== */
    sleepTime: '22:00',

    // 新版：睡眠时长用 Picker
    durationOptions: [],
    durationIndex: 16, // 默认 8.0h 对应的下标
    durationMinutes: 8 * 60,  // 8h
    durationText: '8.0h',

    sleepEfficiency: 88,
    sleepScore: 59,

    feel: 'good',
    feelList: [
      { id:'good',  src:'../assets/image_up.png' },
      { id:'soso',  src:'../assets/image_medium.png' },
      { id:'bad',   src:'../assets/image_down.png' },
    ],

    icons: {
      mooncloud: '../assets/icon_mooncloud.png',
      moon: '../assets/icon_moon.png',
      clock: '../assets/icon_clock.png',
      star: '../assets/icon_star.png',
      like: '../assets/icon_like.png',
      paperclip: '../assets/icon_paperclip.png',
      pen: '../assets/icon_pen.png',
      up: '../assets/icon_up.png',    // 保留引用，防止其他地方报错
      down: '../assets/icon_down.png'
    },
    images: {
      bearDiary: '../assets/bear_diary.png'
    },

    note: '',
    targetDate: '' // 保存要查询的日期
  },

  /* 今日心情 */
  onPickMood(e) {
    this.setData({ mood: e.currentTarget.dataset.id });
  },

  /* 入睡时间 */
  onChangeTime(e) {
    this.setData({ sleepTime: e.detail.value });
  },

  /* 睡眠时长 Picker 选择 */
  onChangeDuration(e) {
    const idx = Number(e.detail.value);
    const minutes = idx * 30;
    this.setData({
      durationIndex: idx,
      durationMinutes: minutes,
      durationText: this.data.durationOptions[idx]
    });
  },

  /* 其他控件 */
  onChangeEfficiency(e) { this.setData({ sleepEfficiency: e.detail.value }); },
  onChangeScore(e) { this.setData({ sleepScore: e.detail.value }); },
  onPickFeel(e) { this.setData({ feel: e.currentTarget.dataset.id }); },
  onInputNote(e) { this.setData({ note: e.detail.value }); },

  onLoad(options) {
    // 初始化睡眠时长选项（0.0 - 12.0 小时，每隔 0.5h）
    const opts = [];
    for (let i = 0; i <= 24; i++) {
      opts.push((i * 0.5).toFixed(1) + 'h');
    }
    this.setData({ durationOptions: opts });

    const dateParam = options.date || new Date().toISOString().slice(0, 10);
    this.setData({ targetDate: dateParam });
    this.fetchHealthDaily(dateParam);
  },

  async fetchHealthDaily(dateStr) {
    const user = AV.User.current();
    if (!user) return;
  
    const dateOnly = new Date(`${dateStr}T00:00:00`);
  
    try {
      const query = new AV.Query('health_daily');
      query.equalTo('user', user);
      query.equalTo('date', dateOnly);
      const obj = await query.first();
  
      if (obj) {
        const data = obj.toJSON();
        const moodReverseMap = {
          1: 'cry',
          2: 'diss',
          3: 'sleepy',
          4: 'happy',
          5: 'very'
        };

        const minutes = data.sleep_duration_min || 480;
        let idx = minutes / 30;
        if (idx > 24) idx = 24; // 最大 12h
  
        this.setData({
          mood: moodReverseMap[data.mood_day] || 'happy',
          sleepTime: data.sleep_bedtime ? new Date(data.sleep_bedtime).toTimeString().slice(0, 5) : '22:00',
          durationMinutes: minutes,
          durationText: `${(minutes / 60).toFixed(1)}h`,
          durationIndex: idx,
          note: data.diary || '',
          sleepEfficiency: data.sleeping_efficiency ? Number(data.sleeping_efficiency) : 88,
          sleepScore: data.sleeping_point ? Number(data.sleeping_point) : 59
        });
      } else {
        // 没有记录，显示默认
        this.setData({
          mood: 'happy',
          sleepTime: '22:00',
          durationMinutes: 480,
          durationText: '8.0h',
          durationIndex: 16,
          note: '',
          sleepEfficiency: 88,
          sleepScore: 59
        });
      }
    } catch (err) {
      console.error('加载 health_daily 失败', err);
    }
  },

  async onSubmit() {
    const user = AV.User.current();
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
  
    const dateStr = this.data.targetDate;
    const dateOnly = new Date(`${dateStr}T00:00:00`);
  
    const moodMap = {
      cry: 1,
      diss: 2,
      sleepy: 3,
      happy: 4,
      very: 5
    };
  
    const bedtime = new Date(`${dateStr}T${this.data.sleepTime}:00`);
  
    wx.showLoading({ title: '保存中...' });
  
    try {
      const query = new AV.Query('health_daily');
      query.equalTo('user', user);
      query.equalTo('date', dateOnly);
      let obj = await query.first();
  
      if (!obj) {
        obj = new AV.Object('health_daily');
        obj.set('user', user);
        obj.set('date', dateOnly);
      }
  
      obj.set('sleep_bedtime', bedtime);
      obj.set('sleep_duration_min', this.data.durationMinutes);
      obj.set('mood_day', moodMap[this.data.mood] || 3);
      obj.set('diary', this.data.note || '');
      obj.set('sleeping_efficiency', String(this.data.sleepEfficiency));
      obj.set('sleeping_point', String(this.data.sleepScore));
  
      await obj.save();
      wx.showToast({ title: '已保存', icon: 'success' });
  
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
  
    } catch (err) {
      console.error('保存状态失败', err);
      wx.showToast({ title: '保存失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
  }    
});
