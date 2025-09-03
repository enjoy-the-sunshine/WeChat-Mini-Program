// pages/add_home/add_home.js
const app = getApp()

Page({
  data: {
    currentCategory: 'recent',
    currentCategoryTitle: '最近浏览',

    brands: [
      { id: 'starbucks', name: '星巴克', emoji: '🌟' },
      { id: 'luckin', name: '瑞幸咖啡', emoji: '☕' },
      { id: 'kfc', name: 'KCOFFEE', emoji: '🍗' },
      { id: 'mccafe', name: 'McCafé', emoji: '🍔' },
      { id: 'tims', name: 'Tims', emoji: '🍁' },
      { id: 'manner', name: 'Manner', emoji: '🎨' },
      { id: 'saturnbird', name: '三顿半', emoji: '🪐' },
      { id: 'nescafe', name: '雀巢咖啡', emoji: '🐦' },
      { id: 'heytea', name: '喜茶', emoji: '🥤' }
    ],

    currentDrinks: [],
    allDrinks: {
      common: [
        { id: 'americano_light', name: '低因美式', caffeine: 100, unit: '/每份', emoji: '☕', category: 'common', isFavorite: false },
        { id: 'americano_standard', name: '标准美式', caffeine: 225, unit: '/每份', emoji: '☕', category: 'common', isFavorite: false },
        { id: 'americano_strong', name: '加浓美式', caffeine: 300, unit: '/每份', emoji: '☕', category: 'common', isFavorite: false },
        { id: 'latte', name: '拿铁', caffeine: 150, unit: '/每份', emoji: '🥛', category: 'common', isFavorite: false },
        { id: 'oat_latte', name: '燕麦拿铁', caffeine: 150, unit: '/每份', emoji: '🌾', category: 'common', isFavorite: false },
        { id: 'cappuccino', name: '卡布奇诺', caffeine: 150, unit: '/每份', emoji: '☕', category: 'common', isFavorite: false },
        { id: 'mocha', name: '摩卡', caffeine: 175, unit: '/每份', emoji: '🍫', category: 'common', isFavorite: false },
        { id: 'caramel_macchiato', name: '焦糖玛奇朵', caffeine: 150, unit: '/每份', emoji: '🍯', category: 'common', isFavorite: false }
      ],
      starbucks: [
        { id: 'sb_americano', name: '美式咖啡', caffeine: 225, unit: '/每份', emoji: '☕', category: 'starbucks', isFavorite: false },
        { id: 'sb_latte', name: '拿铁咖啡', caffeine: 150, unit: '/每份', emoji: '🥛', category: 'starbucks', isFavorite: false },
        { id: 'sb_cappuccino', name: '卡布奇诺', caffeine: 150, unit: '/每份', emoji: '☕', category: 'starbucks', isFavorite: false },
        { id: 'sb_mocha', name: '摩卡咖啡', caffeine: 175, unit: '/每份', emoji: '🍫', category: 'starbucks', isFavorite: false },
        { id: 'sb_caramel_macchiato', name: '焦糖玛奇朵', caffeine: 150, unit: '/每份', emoji: '🍯', category: 'starbucks', isFavorite: false },
        { id: 'sb_flat_white', name: '精萃澳瑞白', caffeine: 180, unit: '/每份', emoji: '☕', category: 'starbucks', isFavorite: false }
      ],
      luckin: [
        { id: 'lk_americano', name: '瑞幸美式', caffeine: 200, unit: '/每份', emoji: '☕', category: 'luckin', isFavorite: false },
        { id: 'lk_latte', name: '瑞幸拿铁', caffeine: 140, unit: '/每份', emoji: '🥛', category: 'luckin', isFavorite: false },
        { id: 'lk_cappuccino', name: '瑞幸卡布奇诺', caffeine: 140, unit: '/每份', emoji: '☕', category: 'luckin', isFavorite: false }
      ]
    },

    recentDrinks: [],
    favoriteDrinks: [],
    customDrinks: [],

    showCustomModal: false,
    customDrink: {
      name: '',
      caffeine: '',
      unitIndex: 0
    },
    unitOptions: ['/每份', '/杯', '/瓶', '/罐']
  },

  onLoad(options) {
    this.loadLocalData();
    this.switchCategory({ currentTarget: { dataset: { category: 'recent' } } });
  
    // 如果是从“自定义按钮”跳过来的，直接弹出自定义弹窗
    if (options.showCustom === '1') {
      this.showCustomAddModal();
    }
  },

  onShow() {
    this.loadLocalData()
    this.updateCurrentDrinks()
  },

  loadLocalData() {
    try {
      const recentDrinks = wx.getStorageSync('recentDrinks') || []
      const favoriteDrinks = wx.getStorageSync('favoriteDrinks') || []
      const customDrinks = wx.getStorageSync('customDrinks') || []

      this.setData({ recentDrinks, favoriteDrinks, customDrinks })
      this.updateFavoriteStatus()
    } catch (e) {
      console.error('加载本地数据失败:', e)
    }
  },

  saveLocalData() {
    try {
      wx.setStorageSync('recentDrinks', this.data.recentDrinks)
      wx.setStorageSync('favoriteDrinks', this.data.favoriteDrinks)
      wx.setStorageSync('customDrinks', this.data.customDrinks)
    } catch (e) {
      console.error('保存本地数据失败:', e)
    }
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    let title = ''

    switch (category) {
      case 'recent': title = '最近浏览'; break
      case 'favorite': title = '我的收藏'; break
      case 'custom': title = '自定义咖啡'; break
      default:
        const brand = this.data.brands.find(b => b.id === category)
        title = brand ? brand.name : '饮品列表'
    }

    this.setData({ currentCategory: category, currentCategoryTitle: title })
    this.updateCurrentDrinks()
  },

  updateCurrentDrinks() {
    let drinks = []
    switch (this.data.currentCategory) {
      case 'recent': drinks = this.data.recentDrinks; break
      case 'favorite': drinks = this.data.favoriteDrinks; break
      case 'custom': drinks = this.data.customDrinks; break
      default: drinks = this.data.allDrinks[this.data.currentCategory] || []
    }
    this.setData({ currentDrinks: drinks })
  },

  updateFavoriteStatus() {
    const favoriteIds = this.data.favoriteDrinks.map(d => d.id)
    Object.keys(this.data.allDrinks).forEach(category => {
      this.data.allDrinks[category].forEach(drink => {
        drink.isFavorite = favoriteIds.includes(drink.id)
      })
    })
    this.data.customDrinks.forEach(drink => {
      drink.isFavorite = favoriteIds.includes(drink.id)
    })
  },

  selectDrink(e) {
    const drink = e.currentTarget.dataset.drink
    this.addToRecent(drink)
    wx.navigateTo({
      url: `/subpackage/recording/drinkdetail/drinkdetail`
        + `?name=${encodeURIComponent(drink.name)}`
        + `&brand=${encodeURIComponent(drink.category || '')}`
        + `&caffeine=${drink.caffeine || 0}`
        + `&unit=${encodeURIComponent(drink.unit || '')}`
    })
  },

  addToRecent(drink) {
    let recentDrinks = [...this.data.recentDrinks]
    recentDrinks = recentDrinks.filter(d => d.id !== drink.id)
    recentDrinks.unshift(drink)
    if (recentDrinks.length > 20) {
      recentDrinks = recentDrinks.slice(0, 20)
    }
    this.setData({ recentDrinks })
    this.saveLocalData()
  },

  toggleFavorite(e) {
    const drinkId = e.currentTarget.dataset.drinkId
    let drink = null
    let category = null

    Object.keys(this.data.allDrinks).forEach(cat => {
      const found = this.data.allDrinks[cat].find(d => d.id === drinkId)
      if (found) {
        drink = found
        category = cat
      }
    })

    if (!drink) {
      drink = this.data.customDrinks.find(d => d.id === drinkId)
      category = 'custom'
    }

    if (!drink) return

    let favoriteDrinks = [...this.data.favoriteDrinks]

    if (drink.isFavorite) {
      favoriteDrinks = favoriteDrinks.filter(d => d.id !== drinkId)
      drink.isFavorite = false
    } else {
      favoriteDrinks.push(drink)
      drink.isFavorite = true
    }

    this.setData({ favoriteDrinks })

    if (category === 'custom') {
      const customDrinks = this.data.customDrinks.map(d =>
        d.id === drinkId ? { ...d, isFavorite: drink.isFavorite } : d
      )
      this.setData({ customDrinks })
    } else {
      const allDrinks = { ...this.data.allDrinks }
      allDrinks[category] = allDrinks[category].map(d =>
        d.id === drinkId ? { ...d, isFavorite: drink.isFavorite } : d
      )
      this.setData({ allDrinks })
    }

    this.saveLocalData()
    this.updateCurrentDrinks()
  },

  showCustomAddModal() {
    this.setData({
      showCustomModal: true,
      customDrink: { name: '', caffeine: '', unitIndex: 0 }
    })
  },

  hideCustomModal() {
    this.setData({ showCustomModal: false })
  },

  stopPropagation() {},

  onCustomNameInput(e) {
    this.setData({ 'customDrink.name': e.detail.value })
  },

  onCustomCaffeineInput(e) {
    this.setData({ 'customDrink.caffeine': e.detail.value })
  },

  onUnitChange(e) {
    this.setData({ 'customDrink.unitIndex': parseInt(e.detail.value) })
  },

  addCustomDrink() {
    const { name, caffeine, unitIndex } = this.data.customDrink
    const unit = this.data.unitOptions[unitIndex]

    if (!name.trim()) {
      wx.showToast({ title: '请输入饮品名称', icon: 'none' })
      return
    }
    if (!caffeine || isNaN(caffeine) || caffeine <= 0) {
      wx.showToast({ title: '请输入有效的咖啡因含量', icon: 'none' })
      return
    }

    const newDrink = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      caffeine: parseInt(caffeine),
      unit: unit,
      emoji: '☕',
      category: 'custom',
      isFavorite: false,
      isCustom: true
    }

    const customDrinks = [newDrink, ...this.data.customDrinks]
    this.setData({ customDrinks, showCustomModal: false })
    this.saveLocalData()

    if (this.data.currentCategory === 'custom') {
      this.updateCurrentDrinks()
    }

    wx.showToast({ title: '添加成功', icon: 'success' })
  },

  goToCheckout() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  deleteCustomDrink(e) {
    const drinkId = e.currentTarget.dataset.drinkId
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个自定义饮品吗？',
      confirmText: '删除',
      confirmColor: '#e74c3c',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.performDeleteCustomDrink(drinkId)
        }
      }
    })
  },

  performDeleteCustomDrink(drinkId) {
    try {
      let customDrinks = [...this.data.customDrinks].filter(drink => drink.id !== drinkId)
      let favoriteDrinks = [...this.data.favoriteDrinks].filter(drink => drink.id !== drinkId)
      let recentDrinks = [...this.data.recentDrinks].filter(drink => drink.id !== drinkId)

      this.setData({ customDrinks, favoriteDrinks, recentDrinks })
      this.saveLocalData()

      if (this.data.currentCategory === 'custom') {
        this.updateCurrentDrinks()
      }

      wx.showToast({ title: '删除成功', icon: 'success' })
    } catch (e) {
      console.error('删除自定义饮品失败:', e)
      wx.showToast({ title: '删除失败', icon: 'error' })
    }
  }
})
