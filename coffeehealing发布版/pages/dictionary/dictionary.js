// pages/dictionary/dictionary.js
const dal = require('../../service/db.js');
const AV = require('../../libs/av-core-min');

// ——可选的品牌映射——
const BRAND_MAP = { starbucks:'星巴克', luckin:'瑞幸', kfc:'KCOFFEE', mccafe:'McCafé', tims:'Tims', manner:'Manner', saturnbird:'三顿半', nescafe:'雀巢咖啡', heytea:'喜茶', costa:'Costa' };
const BRAND_REVERSE = Object.fromEntries(Object.entries(BRAND_MAP).map(([id, name]) => [name, id]));

function rowToDrink(row) {
  const caffeine = Number(row.caffeine_mg ?? row.caffeine_per_serving_mg ?? 0);
  const brandName = row.brand || '';
  const brandId = BRAND_REVERSE[brandName] || brandName;
  return {
      id: row.objectId,
      name: row.product,
      caffeine: row.caffeine_mg,
      unit: row.unit,
      emoji: row.emoji || '☕',
      category: 'custom',
      isCustom: true 
  };
}
function normalizeBrandToken(token) {
  if (!token) return null;
  if (BRAND_MAP[token]) return token;
  return BRAND_REVERSE[token] || token;
}

// ====== 自定义饮品表名 ======
const CLASS_CUSTOM_DRINK = 'drink_catalog2';

// ====== LeanCloud 自定义饮品 CRUD ======
async function listCustomDrinksByUser(userId) {
  if (!userId) return [];
  const q = new AV.Query(CLASS_CUSTOM_DRINK);
  q.equalTo('user', AV.Object.createWithoutData('_User', userId));
  q.descending('createdAt');
  const rows = await q.find();
  return rows.map(r => r.toJSON());
}

async function addCustomDrinkToCloud(userId, { name, caffeine, unit, emoji = '☕' }) {
  if (!userId) throw new Error('userId required');
  const obj = new AV.Object(CLASS_CUSTOM_DRINK);
  obj.set('user', AV.Object.createWithoutData('_User', userId));
  obj.set('product', name);
  obj.set('caffeine_mg', Number(caffeine));
  obj.set('unit', unit);
  obj.set('emoji', emoji);
  const saved = await obj.save();
  return saved.toJSON();
}

async function deleteCustomDrinkFromCloud(userId, objectId) {
  if (!userId) throw new Error('userId required');
  const obj = AV.Object.createWithoutData(CLASS_CUSTOM_DRINK, objectId);
  await obj.destroy();
  return true;
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

    // ——原“收藏”变量，现用作“搜索结果”——
    favorites: [],          // 用来承载“搜索结果列表”
    favoriteIds: [],        // 保留占位，不再使用
    showFavoriteModal: false,

    // 自定义与最近
    recentDrinks: [],
    customDrinks: [],

    // 自定义弹窗
    showCustomModal: false,
    showAddCustomModal: false,
    activeCategory: null,

    // 自定义饮品表单
    customDrink: { name: '', caffeine: '', unitIndex: 0 },
    unitOptions: ['/每份', '/杯', '/瓶', '/罐'],

    // 搜索
    searchKeyword: '',
    searching: false,

    userId: null
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
    const hit = (brands || []).find(b => b.id === activeBrand);
    this.setData({ activeBrandName: hit ? (hit.name || '饮品列表') : '饮品列表' });
  },

  withFavoriteFlags(items) {
    const set = new Set(this.data.favoriteIds);
    return (items || []).map(d => ({ ...d, isFavorite: set.has(d.id) }));
  },

  /* ============ 自定义饮品加载（云端） ============ */
  async loadCustomDrinksFromCloud() {
    try {
      const rows = await listCustomDrinksByUser(this.data.userId);
      const customDrinks = rows.map(r => ({
        id: r.objectId,
        name: r.product,
        caffeine: r.caffeine_mg,
        unit: r.unit,
        emoji: r.emoji || '☕',
        category: 'custom',
        isCustom: true
      }));
      this.setData({ customDrinks });
    } catch (e) {
      console.error('加载自定义饮品失败:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  

  /* ============ 本地最近（保留） ============ */
  loadLocalData() {
    try {
      const recentDrinks = wx.getStorageSync('recentDrinks') || [];
      this.setData({ recentDrinks });
    } catch (e) {
      console.error('加载本地数据失败:', e);
    }
  },
  saveLocalData() {
    try {
      wx.setStorageSync('recentDrinks', this.data.recentDrinks);
    } catch (e) {
      console.error('保存本地数据失败:', e);
    }
  },
  addToRecent(drink) {
    let recentDrinks = [...this.data.recentDrinks];
    recentDrinks = recentDrinks.filter(d => d.id !== drink.id);
    recentDrinks.unshift(drink);
    if (recentDrinks.length > 20) recentDrinks = recentDrinks.slice(0, 20);
    this.setData({ recentDrinks });
    this.saveLocalData();
  },

  /* ============ 生命周期 ============ */
  async onLoad() {
    this.resolveUser();
    this.loadLocalData();               // 最近
    await this.loadCustomDrinksFromCloud(); // 云端自定义饮品
    await this.loadBrands();            // 品牌
    this.updateActiveBrandName();
  },

  /* ============ 加载品牌 & 列表 ============ */
  async loadBrands() {
    try {
      const rows = await dal.listDrinks({ page: 1, pageSize: 1000 });

      const uniqBrands = Array.from(new Set(
        (rows || []).filter(r => r.brand).map(r => r.brand)
      )).sort();

      let brands = uniqBrands.map(name => ({
        id: BRAND_REVERSE[name] || name,
        name,
        logoUrl: this.getBrandLogoUrl(name)
      }));

      if (!brands.length) {
        brands = Object.entries(BRAND_MAP).map(([id, name]) => ({
          id, name, logoUrl: this.getBrandLogoUrl(name)
        }));
      }

      const priorityBrands = ['星巴克','茶百道', '古茗', '喜茶', '瑞幸','茶颜悦色','蜜雪冰城','霸王茶姬'];
      brands.sort((a, b) => {
        const ai = priorityBrands.indexOf(a.name);
        const bi = priorityBrands.indexOf(b.name);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.name.localeCompare(b.name, 'zh-Hans-CN');
      });

      this.setData({ brands });
      this.updateActiveBrandName();
    } catch (e) {
      console.error('[dict] loadBrands error:', e);
      const brands = Object.entries(BRAND_MAP).map(([id, name]) => ({
        id, name, logoUrl: this.getBrandLogoUrl(name)
      }));
      this.setData({ brands });
      this.updateActiveBrandName();
    }
  },

  getBrandLogoUrl(brandName) {
    const logoMap = {
      // ……（保持你原来的映射，不改）
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
  },

  /* ============ 品牌选择 ============ */
  selectBrand(e) {
    const brand = e.currentTarget?.dataset?.brand;
    if (!brand) return;
    wx.navigateTo({
      url: `/subpackage/recording/brandcoffee/brandcoffee?brandId=${brand.id}&brandName=${encodeURIComponent(brand.name)}`
    });
  },

  /* ============ 悬浮栏：搜索（原收藏） ============ */
  switchToFavorite() {
    this.setData({ showFavoriteModal: true, activeCategory: 'favorite' });
    if (this.data.searchKeyword && !(this.data.favorites || []).length) {
      this.doSearch();
    }
  },
  hideFavoriteModal() {
    this.setData({ showFavoriteModal: false, activeCategory: null });
  },
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value || '' });
  },
  async doSearch() {
    const kw = String(this.data.searchKeyword || '').trim();
    this.setData({ searching: true });
    try {
      let { brands } = this.data;
      if (!brands || !brands.length) {
        await this.loadBrands();
        brands = this.data.brands;
      }
      const matchedBrands = brands.filter(b => b.name.includes(kw));
      this.setData({ favorites: matchedBrands });
    } catch (e) {
      console.error('搜索失败：', e);
      wx.showToast({ title: '搜索失败', icon: 'none' });
      this.setData({ favorites: [] });
    } finally {
      this.setData({ searching: false });
    }
  },
  selectFavoriteDrink(e) {
    const brand = e.currentTarget?.dataset?.drink;
    if (!brand) return;
    wx.navigateTo({
      url: `/subpackage/recording/brandcoffee/brandcoffee?brandId=${brand.id}&brandName=${encodeURIComponent(brand.name)}`
    });
  },
  toggleFavorite(e) {
    const id = e?.currentTarget?.dataset?.drinkId;
    if (!id) return;
    const drink =
      (this.data.favorites || []).find(d => d.id === id) ||
      (this.data.list || []).find(d => d.id === id) ||
      (this.data.customDrinks || []).find(d => d.id === id);
    if (drink) {
      this.addToRecent(drink);
      this._goDrinkDetail(drink);
    }
  },

  /* ============ 自定义饮品 ============ */
  switchToCustom() { this.setData({ showCustomModal: true, activeCategory: 'custom' }); },
  hideCustomModal() { this.setData({ showCustomModal: false, activeCategory: null }); },
  showAddCustomModal() {
    this.setData({ showAddCustomModal: true, customDrink: { name: '', caffeine: '', unitIndex: 0 } });
  },
  hideAddCustomModal() { this.setData({ showAddCustomModal: false }); },
  stopPropagation() {},

  onCustomNameInput(e) { this.setData({ 'customDrink.name': e.detail.value }); },
  onCustomCaffeineInput(e) { this.setData({ 'customDrink.caffeine': e.detail.value }); },
  onUnitChange(e) { this.setData({ 'customDrink.unitIndex': parseInt(e.detail.value) }); },

  async addCustomDrink() {
    const { name, caffeine, unitIndex } = this.data.customDrink;
    const unit = this.data.unitOptions[unitIndex];
    if (!name.trim()) return wx.showToast({ title: '请输入饮品名称', icon: 'none' });
    if (!caffeine || isNaN(caffeine) || caffeine <= 0) return wx.showToast({ title: '请输入有效的咖啡因含量', icon: 'none' });

    try {
      await addCustomDrinkToCloud(this.data.userId, {
        name: name.trim(),
        caffeine: parseInt(caffeine),
        unit
      });
      wx.showToast({ title: '添加成功', icon: 'success' });
      this.setData({ showAddCustomModal: false });
      this.loadCustomDrinksFromCloud();
    } catch (e) {
      console.error('添加自定义饮品失败:', e);
      wx.showToast({ title: '添加失败', icon: 'none' });
    }
  },

  deleteCustomDrink(e) {
    const drinkId = e.currentTarget.dataset.drinkId;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个自定义饮品吗？',
      confirmText: '删除',
      confirmColor: '#e74c3c',
      cancelText: '取消',
      success: (res) => { if (res.confirm) this.performDeleteCustomDrink(drinkId); }
    });
  },
  async performDeleteCustomDrink(drinkId) {
    try {
      await deleteCustomDrinkFromCloud(this.data.userId, drinkId);
      wx.showToast({ title: '删除成功', icon: 'success' });
      this.loadCustomDrinksFromCloud();
    } catch (e) {
      console.error('删除自定义饮品失败:', e);
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },

  /* ============ 跳转详情（保持你的写法） ============ */
  toDetail(e) {
    const item = e.currentTarget?.dataset?.item;
    if (!item) return; this._goDrinkDetail(item);
  },
  selectDrink(e) {
    const drink = e.currentTarget?.dataset?.drink;
    if (!drink) return; this._goDrinkDetail(drink);
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

  onPullDownRefresh() {
    this.updateActiveBrandName();
    wx.stopPullDownRefresh();
  },

  onError(err) {
    console.error('页面错误:', err);
    wx.showToast({ title: '加载失败，请重试', icon: 'none' });
  }
});
