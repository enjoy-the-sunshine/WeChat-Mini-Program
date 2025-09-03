// pages/add_home/add_home_with_db.js
// 真实数据库版本：LeanCloud 适配在 utils/database.js
const { dbService } = require('../../utils/database.js')

Page({
  data: {
    currentCategory: 'recent',
    currentCategoryTitle: '最近浏览',

    brands: [],               // ← 在线读取
    currentDrinks: [],
    allDrinks: {},            // { brandId: Drink[] }

    recentDrinks: [],
    favoriteDrinks: [],
    customDrinks: [],

    showCustomModal: false,
    customDrink: { name: '', caffeine: '', unitIndex: 0 },
    unitOptions: ['/每份', '/杯', '/瓶', '/罐'],

    loading: false,
    userId: null
  },

  onLoad() {
    this.getUserId();
    this.initData();
  },

  onShow() {
    this.refreshUserData();
  },

  getUserId() {
    const userId = wx.getStorageSync('userId') || 'default_user';
    this.setData({ userId });
  },

  initData() {
    this.setData({ loading: true });
    this.loadBrands()
      .then(() => this.loadCommonAndBrandDrinks())
      .then(() => this.loadUserData())
      .finally(() => {
        this.updateCurrentDrinks();
        this.setData({ loading: false });
      });
  },

  // 在线取品牌
  loadBrands() {
    return dbService.getBrands()
      .then(brands => {
        this.setData({ brands: brands || [] });
      })
      .catch(err => {
        console.error('加载品牌失败', err);
        this.setData({ brands: [] });
      });
  },

  // 通用 + 各品牌饮品
  loadCommonAndBrandDrinks() {
    const tasks = (this.data.brands || []).map(b =>
      dbService.getDrinks(b.id, { page: 1, pageSize: 100 })
        .then(list => {
          const map = { ...this.data.allDrinks };
          map[b.id] = list || [];
          this.setData({ allDrinks: map });
        })
    );
    // 本地 common 如需保留，这里可赋值空数组
    const map = { ...this.data.allDrinks };
    map.common = map.common || [];
    this.setData({ allDrinks: map });

    return Promise.all(tasks);
  },

  // 用户态（本地存储版）
  loadUserData() {
    const { userId } = this.data;
    if (!userId) return;

    dbService.getUserFavorites(userId, (favorites) => {
      this.setData({ favoriteDrinks: favorites || [] });
      this.updateFavoriteStatus();
    });

    dbService.getCustomDrinks(userId, (custom) => {
      this.setData({ customDrinks: custom || [] });
      this.updateFavoriteStatus();
    });

    dbService.getRecent(userId, 20, (recent) => {
      this.setData({ recentDrinks: recent || [] });
      this.updateFavoriteStatus();
    });
  },

  refreshUserData() {
    this.loadUserData();
    this.updateCurrentDrinks();
  },

  updateFavoriteStatus() {
    const favoriteIds = this.data.favoriteDrinks.map(d => d.drinkId || d.id);
    const allDrinks = { ...this.data.allDrinks };
    Object.keys(allDrinks).forEach(category => {
      allDrinks[category] = (allDrinks[category] || []).map(drink => ({
        ...drink,
        isFavorite: favoriteIds.includes(drink.id)
      }));
    });
    const customDrinks = (this.data.customDrinks || []).map(drink => ({
      ...drink,
      isFavorite: favoriteIds.includes(drink.id)
    }));
    this.setData({ allDrinks, customDrinks });
  },

  // 分类切换
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    let title = '';
    switch (category) {
      case 'recent':   title = '最近浏览'; break;
      case 'favorite': title = '我的收藏'; break;
      case 'custom':   title = '自定义咖啡'; break;
      default: {
        const brand = this.data.brands.find(b => b.id === category);
        title = brand ? brand.name : '饮品列表';
      }
    }
    this.setData({ currentCategory: category, currentCategoryTitle: title });
    this.updateCurrentDrinks();
  },

  updateCurrentDrinks() {
    let drinks = [];
    switch (this.data.currentCategory) {
      case 'recent':   drinks = (this.data.recentDrinks || []).map(x => x.drink || x); break;
      case 'favorite': drinks = (this.data.favoriteDrinks || []).map(x => x.drink || x); break;
      case 'custom':   drinks = this.data.customDrinks || []; break;
      default:         drinks = this.data.allDrinks[this.data.currentCategory] || [];
    }
    this.setData({ currentDrinks: drinks });
  },

  // 选择饮品
  selectDrink(e) {
    const drink = e.currentTarget.dataset.drink;
    this.addToRecent(drink);
    wx.navigateTo({
      url: `/subpackage/recording/drinkdetail/drinkdetail`
        + `?name=${encodeURIComponent(drink.name)}`
        + `&brand=${encodeURIComponent(drink.category || '')}`
        + `&caffeine=${drink.caffeine || 0}`
        + `&unit=${encodeURIComponent(drink.unit || '')}`
    });
  },

  addToRecent(drink) {
    const { userId } = this.data;
    if (!userId) return;
    dbService.updateRecent(userId, drink, (ok) => {
      if (ok) {
        dbService.getRecent(userId, 20, (recent) => {
          this.setData({ recentDrinks: recent || [] });
        });
      }
    });
  },

  // 收藏
  toggleFavorite(e) {
    const drinkId = e.currentTarget.dataset.drinkId;
    const { userId } = this.data;
    if (!userId) return;

    let drink = null;
    Object.keys(this.data.allDrinks).forEach(cat => {
      const found = (this.data.allDrinks[cat] || []).find(d => d.id === drinkId);
      if (found) drink = found;
    });
    if (!drink) drink = (this.data.customDrinks || []).find(d => d.id === drinkId);
    if (!drink) return;

    if (drink.isFavorite) {
      dbService.removeFavorite(userId, drinkId, () => this.refreshUserData());
    } else {
      dbService.addFavorite(userId, drink, () => this.refreshUserData());
    }
  },

  // 自定义弹窗
  showCustomAddModal() {
    this.setData({ showCustomModal: true, customDrink: { name: '', caffeine: '', unitIndex: 0 } });
  },
  hideCustomModal() { this.setData({ showCustomModal: false }); },
  stopPropagation() {},

  onCustomNameInput(e) { this.setData({ 'customDrink.name': e.detail.value }); },
  onCustomCaffeineInput(e) { this.setData({ 'customDrink.caffeine': e.detail.value }); },
  onUnitChange(e) { this.setData({ 'customDrink.unitIndex': parseInt(e.detail.value) }); },

  addCustomDrink() {
    const { name, caffeine, unitIndex } = this.data.customDrink;
    const { userId } = this.data;
    const unit = this.data.unitOptions[unitIndex];

    if (!userId) { wx.showToast({ title: '请先登录', icon: 'none' }); return; }
    if (!name.trim()) { wx.showToast({ title: '请输入饮品名称', icon: 'none' }); return; }
    if (!caffeine || isNaN(caffeine) || caffeine <= 0) {
      wx.showToast({ title: '请输入有效的咖啡因含量', icon: 'none' }); return;
    }

    const newDrink = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      caffeine: parseInt(caffeine),
      unit,
      icon: '/images/drinks/custom.png',
      category: 'custom',
      isFavorite: false,
      isCustom: true
    };

    dbService.addCustomDrink(userId, newDrink, (ok) => {
      if (ok) {
        this.setData({ showCustomModal: false });
        dbService.getCustomDrinks(userId, (custom) => {
          this.setData({ customDrinks: custom || [] });
          if (this.data.currentCategory === 'custom') this.updateCurrentDrinks();
        });
        wx.showToast({ title: '添加成功', icon: 'success' });
      } else {
        wx.showToast({ title: '添加失败，请重试', icon: 'none' });
      }
    });
  },

  onPullDownRefresh() {
    this.refreshUserData();
    wx.stopPullDownRefresh();
  },

  onError(err) {
    console.error('页面错误:', err);
    wx.showToast({ title: '加载失败，请重试', icon: 'none' });
  }
});
