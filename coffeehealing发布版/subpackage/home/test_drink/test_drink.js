// subpackage/forecast/test_drink/test_drink.js
const dal = require('../../../service/db.js')

// ——可选的品牌映射（与你现有一致即可）——
const BRAND_MAP = {
  starbucks: '星巴克',
  luckin: '瑞幸',
  kfc: 'KCOFFEE',
  mccafe: 'McCafé',
  tims: 'Tims',
  manner: 'Manner',
  saturnbird: '三顿半',
  nescafe: '雀巢咖啡',
  heytea: '喜茶'
}

const BRAND_REVERSE = Object.fromEntries(
  Object.entries(BRAND_MAP).map(([id, name]) => [name, id])
)

function getBrandLogoUrl(brandName) {
  const logoMap = {
    'Lipton': 'https://s2.loli.net/2025/09/06/ICycJ1bD3onULTf.png',
      'Seesaw Coffee': 'https://s2.loli.net/2025/09/06/WLG47hFMUlKVt8e.jpg',
      '百事可乐': 'https://s2.loli.net/2025/09/06/oS3nKu1jWz5U87a.png',
      '茶π': 'https://s2.loli.net/2025/09/06/5Bhoi3G4eNpb1Sz.png',
      '茶颜悦色': 'https://s2.loli.net/2025/09/06/ygpMi4ElLbktPQf.jpg',
      '淳茶舍': 'https://s2.loli.net/2025/09/08/5ke9sA1GEgxq3MF.png',
      '东鹏特饮': 'https://s2.loli.net/2025/09/06/l4ChVvtTaDu2KSn.png',
      '果子熟了': 'https://s2.loli.net/2025/09/08/f3egxUHjonDNAWt.jpg',
      '康师傅': 'https://s2.loli.net/2025/09/06/lnC9oiFQdNqrOIb.png',
      '可口可乐': 'https://s2.loli.net/2025/09/06/2fEhlTknz5Qcp7r.png',
      '乐虎': 'https://s2.loli.net/2025/09/06/GMtU976DdoWkaKC.png',
      '蜜雪冰城': 'https://s2.loli.net/2025/09/06/WPblB5zdkAs1Ucp.jpg',
      '麒麟': 'https://s2.loli.net/2025/09/06/B47UAejfRglW3MC.jpg',
      '轻上': 'https://s2.loli.net/2025/09/06/jtD3VC7Pb6ZBTE9.png',
      '瑞幸': 'https://s2.loli.net/2025/09/06/UExTW9Gr7R2YK64.png',
      '三得利': 'https://s2.loli.net/2025/09/06/2VhpfnwD69mkNte.png',
      '提神宝': 'https://s2.loli.net/2025/09/06/Li93Tnp7H6wY1jy.png',
      '旺旺': 'https://s2.loli.net/2025/09/06/8LlDs3zAMchvw5C.png',
      '维他奶': 'https://s2.loli.net/2025/09/08/ocxXAUVi7vlFGhP.jpg',
      '星巴克': 'https://s2.loli.net/2025/09/06/EZzFRNDavnOIytA.png',
      '幸运咖': 'https://s2.loli.net/2025/09/06/o6LNjc7wAZR59kM.jpg',
      '怡宝': 'https://s2.loli.net/2025/09/06/mb9R1LT75xgiqt2.png',
      '永璞': 'https://s2.loli.net/2025/09/06/MOcNwhCT3xRdloV.png',
      '元气森林': 'https://s2.loli.net/2025/09/06/MBzrbOcqsCxYdgS.png',
      '战马': 'https://s2.loli.net/2025/09/08/YmuHwMLr7fx6Ceg.jpg',
      '中沃': 'https://s2.loli.net/2025/09/06/VHxhsopzmFreA4R.png',
      '霸王茶姬': 'https://s2.loli.net/2025/09/08/TDxZbz3JnQ2fOGS.png',
      '茶百道': 'https://s2.loli.net/2025/09/06/PJ1HVoBaEqnxzpU.png',
      '古茗': 'https://s2.loli.net/2025/09/06/nzcDdRA4EyPiIZB.png',
      '库迪': 'https://s2.loli.net/2025/09/06/VGaAg538BUXSInY.png',
      '喜茶': 'https://s2.loli.net/2025/09/06/O3y2erqVJntHDxf.png',
      '东方树叶': 'https://s2.loli.net/2025/09/08/goMxruNCmltWk2Q.png',
      '红牛': 'https://s2.loli.net/2025/09/06/vXgYhr3xpJ9GlNW.jpg',
      'UCC': 'https://s2.loli.net/2025/09/06/oBzHhMaLwjuips9.jpg',
      'M Stand': 'https://s2.loli.net/2025/09/06/mW5EBiRTVY3hxd7.jpg',
      '麦咖啡': 'https://s2.loli.net/2025/09/06/e9KAJ2PdnWt7Uzu.jpg',
      'Manner Coffee': 'https://s2.loli.net/2025/09/06/R957Q4FrHZihGb8.jpg',
      '%Arabica': 'https://s2.loli.net/2025/09/06/U4wk1iJRdv37Vca.jpg',
      '肯德基caffee': 'https://s2.loli.net/2025/09/06/uCcz7O5gMItsUom.jpg',
      'Tims咖啡': 'https://s2.loli.net/2025/09/06/hMFX7RlfbDaZmQY.jpg',
      'Costa': 'https://s2.loli.net/2025/09/06/9PKJo2zS3YM5vfZ.jpg',
      '全家湃客咖啡': 'https://s2.loli.net/2025/09/06/DW5yCKh2nasP7rG.jpg',
      '7-Eleven咖啡': 'https://s2.loli.net/2025/09/06/2SdIpwCBqHJobFn.png'
  };
  return logoMap[brandName] || '/pages/images/coffee-icon.png';
}

function rowToDrink(row) {
  const caffeine = Number(row.caffeine_mg ?? row.caffeine_per_serving_mg ?? 0)
  const brandName = row.brand || ''
  const brandId = BRAND_REVERSE[brandName] || brandName

  // ✅ 新增杯型处理
  let sizes = []
  if (Array.isArray(row.sizes) && row.sizes.length > 0) {
    sizes = row.sizes.map(s => ({
      size_key: s.size_key || '',
      size_ml: s.size_ml || null,
      caffeine: Number(s.caffeine_mg ?? 0)
    }))
  } else if (row.size_key) {
    sizes = [{
      size_key: row.size_key,
      size_ml: row.size_ml || null,
      caffeine
    }]
  }

  return {
    id: row.objectId,
    name: row.product,
    caffeine,
    unit: '/每份',
    size_key: row.size_key,
    size_ml: row.size_ml ?? null,
    category: brandId,
    isFavorite: false,
    sizes, // ✅ 关键是这个
    _raw: row
  }
}


function normalizeBrandToken(token) {
  if (!token) return null
  if (BRAND_MAP[token]) return token
  return BRAND_REVERSE[token] || token
}

Page({
  data: {
    brands: [],
    activeBrand: null,
    activeBrandName: '饮品列表',
    list: [],
    page: 1,
    pageSize: 40,
    loading: false,
    noMore: false,
    keyword: '',

    // 收藏、本地数据、自定义
    favoriteIds: [],
    favorites: [],
    recentDrinks: [],
    customDrinks: [],

    showCustomModal: false,
    customDrink: { name: '', caffeine: '', unitIndex: 0 },
    unitOptions: ['/每份', '/杯', '/瓶', '/罐']
  },

  /* 本地收藏/数据 */
  withFavoriteFlags(items) {
    const set = new Set(this.data.favoriteIds)
    return (items || []).map(d => ({ ...d, isFavorite: set.has(d.id) }))
  },
  loadLocalFavorites() {
    try {
      const ids = wx.getStorageSync('favorites_ids') || []
      const items = wx.getStorageSync('favorites_items') || []
      this.setData({ favoriteIds: ids, favorites: items })
    } catch {}
  },
  saveLocalFavorites() {
    try {
      wx.setStorageSync('favorites_ids', this.data.favoriteIds)
      wx.setStorageSync('favorites_items', this.data.favorites)
    } catch {}
  },
  loadLocalData() {
    try {
      const recentDrinks = wx.getStorageSync('recentDrinks') || []
      const customDrinks = wx.getStorageSync('customDrinks') || []
      this.setData({ recentDrinks, customDrinks })
    } catch {}
  },
  saveLocalData() {
    try {
      wx.setStorageSync('recentDrinks', this.data.recentDrinks)
      wx.setStorageSync('customDrinks', this.data.customDrinks)
    } catch {}
  },

  /* 生命周期 */
  async onLoad() {
    this.loadLocalFavorites()
    this.loadLocalData()
    await this.loadBrands()
    if (!this.data.activeBrand && this.data.brands.length) {
      this.setData({ activeBrand: this.data.brands[0].id })
    }
    if (!this.data.activeBrand) {
      this.setData({ activeBrand: 'starbucks' })
    }
    this.updateActiveBrandName()
    await this.reload()
  },

  updateActiveBrandName() {
    const { brands, activeBrand } = this.data
    if (activeBrand === 'favorite') return this.setData({ activeBrandName: '我的收藏' })
    if (activeBrand === 'recent') return this.setData({ activeBrandName: '最近浏览' })
    if (activeBrand === 'custom') return this.setData({ activeBrandName: '自定义咖啡' })
    const hit = (brands || []).find(b => b.id === activeBrand)
    this.setData({
      activeBrandName: hit ? hit.name || '饮品列表' : '饮品列表'
    })
  },

  async loadBrands() {
    const PRIORITY_BRANDS = ['星巴克','茶百道', '古茗', '喜茶', '瑞幸','茶颜悦色','蜜雪冰城','霸王茶姬']
    try {
      const rows = await dal.listDrinks({ page: 1, pageSize: 1000 })
      const uniq = Array.from(new Set((rows || []).filter(r => r.brand).map(r => r.brand)))
      const sortedBrands = [
        ...PRIORITY_BRANDS.filter(name => uniq.includes(name)),
        ...uniq.filter(name => !PRIORITY_BRANDS.includes(name)).sort()
      ]
      let brands = sortedBrands.map(name => ({
        id: BRAND_REVERSE[name] || name,
        name,
        logoUrl: getBrandLogoUrl(name)
      }))
      if (!brands.length) {
        const allBrandArr = Object.entries(BRAND_MAP).map(([id, name]) => ({
          id,
          name,
          logoUrl: getBrandLogoUrl(name)
        }))
        brands = [
          ...PRIORITY_BRANDS.map(name => allBrandArr.find(b => b.name === name)).filter(Boolean),
          ...allBrandArr.filter(b => !PRIORITY_BRANDS.includes(b.name))
        ]
      }
      this.setData({ brands })
    } catch (e) {
      console.error('[test_drink] loadBrands error:', e)
    }
  },

  async reload() {
    await this.loadBrands()
    this.setData({ list: [], page: 1, noMore: false })
    const { activeBrand, favorites, recentDrinks, pageSize } = this.data
    const AV = require('../../../libs/av-core-min.js')
    require('../../../libs/leancloud-adapters-weapp.js')
  
    if (activeBrand === 'favorite') {
      this.setData({ list: this.withFavoriteFlags(favorites), noMore: true })
      return
    }
    if (activeBrand === 'recent') {
      this.setData({ list: this.withFavoriteFlags(recentDrinks), noMore: true })
      return
    }
    if (activeBrand === 'custom') {
      try {
        const query = new AV.Query('drink_catalog2')
        query.equalTo('user', AV.User.current())
        query.descending('createdAt')
        const results = await query.find()
        const customList = results.map(r => ({
          id: r.id,
          name: r.get('product'),
          caffeine: r.get('caffeine_mg'),
          unit: '/每份',
          emoji: '☕',
          category: 'custom',
          isFavorite: this.data.favoriteIds.includes(r.id),
          isCustom: true,
          sizes: []
        }))
        this.setData({ list: customList, noMore: true })
      } catch (err) {
        console.error('加载自定义饮品失败', err)
        this.setData({ list: [], noMore: true })
      }
      return
    }
  
    // 走普通品牌逻辑
    const brandName = BRAND_MAP[activeBrand] || activeBrand || ''
    const rows = await dal.listDrinks({
      brand: brandName || undefined,
      keyword: (this.data.keyword || '').trim() || undefined,
      page: 1,
      pageSize
    })
  
    const merged = this.mergeProducts(rows) // ✅ 修正调用
    const list = merged.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      isFavorite: item.isFavorite,
      sizes: item.sizes
    }))
  
    this.setData({
      list: this.withFavoriteFlags(list),
      page: 2,
      noMore: list.length < pageSize
    })
  },
  

  

  mergeProducts(rows) {
    const map = {};
    rows.forEach(r => {
      if (!map[r.product]) {
        map[r.product] = {
          id: r.objectId,
          name: r.product,
          category: BRAND_REVERSE[r.brand] || r.brand || '',
          isFavorite: false,
          sizes: []
        };
      }
      map[r.product].sizes.push({
        size_key: r.size_key,
        size_ml: r.size_ml ?? null,
        caffeine: Number(r.caffeine_mg ?? r.caffeine_per_serving_mg ?? 0)
      });
    });
    return Object.values(map);
  },
  
  
  

  async loadMore() {
    if (this.data.loading || this.data.noMore) return
    const { activeBrand, page, pageSize, keyword } = this.data
    if (!activeBrand || ['favorite', 'recent', 'custom'].includes(activeBrand)) return
  
    this.setData({ loading: true })
    try {
      const brandName = BRAND_MAP[activeBrand] || activeBrand || ''
      const rows = await dal.listDrinks({
        brand: brandName || undefined,
        keyword: (keyword || '').trim() || undefined,
        page,
        pageSize
      })
      // ✅ 分页时也合并
      const merged = this.mergeProducts(rows)
      const newItems = merged.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        isFavorite: item.isFavorite,
        sizes: item.sizes
      }))
      // 与现有列表合并
      const all = [
        ...this.data.list,
        ...this.withFavoriteFlags(newItems)
      ]
      this.setData({
        list: all,
        page: page + 1,
        noMore: newItems.length < pageSize
      })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  /* 分类切换 */
  async onBrandTap(e) {
    const id = e?.currentTarget?.dataset?.id
    if (!id) return
    this.setData({ activeBrand: id, keyword: '' })
    this.updateActiveBrandName()
    await this.reload()
  },
  async onKeywordInput(e) {
    const kw = e?.detail?.value || ''
    this.setData({ keyword: kw })
    await this.reload()
  },

  /* 选择饮品并回传 */
  selectDrink(e) {
    const drink = e.currentTarget?.dataset?.drink
    if (!drink) return
    this.addToRecent(drink)
  
    wx.navigateTo({
      url: `/subpackage/recording/drinkdetail/drinkdetail`
        + `?name=${encodeURIComponent(drink.name)}`
        + `&brand=${encodeURIComponent(drink.category || '')}`
        + `&sizes=${encodeURIComponent(JSON.stringify(drink.sizes || []))}`
        + `&isCustom=${drink.isCustom ? 1 : 0}`
        + `&isTest=1`
    });    
  },
  
  addToRecent(drink) {
    let recentDrinks = [...this.data.recentDrinks]
    recentDrinks = recentDrinks.filter(d => d.id !== drink.id)
    recentDrinks.unshift(drink)
    if (recentDrinks.length > 20) recentDrinks = recentDrinks.slice(0, 20)
    this.setData({ recentDrinks })
    this.saveLocalData()
  },

  /* 收藏 */
  toggleFavorite(e) {
    const drinkId = e.currentTarget.dataset.drinkId
    if (!drinkId) return
    let { favoriteIds, favorites, list } = this.data
    const set = new Set(favoriteIds)
    const drinkIndex = list.findIndex(d => d.id === drinkId)
    if (drinkIndex === -1) return
  
    const willFavorite = !set.has(drinkId)
    if (willFavorite) {
      set.add(drinkId)
      favorites = [list[drinkIndex], ...favorites.filter(d => d.id !== drinkId)]
      wx.showToast({ title: '已加入收藏', icon: 'success' })
    } else {
      set.delete(drinkId)
      favorites = favorites.filter(d => d.id !== drinkId)
      wx.showToast({ title: '已取消收藏', icon: 'none' })
    }
  
    // 立即更新当前项目的 isFavorite
    list[drinkIndex].isFavorite = willFavorite
  
    this.setData({
      favoriteIds: Array.from(set),
      favorites,
      list
    })
    this.saveLocalFavorites()
  },
  

  /* 自定义饮品 */
  showCustomAddModal() {
    this.setData({ showCustomModal: true, customDrink: { name: '', caffeine: '', unitIndex: 0 } })
  },
  hideCustomModal() { this.setData({ showCustomModal: false }) },
  stopPropagation() {},
  onCustomNameInput(e) { this.setData({ 'customDrink.name': e.detail.value }) },
  onCustomCaffeineInput(e) { this.setData({ 'customDrink.caffeine': e.detail.value }) },
  onUnitChange(e) { this.setData({ 'customDrink.unitIndex': parseInt(e.detail.value) }) },
  async addCustomDrink() {
    const { name, caffeine, unitIndex } = this.data.customDrink
    const unit = this.data.unitOptions[unitIndex]
    if (!name.trim()) return wx.showToast({ title: '请输入饮品名称', icon: 'none' })
    if (!caffeine || isNaN(caffeine) || caffeine <= 0) return wx.showToast({ title: '请输入有效的咖啡因含量', icon: 'none' })
  
    try {
      const AV = require('../../../libs/av-core-min.js')
      require('../../../libs/leancloud-adapters-weapp.js')
  
      const Drink = AV.Object.extend('drink_catalog2')
      const drink = new Drink()
      if (AV.User.current()) {
        drink.set('user', AV.User.current())
      }
      drink.set('product', name.trim())
      drink.set('caffeine_mg', parseInt(caffeine))
      drink.set('unit', unit)
      await drink.save()
  
      wx.showToast({ title: '添加成功', icon: 'success' })
      this.setData({ showCustomModal: false })
  
      if (this.data.activeBrand === 'custom') {
        await this.reload()
      }
    } catch (err) {
      console.error('保存自定义饮品失败', err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },
  
  deleteCustomDrink(e) {
    const drinkId = e.currentTarget.dataset.drinkId
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个自定义饮品吗？',
      success: (res) => { if (res.confirm) this.performDeleteCustomDrink(drinkId) }
    })
  },
  async performDeleteCustomDrink(drinkId) {
    try {
      const AV = require('../../../libs/av-core-min.js')
      require('../../../libs/leancloud-adapters-weapp.js')
  
      const obj = AV.Object.createWithoutData('drink_catalog2', drinkId)
      await obj.destroy()
  
      wx.showToast({ title: '删除成功', icon: 'success' })
      if (this.data.activeBrand === 'custom') {
        await this.reload()
      }
    } catch (err) {
      console.error('删除自定义饮品失败', err)
      wx.showToast({ title: '删除失败', icon: 'none' })
    }
  }
  
})
