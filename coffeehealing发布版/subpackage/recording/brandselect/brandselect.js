// subpackage/recording/brandselect/brandselect.js
const dal = require('../../../service/db.js');
const AV = require('../../../libs/av-core-min');

// 品牌映射
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
};
const BRAND_REVERSE = Object.fromEntries(Object.entries(BRAND_MAP).map(([id, name]) => [name, id]));

// 品牌 logo
function getBrandLogoUrl(name) {
  const logos = {
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
  return logos[name] || '/pages/images/coffee-icon.png';
}

// 合并相同 product
function mergeProducts(rows) {
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
}

Page({
  data: {
    brands: [],
    activeBrand: null,
    activeBrandName: '饮品列表',
    list: [],
    page: 1,
    pageSize: 40,
    favoriteIds: [],
    favorites: [],
    recentDrinks: [],
    customDrinks: [],
    keyword: '',
    noMore: false,
    userId: null
  },

  onLoad() {
    this.resolveUser()
    this.loadLocalFavorites()
    this.loadLocalData()
    if (this.data.userId) {
      this.loadCloudFavorites()
    }
    this.loadBrands().then(async () => {
      if (!this.data.activeBrand) {
        this.setData({ activeBrand: 'starbucks' })
      }
      this.updateActiveBrandName()
      await this.reload()
    })
  },
  

  resolveUser() {
    const u = AV.User.current && AV.User.current();
    const userId = u ? u.id : null;
    this.setData({ userId });
  },

  updateActiveBrandName() {
    const { activeBrand, brands } = this.data
    if (activeBrand === 'favorite') return this.setData({ activeBrandName: '收藏' })
    if (activeBrand === 'recent') return this.setData({ activeBrandName: '浏览' })
    if (activeBrand === 'custom') return this.setData({ activeBrandName: '自定义' })
    const hit = (brands || []).find(b => b.id === activeBrand)
    this.setData({ activeBrandName: hit ? hit.name || '饮品列表' : '饮品列表' })
  },
  

  withFavoriteFlags(items) {
    const set = new Set(this.data.favoriteIds);
    return (items || []).map(d => ({ ...d, isFavorite: set.has(d.id) }));
  },

  async loadBrands() {
    const PRIORITY = ['星巴克','茶百道', '古茗', '喜茶', '瑞幸','茶颜悦色','蜜雪冰城','霸王茶姬'];
    const rows = await dal.listDrinks({ page: 1, pageSize: 1000 });
    const brandNames = Array.from(new Set(rows.filter(r => r.brand).map(r => r.brand)));
    const sorted = [
      ...PRIORITY.filter(n => brandNames.includes(n)),
      ...brandNames.filter(n => !PRIORITY.includes(n)).sort()
    ];
    const brands = sorted.map(name => ({
      id: BRAND_REVERSE[name] || name,
      name,
      logoUrl: getBrandLogoUrl(name)
    }));
    this.setData({ brands });
  },

  async reload() {
    const { activeBrand, favorites, recentDrinks, userId } = this.data;
  
    if (activeBrand === 'favorite') {
      this.setData({ list: this.withFavoriteFlags(favorites), noMore: true });
      return;
    }
    if (activeBrand === 'recent') {
      this.setData({ list: this.withFavoriteFlags(recentDrinks), noMore: true });
      return;
    }
  
    if (activeBrand === 'custom') {
      // 自定义饮品从 LeanCloud 拉取
      if (!userId) {
        this.setData({ list: [], noMore: true });
        return;
      }
      const query = new AV.Query('drink_catalog2');
      query.equalTo('user', AV.User.current());
      query.descending('createdAt');
      const results = await query.find();
  
      const customList = results.map(r => ({
        id: r.id,
        name: r.get('product'),
        caffeine: r.get('caffeine_mg'),
        emoji: '☕',
        category: 'custom',
        isFavorite: this.data.favoriteIds.includes(r.id),
        isCustom: true,
        sizes: [] // 自定义咖啡没有杯型
      }));
  
      this.setData({ list: customList, noMore: true });
      return;
    }
  
    // 原品牌逻辑...
    const rows = await dal.listDrinks({
      brand: BRAND_MAP[activeBrand] || activeBrand,
      keyword: (this.data.keyword || '').trim() || undefined,
      page: 1,
      pageSize: 1000
    });
  
    const merged = mergeProducts(rows);
    const list = merged.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      isFavorite: item.isFavorite,
      sizes: item.sizes
    }));
    this.setData({ list: this.withFavoriteFlags(list), noMore: true });
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
  
  
  
  

  // 点击品牌
  onBrandTap(e) {
    const id = e.currentTarget.dataset.id;
    if (!id || id === this.data.activeBrand) return;
    this.setData({ activeBrand: id, keyword: '' });
    this.updateActiveBrandName();
    this.reload();
  },

  // 搜索
  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value });
    this.reload();
  },

  // 跳转 drinkdetail
  selectDrink(e) {
    const drink = e.currentTarget.dataset.drink;
    if (!drink) return;
    this.addToRecent(drink);
    this._goDrinkDetail(drink);
  },

  _goDrinkDetail(drink) {
    wx.navigateTo({
      url: `/subpackage/recording/drinkdetail/drinkdetail`
        + `?name=${encodeURIComponent(drink.name)}`
        + `&brand=${encodeURIComponent(drink.category || '')}`
        + `&sizes=${encodeURIComponent(JSON.stringify(drink.sizes || []))}`
        + `&isCustom=${drink.isCustom ? 1 : 0}`
        + `&caffeine=${drink.caffeine || 0}`
    });
  },
  

  // 添加最近浏览
  addToRecent(drink) {
    let recent = [...this.data.recentDrinks];
    recent = recent.filter(d => d.id !== drink.id);
    recent.unshift(drink);
    if (recent.length > 20) recent = recent.slice(0, 20);
    this.setData({ recentDrinks: recent });
    wx.setStorageSync('recentDrinks', recent);
  },

  loadLocalFavorites() {
    try {
      const ids = wx.getStorageSync('favorites_ids') || [];
      const items = wx.getStorageSync('favorites_items') || [];
      this.setData({ favoriteIds: ids, favorites: items });
    } catch {}
  },

  saveLocalFavorites() {
    try {
      wx.setStorageSync('favorites_ids', this.data.favoriteIds);
      wx.setStorageSync('favorites_items', this.data.favorites);
    } catch {}
  },

  async loadCloudFavorites() {
    if (!this.data.userId) return;
    const rows = await dal.listFavoritesByUser(this.data.userId);
    const snaps = (rows || []).map(r => ({
      id: r.drink_id,
      name: r.product || '',
      category: BRAND_REVERSE[r.brand] || r.brand || '',
      isFavorite: true
    }));
    this.setData({
      favoriteIds: snaps.map(s => s.id),
      favorites: snaps
    });
    this.saveLocalFavorites();
  },

  loadLocalData() {
    try {
      const recentDrinks = wx.getStorageSync('recentDrinks') || [];
      const customDrinks = wx.getStorageSync('customDrinks') || [];
      this.setData({ recentDrinks, customDrinks });
    } catch {}
  },
  async switchCategory(e) {
    const id = e.currentTarget.dataset.id || e.currentTarget.dataset.category
    if (!id) return
    this.setData({ activeBrand: id, keyword: '' })
    this.updateActiveBrandName()
    await this.reload()
  },
  /* 自定义饮品 */
  showCustomAddModal() {
    this.setData({ showCustomModal: true, customDrink: { name: '', caffeine: '' } })
  },
  hideCustomModal() { this.setData({ showCustomModal: false }) },
  stopPropagation() {},
  onCustomNameInput(e) { this.setData({ 'customDrink.name': e.detail.value }) },
  onCustomCaffeineInput(e) { this.setData({ 'customDrink.caffeine': e.detail.value }) },
  showCustomAddModal() {
    this.setData({ showCustomModal: true, customDrink: { name: '', caffeine: '' } })
  },
  async addCustomDrink() {
    const { name, caffeine } = this.data.customDrink;
    if (!name.trim()) return wx.showToast({ title: '请输入饮品名称', icon: 'none' });
    if (!caffeine || isNaN(caffeine) || caffeine <= 0)
      return wx.showToast({ title: '请输入有效的咖啡因含量', icon: 'none' });
  
    try {
      const Drink = AV.Object.extend('drink_catalog2');
      const drink = new Drink();
      if (AV.User.current()) {
        drink.set('user', AV.User.current());
      }
      drink.set('product', name.trim());
      drink.set('caffeine_mg', parseInt(caffeine));
      await drink.save();
  
      wx.showToast({ title: '添加成功', icon: 'success' });
      this.setData({ showCustomModal: false });
  
      if (this.data.activeBrand === 'custom') {
        await this.reload();
      }
    } catch (err) {
      console.error('保存自定义饮品失败', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
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
      const obj = AV.Object.createWithoutData('drink_catalog2', drinkId);
      await obj.destroy();
      wx.showToast({ title: '删除成功', icon: 'success' });
  
      if (this.data.activeBrand === 'custom') {
        await this.reload();
      }
    } catch (err) {
      console.error('删除自定义饮品失败', err);
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },
  
  
  
});
