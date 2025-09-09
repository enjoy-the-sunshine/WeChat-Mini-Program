// pages/brandcoffee/brandcoffee.js
const dal = require('../../../service/db.js');
const AV = require('../../../libs/av-core-min');
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

Page({
  data: {
    brand: '',
    brandName: '',
    brandLogoUrl: '',
    keyword: '',
    coffeeList: [],
    filteredList: [],
    favoriteIds: [],
    userId: null
  },

  async onLoad(options) {
    const brandId = options.brandId || '';
    const brandName = decodeURIComponent(options.brandName || '');
    const userId = this.getUserId();
    this.setData({
      brand: brandId,
      brandName,
      brandLogoUrl: getBrandLogoUrl(brandName),
      userId
    });

    let list = [];

    if (brandName === '最近') {
      list = wx.getStorageSync('recentCoffee') || [];
    } else {
      try {
        // 从后端获取 drink_catalog2 数据
        const rows = await dal.listDrinks({ brand: brandName, page: 1, pageSize: 1000 });

        // 按饮品名称分组，每个饮品包含多个杯型
        const drinkMap = new Map();
        (rows || []).forEach(row => {
          const caffeine = Number(row.caffeine_mg ?? row.caffeine_per_serving_mg ?? 0);
          const productName = row.product;
          const sizeKey = row.size_key || '';
          const sizeMl = row.size_ml || '';
          
          if (!drinkMap.has(productName)) {
            drinkMap.set(productName, {
              name: productName,
              cupSizes: [],
              objectId: row.objectId,
              isFavorite: false
            });
          }
          
          const drink = drinkMap.get(productName);
          drink.cupSizes.push({
            name: sizeKey || '标准',
            caffeine: caffeine,
            size_key: sizeKey,
            size_ml: sizeMl,
            objectId: row.objectId
          });
        });
        
        // 转换为数组，按杯型数量排序
        list = Array.from(drinkMap.values()).sort((a, b) => b.cupSizes.length - a.cupSizes.length);

        if (list.length === 0) {
          list = this.getHardcodedDrinks(brandName);
        }
      } catch (e) {
        console.error('从云端获取饮品数据失败:', e);
        list = this.getHardcodedDrinks(brandName);
      }
    }

    this.setData({ coffeeList: list, filteredList: list });
    wx.setNavigationBarTitle({ title: brandName });

    this.loadFavoriteStatus();
  },

  getHardcodedDrinks(brandName) {
    // 保留原有兜底逻辑
    return [];
  },

  getUserId() {
    const u = AV.User.current && AV.User.current();
    return u ? u.id : null;
  },

  async loadFavoriteStatus() {
    const { userId } = this.data;
    try {
      if (userId) {
        const rows = await dal.listFavoritesByUser(userId);
        const favoriteIds = (rows || []).map(r => r.drink_id);
        this.setData({ favoriteIds });
        this.saveFavoriteStatus();
      } else {
        const favoriteIds = wx.getStorageSync('favorites_ids') || [];
        this.setData({ favoriteIds });
      }
      this.updateFavoriteFlags();
    } catch (e) {
      console.error('加载收藏状态失败:', e);
      const favoriteIds = wx.getStorageSync('favorites_ids') || [];
      this.setData({ favoriteIds });
      this.updateFavoriteFlags();
    }
  },

  updateFavoriteFlags() {
    const { favoriteIds, coffeeList, keyword } = this.data;
    const favoriteSet = new Set(favoriteIds);

    const updatedList = coffeeList.map(drink => {
      // 检查饮品本身是否被收藏
      const isDrinkFavorite = favoriteSet.has(drink.objectId || drink.name);
      
      // 检查各个杯型是否被收藏
      const updatedCupSizes = drink.cupSizes.map(cupSize => ({
        ...cupSize,
        isFavorite: favoriteSet.has(cupSize.objectId || `${drink.name}-${cupSize.size_key}`)
      }));
      
      return {
        ...drink,
        isFavorite: isDrinkFavorite,
        cupSizes: updatedCupSizes
      };
    });

    let filteredList = updatedList;
    if (keyword) {
      filteredList = updatedList.filter(item =>
        item.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    this.setData({
      coffeeList: updatedList,
      filteredList
    });
  },

  saveFavoriteStatus() {
    try {
      wx.setStorageSync('favorites_ids', this.data.favoriteIds);
    } catch (e) {
      console.error('保存收藏状态失败:', e);
    }
  },

  async toggleFavorite(e) {
    const drink = e.currentTarget.dataset.drink;
    if (!drink) return;

    const { favoriteIds, userId, brandName } = this.data;
    
    // 如果饮品有多个杯型，收藏整个饮品（使用第一个杯型的数据）
    let drinkId, drinkName, caffeine, sizeKey;
    
    if (drink.cupSizes && drink.cupSizes.length > 0) {
      // 使用第一个杯型的数据作为代表
      const firstCupSize = drink.cupSizes[0];
      drinkId = firstCupSize.objectId || `${drink.name}-${firstCupSize.size_key}`;
      drinkName = drink.name;
      caffeine = firstCupSize.caffeine;
      sizeKey = firstCupSize.size_key;
    } else {
      // 兼容旧数据结构
      drinkId = drink.objectId || drink.name;
      drinkName = drink.name;
      caffeine = drink.caffeine || 0;
      sizeKey = drink.size_key || '';
    }

    let newFavoriteIds = [...favoriteIds];
    const isFav = favoriteIds.includes(drinkId);

    if (isFav) {
      newFavoriteIds = newFavoriteIds.filter(id => id !== drinkId);
      this.setData({ favoriteIds: newFavoriteIds });
      this.saveFavoriteStatus();
      this.updateFavoriteFlags();
      if (userId) {
        try {
          await dal.removeFavorite(userId, drinkId);
        } catch (e) {
          console.warn('云端取消收藏失败:', e);
        }
      }
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
      newFavoriteIds.push(drinkId);
      this.setData({ favoriteIds: newFavoriteIds });
      this.saveFavoriteStatus();
      this.updateFavoriteFlags();
      if (userId) {
        try {
          await dal.addFavorite(userId, {
            id: drinkId,
            name: drinkName,
            caffeine: caffeine,
            unit: '/每份',
            category: brandName,
            size_key: sizeKey
          });
        } catch (e) {
          console.warn('云端添加收藏失败:', e);
        }
      }
      wx.showToast({ title: '已加入收藏', icon: 'success' });
    }
  },

  onSearchInput(e) {
    const keyword = e.detail.value.toLowerCase();
    const filteredList = this.data.coffeeList.filter(item =>
      item.name.toLowerCase().includes(keyword)
    );
    this.setData({
      keyword: e.detail.value,
      filteredList
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
