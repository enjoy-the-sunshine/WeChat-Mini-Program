const STORAGE_KEY = 'settings_message_page';

// 计算“是否禁用子项”的样式和布尔
function computeDisabled(receiveOn) {
  return {
    childrenDisabled: !receiveOn,
    disabledCls: receiveOn ? '' : 'disabled'
  };
}

// 一键自适应字号：按 24/20/18/16px 目标 → 结合系统字体设置 → 转 rpx
function makeFonts() {
  const sys = wx.getSystemInfoSync();
  const rpxPerPx = 750 / sys.windowWidth; // px → rpx（常用）
  // fontSizeSetting：系统字体大小（PX 基准），部分机型可能没有，默认 16
  const sysPx = typeof sys.fontSizeSetting === 'number' ? sys.fontSizeSetting : 16;
  const scale = sysPx / 16; // 相对标准 16px 的缩放系数

  const toRpx = (px) => Math.round(px * scale * rpxPerPx);
  return {
    h1: toRpx(24), // 大标题
    h2: toRpx(20), // 小标题
    lg: toRpx(18), // 矩形内大字
    sm: toRpx(16)  // 矩形内小字
  };
}

Page({
  data: {
    // 字号映射（onLoad 里初始化）
    font: { h1: 48, h2: 40, lg: 36, sm: 32 },

    settings: {
      receiveNotify: false,

      dailyIntake: false,
      sleepTime: false,
      energyChange: false,

      likeNotify: false,
      collectNotify: false,
      commentNotify: false,

      systemNotify: false,
      featureNotify: false,

      dndMode: false,
      dndTime: false
    },

    // 子项禁用状态与样式
    childrenDisabled: true,
    disabledCls: 'disabled'
  },

  onLoad() {
    // 初始化字体自适配
    const font = makeFonts();

    // 读取本地持久化
    let merged = this.data.settings;
    try {
      const saved = wx.getStorageSync(STORAGE_KEY);
      if (saved && typeof saved === 'object') {
        merged = Object.assign({}, merged, saved);
      }
    } catch (e) {
      console.warn('load settings failed', e);
    }

    this.setData(Object.assign({
      font,
      settings: merged
    }, computeDisabled(!!merged.receiveNotify)));
  },

  onShow() {
    // 若用户在系统里改了“字体大小”，回到页面时实时刷新字体
    this.setData({ font: makeFonts() });
  },

  onToggle(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;

    // 总开关
    if (key === 'receiveNotify') {
      let next = Object.assign({}, this.data.settings, { receiveNotify: value });
      if (!value) {
        // 关闭时全部清零
        next = Object.assign(next, {
          dailyIntake: false, sleepTime: false, energyChange: false,
          likeNotify: false, collectNotify: false, commentNotify: false,
          systemNotify: false, featureNotify: false,
          dndMode: false, dndTime: false
        });
      }
      this.setData(Object.assign({ settings: next }, computeDisabled(value)));
      wx.setStorageSync(STORAGE_KEY, next);
      return;
    }

    // 子开关（保险：被禁用时直接返回）
    if (this.data.childrenDisabled) return;

    const next = Object.assign({}, this.data.settings);
    next[key] = value;
    this.setData({ settings: next });
    wx.setStorageSync(STORAGE_KEY, next);
  }
});
