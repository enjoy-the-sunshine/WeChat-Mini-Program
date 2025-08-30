// pages/add_home/add_home.js
const app = getApp()

Page({
  data: {
    // 当前选中的分类
    currentCategory: 'recent',
    currentCategoryTitle: '最近浏览',
    
    // 品牌列表
    brands: [
      {
        id: 'starbucks',
        name: '星巴克',
        emoji: '🌟'
      },
      {
        id: 'luckin',
        name: '瑞幸咖啡',
        emoji: '☕'
      },
      {
        id: 'kfc',
        name: 'KCOFFEE',
        emoji: '🍗'
      },
      {
        id: 'mccafe',
        name: 'McCafé',
        emoji: '🍔'
      },
      {
        id: 'tims',
        name: 'Tims',
        emoji: '🍁'
      },
      {
        id: 'manner',
        name: 'Manner',
        emoji: '🎨'
      },
      {
        id: 'saturnbird',
        name: '三顿半',
        emoji: '🪐'
      },
      {
        id: 'nescafe',
        name: '雀巢咖啡',
        emoji: '🐦'
      },
      {
        id: 'heytea',
        name: '喜茶',
        emoji: '🥤'
      }
    ],
    
    // 当前显示的饮品列表
    currentDrinks: [],
    
    // 所有饮品数据（模拟数据库）
    allDrinks: {
      // 通用咖啡品类
      common: [
        {
          id: 'americano_light',
          name: '低因美式',
          caffeine: 100,
          unit: '/每份',
          emoji: '☕',
          category: 'common',
          isFavorite: false
        },
        {
          id: 'americano_standard',
          name: '标准美式',
          caffeine: 225,
          unit: '/每份',
          emoji: '☕',
          category: 'common',
          isFavorite: false
        },
        {
          id: 'americano_strong',
          name: '加浓美式',
          caffeine: 300,
          unit: '/每份',
          emoji: '☕',
          category: 'common',
          isFavorite: false
        },
        {
          id: 'latte',
          name: '拿铁',
          caffeine: 150,
          unit: '/每份',
          emoji: '🥛',
          category: 'common',
          isFavorite: false
        },
        {
          id: 'oat_latte',
          name: '燕麦拿铁',
          caffeine: 150,
          unit: '/每份',
          emoji: '🌾',
          category: 'common',
          isFavorite: false
        },
        {
          id: 'cappuccino',
          name: '卡布奇诺',
          caffeine: 150,
          unit: '/每份',
          emoji: '☕',
          category: 'common',
          isFavorite: false
        },
        {
          id: 'mocha',
          name: '摩卡',
          caffeine: 175,
          unit: '/每份',
          emoji: '🍫',
          category: 'common',
          isFavorite: false
        },
        {
          id: 'caramel_macchiato',
          name: '焦糖玛奇朵',
          caffeine: 150,
          unit: '/每份',
          emoji: '🍯',
          category: 'common',
          isFavorite: false
        }
      ],
      
      // 星巴克饮品
      starbucks: [
        {
          id: 'sb_americano',
          name: '美式咖啡',
          caffeine: 225,
          unit: '/每份',
          emoji: '☕',
          category: 'starbucks',
          isFavorite: false
        },
        {
          id: 'sb_latte',
          name: '拿铁咖啡',
          caffeine: 150,
          unit: '/每份',
          emoji: '🥛',
          category: 'starbucks',
          isFavorite: false
        },
        {
          id: 'sb_cappuccino',
          name: '卡布奇诺',
          caffeine: 150,
          unit: '/每份',
          emoji: '☕',
          category: 'starbucks',
          isFavorite: false
        },
        {
          id: 'sb_mocha',
          name: '摩卡咖啡',
          caffeine: 175,
          unit: '/每份',
          emoji: '🍫',
          category: 'starbucks',
          isFavorite: false
        },
        {
          id: 'sb_caramel_macchiato',
          name: '焦糖玛奇朵',
          caffeine: 150,
          unit: '/每份',
          emoji: '🍯',
          category: 'starbucks',
          isFavorite: false
        },
        {
          id: 'sb_flat_white',
          name: '精萃澳瑞白',
          caffeine: 180,
          unit: '/每份',
          emoji: '☕',
          category: 'starbucks',
          isFavorite: false
        }
      ],
      
      // 瑞幸咖啡饮品
      luckin: [
        {
          id: 'lk_americano',
          name: '瑞幸美式',
          caffeine: 200,
          unit: '/每份',
          emoji: '☕',
          category: 'luckin',
          isFavorite: false
        },
        {
          id: 'lk_latte',
          name: '瑞幸拿铁',
          caffeine: 140,
          unit: '/每份',
          emoji: '🥛',
          category: 'luckin',
          isFavorite: false
        },
        {
          id: 'lk_cappuccino',
          name: '瑞幸卡布奇诺',
          caffeine: 140,
          unit: '/每份',
          emoji: '☕',
          category: 'luckin',
          isFavorite: false
        }
      ]
    },
    
    // 最近浏览的饮品
    recentDrinks: [],
    
    // 收藏的饮品
    favoriteDrinks: [],
    
    // 自定义饮品
    customDrinks: [],
    
    // 自定义咖啡弹窗
    showCustomModal: false,
    customDrink: {
      name: '',
      caffeine: '',
      unitIndex: 0
    },
    unitOptions: ['/每份', '/杯', '/瓶', '/罐']
  },

  onLoad: function (options) {
    this.loadLocalData()
    this.switchCategory({ currentTarget: { dataset: { category: 'recent' } } })
  },

  onShow: function () {
    // 页面显示时刷新数据
    this.loadLocalData()
    this.updateCurrentDrinks()
  },

  // 加载本地存储数据
  loadLocalData: function () {
    try {
      const recentDrinks = wx.getStorageSync('recentDrinks') || []
      const favoriteDrinks = wx.getStorageSync('favoriteDrinks') || []
      const customDrinks = wx.getStorageSync('customDrinks') || []
      
      this.setData({
        recentDrinks,
        favoriteDrinks,
        customDrinks
      })
      
      // 更新收藏状态
      this.updateFavoriteStatus()
    } catch (e) {
      console.error('加载本地数据失败:', e)
    }
  },

  // 保存本地数据
  saveLocalData: function () {
    try {
      wx.setStorageSync('recentDrinks', this.data.recentDrinks)
      wx.setStorageSync('favoriteDrinks', this.data.favoriteDrinks)
      wx.setStorageSync('customDrinks', this.data.customDrinks)
    } catch (e) {
      console.error('保存本地数据失败:', e)
    }
  },

  // 切换分类
  switchCategory: function (e) {
    const category = e.currentTarget.dataset.category
    let title = ''
    
    switch (category) {
      case 'recent':
        title = '最近浏览'
        break
      case 'favorite':
        title = '我的收藏'
        break
      case 'custom':
        title = '自定义咖啡'
        break
      default:
        // 查找品牌名称
        const brand = this.data.brands.find(b => b.id === category)
        title = brand ? brand.name : '饮品列表'
    }
    
    this.setData({
      currentCategory: category,
      currentCategoryTitle: title
    })
    
    this.updateCurrentDrinks()
  },

  // 更新当前显示的饮品列表
  updateCurrentDrinks: function () {
    let drinks = []
    
    switch (this.data.currentCategory) {
      case 'recent':
        drinks = this.data.recentDrinks
        break
      case 'favorite':
        drinks = this.data.favoriteDrinks
        break
      case 'custom':
        drinks = this.data.customDrinks
        break
      default:
        // 品牌分类
        drinks = this.data.allDrinks[this.data.currentCategory] || []
    }
    
    this.setData({
      currentDrinks: drinks
    })
  },

  // 更新收藏状态
  updateFavoriteStatus: function () {
    const favoriteIds = this.data.favoriteDrinks.map(d => d.id)
    
    // 更新所有饮品数据中的收藏状态
    Object.keys(this.data.allDrinks).forEach(category => {
      this.data.allDrinks[category].forEach(drink => {
        drink.isFavorite = favoriteIds.includes(drink.id)
      })
    })
    
    // 更新自定义饮品的收藏状态
    this.data.customDrinks.forEach(drink => {
      drink.isFavorite = favoriteIds.includes(drink.id)
    })
  },

  // 选择饮品
  selectDrink: function (e) {
    const drink = e.currentTarget.dataset.drink
    
    // 添加到最近浏览
    this.addToRecent(drink)
    
    // 跳转到详情页面
    wx.navigateTo({
      url: `/pages/drink_detail/drink_detail?id=${drink.id}&category=${drink.category}`
    })
  },

  // 添加到最近浏览
  addToRecent: function (drink) {
    let recentDrinks = [...this.data.recentDrinks]
    
    // 移除已存在的相同饮品
    recentDrinks = recentDrinks.filter(d => d.id !== drink.id)
    
    // 添加到开头
    recentDrinks.unshift(drink)
    
    // 限制数量为20个
    if (recentDrinks.length > 20) {
      recentDrinks = recentDrinks.slice(0, 20)
    }
    
    this.setData({
      recentDrinks
    })
    
    this.saveLocalData()
  },

  // 切换收藏状态
  toggleFavorite: function (e) {
    const drinkId = e.currentTarget.dataset.drinkId
    
    // 查找饮品
    let drink = null
    let category = null
    
    // 在所有饮品中查找
    Object.keys(this.data.allDrinks).forEach(cat => {
      const found = this.data.allDrinks[cat].find(d => d.id === drinkId)
      if (found) {
        drink = found
        category = cat
      }
    })
    
    // 在自定义饮品中查找
    if (!drink) {
      drink = this.data.customDrinks.find(d => d.id === drinkId)
      category = 'custom'
    }
    
    if (!drink) return
    
    let favoriteDrinks = [...this.data.favoriteDrinks]
    
    if (drink.isFavorite) {
      // 取消收藏
      favoriteDrinks = favoriteDrinks.filter(d => d.id !== drinkId)
      drink.isFavorite = false
    } else {
      // 添加收藏
      favoriteDrinks.push(drink)
      drink.isFavorite = true
    }
    
    this.setData({
      favoriteDrinks
    })
    
    // 更新对应分类的数据
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

  // 显示自定义咖啡弹窗
  showCustomAddModal: function () {
    this.setData({
      showCustomModal: true,
      customDrink: {
        name: '',
        caffeine: '',
        unitIndex: 0
      }
    })
  },

  // 隐藏自定义咖啡弹窗
  hideCustomModal: function () {
    this.setData({
      showCustomModal: false
    })
  },

  // 阻止事件冒泡
  stopPropagation: function () {
    // 空函数，用于阻止事件冒泡
  },

  // 自定义名称输入
  onCustomNameInput: function (e) {
    this.setData({
      'customDrink.name': e.detail.value
    })
  },

  // 自定义咖啡因输入
  onCustomCaffeineInput: function (e) {
    this.setData({
      'customDrink.caffeine': e.detail.value
    })
  },

  // 单位选择
  onUnitChange: function (e) {
    this.setData({
      'customDrink.unitIndex': parseInt(e.detail.value)
    })
  },

  // 添加自定义咖啡
  addCustomDrink: function () {
    const { name, caffeine, unitIndex } = this.data.customDrink
    const unit = this.data.unitOptions[unitIndex]
    
    if (!name.trim()) {
      wx.showToast({
        title: '请输入饮品名称',
        icon: 'none'
      })
      return
    }
    
    if (!caffeine || isNaN(caffeine) || caffeine <= 0) {
      wx.showToast({
        title: '请输入有效的咖啡因含量',
        icon: 'none'
      })
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
    
    this.setData({
      customDrinks,
      showCustomModal: false
    })
    
    this.saveLocalData()
    
    // 如果当前在自定义分类，更新显示
    if (this.data.currentCategory === 'custom') {
      this.updateCurrentDrinks()
    }
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })
  },

  // 底部购物车栏点击事件
  goToCheckout: function () {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 删除自定义饮品
  deleteCustomDrink: function (e) {
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

  // 执行删除自定义饮品
  performDeleteCustomDrink: function (drinkId) {
    try {
      // 从自定义饮品列表中删除
      let customDrinks = [...this.data.customDrinks]
      customDrinks = customDrinks.filter(drink => drink.id !== drinkId)
      
      // 从收藏列表中删除（如果已收藏）
      let favoriteDrinks = [...this.data.favoriteDrinks]
      favoriteDrinks = favoriteDrinks.filter(drink => drink.id !== drinkId)
      
      // 从最近浏览列表中删除（如果存在）
      let recentDrinks = [...this.data.recentDrinks]
      recentDrinks = recentDrinks.filter(drink => drink.id !== drinkId)
      
      this.setData({
        customDrinks,
        favoriteDrinks,
        recentDrinks
      })
      
      // 保存到本地存储
      this.saveLocalData()
      
      // 如果当前在自定义分类，更新显示
      if (this.data.currentCategory === 'custom') {
        this.updateCurrentDrinks()
      }
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
      
    } catch (e) {
      console.error('删除自定义饮品失败:', e)
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  }
})