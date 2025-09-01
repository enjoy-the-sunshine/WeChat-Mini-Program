Page({
  data: {
    bodyCaffeine: 20, // 体内实时咖啡因
    dailyCaffeine: 250, // 今日咖啡因
    dailyLimit: 300, // 上限
    timer: '45:00',
    levelText: '', // 低/中/高
    levelClass: '',
    fillHeightStr: '0%', // 圆圈高度字符串
    progressWidthStr: '0%' // 进度条宽度字符串
  },

  onLoad() {
    this.updateLevel();
    this.updateProgressValues();
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
    this.setData({
      levelText: text,
      levelClass: cls
    });
  },

  updateProgressValues() {
    const { bodyCaffeine, dailyCaffeine, dailyLimit } = this.data;
    const fillHeightStr = ((bodyCaffeine / dailyLimit) * 100).toFixed(0) + '%';
    const progressWidthStr = ((dailyCaffeine / dailyLimit) * 100).toFixed(0) + '%';
    this.setData({
      fillHeightStr,
      progressWidthStr
    });
  },

  goToSetting() {
    wx.navigateTo({
      url: '/subpackage/home/main_record_setting/main_record_setting'
    });
  }
});
