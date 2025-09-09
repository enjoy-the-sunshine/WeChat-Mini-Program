// pages/questions/questions.js
const db = require('../../service/db');
const AV = require('../../libs/av-core-min');

Page({
  data: {
    currentStep: 0,
    answers: [],
    questions: [
      {
        type: 'abc',
        text: '喝完咖啡后，你的通常感受是？',
        options: [
          { key: 'A', value: 0, label: '很快精神焕发，但过两小时就没事了' },
          { key: 'B', value: 1, label: '效果来得慢，但能持续很久，甚至影响晚上睡眠' },
          { key: 'C', value: 2, label: '感觉适中，效果持续半天左右' },
        ],
      },
      { type: 'yn', text: '您是否患有严重肝病' },
      { type: 'yn', text: '您是否处于孕中期和晚期' },
      { type: 'yn', text: '您是否吸烟' },
      { type: 'yn', text: '您是否长期服用口服避孕药或雌激素药物' },
    ],
  },

  selectAnswer(e) {
    const { currentStep, questions } = this.data;
    const q = questions[currentStep];
    const answers = [...this.data.answers];

    if (q.type === 'abc') {
      answers[currentStep] = Number(e.currentTarget.dataset.value); // 0/1/2
    } else {
      const yn = e.currentTarget.dataset.answer;
      answers[currentStep] = yn === 'yes' ? 1 : 0;
    }

    this.setData({ answers });
  },

  prevStep() {
    if (this.data.currentStep > 0) {
      this.setData({ currentStep: this.data.currentStep - 1 });
    }
  },

  nextStep() {
    const { currentStep, answers, questions } = this.data;
    if (answers[currentStep] === undefined) {
      wx.showToast({ title: '请先选择答案', icon: 'none' });
      return;
    }
    if (currentStep < questions.length - 1) {
      this.setData({ currentStep: currentStep + 1 });
    }
  },

  async finish() {
    const { currentStep, answers } = this.data;
    if (answers[currentStep] === undefined) {
      wx.showToast({ title: '请先选择答案', icon: 'none' });
      return;
    }
    const user = AV.User.current();
    if (!user) {
      wx.showToast({ title: '尚未登录', icon: 'none' });
      return;
    }
    try {
      await db.saveOnboarding(user.id, { answers });
      wx.setStorageSync('hasCompletedQuestions', true);
      wx.showToast({ title: '问卷完成', icon: 'success' });

      const prof = await db.getOrCreateUserProfile(user.id, {});
      if (db.isOnboardingCompleted(prof)) {
        setTimeout(() => wx.switchTab({ url: '/pages/home/home' }), 600);
      } else {
        setTimeout(() => wx.redirectTo({ url: '/pages/login_bear/login_bear' }), 600);
      }
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },
});
