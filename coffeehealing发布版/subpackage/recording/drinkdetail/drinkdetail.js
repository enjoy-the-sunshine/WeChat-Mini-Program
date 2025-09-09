Page({
  data: {
    cupSize: null,
    caffeineAmount: 0,
    showModal: false,
    currentCup: '',
    amount: 100,
    drinkTime: '',
    drinkName: '',
    brandName: '',
    unit: '',
    sizeOptions: [],
    sizeMl: 0,
    caffeinePerServ: 0,
    isCustom: false,
    drinkPercentage: 100,
    isTest: false,
    modalVisible: false,
    modalTitle: '',
    modalMessage: '',
    modalConfirmFn: null
  },

  onLoad(options) {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.setData({ drinkTime: currentTime });

    if (options.name) this.setData({ drinkName: decodeURIComponent(options.name) });
    if (options.brand) this.setData({ brandName: decodeURIComponent(options.brand) });
    if (options.isTest && Number(options.isTest) === 1) {
      this.setData({ isTest: true });
    }
    if (options.isCustom && Number(options.isCustom) === 1) {
      this.setData({
        isCustom: true,
        caffeineAmount: Number(options.caffeine) || 0,
        caffeinePerServ: Number(options.caffeine) || 0
      });
    } else if (options.sizes) {
      try {
        let sizes = JSON.parse(decodeURIComponent(options.sizes));
        // 删除超大杯
        sizes = sizes.filter(s => s.size_key !== '超大杯');

        // 保留最多 3 个（大中小）
        const order = ['大杯', '中杯', '小杯'];
        sizes = sizes
          .sort((a, b) => order.indexOf(a.size_key) - order.indexOf(b.size_key))
          .slice(0, 3)
          .map(s => ({
            ...s,
            cupImage: `../images/cup-${s.size_key === '大杯' ? 'large' : s.size_key === '中杯' ? 'medium' : 'small'}.png`
          }));

        this.setData({ sizeOptions: sizes });
      } catch (err) {
        console.error('解析尺寸信息失败', err);
      }
    }
  },

  selectCup(e) {
    const sizeKey = e.currentTarget.dataset.size;
    const sizeObj = this.data.sizeOptions.find(s => s.size_key === sizeKey);
    if (sizeObj) {
      this.setData({
        cupSize: sizeObj.size_key,
        sizeMl: sizeObj.size_ml,
        caffeinePerServ: sizeObj.caffeine
      }, () => {
        this.updateCaffeineAmount();
      });
    }
  },

  showInputModal(e) {
    const sizeKey = e.currentTarget.dataset.size;
    const sizeObj = this.data.sizeOptions.find(s => s.size_key === sizeKey);
    if (sizeObj) {
      this.setData({
        showModal: true,
        currentCup: sizeObj.size_key,
        cupSize: sizeObj.size_key,
        sizeMl: sizeObj.size_ml,
        caffeinePerServ: sizeObj.caffeine,
        amount: this.data.amount || 100
      }, () => {
        this.updateCaffeineAmount();
      });
    }
  },

  closeModal() {
    this.setData({ showModal: false });
  },

  onAmountInput(e) {
    const value = e.detail.value;
    if (value >= 0 && value <= 100) {
      this.setData({ amount: value }, () => {
        this.updateCaffeineAmount();
      });
    }
  },

  onSliderInput(e) {
    const value = e.detail.value;
    this.setData({ amount: value }, () => {
      this.updateCaffeineAmount();
    });
  },

  updateCaffeineAmount() {
    if (!this.data.cupSize && !this.data.isCustom) {
      this.setData({ caffeineAmount: 0 });
      return;
    }

    let baseCaffeine = 0;
    if (this.data.isCustom) {
      baseCaffeine = this.data.caffeinePerServ || 0;
    } else {
      baseCaffeine = this.data.caffeinePerServ || 0;
      const amountRatio = Number(this.data.amount) / 100;
      baseCaffeine = baseCaffeine * amountRatio;
    }

    // 应用饮用百分比
    const percentageRatio = Number(this.data.drinkPercentage) / 100;
    const actualCaffeine = Math.round(baseCaffeine * percentageRatio);
    this.setData({ caffeineAmount: actualCaffeine });
  },

  onTimeChange(e) {
    this.setData({ drinkTime: e.detail.value });
  },

  onPercentageChange(e) {
    const value = e.detail.value;
    this.setData({ drinkPercentage: value }, () => {
      this.updateCaffeineAmount();
    });
  },

  onPercentageChanging(e) {
    const value = e.detail.value;
    this.setData({ drinkPercentage: value });
  },

  confirmAmount() {
    if (!this.data.amount || this.data.amount < 0 || this.data.amount > 100) {
      wx.showToast({
        title: '请输入0-100之间的数值',
        icon: 'none'
      });
      return;
    }
    this.updateCaffeineAmount();
    this.closeModal();
  },

  goBackToCaffeine() {
    if (!this.data.isCustom && !this.data.cupSize) {
      wx.showToast({ title: '请先选择杯型', icon: 'none' });
      return;
    }
  
    if (this.data.isCustom && !this.data.drinkName) {
      wx.showToast({ title: '饮品信息不完整', icon: 'none' });
      return;
    }
  
    const t = new Date();
    const dateString = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    const timeString = this.data.drinkTime || `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
  
    const caffeineTotal = this.data.isCustom
      ? this.data.caffeineAmount
      : (this.data.caffeinePerServ || this.data.caffeineAmount);
  
    // 如果是测试饮品，不保存到数据库，直接跳转回main_forecast
    if (this.data.isTest) {
      const [hh, mm] = timeString.split(':').map(n => parseInt(n, 10) || 0);
      const testTime = new Date(
        t.getFullYear(),
        t.getMonth(),
        t.getDate(),
        hh,
        mm
      );
  
      const testData = {
        caffeine: caffeineTotal,
        takenTime: testTime,
        drinkName: this.data.drinkName,
        brandName: this.data.brandName
      };
  
      console.log('存储测试饮品数据:', testData);
      wx.setStorageSync('testDrinkData', testData);
  
      wx.showToast({ title: '测试饮品已添加', icon: 'success' });
      wx.redirectTo({
        url: '/subpackage/home/main_forecast/main_forecast'
      });
      return;
    }
  
    // 正常饮品记录，保存到数据库
    const AV = require('../../../libs/av-core-min.js');
    require('../../../libs/leancloud-adapters-weapp.js');
  
    // 1. 获取用户上限
    const profileQuery = new AV.Query('user_profiles');
    profileQuery.equalTo('user', AV.User.current());
    profileQuery.first().then(profile => {
      let limit = Infinity;
  
      if (profile) {
        // 先取 mg 数值
        const limitMg = profile.get('daily_caffeine_limit_mg');
        if (typeof limitMg === 'number' && !isNaN(limitMg)) {
          limit = limitMg;
        } else {
          // 再尝试 key 映射
          const key = profile.get('daily_caffeine_limit_key') || '';
          const limitMap = { low: 200, medium: 400, high: 600 };
          limit = limitMap[key] !== undefined ? limitMap[key] : 400; // 默认 400
        }
      }
  
      // 2. 计算今天已摄入
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const intakeQuery = new AV.Query('intakes');
      intakeQuery.equalTo('user', AV.User.current());
      intakeQuery.equalTo('takenAt', today);
      intakeQuery.find().then(rows => {
        const consumed = rows.reduce((sum, r) => sum + (r.get('caffeine_total_mg') || 0), 0);
  
        // 3. 预测摄入后是否超标
        console.log('已摄入:', consumed, '当前杯咖啡因:', caffeineTotal, '上限:', limit);
        const totalAfter = consumed + caffeineTotal;
        console.log('摄入后总量:', totalAfter);
  
        if (totalAfter > limit) {
          this.showModal(
            '提示',
            '摄入这杯咖啡后将超过今日咖啡因上限，\n是否继续摄入咖啡？',
            () => {
              this.saveIntake(caffeineTotal, dateString, timeString);
            }
          );
        } else {
          this.saveIntake(caffeineTotal, dateString, timeString);
        }
        
  
      }).catch(console.error);
    }).catch(console.error);
  },
  

  saveIntake(caffeineTotal, dateString, timeString) {
    const AV = require('../../../libs/av-core-min.js');
    const dateOnly = new Date(`${dateString}T00:00:00`);
    const Intake = AV.Object.extend('intakes');
    const intake = new Intake();
    intake.set('user', AV.User.current());
    intake.set('takenAt', dateOnly);
    intake.set('takenAt_time', timeString);
    intake.set('brand', this.data.brandName || '');
    intake.set('product', this.data.drinkName || '未知饮品');
    if (!this.data.isCustom) {
      intake.set('size_key', this.data.cupSize || '');
      intake.set('size_ml', this.data.sizeMl || 0);
    }
    intake.set('caffeine_per_serving_mg', caffeineTotal);
    intake.set('servings', 1);
    intake.set('caffeine_total_mg', caffeineTotal);
    intake.set('note', this.data.note || '');

    intake.save().then(() => {
      wx.setStorageSync('newDrinkRecord', {
        brand: this.data.brandName,
        name: this.data.drinkName,
        caffeine: caffeineTotal,
        date: dateString,
        time: timeString
      });
      wx.reLaunch({ url: '/pages/recording/recording' });
    }).catch(console.error);
  },
  showModal(title, message, confirmCallback) {
    this.setData({
      modalVisible: true,
      modalTitle: title,
      modalMessage: message,
      modalConfirmFn: confirmCallback || null
    });
  },
  
  hideModal() {
    this.setData({ modalVisible: false });
  },
  
  confirmModal() {
    if (typeof this.data.modalConfirmFn === 'function') {
      this.data.modalConfirmFn();
    }
    this.hideModal();
  }
  
});
