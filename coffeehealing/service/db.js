// services/db.js
// 统一的数据访问层（DAL）：把所有 LeanCloud 的读写放在这一处
// 页面层：只关心调用，不直接 new AV.Query / AV.Object

const AV = require('../libs/av-core-min');

/* ------------------------------ 工具函数 ------------------------------ */

// toPlain: 将 AV.Object → 普通 JSON（含 objectId/createdAt/updatedAt）
function toPlain(obj) {
  if (!obj) return null;
  return obj.toJSON();
}

// parseDateOnly: 'YYYY-MM-DD' → 本地 0 点 Date（避免时区偏移导致日期不准）
function parseDateOnly(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

// safeNum: 防止 NaN / null
function safeNum(x, def = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : def;
}

// 构建通用 ACL（示例：公共可读 + 仅管理员可写）
function buildPublicReadAdminWriteACL() {
  const acl = new AV.ACL();
  acl.setPublicReadAccess(true);
  if (acl.setRoleWriteAccess) {
    acl.setRoleWriteAccess('admin', true);
  }
  return acl;
}

/* ------------------------------ Class 名称 ------------------------------ */
const CLASS_INTAKE = 'intakes';
const CLASS_DRINK = 'drinks_catalog2';
const CLASS_PROFILE = 'user_profiles';
const CLASS_FEEDBACK = 'feedback';
const CLASS_FAVORITE = 'user_favorites';        // ⭐ 新增：用户收藏表

/* ====================================================================== */
/*                               intakes                                  */
/* ====================================================================== */
async function listIntakesByDate(dateStrOrDate, userId) {
  const day = typeof dateStrOrDate === 'string' ? parseDateOnly(dateStrOrDate) : dateStrOrDate;
  const q = new AV.Query(CLASS_INTAKE);
  q.equalTo('takenAt', day);
  if (userId) q.equalTo('userId', userId);
  q.ascending('takenAt_time');
  const rows = await q.find();
  return rows.map(toPlain);
}

async function listIntakesInRange(startStrOrDate, endStrOrDate, userId) {
  const start = typeof startStrOrDate === 'string' ? parseDateOnly(startStrOrDate) : startStrOrDate;
  const end = typeof endStrOrDate === 'string' ? parseDateOnly(endStrOrDate) : endStrOrDate;
  const q = new AV.Query(CLASS_INTAKE);
  q.greaterThanOrEqualTo('takenAt', start);
  q.lessThanOrEqualTo('takenAt', end);
  if (userId) q.equalTo('userId', userId);
  q.addAscending('takenAt').addAscending('takenAt_time');
  q.limit(1000);
  const rows = await q.find();
  return rows.map(toPlain);
}

async function addIntake(data, { useACL = false } = {}) {
  const obj = new AV.Object(CLASS_INTAKE);
  Object.entries(data).forEach(([k, v]) => obj.set(k, v));
  if (useACL) obj.setACL(buildPublicReadAdminWriteACL());
  const saved = await obj.save();
  return toPlain(saved);
}

async function updateIntake(objectId, patch) {
  const obj = AV.Object.createWithoutData(CLASS_INTAKE, objectId);
  Object.entries(patch).forEach(([k, v]) => obj.set(k, v));
  const saved = await obj.save();
  return toPlain(saved);
}

async function deleteIntake(objectId) {
  const obj = AV.Object.createWithoutData(CLASS_INTAKE, objectId);
  await obj.destroy();
  return true;
}

/* ====================================================================== */
/*                            drinks_catalog2                              */
/* ====================================================================== */
async function listDrinks({ brand, keyword, page = 1, pageSize = 20 } = {}) {
  const q = new AV.Query(CLASS_DRINK);
  if (brand) q.equalTo('brand', brand);
  if (keyword) q.contains('product', keyword);
  q.addAscending('brand').addAscending('product').addAscending('size_key');
  q.skip((page - 1) * pageSize).limit(pageSize);
  const rows = await q.find();
  return rows.map(toPlain);
}

async function getDrink(objectId) {
  const obj = AV.Object.createWithoutData(CLASS_DRINK, objectId);
  await obj.fetch();
  return toPlain(obj);
}

async function upsertDrink(snap, { useACL = false } = {}) {
  const { brand, product, size_key } = snap;
  const q = new AV.Query(CLASS_DRINK);
  q.equalTo('brand', brand);
  q.equalTo('product', product);
  q.equalTo('size_key', size_key);
  const existing = await q.first();

  let obj;
  if (existing) {
    obj = AV.Object.createWithoutData(CLASS_DRINK, existing.id);
  } else {
    obj = new AV.Object(CLASS_DRINK);
    if (useACL) obj.setACL(buildPublicReadAdminWriteACL());
  }

  obj.set('brand', brand);
  obj.set('product', product);
  obj.set('size_key', size_key);
  obj.set('size_ml', safeNum(snap.size_ml));
  obj.set('caffeine_per_serving_mg', safeNum(snap.caffeine_per_serving_mg));
  obj.set('polyphenols_per_serving_mg', safeNum(snap.polyphenols_per_serving_mg));

  const servings = safeNum(snap.servings, 1);
  obj.set('servings', servings);
  obj.set('caffeine_total_mg', safeNum(snap.caffeine_per_serving_mg) * servings);
  obj.set('polyphenols_total_mg', safeNum(snap.polyphenols_per_serving_mg) * servings);

  if (snap.note) obj.set('note', snap.note);

  const saved = await obj.save();
  return toPlain(saved);
}

async function addDrink(data, { useACL = false } = {}) {
  const obj = new AV.Object(CLASS_DRINK);
  Object.entries(data).forEach(([k, v]) => obj.set(k, v));
  if (useACL) obj.setACL(buildPublicReadAdminWriteACL());
  const saved = await obj.save();
  return toPlain(saved);
}

async function updateDrink(objectId, patch) {
  const obj = AV.Object.createWithoutData(CLASS_DRINK, objectId);
  Object.entries(patch).forEach(([k, v]) => obj.set(k, v));
  const saved = await obj.save();
  return toPlain(saved);
}

async function deleteDrink(objectId) {
  const obj = AV.Object.createWithoutData(CLASS_DRINK, objectId);
  await obj.destroy();
  return true;
}

async function listBrands() {
  const q = new AV.Query(CLASS_DRINK);
  q.select(['brand']).limit(1000);
  const rows = await q.find();
  const brands = rows.map(r => r.get('brand')).filter(Boolean);
  return Array.from(new Set(brands)).sort();
}

/* ====================================================================== */
/*                                 profiles                               */
/* ====================================================================== */
// 旧方案（通过 userId 字段）
async function getOrCreateProfile(userId, defaults = {}) {
  const q = new AV.Query(CLASS_PROFILE);
  q.equalTo('userId', userId);
  const exist = await q.first();
  if (exist) return toPlain(exist);

  const obj = new AV.Object(CLASS_PROFILE);
  obj.set('userId', userId);
  Object.entries(defaults).forEach(([k, v]) => obj.set(k, v));
  const saved = await obj.save();
  return toPlain(saved);
}

async function getProfile(userId) {
  const q = new AV.Query(CLASS_PROFILE);
  q.equalTo('userId', userId);
  const exist = await q.first();
  return exist ? toPlain(exist) : null;
}

async function updateProfile(userId, patch) {
  const q = new AV.Query(CLASS_PROFILE);
  q.equalTo('userId', userId);
  const exist = await q.first();
  if (!exist) throw new Error('Profile not found for userId=' + userId);
  const obj = AV.Object.createWithoutData(CLASS_PROFILE, exist.id);
  Object.entries(patch).forEach(([k, v]) => obj.set(k, v));
  const saved = await obj.save();
  return toPlain(saved);
}

// 新方案（通过 Pointer<_User>）
async function getOrCreateUserProfile(userId, defaults = {}) {
  const q = new AV.Query(CLASS_PROFILE);
  q.equalTo('user', AV.Object.createWithoutData('_User', userId));
  const exist = await q.first();
  if (exist) return toPlain(exist);

  const obj = new AV.Object(CLASS_PROFILE);
  obj.set('user', AV.Object.createWithoutData('_User', userId)); // Pointer<_User>

  obj.set('display_name', defaults.display_name || '');
  obj.set('phone_contact', defaults.phone_contact || '');
  obj.set('avatar', defaults.avatar || null);
  obj.set('height_cm', defaults.height_cm || null);
  obj.set('weight_kg', defaults.weight_kg || null);
  obj.set('age', defaults.age || null);
  obj.set('caffeine_template_key', defaults.caffeine_template_key || '');
  obj.set('bedtime_caffeine_threshold_mg', defaults.bedtime_caffeine_threshold_mg || null);
  obj.set('bedtime_target', defaults.bedtime_target || '');
  obj.set('bear_style', defaults.bear_style || {});
  obj.set('onboarding_answers1', defaults.onboarding_answers1 || null);
  obj.set('onboarding_answers2', defaults.onboarding_answers2 || null);
  obj.set('onboarding_answers3', defaults.onboarding_answers3 || null);
  obj.set('onboarding_answers4', defaults.onboarding_answers4 || null);
  obj.set('onboarding_answers5', defaults.onboarding_answers5 || null);

  const saved = await obj.save();
  return toPlain(saved);
}

async function updateUserProfile(userId, patch) {
  const q = new AV.Query(CLASS_PROFILE);
  q.equalTo('user', AV.Object.createWithoutData('_User', userId));
  const exist = await q.first();
  if (!exist) throw new Error('User profile not found for userId=' + userId);
  const obj = AV.Object.createWithoutData(CLASS_PROFILE, exist.id);
  Object.entries(patch).forEach(([k, v]) => obj.set(k, v));
  const saved = await obj.save();
  return toPlain(saved);
}

/* ====================================================================== */
/*                                 account                                */
/* ====================================================================== */
async function registerWithPhone(phone, password, defaults = {}) {
  if (!phone || !String(phone).trim()) {
    throw new Error('手机号不能为空');
  }
  if (!password || !String(password).trim()) {
    throw new Error('密码不能为空');
  }

  const phoneTrim = String(phone).trim();
  let registeredUser;

  try {
    // 尝试注册
    const user = new AV.User();
    user.setUsername(phoneTrim);
    user.setMobilePhoneNumber(phoneTrim);
    user.setPassword(password);
    registeredUser = await user.signUp();
  } catch (err) {
    if (err.code === 214) {
      // 手机号已注册，直接登录
      registeredUser = await AV.User.logInWithMobilePhone(phoneTrim, password);
    } else {
      throw err;
    }
  }
  
  const userId = registeredUser.id;

  // 创建或获取 user_profiles
  const profile = await getOrCreateUserProfile(userId, {
    display_name: defaults.display_name || '新用户',
    phone_contact: phoneTrim,
    ...defaults
  });

  // 初始化 health_daily
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDate = parseDateOnly(todayStr);

  const healthDailyQuery = new AV.Query('health_daily');
  healthDailyQuery.equalTo('user', AV.Object.createWithoutData('_User', userId));
  healthDailyQuery.equalTo('date', todayDate);

  const existDaily = await healthDailyQuery.first();
  if (!existDaily) {
    const healthDaily = new AV.Object('health_daily');
    healthDaily.set('user', AV.Object.createWithoutData('_User', userId));
    healthDaily.set('date', todayDate);
    healthDaily.set('status', 'initial');
    await healthDaily.save();
  }

  return { user: registeredUser.toJSON(), profile };
}
// 检查手机号是否已注册
async function queryUserByPhone(phone) {
  const query = new AV.Query('_User');
  query.equalTo('phone', phone);
  const result = await query.find();
  return result; // 如果数组长度 > 0 就代表存在用户
}

module.exports = {
  registerWithPhone,
  queryUserByPhone
};

async function loginWithPhone(phone, password) {
  if (!phone || !String(phone).trim()) {
    throw new Error('手机号不能为空');
  }
  if (!password || !String(password).trim()) {
    throw new Error('密码不能为空');
  }

  try {
    const loggedInUser = await AV.User.logInWithMobilePhone(
      String(phone).trim(),
      String(password)
    );
    const userId = loggedInUser.id;

    const profile = await getOrCreateUserProfile(userId, {
      display_name: String(phone).trim(),
      phone_contact: String(phone).trim()
    });

    return { user: loggedInUser.toJSON(), profile };
  } catch (err) {
    if (err.code === 211) {
      throw new Error('手机号未注册');
    }
    if (err.code === 210) {
      throw new Error('密码错误');
    }
    throw err;
  }
}

/* ====================================================================== */
/*                                favorites                                */
/* ====================================================================== */
/**
 * 列出某个用户的收藏
 * 返回：[{objectId, drink_id, brand, product, size_key, caffeine_per_serving_mg, unit, drink(可空), createdAt, ...}]
 */
async function listFavoritesByUser(userId) {
  if (!userId) throw new Error('listFavoritesByUser: userId required');
  const q = new AV.Query(CLASS_FAVORITE);
  q.equalTo('user', AV.Object.createWithoutData('_User', userId));
  q.include('drink');                      // 如果有 pointer，顺带取回
  q.limit(1000).descending('createdAt');
  const rows = await q.find();
  return rows.map(toPlain);
}

/**
 * 添加收藏（幂等：已存在则直接返回）
 * drinkSnap: { id, name, caffeine, unit, category(品牌名或品牌ID), size_key? }
 */
async function addFavorite(userId, drinkSnap) {
  if (!userId) throw new Error('addFavorite: userId required');
  if (!drinkSnap || !drinkSnap.id) throw new Error('addFavorite: drinkSnap.id required');

  // 先查是否已存在
  const q = new AV.Query(CLASS_FAVORITE);
  q.equalTo('user', AV.Object.createWithoutData('_User', userId));
  q.equalTo('drink_id', String(drinkSnap.id));
  const exist = await q.first();
  if (exist) return toPlain(exist);

  const obj = new AV.Object(CLASS_FAVORITE);
  obj.set('user', AV.Object.createWithoutData('_User', userId));
  obj.set('drink_id', String(drinkSnap.id));

  // 可选的指针（若该收藏来自字典）
  try {
    obj.set('drink', AV.Object.createWithoutData(CLASS_DRINK, String(drinkSnap.id)));
  } catch (_) {}

  // 快照：避免字典后续变更影响历史
  obj.set('brand', drinkSnap.brand || drinkSnap.category || '');
  obj.set('product', drinkSnap.name || '');
  obj.set('size_key', drinkSnap.size_key || '');
  obj.set('caffeine_per_serving_mg', safeNum(drinkSnap.caffeine));
  obj.set('unit', drinkSnap.unit || '/每份');

  const saved = await obj.save();
  return toPlain(saved);
}

/**
 * 取消收藏（按 user + drink_id 删除，多余记录也清理）
 */
async function removeFavorite(userId, drinkId) {
  if (!userId) throw new Error('removeFavorite: userId required');
  const q = new AV.Query(CLASS_FAVORITE);
  q.equalTo('user', AV.Object.createWithoutData('_User', userId));
  q.equalTo('drink_id', String(drinkId));
  const rows = await q.find();
  if (!rows.length) return true;
  await AV.Object.destroyAll(rows);
  return true;
}

/* ====================================================================== */
/*                                 feedback                               */
/* ====================================================================== */
async function addFeedback(data, { useACL = false } = {}) {
  const obj = new AV.Object(CLASS_FEEDBACK);
  Object.entries(data).forEach(([k, v]) => obj.set(k, v));
  if (useACL) obj.setACL(buildPublicReadAdminWriteACL());
  const saved = await obj.save();
  return toPlain(saved);
}

/* ====================================================================== */
/*                                导出 API                                */
/* ====================================================================== */
module.exports = {
  // 工具
  toPlain,
  parseDateOnly,
  safeNum,

  // intakes
  listIntakesByDate,
  listIntakesInRange,
  addIntake,
  updateIntake,
  deleteIntake,

  // drinks_catalog2
  listDrinks,
  getDrink,
  upsertDrink,
  addDrink,
  updateDrink,
  deleteDrink,
  listBrands,

  // profiles
  getOrCreateProfile,
  getProfile,
  updateProfile,
  getOrCreateUserProfile,
  updateUserProfile,

  // account
  registerWithPhone,
  loginWithPhone,

  // favorites ⭐
  listFavoritesByUser,
  addFavorite,
  removeFavorite,

  // feedback
  addFeedback
};
