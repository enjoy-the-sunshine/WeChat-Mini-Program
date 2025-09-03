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
        { id:'cry',   src:'../assets/mood_cry.png' },
        { id:'angry', src:'../assets/mood_angry.png' },
        { id:'sleepy',src:'../assets/mood_sleepy.png' },
        { id:'speech',src:'../assets/mood_speechless.png' },
        { id:'diss',  src:'../assets/mood_dissatisfied.png' },
        { id:'very', src:'../assets/mood_veryhappy.png' },
        { id:'yawn',src:'../assets/mood_yan.png' },
      ],
  
      /* ===== 睡眠区域 ===== */
      sleepTime: '22:00',
  
      // 内部统一用“分钟”存储；显示成 X.Xh
      durationMinutes: 8 * 60,  // 8h
      durationStep: 30,         // 每次点击 ±30min
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
        pen: '../assets/icon_pen.png'
      },
      images: {
        bearDiary: '../assets/bear_diary.png'
      },
  
      note: '',
      targetDate: '' // 保存要查询的日期
    },
  
    /* 今日心情 */
    onPickMood(e) {
      const moodId = e.currentTarget.dataset.id;
      console.log('选择心情:', moodId, '对应图片:', this.data.moodBigMap[moodId]);
      this.setData({ mood: moodId });
    },
  
    /* 入睡时间 */
    onChangeTime(e) {
      this.setData({ sleepTime: e.detail.value });
    },
  
    /* 睡眠时长：上下箭头 */
    tapIncDuration() { this._bumpDuration(this.data.durationStep); },
    tapDecDuration() { this._bumpDuration(-this.data.durationStep); },
  
    _bumpDuration(delta) {
      let total = this.data.durationMinutes + delta;
      if (total < 0) total = 0;
      if (total > 24 * 60) total = 24 * 60;
  
      const hoursDecimal = (total / 60).toFixed(1); // 一位小数：8.0h / 8.5h
      this.setData({
        durationMinutes: total,
        durationText: `${hoursDecimal}h`
      });
    },
  
    /* 其他控件 */
    onChangeEfficiency(e) { this.setData({ sleepEfficiency: e.detail.value }); },
    onChangeScore(e) { this.setData({ sleepScore: e.detail.value }); },
    onPickFeel(e) { this.setData({ feel: e.currentTarget.dataset.id }); },
    onInputNote(e) { this.setData({ note: e.detail.value }); },
  
    onLoad(options) {
      const dateParam = options.date || new Date().toISOString().slice(0, 10);
      this.setData({ targetDate: dateParam });
      
      // 添加调试信息
      console.log('recording_state onLoad, moodList:', this.data.moodList);
      console.log('recording_state onLoad, moodBigMap:', this.data.moodBigMap);
      
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
    
          this.setData({
            mood: moodReverseMap[data.mood_day] || 'happy',
            sleepTime: data.sleep_bedtime ? new Date(data.sleep_bedtime).toTimeString().slice(0, 5) : '22:00',
            durationMinutes: data.sleep_duration_min || 480,
            durationText: `${((data.sleep_duration_min || 480) / 60).toFixed(1)}h`,
            note: data.diary || '',
            // 新加：如果字段为空则用默认值
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
    
        // 新加：保存睡眠效率和评分（转成 string 存储）
        obj.set('sleeping_efficiency', String(this.data.sleepEfficiency));
        obj.set('sleeping_point', String(this.data.sleepScore));
    
        await obj.save();
        wx.showToast({ title: '已保存', icon: 'success' });
    
        // 延迟 1 秒返回上一页
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
  