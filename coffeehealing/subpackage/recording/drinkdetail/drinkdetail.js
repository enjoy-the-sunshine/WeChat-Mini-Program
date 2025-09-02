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
    amount: '',
    drinkTime: '',
    drinkName: '',
    brandName: '',
    caffeinePerServ: 0,
    unit: ''
  },

  onLoad(options) {
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
    this.setData({ showModal: false, amount: '' })
  },

  onAmountInput(e) {
    this.setData({ amount: e.detail.value }, () => {
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
    this.updateCaffeineAmount()
    this.closeModal()
  },

  goBackToCaffeine() {
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
