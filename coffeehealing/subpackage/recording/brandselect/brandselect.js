// subpackage/recording/brandselect/brandselect.js
const dal = require('../../../service/db.js');
const AV  = require('../../../libs/av-core-min'); // 需要拿当前用户

// ——可选的品牌映射（与你现有一致即可）——
const BRAND_MAP = { starbucks:'星巴克', luckin:'瑞幸', kfc:'KCOFFEE', mccafe:'McCafé', tims:'Tims', manner:'Manner', saturnbird:'三顿半', nescafe:'雀巢咖啡', heytea:'喜茶' };
const BRAND_REVERSE = Object.fromEntries(Object.entries(BRAND_MAP).map(([id, name]) => [name, id]));

function rowToDrink(row) {
  const caffeine = Number(row.caffeine_mg ?? row.caffeine_per_serving_mg ?? 0);
  const brandName = row.brand || '';
  const brandId = BRAND_REVERSE[brandName] || brandName;
  return {
    id: row.objectId,
    name: row.product,
    caffeine,
    unit: '/每份',
    size_key: row.size_key,
    size_ml: row.size_ml ?? null,
    category: brandId,
    isFavorite: false,
    _raw: row
  };
}
function normalizeBrandToken(token) {
  if (!token) return null;
  if (BRAND_MAP[token]) return token;
  return BRAND_REVERSE[token] || token;
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

    // 收藏
    favoriteIds: [],   // 统一维护（来源：云端或本地）
    favorites: [],     // 收藏列表（用于"收藏"分类显示）

    // 最近和自定义
    recentDrinks: [],
    customDrinks: [],

    // 自定义弹窗
    showCustomModal: false,
    customDrink: { name: '', caffeine: '', unitIndex: 0 },
    unitOptions: ['/每份', '/杯', '/瓶', '/罐'],

    userId: null,      // 当前登录用户 id（未登录则为 null）
  },

  /* ============ 登录态 & 初始化 ============ */
  resolveUser() {
    const u = AV.User.current && AV.User.current();
    const userId = u ? u.id : null;
    this.setData({ userId });
    return userId;
  },

  updateActiveBrandName() {
    const { brands, activeBrand } = this.data;
    if (activeBrand === 'favorite') return this.setData({ activeBrandName: '我的收藏' });
    if (activeBrand === 'recent') return this.setData({ activeBrandName: '最近浏览' });
    if (activeBrand === 'custom') return this.setData({ activeBrandName: '自定义咖啡' });
    const hit = (brands || []).find(b => b.id === activeBrand);
    this.setData({ activeBrandName: hit ? (hit.name || '饮品列表') : '饮品列表' });
  },

  withFavoriteFlags(items) {
    const set = new Set(this.data.favoriteIds);
    return (items || []).map(d => ({ ...d, isFavorite: set.has(d.id) }));
  },

  /* ============ 本地收藏（兜底/缓存） ============ */
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

  /* ============ 云端收藏 ============ */
  async loadCloudFavorites() {
    const { userId } = this.data;
    if (!userId) return; // 未登录不拉云端
    const rows = await dal.listFavoritesByUser(userId);
    // 云端返回的快照 -> 页面结构
    const snaps = (rows || []).map(r => ({
      id: r.drink_id,
      name: r.product || '',
      caffeine: Number(r.caffeine_per_serving_mg) || 0,
      unit: r.unit || '/每份',
      category: BRAND_REVERSE[r.brand] || r.brand || '',
      isFavorite: true
    }));
    const ids = snaps.map(s => s.id);
    this.setData({ favoriteIds: ids, favorites: snaps });
    // 缓存到本地，离线也能用
    this.saveLocalFavorites();
  },

  async addCloudFavorite(drink) {
    const { userId } = this.data;
    if (!userId) return; // 未登录直接跳过（保持本地收藏）
    await dal.addFavorite(userId, {
      id: drink.id,
      name: drink.name,
      caffeine: drink.caffeine,
      unit: drink.unit,
      category: drink.category,   // 可是品牌 id 或中文名，服务端做了兜底
      size_key: drink.size_key || ''
    });
  },

  async removeCloudFavorite(drinkId) {
    const { userId } = this.data;
    if (!userId) return;
    await dal.removeFavorite(userId, drinkId);
  },

  /* ============ 生命周期 ============ */
  async onLoad() {
    this.resolveUser();
    this.loadLocalFavorites();      // 先读本地，保证秒开
    this.loadLocalData();           // 加载最近和自定义数据
    if (this.data.userId) {
      await this.loadCloudFavorites(); // 登录后再同步云端
    }

    await this.loadBrands();
    if (!this.data.activeBrand && this.data.brands.length) {
      this.setData({ activeBrand: this.data.brands[0].id });
    }
    if (!this.data.activeBrand) this.setData({ activeBrand: 'starbucks' });
    this.updateActiveBrandName();
    await this.reload();
  },

  /* ============ 加载品牌 & 列表 ============ */
  async loadBrands() {
    try {
      const rows = await dal.listDrinks({ page: 1, pageSize: 1000 });
      const uniq = Array.from(new Set((rows || []).filter(r => r.brand).map(r => r.brand))).sort();
      let brands = uniq.map(name => ({ id: BRAND_REVERSE[name] || name, name }));
      if (!brands.length) brands = Object.entries(BRAND_MAP).map(([id, name]) => ({ id, name }));
      this.setData({ brands }); this.updateActiveBrandName();
    } catch (e) {
      console.error('[brandselect] loadBrands error:', e);
      const brands = Object.entries(BRAND_MAP).map(([id, name]) => ({ id, name }));
      this.setData({ brands }); this.updateActiveBrandName();
    }
  },

  async reload() {
    if (this.data.activeBrand === 'favorite') {
      this.setData({ list: this.withFavoriteFlags(this.data.favorites), page: 1, noMore: true });
      return;
    }
    if (this.data.activeBrand === 'recent') {
      this.setData({ list: this.data.recentDrinks, page: 1, noMore: true });
      return;
    }
    if (this.data.activeBrand === 'custom') {
      this.setData({ list: this.data.customDrinks, page: 1, noMore: true });
      return;
    }
    this.setData({ page: 1, list: [], noMore: false });
    await this.loadMore();
  },

  async loadMore() {
    if (this.data.loading || this.data.noMore) return;
    const { activeBrand, page, pageSize, keyword } = this.data;
    if (!activeBrand || activeBrand === 'favorite') return;
    this.setData({ loading: true });
    try {
      const brandName = BRAND_MAP[activeBrand] || activeBrand || '';
      const rows = await dal.listDrinks({
        brand: brandName || undefined,
        keyword: (keyword || '').trim() || undefined,
        page, pageSize
      });
      const items = this.withFavoriteFlags((rows || []).map(rowToDrink));
      this.setData({
        list: [...this.data.list, ...items],
        page: page + 1,
        noMore: items.length < pageSize
      });
    } catch (e) {
      console.error('[brandselect] loadMore error:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onReachBottom() { this.loadMore(); },
  async onPullDownRefresh() { try { await this.reload(); } finally { wx.stopPullDownRefresh(); } },

  /* ============ 分类切换 & 搜索 ============ */
  async onBrandTap(e) {
    const id = e?.currentTarget?.dataset?.id;
    if (!id || id === this.data.activeBrand) return;
    this.setData({ activeBrand: id, keyword: '' });
    this.updateActiveBrandName();
    await this.reload();
  },
  async switchCategory(e) {
    const rawId = e?.currentTarget?.dataset?.id;
    const rawCat = e?.currentTarget?.dataset?.category;
    const token = (rawId ?? rawCat ?? '').toString().trim();
    if (!token) return;

    if (token === 'favorite' || token === '收藏') {
      this.setData({ activeBrand: 'favorite', keyword: '' });
      this.updateActiveBrandName();
      await this.reload();
      return;
    }
    if (token === 'recent' || token === '最近') {
      this.setData({ activeBrand: 'recent', keyword: '' });
      this.updateActiveBrandName();
      await this.reload();
      return;
    }
    if (token === 'custom' || token === '自定义') {
      this.setData({ activeBrand: 'custom', keyword: '' });
      this.updateActiveBrandName();
      await this.reload();
      return;
    }

    const normalizedId = normalizeBrandToken(token);
    if (normalizedId === this.data.activeBrand) return;
    this.setData({ activeBrand: normalizedId, keyword: '' });
    this.updateActiveBrandName();
    await this.reload();
  },
  async onKeywordInput(e) {
    const kw = e?.detail?.value || '';
    this.setData({ keyword: kw });
    await this.reload();
  },

  /* ============ 跳转详情（保持你的写法） ============ */
  toDetail(e) {
    const item = e.currentTarget?.dataset?.item;
    if (!item) return; this._goDrinkDetail(item);
  },
  selectDrink(e) {
    const drink = e.currentTarget?.dataset?.drink;
    if (!drink) return;
    this.addToRecent(drink);
    this._goDrinkDetail(drink);
  },
  _goDrinkDetail(drink) {
    wx.navigateTo({
      url: `/subpackage/recording/drinkdetail/drinkdetail`
        + `?name=${encodeURIComponent(drink.name)}`
        + `&brand=${encodeURIComponent(drink.category || '')}`
        + `&caffeine=${drink.caffeine || 0}`
        + `&unit=${encodeURIComponent(drink.unit || '')}`
    });
  },

  /* ============ ⭐ 收藏（云端优先，本地兜底） ============ */
  async toggleFavorite(e) {
    const drinkId = e?.currentTarget?.dataset?.drinkId;
    if (!drinkId) return;

    // 找到当前 drink
    let drink = (this.data.list || []).find(d => d.id === drinkId)
            || (this.data.favorites || []).find(d => d.id === drinkId);
    if (!drink) return;

    const set = new Set(this.data.favoriteIds);
    let favorites = [...this.data.favorites];

    if (set.has(drinkId)) {
      // 取消收藏
      set.delete(drinkId);
      favorites = favorites.filter(d => d.id !== drinkId);
      this.setData({ favoriteIds: Array.from(set), favorites });
      this.saveLocalFavorites();
      // 云端同步（忽略错误，不阻塞 UI）
      try { await this.removeCloudFavorite(drinkId); } catch(e){ console.warn('cloud remove fav fail', e); }
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
      // 添加收藏
      set.add(drinkId);
      const snap = {
        id: drink.id,
        name: drink.name,
        caffeine: drink.caffeine,
        unit: drink.unit,
        category: drink.category,
        size_key: drink.size_key || ''
      };
      favorites = [snap, ...favorites.filter(d => d.id !== drinkId)];
      this.setData({ favoriteIds: Array.from(set), favorites });
      this.saveLocalFavorites();
      try { await this.addCloudFavorite(snap); } catch(e){ console.warn('cloud add fav fail', e); }
      wx.showToast({ title: '已加入收藏', icon: 'success' });
    }

    // 刷新当前列表的星标
    if (this.data.activeBrand === 'favorite') {
      this.setData({ list: this.withFavoriteFlags(favorites), noMore: true });
    } else {
      this.setData({ list: this.withFavoriteFlags(this.data.list) });
    }
  },

  /* ============ 最近和自定义功能 ============ */
  loadLocalData() {
    try {
      const recentDrinks = wx.getStorageSync('recentDrinks') || []
      const customDrinks = wx.getStorageSync('customDrinks') || []
      this.setData({ recentDrinks, customDrinks })
    } catch (e) {
      console.error('加载本地数据失败:', e)
    }
  },

  saveLocalData() {
    try {
      wx.setStorageSync('recentDrinks', this.data.recentDrinks)
      wx.setStorageSync('customDrinks', this.data.customDrinks)
    } catch (e) {
      console.error('保存本地数据失败:', e)
    }
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

  /* ============ 自定义饮品功能 ============ */
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

    if (this.data.activeBrand === 'custom') {
      this.reload()
    }

    wx.showToast({ title: '添加成功', icon: 'success' })
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
      let recentDrinks = [...this.data.recentDrinks].filter(drink => drink.id !== drinkId)

      this.setData({ customDrinks, recentDrinks })
      this.saveLocalData()

      if (this.data.activeBrand === 'custom') {
        this.reload()
      }

      wx.showToast({ title: '删除成功', icon: 'success' })
    } catch (e) {
      console.error('删除自定义饮品失败:', e)
      wx.showToast({ title: '删除失败', icon: 'error' })
    }
  }
});