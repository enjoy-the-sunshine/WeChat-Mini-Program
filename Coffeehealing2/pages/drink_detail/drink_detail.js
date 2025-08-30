// pages/drink_detail/drink_detail.js
Page({
  data: {
    drink: {},
    selectedSize: 'medium', // 默认选中中杯
    drinkTime: '',
    currentCaffeine: 0,
    sizeMultipliers: {
      large: 1.3,
      medium: 1.0,
      small: 0.7
    }
  },

  onLoad: function (options) {
    // 获取传递过来的饮品信息
    const drinkId = options.id
    const category = options.category
    
    // 这里应该从数据库或缓存中获取饮品详情
    // 暂时使用模拟数据
    const drink = this.getDrinkById(drinkId, category)
    
    if (drink) {
      this.setData({
        drink: drink,
        currentCaffeine: Math.round(drink.caffeine * this.data.sizeMultipliers.medium)
      })
    }
    
    // 设置默认时间为当前时间
    const now = new Date()
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    this.setData({
      drinkTime: timeString
    })
  },

  // 根据ID获取饮品信息
  getDrinkById: function (id, category) {
    // 模拟饮品数据
    const allDrinks = {
      common: [
        {
          id: 'americano_light',
          name: '低因美式',
          caffeine: 100,
          unit: '/每份',
          emoji: '☕',
          category: 'common'
        },
        {
          id: 'americano_standard',
          name: '标准美式',
          caffeine: 225,
          unit: '/每份',
          emoji: '☕',
          category: 'common'
        },
        {
          id: 'americano_strong',
          name: '加浓美式',
          caffeine: 300,
          unit: '/每份',
          emoji: '☕',
          category: 'common'
        },
        {
          id: 'latte',
          name: '拿铁',
          caffeine: 150,
          unit: '/每份',
          emoji: '🥛',
          category: 'common'
        },
        {
          id: 'oat_latte',
          name: '燕麦拿铁',
          caffeine: 150,
          unit: '/每份',
          emoji: '🌾',
          category: 'common'
        },
        {
          id: 'cappuccino',
          name: '卡布奇诺',
          caffeine: 150,
          unit: '/每份',
          emoji: '☕',
          category: 'common'
        },
        {
          id: 'mocha',
          name: '摩卡',
          caffeine: 175,
          unit: '/每份',
          emoji: '🍫',
          category: 'common'
        },
        {
          id: 'caramel_macchiato',
          name: '焦糖玛奇朵',
          caffeine: 150,
          unit: '/每份',
          emoji: '🍯',
          category: 'common'
        }
      ],
      starbucks: [
        {
          id: 'sb_americano',
          name: '美式咖啡',
          caffeine: 225,
          unit: '/每份',
          emoji: '☕',
          category: 'starbucks'
        },
        {
          id: 'sb_latte',
          name: '拿铁咖啡',
          caffeine: 150,
          unit: '/每份',
          emoji: '🥛',
          category: 'starbucks'
        },
        {
          id: 'sb_cappuccino',
          name: '卡布奇诺',
          caffeine: 150,
          unit: '/每份',
          emoji: '☕',
          category: 'starbucks'
        },
        {
          id: 'sb_mocha',
          name: '摩卡咖啡',
          caffeine: 175,
          unit: '/每份',
          emoji: '🍫',
          category: 'starbucks'
        },
        {
          id: 'sb_caramel_macchiato',
          name: '焦糖玛奇朵',
          caffeine: 150,
          unit: '/每份',
          emoji: '🍯',
          category: 'starbucks'
        },
        {
          id: 'sb_flat_white',
          name: '精萃澳瑞白',
          caffeine: 180,
          unit: '/每份',
          emoji: '☕',
          category: 'starbucks'
        }
      ],
      luckin: [
        {
          id: 'lk_americano',
          name: '瑞幸美式',
          caffeine: 200,
          unit: '/每份',
          emoji: '☕',
          category: 'luckin'
        },
        {
          id: 'lk_latte',
          name: '瑞幸拿铁',
          caffeine: 140,
          unit: '/每份',
          emoji: '🥛',
          category: 'luckin'
        },
        {
          id: 'lk_cappuccino',
          name: '瑞幸卡布奇诺',
          caffeine: 140,
          unit: '/每份',
          emoji: '☕',
          category: 'luckin'
        }
      ]
    }
    
    const categoryDrinks = allDrinks[category] || []
    return categoryDrinks.find(drink => drink.id === id)
  },

  // 选择杯子大小
  selectSize: function (e) {
    const size = e.currentTarget.dataset.size
    const multiplier = this.data.sizeMultipliers[size]
    const newCaffeine = Math.round(this.data.drink.caffeine * multiplier)
    
    this.setData({
      selectedSize: size,
      currentCaffeine: newCaffeine
    })
  },

  // 时间选择
  onTimeChange: function (e) {
    this.setData({
      drinkTime: e.detail.value
    })
  },

  // 返回上一页
  goBack: function () {
    wx.navigateBack()
  },

  // 添加饮品
  addDrink: function () {
    if (!this.data.drinkTime) {
      wx.showToast({
        title: '请选择饮用时间',
        icon: 'none'
      })
      return
    }

    const drinkRecord = {
      id: this.data.drink.id,
      name: this.data.drink.name,
      caffeine: this.data.currentCaffeine,
      size: this.data.selectedSize,
      drinkTime: this.data.drinkTime,
      addTime: new Date().toISOString(),
      category: this.data.drink.category,
      emoji: this.data.drink.emoji
    }

    // 保存到本地存储
    this.saveDrinkRecord(drinkRecord)

    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })

    // 延迟返回上一页
    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  },

  // 保存饮品记录
  saveDrinkRecord: function (record) {
    try {
      let todayRecords = wx.getStorageSync('todayDrinkRecords') || []
      
      // 添加新记录
      todayRecords.push(record)
      
      // 保存到本地存储
      wx.setStorageSync('todayDrinkRecords', todayRecords)
      
      // 更新今日咖啡因总量
      this.updateTodayCaffeine()
      
    } catch (e) {
      console.error('保存饮品记录失败:', e)
    }
  },

  // 更新今日咖啡因总量
  updateTodayCaffeine: function () {
    try {
      const todayRecords = wx.getStorageSync('todayDrinkRecords') || []
      const today = new Date().toDateString()
      
      // 过滤今日记录
      const todayDrinks = todayRecords.filter(record => {
        const recordDate = new Date(record.addTime).toDateString()
        return recordDate === today
      })
      
      // 计算总咖啡因
      const totalCaffeine = todayDrinks.reduce((sum, record) => sum + record.caffeine, 0)
      
      // 保存今日总量
      wx.setStorageSync('todayTotalCaffeine', totalCaffeine)
      
    } catch (e) {
      console.error('更新今日咖啡因总量失败:', e)
    }
  }
})
