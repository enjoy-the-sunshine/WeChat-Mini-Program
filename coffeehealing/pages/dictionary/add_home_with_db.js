// pages/add_home/add_home_with_db.js
// 这是集成真实数据库的示例代码，展示如何替换模拟数据

const app = getApp()
const { dbService } = require('../../utils/database.js')

Page({
  data: {
    // 当前选中的分类
    currentCategory: 'recent',
    currentCategoryTitle: '最近浏览',
    
    // 品牌列表 (从数据库加载)
    brands: [],
    
    // 当前显示的饮品列表
    currentDrinks: [],
    
    // 所有饮品数据 (从数据库加载)
    allDrinks: {},
    
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
    unitOptions: ['/每份', '/杯', '/瓶', '/罐'],
    
    // 加载状态
    loading: false,
    userId: null
  },

  onLoad: function (options) {
    // 获取用户ID (需要实现用户系统)
    this.getUserId()
    
    // 初始化数据
    this.initData()
  },

  onShow: function () {
    // 页面显示时刷新数据
    this.refreshUserData()
  },

  // 获取用户ID
  getUserId: function () {
    // 这里需要根据你的用户系统实现
    // 示例：从本地存储或全局状态获取
    const userId = wx.getStorageSync('userId') || 'default_user'
    this.setData({ userId })
  },

  // 初始化数据
  initData: function () {
    this.setData({ loading: true })
    
    // 加载品牌列表
    this.loadBrands()
    
    // 加载通用饮品数据
    this.loadCommonDrinks()
    
    // 加载用户数据
    this.loadUserData()
  },

  // 加载品牌列表
  loadBrands: function () {
    dbService.getBrands((brands) => {
      this.setData({ 
        brands: brands || [],
        loading: false
      })
    })
  },

  // 加载通用饮品数据
  loadCommonDrinks: function () {
    // 加载通用咖啡品类
    dbService.getDrinks('common', (commonDrinks) => {
      const allDrinks = { ...this.data.allDrinks }
      allDrinks.common = commonDrinks || []
      this.setData({ allDrinks })
    })
    
    // 加载各品牌饮品数据
    this.data.brands.forEach(brand => {
      dbService.getDrinks(brand.id, (brandDrinks) => {
        const allDrinks = { ...this.data.allDrinks }
        allDrinks[brand.id] = brandDrinks || []
        this.setData({ allDrinks })
      })
    })
  },

  // 加载用户数据
  loadUserData: function () {
    const { userId } = this.data
    if (!userId) return
    
    // 加载收藏
    dbService.getUserFavorites(userId, (favorites) => {
      this.setData({ favoriteDrinks: favorites || [] })
      this.updateFavoriteStatus()
    })
    
    // 加载自定义饮品
    dbService.getCustomDrinks(userId, (custom) => {
      this.setData({ customDrinks: custom || [] })
      this.updateFavoriteStatus()
    })
    
    // 加载最近浏览
    dbService.getRecent(userId, 20, (recent) => {
      this.setData({ recentDrinks: recent || [] })
      this.updateFavoriteStatus()
    })
  },

  // 刷新用户数据
  refreshUserData: function () {
    this.loadUserData()
    this.updateCurrentDrinks()
  },

  // 更新收藏状态
  updateFavoriteStatus: function () {
    const favoriteIds = this.data.favoriteDrinks.map(d => d.drinkId || d.id)
    
    // 更新所有饮品数据中的收藏状态
    const allDrinks = { ...this.data.allDrinks }
    Object.keys(allDrinks).forEach(category => {
      allDrinks[category] = allDrinks[category].map(drink => ({
        ...drink,
        isFavorite: favoriteIds.includes(drink.id)
      }))
    })
    
    // 更新自定义饮品的收藏状态
    const customDrinks = this.data.customDrinks.map(drink => ({
      ...drink,
      isFavorite: favoriteIds.includes(drink.id)
    }))
    
    this.setData({ 
      allDrinks,
      customDrinks
    })
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
        drinks = this.data.recentDrinks.map(item => item.drink || item)
        break
      case 'favorite':
        drinks = this.data.favoriteDrinks.map(item => item.drink || item)
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

  // 选择饮品
  selectDrink: function (e) {
    const drink = e.currentTarget.dataset.drink
    
    // 添加到最近浏览
    this.addToRecent(drink)
    
    // 跳转到详情页面或执行其他操作
    wx.navigateTo({
      url: `/pages/drink_detail/drink_detail?id=${drink.id}&category=${drink.category}`
    })
  },

  // 添加到最近浏览
  addToRecent: function (drink) {
    const { userId } = this.data
    if (!userId) return
    
    dbService.updateRecent(userId, drink, (success) => {
      if (success) {
        // 刷新最近浏览数据
        dbService.getRecent(userId, 20, (recent) => {
          this.setData({ recentDrinks: recent || [] })
        })
      }
    })
  },

  // 切换收藏状态
  toggleFavorite: function (e) {
    const drinkId = e.currentTarget.dataset.drinkId
    const { userId } = this.data
    if (!userId) return
    
    // 查找饮品
    let drink = null
    
    // 在所有饮品中查找
    Object.keys(this.data.allDrinks).forEach(cat => {
      const found = this.data.allDrinks[cat].find(d => d.id === drinkId)
      if (found) drink = found
    })
    
    // 在自定义饮品中查找
    if (!drink) {
      drink = this.data.customDrinks.find(d => d.id === drinkId)
    }
    
    if (!drink) return
    
    if (drink.isFavorite) {
      // 取消收藏
      dbService.removeFavorite(userId, drinkId, (success) => {
        if (success) {
          this.refreshUserData()
        }
      })
    } else {
      // 添加收藏
      dbService.addFavorite(userId, drink, (success) => {
        if (success) {
          this.refreshUserData()
        }
      })
    }
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
    const { userId } = this.data
    const unit = this.data.unitOptions[unitIndex]
    
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
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
      icon: '/images/drinks/custom.png',
      category: 'custom',
      isFavorite: false,
      isCustom: true
    }
    
    dbService.addCustomDrink(userId, newDrink, (success) => {
      if (success) {
        this.setData({
          showCustomModal: false
        })
        
        // 刷新自定义饮品列表
        dbService.getCustomDrinks(userId, (custom) => {
          this.setData({ customDrinks: custom || [] })
          
          // 如果当前在自定义分类，更新显示
          if (this.data.currentCategory === 'custom') {
            this.updateCurrentDrinks()
          }
        })
        
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: '添加失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.refreshUserData()
    wx.stopPullDownRefresh()
  },

  // 错误处理
  onError: function (error) {
    console.error('页面错误:', error)
    wx.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    })
  }
})
