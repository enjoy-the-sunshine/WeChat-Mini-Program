// utils/auth.js
// 使用 libs 里的 LeanCloud SDK（非 npm 方案）
const AV = require('../libs/av-core-min.js');

// 适配器：文件名以你 libs 目录为准（常见 weapp / wxapp）
try {
  require('../libs/leancloud-adapters-weapp.js')(AV);
} catch (e) {
  try {
    require('../libs/leancloud-adapters-wxapp.js')(AV);
  } catch (_) {
    console.warn('LeanCloud weapp adapter not found, please check libs/ file name.');
  }
}

// 如果你尚未在 app.js 里调用 AV.init，可在这里做一次兜底初始化：
// （已在 app.js 初始化的话，这里保持注释即可，避免重复 init）
// AV.init({
//   appId: 'YOUR_APP_ID',
//   appKey: 'YOUR_APP_KEY'
//   // 国内版通常无需 serverURLs；国际版/自定义域名再加：
//   // serverURLs: 'https://YOUR_DOMAIN'
// });

async function login() {
  const cur = AV.User.current();
  if (cur) return cur;
  return AV.User.loginWithWeapp();
}

module.exports = { login, AV };
