Page({
  data: {
    currentStep: 0,
    questions: [
      { text: '您是否已年满18周岁？' },
      { text: '您是否为孕妇/备孕期女性？' },
      { text: '您是否对咖啡因过敏？' },
      { text: '您是否患有心血管疾病（如高血压、冠心病等）' },
      { text: '您是否有长期失眠 / 睡眠障碍问题？' }
    ],
    answers: [null, null, null, null, null] // 存储每题的答案
  },

  // 选中答案
  selectAnswer(e) {
    const answer = e.currentTarget.dataset.answer;
    const { currentStep, answers } = this.data;
    answers[currentStep] = answer;
    this.setData({ answers });
  },

  // 下一步
  nextStep() {
    const { currentStep, answers } = this.data;

    // 如果当前题没有作答
    if (answers[currentStep] === null) {
      wx.showToast({
        title: '请先选择答案',
        icon: 'none'
      });
      return;
    }

    if (currentStep < this.data.questions.length - 1) {
      this.setData({ currentStep: currentStep + 1 });
    }
  },

  // 上一步
  prevStep() {
    const { currentStep } = this.data;
    if (currentStep > 0) {
      this.setData({ currentStep: currentStep - 1 });
    }
  },

  // 完成问卷
  finish() {
    const { currentStep, answers } = this.data;

    // 最后一题未作答
    if (answers[currentStep] === null) {
      wx.showToast({
        title: '请先选择答案',
        icon: 'none'
      });
      return;
    }

    console.log('用户回答：', this.data.answers);
    wx.redirectTo({
      url: '/pages/index/index'
    });
  }
});
