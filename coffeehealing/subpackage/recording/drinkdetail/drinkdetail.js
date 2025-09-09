const caffeineBaseMap = {
  '大杯': 250,
  '中杯': 200,
  '小杯': 150
}

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
    caffeinePerServ: 0,
    unit: ''
  },

  onLoad(options) {
    // 设置默认时间为当前时间
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    
    if (options.name) {
      this.setData({ drinkName: decodeURIComponent(options.name) })
    }
    if (options.brand) {
      this.setData({ brandName: decodeURIComponent(options.brand) })
    }
    if (options.caffeine) {
      this.setData({ caffeinePerServ: Number(options.caffeine) })
    }
    if (options.unit) {
      this.setData({ unit: decodeURIComponent(options.unit) })
    }
    
    // 设置默认时间
    this.setData({ drinkTime: currentTime })
  },

  selectCup(e) {
    const size = e.currentTarget.dataset.size
    this.setData({ cupSize: size }, () => {
      this.updateCaffeineAmount()
    })
  },

  showInputModal(e) {
    const size = e.currentTarget.dataset.size
    this.setData({
      showModal: true,
      currentCup: size,
      cupSize: size,
      amount: this.data.amount || 100
    }, () => {
      this.updateCaffeineAmount()
    })
  },

  closeModal() {
    this.setData({ showModal: false })
  },

  onAmountInput(e) {
    const value = e.detail.value
    // 限制输入范围在0-100之间
    if (value >= 0 && value <= 100) {
      this.setData({ amount: value }, () => {
        this.updateCaffeineAmount()
      })
    }
  },

  // 滑块输入处理
  onSliderInput(e) {
    const value = e.detail.value
    this.setData({ amount: value }, () => {
      this.updateCaffeineAmount()
    })
  },

  updateCaffeineAmount() {
    const baseCaffeine = this.data.caffeinePerServ || caffeineBaseMap[this.data.cupSize] || 0
    const amountRatio = Number(this.data.amount) / 100
    const actualCaffeine = Math.round(baseCaffeine * amountRatio)
    this.setData({ caffeineAmount: actualCaffeine })
  },

  onTimeChange(e) {
    this.setData({ drinkTime: e.detail.value })
  },

  confirmAmount() {
    if (!this.data.amount || this.data.amount < 0 || this.data.amount > 100) {
      wx.showToast({
        title: '请输入0-100之间的数值',
        icon: 'none'
      })
      return
    }
    this.updateCaffeineAmount()
    this.closeModal()
  },

  goBackToCaffeine() {
    if (!this.data.cupSize) {
      wx.showToast({
        title: '请先选择杯型',
        icon: 'none'
      })
      return
    }
    
    const AV = require('../../../libs/av-core-min.js')
    require('../../../libs/leancloud-adapters-weapp.js')

    const t = new Date()
    const dateString = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
    const dateOnly = new Date(`${dateString}T00:00:00`)
    const timeString = this.data.drinkTime || `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`

    const caffeinePerServ = this.data.caffeinePerServ || this.data.caffeineAmount
    const servings = 1
    const caffeineTotal = caffeinePerServ * servings

    const Intake = AV.Object.extend('intakes')
    const intake = new Intake()
    intake.set('user', AV.User.current())
    intake.set('takenAt', dateOnly)
    intake.set('takenAt_time', timeString)
    intake.set('brand', this.data.brandName || '')
    intake.set('product', this.data.drinkName || '未知饮品')
    intake.set('size_key', this.data.cupSize || '')
    intake.set('size_ml', this.data.sizeMl || 0)
    intake.set('caffeine_per_serving_mg', caffeinePerServ)
    intake.set('servings', servings)
    intake.set('caffeine_total_mg', caffeineTotal)
    intake.set('note', this.data.note || '')

    intake.save().then(() => {
      wx.setStorageSync('newDrinkRecord', {
        brand: this.data.brandName,
        name: this.data.drinkName,
        caffeine: caffeineTotal,
        date: dateString,
        time: timeString
      })
      wx.reLaunch({
        url: '/pages/recording/recording'
      })
    }).catch(console.error)
  }
})
