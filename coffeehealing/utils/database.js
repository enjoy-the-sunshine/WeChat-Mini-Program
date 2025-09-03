// utils/database.js
// 数据库接入模板 - 用于替换模拟数据

/**
 * 数据库配置
 * 支持多种数据库类型：
 * 1. 云开发数据库 (推荐)
 * 2. 自建服务器 API
 * 3. 第三方云服务 (如 LeanCloud、Bmob 等)
 */

// 云开发数据库配置 (推荐)
const cloudConfig = {
  env: 'your-env-id', // 替换为你的云环境ID
  collection: {
    brands: 'brands',
    drinks: 'drinks',
    userFavorites: 'user_favorites',
    userCustom: 'user_custom',
    userRecent: 'user_recent'
  }
}

// API 服务器配置
const apiConfig = {
  baseUrl: 'https://your-api-domain.com/api',
  endpoints: {
    brands: '/brands',
    drinks: '/drinks',
    favorites: '/favorites',
    custom: '/custom',
    recent: '/recent'
  }
}

/**
 * 数据库操作类
 */
class DatabaseService {
  constructor() {
    this.init()
  }

  // 初始化数据库连接
  init() {
    // 云开发初始化
    if (wx.cloud) {
      wx.cloud.init({
        env: cloudConfig.env,
        traceUser: true
      })
    }
  }

  /**
   * 获取品牌列表
   * @param {Function} callback 回调函数
   */
  getBrands(callback) {
    // 云开发方式
    if (wx.cloud) {
      wx.cloud.database().collection(cloudConfig.collection.brands)
        .get()
        .then(res => {
          callback && callback(res.data)
        })
        .catch(err => {
          console.error('获取品牌列表失败:', err)
          callback && callback([])
        })
    } else {
      // API 方式
      wx.request({
        url: `${apiConfig.baseUrl}${apiConfig.endpoints.brands}`,
        method: 'GET',
        success: (res) => {
          callback && callback(res.data)
        },
        fail: (err) => {
          console.error('获取品牌列表失败:', err)
          callback && callback([])
        }
      })
    }
  }

  /**
   * 获取饮品列表
   * @param {String} brandId 品牌ID
   * @param {Function} callback 回调函数
   */
  getDrinks(brandId, callback) {
    if (wx.cloud) {
      const query = brandId ? { brandId: brandId } : {}
      wx.cloud.database().collection(cloudConfig.collection.drinks)
        .where(query)
        .get()
        .then(res => {
          callback && callback(res.data)
        })
        .catch(err => {
          console.error('获取饮品列表失败:', err)
          callback && callback([])
        })
    } else {
      const url = brandId 
        ? `${apiConfig.baseUrl}${apiConfig.endpoints.drinks}?brandId=${brandId}`
        : `${apiConfig.baseUrl}${apiConfig.endpoints.drinks}`
      
      wx.request({
        url: url,
        method: 'GET',
        success: (res) => {
          callback && callback(res.data)
        },
        fail: (err) => {
          console.error('获取饮品列表失败:', err)
          callback && callback([])
        }
      })
    }
  }

  /**
   * 获取用户收藏
   * @param {String} userId 用户ID
   * @param {Function} callback 回调函数
   */
  getUserFavorites(userId, callback) {
    if (wx.cloud) {
      wx.cloud.database().collection(cloudConfig.collection.userFavorites)
        .where({ userId: userId })
        .get()
        .then(res => {
          callback && callback(res.data)
        })
        .catch(err => {
          console.error('获取用户收藏失败:', err)
          callback && callback([])
        })
    } else {
      wx.request({
        url: `${apiConfig.baseUrl}${apiConfig.endpoints.favorites}?userId=${userId}`,
        method: 'GET',
        success: (res) => {
          callback && callback(res.data)
        },
        fail: (err) => {
          console.error('获取用户收藏失败:', err)
          callback && callback([])
        }
      })
    }
  }

  /**
   * 添加收藏
   * @param {String} userId 用户ID
   * @param {Object} drink 饮品信息
   * @param {Function} callback 回调函数
   */
  addFavorite(userId, drink, callback) {
    const data = {
      userId: userId,
      drinkId: drink.id,
      drink: drink,
      createTime: new Date()
    }

    if (wx.cloud) {
      wx.cloud.database().collection(cloudConfig.collection.userFavorites)
        .add({ data: data })
        .then(res => {
          callback && callback(true)
        })
        .catch(err => {
          console.error('添加收藏失败:', err)
          callback && callback(false)
        })
    } else {
      wx.request({
        url: `${apiConfig.baseUrl}${apiConfig.endpoints.favorites}`,
        method: 'POST',
        data: data,
        success: (res) => {
          callback && callback(true)
        },
        fail: (err) => {
          console.error('添加收藏失败:', err)
          callback && callback(false)
        }
      })
    }
  }

  /**
   * 取消收藏
   * @param {String} userId 用户ID
   * @param {String} drinkId 饮品ID
   * @param {Function} callback 回调函数
   */
  removeFavorite(userId, drinkId, callback) {
    if (wx.cloud) {
      wx.cloud.database().collection(cloudConfig.collection.userFavorites)
        .where({
          userId: userId,
          drinkId: drinkId
        })
        .remove()
        .then(res => {
          callback && callback(true)
        })
        .catch(err => {
          console.error('取消收藏失败:', err)
          callback && callback(false)
        })
    } else {
      wx.request({
        url: `${apiConfig.baseUrl}${apiConfig.endpoints.favorites}`,
        method: 'DELETE',
        data: {
          userId: userId,
          drinkId: drinkId
        },
        success: (res) => {
          callback && callback(true)
        },
        fail: (err) => {
          console.error('取消收藏失败:', err)
          callback && callback(false)
        }
      })
    }
  }

  /**
   * 添加自定义饮品
   * @param {String} userId 用户ID
   * @param {Object} drink 饮品信息
   * @param {Function} callback 回调函数
   */
  addCustomDrink(userId, drink, callback) {
    const data = {
      userId: userId,
      ...drink,
      createTime: new Date()
    }

    if (wx.cloud) {
      wx.cloud.database().collection(cloudConfig.collection.userCustom)
        .add({ data: data })
        .then(res => {
          callback && callback(true)
        })
        .catch(err => {
          console.error('添加自定义饮品失败:', err)
          callback && callback(false)
        })
    } else {
      wx.request({
        url: `${apiConfig.baseUrl}${apiConfig.endpoints.custom}`,
        method: 'POST',
        data: data,
        success: (res) => {
          callback && callback(true)
        },
        fail: (err) => {
          console.error('添加自定义饮品失败:', err)
          callback && callback(false)
        }
      })
    }
  }

  /**
   * 获取用户自定义饮品
   * @param {String} userId 用户ID
   * @param {Function} callback 回调函数
   */
  getCustomDrinks(userId, callback) {
    if (wx.cloud) {
      wx.cloud.database().collection(cloudConfig.collection.userCustom)
        .where({ userId: userId })
        .orderBy('createTime', 'desc')
        .get()
        .then(res => {
          callback && callback(res.data)
        })
        .catch(err => {
          console.error('获取自定义饮品失败:', err)
          callback && callback([])
        })
    } else {
      wx.request({
        url: `${apiConfig.baseUrl}${apiConfig.endpoints.custom}?userId=${userId}`,
        method: 'GET',
        success: (res) => {
          callback && callback(res.data)
        },
        fail: (err) => {
          console.error('获取自定义饮品失败:', err)
          callback && callback([])
        }
      })
    }
  }

  /**
   * 更新最近浏览
   * @param {String} userId 用户ID
   * @param {Object} drink 饮品信息
   * @param {Function} callback 回调函数
   */
  updateRecent(userId, drink, callback) {
    const data = {
      userId: userId,
      drinkId: drink.id,
      drink: drink,
      viewTime: new Date()
    }

    if (wx.cloud) {
      // 先删除旧的记录
      wx.cloud.database().collection(cloudConfig.collection.userRecent)
        .where({
          userId: userId,
          drinkId: drink.id
        })
        .remove()
        .then(() => {
          // 添加新记录
          return wx.cloud.database().collection(cloudConfig.collection.userRecent)
            .add({ data: data })
        })
        .then(res => {
          callback && callback(true)
        })
        .catch(err => {
          console.error('更新最近浏览失败:', err)
          callback && callback(false)
        })
    } else {
      wx.request({
        url: `${apiConfig.baseUrl}${apiConfig.endpoints.recent}`,
        method: 'POST',
        data: data,
        success: (res) => {
          callback && callback(true)
        },
        fail: (err) => {
          console.error('更新最近浏览失败:', err)
          callback && callback(false)
        }
      })
    }
  }

  /**
   * 获取最近浏览
   * @param {String} userId 用户ID
   * @param {Number} limit 限制数量
   * @param {Function} callback 回调函数
   */
  getRecent(userId, limit = 20, callback) {
    if (wx.cloud) {
      wx.cloud.database().collection(cloudConfig.collection.userRecent)
        .where({ userId: userId })
        .orderBy('viewTime', 'desc')
        .limit(limit)
        .get()
        .then(res => {
          callback && callback(res.data)
        })
        .catch(err => {
          console.error('获取最近浏览失败:', err)
          callback && callback([])
        })
    } else {
      wx.request({
        url: `${apiConfig.baseUrl}${apiConfig.endpoints.recent}?userId=${userId}&limit=${limit}`,
        method: 'GET',
        success: (res) => {
          callback && callback(res.data)
        },
        fail: (err) => {
          console.error('获取最近浏览失败:', err)
          callback && callback([])
        }
      })
    }
  }
}

// 创建数据库服务实例
const dbService = new DatabaseService()

module.exports = {
  dbService,
  cloudConfig,
  apiConfig
}
