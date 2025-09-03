// utils/database.js
const dal = require('../services/db.js');

/** 品牌映射（按需增补或直接用中文） */
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
const BRAND_REVERSE = Object.fromEntries(
  Object.entries(BRAND_MAP).map(([id, name]) => [name, id])
);

/** 表行 → 页面 drink 对象 */
function rowToDrink(row) {
  const caffeine = Number(row.caffeine_mg ?? row.caffeine_per_serving_mg ?? 0);
  const brandName = row.brand || '';
  const brandId = BRAND_REVERSE[brandName] || brandName; // 映射不到就用中文
  return {
    id: row.objectId,
    name: row.product,
    caffeine,
    unit: '/每份',
    size_key: row.size_key,
    size_ml: row.size_ml ?? null,
    emoji: '☕',
    category: brandId,
    isFavorite: false,
    _raw: row
  };
}

/** 读品牌（仅展示 approved & isPublic=true） */
async function getBrands() {
  const page1 = await dal.listDrinks({ page: 1, pageSize: 1000 });
  const rows = page1.filter(r =>
    (r.status ?? 'approved') === 'approved' &&
    (r.isPublic ?? true) === true &&
    !!r.brand
  );
  const uniq = Array.from(new Set(rows.map(r => r.brand))).sort();
  return uniq.map(name => ({
    id: BRAND_REVERSE[name] || name,
    name,
    emoji: '🧋'
  }));
}

/** 读某品牌饮品；brand='common' 返回空（保留你们本地 common 逻辑） */
async function getDrinks(brandIdOrCommon, { page = 1, pageSize = 40, keyword = '' } = {}) {
  if (brandIdOrCommon === 'common') return [];
  const brandName = BRAND_MAP[brandIdOrCommon] || brandIdOrCommon;
  const rows = await dal.listDrinks({ brand: brandName, keyword, page, pageSize });
  const filtered = rows.filter(r =>
    (r.status ?? 'approved') === 'approved' &&
    (r.isPublic ?? true) === true
  );
  return filtered.map(rowToDrink);
}

/** —— 最近 / 收藏 / 自定义：本地存储兜底，与旧页面兼容 —— */
function _get(key, def = []) { try { return wx.getStorageSync(key) || def; } catch { return def; } }
function _set(key, v) { try { wx.setStorageSync(key, v); } catch {} }

function getRecent(userId, limit = 20, cb) { const arr = _get('recentDrinks').slice(0, limit); cb && cb(arr); return arr; }
function updateRecent(userId, drink, cb) {
  let arr = _get('recentDrinks');
  arr = arr.filter(d => d.id !== drink.id);
  arr.unshift(drink);
  if (arr.length > 50) arr = arr.slice(0, 50);
  _set('recentDrinks', arr);
  cb && cb(true); return true;
}
function getUserFavorites(userId, cb) { const v = _get('favoriteDrinks'); cb && cb(v); return v; }
function addFavorite(userId, drink, cb) { const v = _get('favoriteDrinks'); if (!v.find(d=>d.id===drink.id)) v.push(drink); _set('favoriteDrinks', v); cb && cb(true); }
function removeFavorite(userId, id, cb) { let v = _get('favoriteDrinks'); v = v.filter(d=>d.id!==id); _set('favoriteDrinks', v); cb && cb(true); }
function getCustomDrinks(userId, cb) { const v = _get('customDrinks'); cb && cb(v); return v; }
function addCustomDrink(userId, drink, cb) { const v = [drink, ..._get('customDrinks')]; _set('customDrinks', v); cb && cb(true); }

module.exports = {
  dbService: {
    getBrands,
    getDrinks,
    getRecent, updateRecent,
    getUserFavorites, addFavorite, removeFavorite,
    getCustomDrinks, addCustomDrink
  }
};
