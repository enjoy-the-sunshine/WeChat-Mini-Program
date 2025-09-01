Page({
    data: {
      /* ===== 今日心情（示例） ===== */
      mood: 'happy',
      moodBigMap: {
        happy:   { src: '../assets/mood_happy.png',   text: '开心' },
        cry:     { src: '../assets/mood_cry.png',     text: '哭哭' },
        angry:   { src: '../assets/mood_angry.png',   text: '生气' },
        sleepy:  { src: '../assets/mood_sleepy.png',  text: '困' },
        yawn:    { src: '../assets/mood_yan.png',     text: '疲惫' },
        speech:  { src: '../assets/mood_speechless.png', text: '无语' },
        diss:    { src: '../assets/mood_dissatisfied.png', text: '难过' },
        very:    { src: '../assets/mood_veryhappy.png', text: '很开心' },
      },
      // 右侧 8 只小熊（小图：文件名带 1）
      moodList: [
        { id:'very',  src:'../assets/mode_happy1.png' },
        { id:'diss',  src:'../assets/mood_yan1.png' },
        { id:'angry', src:'../assets/mood_angry1.png' },
        { id:'cry',   src:'../assets/mood_cry1.png' },
        { id:'sleepy',src:'../assets/mood_sleepy1.png' },
        { id:'speech',src:'../assets/mood_speechless1.png' },
        { id:'happy', src:'../assets/mood_veryhappy1.png' },
        { id:'sleepy',src:'../assets/mood_sleepy1.png' },
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
  
      note: ''
    },
  
    /* 今日心情 */
    onPickMood(e) {
      this.setData({ mood: e.currentTarget.dataset.id });
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
  
    onSubmit() {
      const payload = {
        mood: this.data.mood,
        sleepTime: this.data.sleepTime,
        // 以小时小数上报，例如 8.5h
        sleepDuration: this.data.durationText,
        efficiency: this.data.sleepEfficiency,
        score: this.data.sleepScore,
        feel: this.data.feel,
        note: this.data.note
      };
      console.log('提交：', payload);
      wx.showToast({ title: '已保存', icon: 'success' });
    }
  });
  