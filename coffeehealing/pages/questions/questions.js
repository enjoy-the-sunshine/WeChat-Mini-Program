// pages/questions/questions.js
Page({
  data: {
    currentStep: 0,
    answers: [],
    // 原来的问题内容保持不变
    questions: [
      { text: '请问您是否已经年满18岁？' },
      { text: '您是否为孕妇/备孕期女性？' },
      { text: '您是否对咖啡因过敏？' },
      { text: '您是否患有心血管疾病（如高血压、冠心病等）' },
      { text: '您是否有长期失眠/睡眠障碍问题？' }
    ]
  },

  // 上一步
  prevStep() {
    if (this.data.currentStep > 0) {
      this.setData({
        currentStep: this.data.currentStep - 1
      });
    }
  },

  // 下一步
  nextStep() {
    const { currentStep, answers, questions } = this.data;
    if (answers[currentStep] === undefined || answers[currentStep] === null) {
      wx.showToast({
        title: '请先选择答案',
        icon: 'none'
      });
      return;
    }
    if (currentStep < questions.length - 1) {
      this.setData({
        currentStep: currentStep + 1
      });
    }
  },

  // 完成问卷
  finish() {
    const { currentStep, answers } = this.data;
    if (answers[currentStep] === undefined || answers[currentStep] === null) {
      wx.showToast({
        title: '请先选择答案',
        icon: 'none'
      });
      return;
    }
    wx.setStorageSync('hasCompletedQuestions', true);
    wx.showToast({
      title: '问卷完成',
      icon: 'success'
    });
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/home/home'
      });
    }, 1500);
  },

  // 选择答案
  selectAnswer(e) {
    const answer = e.currentTarget.dataset.answer;
    const answers = [...this.data.answers];
    answers[this.data.currentStep] = answer;
    this.setData({ answers });
  }
});
