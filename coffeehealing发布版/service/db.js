// service/db.js
// 统一的数据访问层（DAL）：把所有 LeanCloud 的读写放在这一处
// 页面层：只关心调用，不直接 new AV.Query / AV.Object

const AV = require('../libs/av-core-min');
const K_BASE = Math.LN2 / 4; // ln(2)/4 ≈ 0.173 —— 个性化代谢速率的基准常量

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
const CLASS_FAVORITE = 'user_favorites';        // ⭐ 用户收藏表

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
/*                            drinks_catalog2                             */
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
/*                                profiles                                */
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

// ✅ 统一版 getProfile（推荐用这个）
async function getProfile(userId, { ensure = false, defaults = {} } = {}) {
  if (!userId) throw new Error('getProfile: userId required');

  // 1) 新方案：Pointer<_User>
  const q1 = new AV.Query(CLASS_PROFILE);
  q1.equalTo('user', AV.Object.createWithoutData('_User', userId));
  const p1 = await q1.first();
  if (p1) return toPlain(p1);

  // 2) 旧方案：userId（String）
  const q2 = new AV.Query(CLASS_PROFILE);
  q2.equalTo('userId', userId);
  const p2 = await q2.first();
  if (p2) return toPlain(p2);

  // 3) 需要就地创建（一人一档）
  if (ensure) {
    return await getOrCreateUserProfile(userId, defaults);
  }
  return null;
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

/* ---------------- 个性化代谢速率：从画像计算 k ---------------- */
/**
 * 依据用户画像计算个性化代谢速率 k
 * k = K_BASE × F_gene × F_smoke × F_pregnancy × F_ocp_hrt × F_liver × F_age
 */
function computePersonalKFromProfile(profile) {
  try {
    let F_gene = 1.0;
    let F_smoke = 1.0;
    let F_pregnancy = 1.0;
    let F_ocp_hrt = 1.0;
    let F_liver = 1.0;
    let F_age = 1.0;

    // 基因（onboarding_answers1）：0=快(1.5), 1=慢(0.6), 2=正常(1.0)
    const geneAns = profile && typeof profile.onboarding_answers1 === 'number' ? profile.onboarding_answers1 : null;
    const geneMap = [1.5, 0.6, 1.0];
    if (geneAns !== null && geneAns >= 0 && geneAns < geneMap.length) F_gene = geneMap[geneAns];

    // 吸烟（onboarding_answers2）：0=否(1.0), 1=是(1.4)
    const smokeAns = profile && typeof profile.onboarding_answers2 === 'number' ? profile.onboarding_answers2 : null;
    const smokeMap = [1.0, 1.4];
    if (smokeAns !== null && smokeAns >= 0 && smokeAns < smokeMap.length) F_smoke = smokeMap[smokeAns];

    // 怀孕（onboarding_answers3）：0=未怀孕/早期(1.0), 1=孕中晚期(0.35)
    const pregAns = profile && typeof profile.onboarding_answers3 === 'number' ? profile.onboarding_answers3 : null;
    const pregMap = [1.0, 0.35];
    if (pregAns !== null && pregAns >= 0 && pregAns < pregMap.length) F_pregnancy = pregMap[pregAns];

    // OCP/HRT（onboarding_answers4）：0=否(1.0), 1=是(0.6)
    const ocpAns = profile && typeof profile.onboarding_answers4 === 'number' ? profile.onboarding_answers4 : null;
    const ocpMap = [1.0, 0.6];
    if (ocpAns !== null && ocpAns >= 0 && ocpAns < ocpMap.length) F_ocp_hrt = ocpMap[ocpAns];

    // 肝功能（onboarding_answers5）：0=健康(1.0), 1=重度肝病(0.4)
    const liverAns = profile && typeof profile.onboarding_answers5 === 'number' ? profile.onboarding_answers5 : null;
    const liverMap = [1.0, 0.4];
    if (liverAns !== null && liverAns >= 0 && liverAns < liverMap.length) F_liver = liverMap[liverAns];

    // 年龄（profile.age）：>65 岁 0.9，否则 1.0
    const ageVal = profile && typeof profile.age === 'number' ? profile.age : null;
    if (ageVal !== null && ageVal > 65) F_age = 0.9;

    return K_BASE * F_gene * F_smoke * F_pregnancy * F_ocp_hrt * F_liver * F_age;
  } catch (e) {
    return K_BASE;
  }
}

/** 获取用户个性化 k（若不存在画像或出错，回退为 K_BASE） */
async function getPersonalK(userId) {
  try {
    const profile = await getProfile(userId, { ensure: false });
    return computePersonalKFromProfile(profile);
  } catch (e) {
    return K_BASE;
  }
}

/* ====================================================================== */
/*                                 account                                */
/* ====================================================================== */
/** ✅ 新增：账号注册（用户名+密码），不依赖手机号 */
async function registerWithAccount(username, password, defaults = {}) {
  if (!username || !String(username).trim()) {
    throw new Error('账号不能为空');
  }
  if (!password || !String(password).trim()) {
    throw new Error('密码不能为空');
  }

  const uname = String(username).trim();
  let user;

  try {
    const u = new AV.User();
    u.setUsername(uname);
    u.setPassword(password);
    user = await u.signUp();
  } catch (err) {
    if (err.code === 202) {
      // 用户名已被占用
      throw new Error('账号已存在');
    }
    throw err;
  }

  const userId = user.id;

  // 创建/获取 user_profiles
  const profile = await getOrCreateUserProfile(userId, {
    display_name: defaults.display_name || uname,
    phone_contact: '', // 取消手机号注册
    ...defaults
  });

  // 初始化 health_daily（与旧逻辑一致）
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

  return { user: user.toJSON(), profile };
}

/** ✅ 新增：账号登录（用户名+密码） */
async function loginWithAccount(username, password) {
  if (!username || !String(username).trim()) {
    throw new Error('账号不能为空');
  }
  if (!password || !String(password).trim()) {
    throw new Error('密码不能为空');
  }

  try {
    const loggedInUser = await AV.User.logIn(String(username).trim(), String(password));
    const userId = loggedInUser.id;

    const profile = await getOrCreateUserProfile(userId, {
      display_name: String(username).trim(),
      phone_contact: ''
    });

    return { user: loggedInUser.toJSON(), profile };
  } catch (err) {
    if (err.code === 211) {
      throw new Error('账号不存在');
    }
    if (err.code === 210) {
      throw new Error('密码错误');
    }
    throw err;
  }
}

/** 保留：手机号注册与登录（兼容老页面） */
async function registerWithPhone(phone, password, defaults = {}) {
  if (!phone || !String(phone).trim()) throw new Error('手机号不能为空');
  if (!password || !String(password).trim()) throw new Error('密码不能为空');

  const phoneTrim = String(phone).trim();
  let registeredUser;

  try {
    const user = new AV.User();
    user.setUsername(phoneTrim);
    user.setMobilePhoneNumber(phoneTrim);
    user.setPassword(password);
    registeredUser = await user.signUp();
  } catch (err) {
    if (err.code === 214) {
      registeredUser = await AV.User.logInWithMobilePhone(phoneTrim, password);
    } else {
      throw err;
    }
  }

  const userId = registeredUser.id;

  const profile = await getOrCreateUserProfile(userId, {
    display_name: defaults.display_name || '新用户',
    phone_contact: phoneTrim,
    ...defaults
  });

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

async function loginWithPhone(phone, password) {
  if (!phone || !String(phone).trim()) throw new Error('手机号不能为空');
  if (!password || !String(password).trim()) throw new Error('密码不能为空');

  try {
    const loggedInUser = await AV.User.logInWithMobilePhone(String(phone).trim(), String(password));
    const userId = loggedInUser.id;

    const profile = await getOrCreateUserProfile(userId, {
      display_name: String(phone).trim(),
      phone_contact: String(phone).trim()
    });

    return { user: loggedInUser.toJSON(), profile };
  } catch (err) {
    if (err.code === 211) throw new Error('手机号未注册');
    if (err.code === 210) throw new Error('密码错误');
    throw err;
  }
}

/* ====================================================================== */
/*                                favorites                                */
/* ====================================================================== */
async function listFavoritesByUser(userId) {
  if (!userId) throw new Error('listFavoritesByUser: userId required');
  const q = new AV.Query(CLASS_FAVORITE);
  q.equalTo('user', AV.Object.createWithoutData('_User', userId));
  q.include('drink');
  q.limit(1000).descending('createdAt');
  const rows = await q.find();
  return rows.map(toPlain);
}

async function addFavorite(userId, drinkSnap) {
  if (!userId) throw new Error('addFavorite: userId required');
  if (!drinkSnap || !drinkSnap.id) throw new Error('addFavorite: drinkSnap.id required');

  const q = new AV.Query(CLASS_FAVORITE);
  q.equalTo('user', AV.Object.createWithoutData('_User', userId));
  q.equalTo('drink_id', String(drinkSnap.id));
  const exist = await q.first();
  if (exist) return toPlain(exist);

  const obj = new AV.Object(CLASS_FAVORITE);
  obj.set('user', AV.Object.createWithoutData('_User', userId));
  obj.set('drink_id', String(drinkSnap.id));

  try {
    obj.set('drink', AV.Object.createWithoutData(CLASS_DRINK, String(drinkSnap.id)));
  } catch (_) {}

  obj.set('brand', drinkSnap.brand || drinkSnap.category || '');
  obj.set('product', drinkSnap.name || '');
  obj.set('size_key', drinkSnap.size_key || '');
  obj.set('caffeine_per_serving_mg', safeNum(drinkSnap.caffeine));
  obj.set('unit', drinkSnap.unit || '/每份');

  const saved = await obj.save();
  return toPlain(saved);
}

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
/*                          onboarding helpers                            */
/* ====================================================================== */
function normAns(x) {
  if (typeof x === 'number' && Number.isFinite(x)) return x;
  if (typeof x === 'boolean') return x ? 1 : 0;
  const s = String(x ?? '').trim();
  if (s === '') return null;
  if (['是','yes','y','true','1'].includes(s.toLowerCase())) return 1;
  if (['否','no','n','false','0'].includes(s.toLowerCase())) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function isOnboardingCompleted(profile) {
  if (!profile) return false;
  const hasName = !!String(profile.display_name || '').trim();
  const ok = [1,2,3,4,5].every(i => typeof profile[`onboarding_answers${i}`] === 'number');
  return hasName && ok;
}

async function saveOnboarding(userId, { bearName, answers = [] } = {}) {
  const patch = {};
  if (bearName && String(bearName).trim()) {
    patch.display_name = String(bearName).trim();
  }
  [1,2,3,4,5].forEach((i) => {
    const v = answers[i - 1];
    const n = normAns(v);
    if (n !== null && n !== undefined) {
      patch[`onboarding_answers${i}`] = n;
    }
  });
  if (!Object.keys(patch).length) return null;
  return await updateUserProfile(userId, patch);
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

  // account（账号 & 手机 兼容导出）
  registerWithAccount,
  loginWithAccount,
  registerWithPhone,
  loginWithPhone,

  // favorites ⭐
  listFavoritesByUser,
  addFavorite,
  removeFavorite,

  // feedback
  addFeedback,

  // onboarding helpers
  isOnboardingCompleted,
  saveOnboarding,

  // personalization (k 计算)
  computePersonalKFromProfile,
  getPersonalK
};
