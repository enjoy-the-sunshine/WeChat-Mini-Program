// pages/brandcoffee/brandcoffee.js
const dal = require('../../../service/db.js');
const AV = require('../../../libs/av-core-min');

Page({
  data: {
    brand: '',
    brandName: '',
    brandLogoUrl: '',
    keyword: '',
    coffeeList: [],
    filteredList: [],
    favoriteIds: [],   // 收藏的饮品ID列表
    userId: null       // 当前用户ID
  },

  async onLoad(options) {
    const brandId = options.brandId || '';
    const brandName = decodeURIComponent(options.brandName || '');
    const userId = this.getUserId();
    this.setData({ 
      brand: brandId,
      brandName: brandName,
      brandLogoUrl: this.getBrandLogoUrl(brandName),
      userId: userId
    });
  
    let list = [];
  
    if (brandName === '最近') {
      // 从本地存储读取最近列表
      list = wx.getStorageSync('recentCoffee') || [];
    } else {
      // 从云端数据库获取品牌饮品数据
      try {
        const rows = await dal.listDrinks({ brand: brandName, page: 1, pageSize: 1000 });
        list = (rows || []).map(row => ({
          name: row.product,
          small: row.size_key === 'small' ? row.caffeine_per_serving_mg : null,
          medium: row.size_key === 'medium' ? row.caffeine_per_serving_mg : null,
          large: row.size_key === 'large' ? row.caffeine_per_serving_mg : null,
          caffeine: row.caffeine_per_serving_mg || 0,
          size_key: row.size_key,
          size_ml: row.size_ml,
          objectId: row.objectId
        }));
        
        // 如果没有数据，使用硬编码数据作为兜底
        if (list.length === 0) {
          list = this.getHardcodedDrinks(brandName);
        }
      } catch (e) {
        console.error('从云端获取饮品数据失败:', e);
        // 降级到硬编码数据
        list = this.getHardcodedDrinks(brandName);
      }
    }
  
    this.setData({ coffeeList: list, filteredList: list });
    wx.setNavigationBarTitle({ title: brandName });
    
    // 加载收藏状态
    this.loadFavoriteStatus();
  },

  // 获取硬编码的饮品数据（作为兜底）
  getHardcodedDrinks(brandName) {
    if (brandName === '星巴克') {
      return [
        { name: '焦糖玛奇朵', small: 150, medium: 190, large: 230 },
        { name: '美式咖啡', small: 180, medium: 225, large: 240 },
        { name: '拿铁', small: 130, medium: 170, large: 210 },
        { name: '卡布奇诺', small: 120, medium: 160, large: 200 },
        { name: '馥芮白', small: 140, medium: 180, large: 220 },
        { name: '摩卡', small: 110, medium: 150, large: 190 },
        { name: '红茶拿铁', small: 40, medium: 50, large: 60 }
      ];
    } else if (brandName === '瑞幸') {
      return [
        { name: '拿铁', small: 130, medium: 170, large: 210 },
        { name: '生椰拿铁', small: 120, medium: 160, large: 200 },
        { name: '厚乳拿铁', small: 125, medium: 165, large: 205 },
        { name: '焦糖拿铁', small: 115, medium: 155, large: 195 },
        { name: '香草拿铁', small: 120, medium: 160, large: 200 },
        { name: '榛果拿铁', small: 110, medium: 150, large: 190 },
        { name: '丝绒拿铁', small: 125, medium: 165, large: 205 },
        { name: '椰云拿铁', small: 120, medium: 160, large: 200 },
        { name: '生酪拿铁', small: 130, medium: 170, large: 210 },
        { name: '小白拿铁', small: 115, medium: 155, large: 195 },
        { name: '酱香拿铁', small: 140, medium: 180, large: 220 },
        { name: '抹茶拿铁', small: 80, medium: 100, large: 120 },
        { name: '陨石拿铁', small: 130, medium: 170, large: 210 },
        { name: '元气厚乳拿铁', small: 125, medium: 165, large: 205 },
        { name: '冠军燕麦拿铁', small: 120, medium: 160, large: 200 },
        { name: '冰吸生椰拿铁', small: 120, medium: 160, large: 200 },
        { name: '冲绳黑糖拿铁', small: 110, medium: 150, large: 190 },
        { name: '夏日青提拿铁', small: 100, medium: 140, large: 180 },
        { name: '抓马西瓜拿铁', small: 100, medium: 140, large: 180 },
        { name: '抹茶燕麦拿铁', small: 80, medium: 100, large: 120 },
        { name: '摸鱼生椰拿铁', small: 120, medium: 160, large: 200 },
        { name: '杏花乌龙拿铁', small: 90, medium: 120, large: 150 },
        { name: '冰厚乳拿铁', small: 125, medium: 165, large: 205 },
        { name: '姜饼人拿铁', small: 110, medium: 150, large: 190 },
        { name: '焦糖玛奇朵', small: 150, medium: 190, large: 230 },
        { name: '精萃澳瑞白', small: 140, medium: 180, large: 220 },
        { name: '棒香燕麦拿铁', small: 120, medium: 160, large: 200 },
        { name: '陨石燕麦拿铁', small: 130, medium: 170, large: 210 },
        { name: '陨石生椰拿铁', small: 130, medium: 170, large: 210 },
        { name: '香草丝绒拿铁', small: 125, medium: 165, large: 205 },
        { name: '生椰丝绒拿铁', small: 125, medium: 165, large: 205 },
        { name: '碧螺知春拿铁', small: 90, medium: 120, large: 150 },
        { name: '新鸳鸯红茶拿铁', small: 80, medium: 100, large: 120 },
        { name: '茉莉海盐拿铁', small: 90, medium: 120, large: 150 },
        { name: '橙之海生酪拿铁', small: 130, medium: 170, large: 210 },
        { name: '茉莉花香拿铁', small: 90, medium: 120, large: 150 },
        { name: '陨石厚乳拿铁', small: 130, medium: 170, large: 210 },
        { name: '瓦尔登滑雪拿铁', small: 120, medium: 160, large: 200 },
        { name: '太妃榛香厚乳拿铁', small: 125, medium: 165, large: 205 },
        { name: '海盐芝士厚乳拿铁', small: 125, medium: 165, large: 205 },
        { name: '花魁·拿铁', small: 140, medium: 180, large: 220 },
        { name: '海盐芝士鸳鸯拿铁', small: 80, medium: 100, large: 120 },
        { name: '花魁·澳瑞白', small: 150, medium: 190, large: 230 },
        { name: '蓝丝绒冰雪拿铁', small: 120, medium: 160, large: 200 },
        { name: '虎年啾鸣丝绒拿铁', small: 125, medium: 165, large: 205 },
        { name: '天堂庄园·拿铁', small: 140, medium: 180, large: 220 },
        { name: '九州草莓丝绒拿铁', small: 125, medium: 165, large: 205 },
        { name: '冲绳黑糖丝绒拿铁', small: 125, medium: 165, large: 205 },
        { name: '耶加雪菲·拿铁', small: 140, medium: 180, large: 220 },
        { name: '冲绳黑糖燕麦拿铁', small: 120, medium: 160, large: 200 },
        { name: '圣诞初雪丝绒拿铁', small: 125, medium: 165, large: 205 },
        { name: '云南小柑橘·拿铁', small: 140, medium: 180, large: 220 },
        { name: '天堂庄园·澳瑞白', small: 150, medium: 190, large: 230 },
        { name: '耶加雪菲·澳瑞白', small: 150, medium: 190, large: 230 },
        { name: '云南小柑橘·澳瑞白', small: 150, medium: 190, large: 230 },
        { name: '标准美式', small: 180, medium: 225, large: 240 },
        { name: '橙C美式', small: 180, medium: 225, large: 240 },
        { name: '加浓美式', small: 200, medium: 250, large: 270 },
        { name: '椰青冰萃美式', small: 180, medium: 225, large: 240 },
        { name: '橘金气泡美式', small: 180, medium: 225, large: 240 },
        { name: '焦糖加浓美式', small: 200, medium: 250, large: 270 },
        { name: '焦糖标准美式', small: 180, medium: 225, large: 240 },
        { name: '黑金气泡美式', small: 180, medium: 225, large: 240 },
        { name: '葡萄冰萃美式', small: 180, medium: 225, large: 240 },
        { name: '花魁·美式', small: 200, medium: 250, large: 270 },
        { name: '天堂庄园·美式', small: 200, medium: 250, large: 270 },
        { name: '耶加雪菲·美式', small: 200, medium: 250, large: 270 },
        { name: '云南小柑橘·冰美式', small: 200, medium: 250, large: 270 }
      ];
    } else if (brandName === '库迪') {
      return [
        { name: '美式', small: 180, medium: 225, large: 240 },
        { name: '拿铁', small: 130, medium: 170, large: 210 },
        { name: '卡布奇诺', small: 120, medium: 160, large: 200 },
        { name: '摩卡', small: 110, medium: 150, large: 190 },
        { name: '焦糖玛奇朵', small: 150, medium: 190, large: 230 }
      ];
    } else if (brandName === '霸王茶姬') {
      return [
        { name: '伯牙绝弦', caffeine: 80 },
        { name: '山野栀子', caffeine: 75 },
        { name: '醒时春山', caffeine: 85 },
        { name: '青青糯山', caffeine: 70 },
        { name: '桂馥兰香', caffeine: 80 },
        { name: '白雾红尘', caffeine: 90 },
        { name: '去云南·玫瑰普洱', caffeine: 60 },
        { name: '花田乌龙', caffeine: 75 },
        { name: '万山红·金丝小种', caffeine: 85 },
        { name: '青沫观音', caffeine: 70 },
        { name: '桂子飘飘', caffeine: 80 },
        { name: '关山木兰', caffeine: 75 },
        { name: '春日韬韬', caffeine: 80 },
        { name: '千山雪·金丝小种', caffeine: 85 },
        { name: '杨枝甘露', caffeine: 0 },
        { name: '云海芒芒', caffeine: 0 },
        { name: '神仙椰水', caffeine: 0 },
        { name: '观音仙椰', caffeine: 60 },
        { name: '茉莉仙椰', caffeine: 60 },
        { name: '海盐电解·柠檬茶', caffeine: 0 },
        { name: '清凉因子·柠檬茶', caffeine: 0 },
        { name: '浮生梦媞', caffeine: 0 },
        { name: '葡萄碎玉', caffeine: 0 },
        { name: '千峰翠', caffeine: 75 },
        { name: '琥珀光', caffeine: 80 },
        { name: '橙香四季', caffeine: 0 },
        { name: '七里香', caffeine: 80 },
        { name: '折桂令', caffeine: 75 },
        { name: '酌红袍', caffeine: 85 },
        { name: '云中绿', caffeine: 70 },
        { name: '花田坞', caffeine: 75 },
        { name: '野栀子', caffeine: 75 },
        { name: '木兰辞', caffeine: 80 },
        { name: '观音韵', caffeine: 70 },
        { name: '陈柑普洱茶拿铁', caffeine: 90 },
        { name: '大红袍茶拿铁', caffeine: 95 },
        { name: '正山小种茶拿铁', caffeine: 90 },
        { name: '七窨·茉莉雪芽', caffeine: 80 },
        { name: '慢焙·金观音', caffeine: 85 },
        { name: '轻酵·金桂乌龙', caffeine: 80 },
        { name: '生晒·陈柑普洱', caffeine: 60 },
        { name: '混捻·糯香绿茶', caffeine: 70 }
      ];
    } else if (brandName === '喜茶') {
      return [
        { name: '去火*纤体瓶', caffeine: 0 },
        { name: '羽衣纤体瓶', caffeine: 0 },
        { name: '多肉桃李', caffeine: 0 },
        { name: '清爽芭乐提', caffeine: 0 },
        { name: '多肉葡萄', caffeine: 0 },
        { name: '轻芝多肉葡萄', caffeine: 0 },
        { name: '芒芒甘露', caffeine: 0 },
        { name: '超多肉芒芒甘露', caffeine: 0 },
        { name: '椰椰芒芒', caffeine: 0 },
        { name: '鸭喜香轻柠茶', caffeine: 0 },
        { name: '绿妍轻柠茶', caffeine: 0 },
        { name: '多肉青提', caffeine: 0 },
        { name: '多肉芒芒', caffeine: 0 },
        { name: '满杯红柚', caffeine: 0 },
        { name: '咸酪厚抹', caffeine: 80 },
        { name: '芝芝抹茶', caffeine: 80 },
        { name: '三倍厚抹', caffeine: 120 },
        { name: '小奶茉', caffeine: 60 },
        { name: '芝芝绿妍茶后', caffeine: 60 },
        { name: '纯绿妍茶后', caffeine: 60 },
        { name: '牦牛乳酥油茶', caffeine: 0 },
        { name: '烤布蕾油切乌龙冰', caffeine: 80 },
        { name: '烤布蕾抹茶冰', caffeine: 80 },
        { name: '抹茶波波冰', caffeine: 80 },
        { name: '烤布蕾奶茶冰', caffeine: 60 },
        { name: '奶茶波波冰', caffeine: 60 },
        { name: '烤黑糖波波牛乳茶', caffeine: 60 },
        { name: '嫣红牛乳茶', caffeine: 60 },
        { name: '热烤黑糖波波牛乳茶', caffeine: 60 },
        { name: '热烤黑糖波波牛乳', caffeine: 60 },
        { name: '热咸酪厚抹', caffeine: 80 },
        { name: '热芝芝抹茶', caffeine: 80 },
        { name: '热小奶茉', caffeine: 60 },
        { name: '热三倍厚抹', caffeine: 120 },
        { name: '芝芝多肉葡萄', caffeine: 0 },
        { name: '芝芝多肉青提', caffeine: 0 },
        { name: '芝芝芒芒', caffeine: 0 }
      ];
    } else if (brandName === 'Costa') {
      return [
        { name: '美式咖啡', small: 180, medium: 225, large: 240 },
        { name: '拿铁', small: 130, medium: 170, large: 210 },
        { name: '卡布奇诺', small: 120, medium: 160, large: 200 },
        { name: '摩卡', small: 110, medium: 150, large: 190 },
        { name: '焦糖玛奇朵', small: 150, medium: 190, large: 230 },
        { name: '馥芮白', small: 140, medium: 180, large: 220 },
        { name: '香草拿铁', small: 120, medium: 160, large: 200 },
        { name: '榛果拿铁', small: 110, medium: 150, large: 190 },
        { name: '焦糖拿铁', small: 115, medium: 155, large: 195 },
        { name: '香草卡布奇诺', small: 120, medium: 160, large: 200 },
        { name: '榛果卡布奇诺', small: 110, medium: 150, large: 190 },
        { name: '焦糖卡布奇诺', small: 115, medium: 155, large: 195 },
        { name: '香草摩卡', small: 110, medium: 150, large: 190 },
        { name: '榛果摩卡', small: 100, medium: 140, large: 180 },
        { name: '焦糖摩卡', small: 105, medium: 145, large: 185 },
        { name: '香草馥芮白', small: 130, medium: 170, large: 210 },
        { name: '榛果馥芮白', small: 120, medium: 160, large: 200 },
        { name: '焦糖馥芮白', small: 125, medium: 165, large: 205 },
        { name: '香草焦糖玛奇朵', small: 140, medium: 180, large: 220 },
        { name: '榛果焦糖玛奇朵', small: 130, medium: 170, large: 210 },
        { name: '焦糖焦糖玛奇朵', small: 135, medium: 175, large: 215 },
        { name: '香草美式', small: 170, medium: 215, large: 230 },
        { name: '榛果美式', small: 160, medium: 205, large: 220 },
        { name: '焦糖美式', small: 165, medium: 210, large: 225 },
        { name: '香草拿铁', small: 120, medium: 160, large: 200 },
        { name: '榛果拿铁', small: 110, medium: 150, large: 190 },
        { name: '焦糖拿铁', small: 115, medium: 155, large: 195 },
        { name: '香草卡布奇诺', small: 120, medium: 160, large: 200 },
        { name: '榛果卡布奇诺', small: 110, medium: 150, large: 190 },
        { name: '焦糖卡布奇诺', small: 115, medium: 155, large: 195 }
      ];
    } else if (brandName === '古茗') {
      return [
        { name: '古茗奶茶', caffeine: 60 },
        { name: '古茗奶绿', caffeine: 50 },
        { name: '古茗奶盖', caffeine: 70 },
        { name: '古茗奶霜', caffeine: 65 },
        { name: '古茗奶昔', caffeine: 55 },
        { name: '古茗奶泡', caffeine: 60 },
        { name: '古茗奶沫', caffeine: 50 },
        { name: '古茗奶花', caffeine: 65 },
        { name: '古茗奶香', caffeine: 60 },
        { name: '古茗奶味', caffeine: 55 },
        { name: '古茗奶甜', caffeine: 50 },
        { name: '古茗奶滑', caffeine: 60 },
        { name: '古茗奶润', caffeine: 55 },
        { name: '古茗奶醇', caffeine: 65 },
        { name: '古茗奶浓', caffeine: 70 },
        { name: '古茗奶淡', caffeine: 45 },
        { name: '古茗奶清', caffeine: 40 },
        { name: '古茗奶爽', caffeine: 50 },
        { name: '古茗奶凉', caffeine: 45 },
        { name: '古茗奶热', caffeine: 60 }
      ];
    } else if (brandName === '茶百道') {
      return [
        { name: '茶百道奶茶', caffeine: 60 },
        { name: '茶百道奶绿', caffeine: 50 },
        { name: '茶百道奶盖', caffeine: 70 },
        { name: '茶百道奶霜', caffeine: 65 },
        { name: '茶百道奶昔', caffeine: 55 },
        { name: '茶百道奶泡', caffeine: 60 },
        { name: '茶百道奶沫', caffeine: 50 },
        { name: '茶百道奶花', caffeine: 65 },
        { name: '茶百道奶香', caffeine: 60 },
        { name: '茶百道奶味', caffeine: 55 },
        { name: '茶百道奶甜', caffeine: 50 },
        { name: '茶百道奶滑', caffeine: 60 },
        { name: '茶百道奶润', caffeine: 55 },
        { name: '茶百道奶醇', caffeine: 65 },
        { name: '茶百道奶浓', caffeine: 70 },
        { name: '茶百道奶淡', caffeine: 45 },
        { name: '茶百道奶清', caffeine: 40 },
        { name: '茶百道奶爽', caffeine: 50 },
        { name: '茶百道奶凉', caffeine: 45 },
        { name: '茶百道奶热', caffeine: 60 }
      ];
    } else if (brandName === 'KCOFFEE') {
      return [
        { name: 'KCOFFEE美式', small: 180, medium: 225, large: 240 },
        { name: 'KCOFFEE拿铁', small: 130, medium: 170, large: 210 },
        { name: 'KCOFFEE卡布奇诺', small: 120, medium: 160, large: 200 },
        { name: 'KCOFFEE摩卡', small: 110, medium: 150, large: 190 },
        { name: 'KCOFFEE焦糖玛奇朵', small: 150, medium: 190, large: 230 },
        { name: 'KCOFFEE馥芮白', small: 140, medium: 180, large: 220 },
        { name: 'KCOFFEE香草拿铁', small: 120, medium: 160, large: 200 },
        { name: 'KCOFFEE榛果拿铁', small: 110, medium: 150, large: 190 },
        { name: 'KCOFFEE焦糖拿铁', small: 115, medium: 155, large: 195 }
      ];
    } else if (brandName === 'McCafé') {
      return [
        { name: 'McCafé美式', small: 180, medium: 225, large: 240 },
        { name: 'McCafé拿铁', small: 130, medium: 170, large: 210 },
        { name: 'McCafé卡布奇诺', small: 120, medium: 160, large: 200 },
        { name: 'McCafé摩卡', small: 110, medium: 150, large: 190 },
        { name: 'McCafé焦糖玛奇朵', small: 150, medium: 190, large: 230 },
        { name: 'McCafé馥芮白', small: 140, medium: 180, large: 220 },
        { name: 'McCafé香草拿铁', small: 120, medium: 160, large: 200 },
        { name: 'McCafé榛果拿铁', small: 110, medium: 150, large: 190 },
        { name: 'McCafé焦糖拿铁', small: 115, medium: 155, large: 195 }
      ];
    } else if (brandName === 'Tims') {
      return [
        { name: 'Tims美式', small: 180, medium: 225, large: 240 },
        { name: 'Tims拿铁', small: 130, medium: 170, large: 210 },
        { name: 'Tims卡布奇诺', small: 120, medium: 160, large: 200 },
        { name: 'Tims摩卡', small: 110, medium: 150, large: 190 },
        { name: 'Tims焦糖玛奇朵', small: 150, medium: 190, large: 230 },
        { name: 'Tims馥芮白', small: 140, medium: 180, large: 220 },
        { name: 'Tims香草拿铁', small: 120, medium: 160, large: 200 },
        { name: 'Tims榛果拿铁', small: 110, medium: 150, large: 190 },
        { name: 'Tims焦糖拿铁', small: 115, medium: 155, large: 195 }
      ];
    } else if (brandName === 'Manner') {
      return [
        { name: 'Manner美式', small: 180, medium: 225, large: 240 },
        { name: 'Manner拿铁', small: 130, medium: 170, large: 210 },
        { name: 'Manner卡布奇诺', small: 120, medium: 160, large: 200 },
        { name: 'Manner摩卡', small: 110, medium: 150, large: 190 },
        { name: 'Manner焦糖玛奇朵', small: 150, medium: 190, large: 230 },
        { name: 'Manner馥芮白', small: 140, medium: 180, large: 220 },
        { name: 'Manner香草拿铁', small: 120, medium: 160, large: 200 },
        { name: 'Manner榛果拿铁', small: 110, medium: 150, large: 190 },
        { name: 'Manner焦糖拿铁', small: 115, medium: 155, large: 195 }
      ];
    } else if (brandName === '三顿半') {
      return [
        { name: '三顿半美式', caffeine: 180 },
        { name: '三顿半拿铁', caffeine: 130 },
        { name: '三顿半卡布奇诺', caffeine: 120 },
        { name: '三顿半摩卡', caffeine: 110 },
        { name: '三顿半焦糖玛奇朵', caffeine: 150 },
        { name: '三顿半馥芮白', caffeine: 140 },
        { name: '三顿半香草拿铁', caffeine: 120 },
        { name: '三顿半榛果拿铁', caffeine: 110 },
        { name: '三顿半焦糖拿铁', caffeine: 115 }
      ];
    } else if (brandName === '雀巢咖啡') {
      return [
        { name: '雀巢美式', caffeine: 180 },
        { name: '雀巢拿铁', caffeine: 130 },
        { name: '雀巢卡布奇诺', caffeine: 120 },
        { name: '雀巢摩卡', caffeine: 110 },
        { name: '雀巢焦糖玛奇朵', caffeine: 150 },
        { name: '雀巢馥芮白', caffeine: 140 },
        { name: '雀巢香草拿铁', caffeine: 120 },
        { name: '雀巢榛果拿铁', caffeine: 110 },
        { name: '雀巢焦糖拿铁', caffeine: 115 }
      ];
    }
    
    // 默认返回空数组
    return [];
  },

  // 获取用户ID
  getUserId() {
    const u = AV.User.current && AV.User.current();
    return u ? u.id : null;
  },

  // 加载收藏状态
  async loadFavoriteStatus() {
    const { userId } = this.data;
    if (!userId) {
      // 未登录时使用本地收藏
      try {
        const favoriteIds = wx.getStorageSync('favorites_ids') || [];
        this.setData({ favoriteIds });
        this.updateFavoriteFlags();
      } catch (e) {
        console.error('加载本地收藏状态失败:', e);
      }
      return;
    }

    try {
      // 从云端加载收藏
      const rows = await dal.listFavoritesByUser(userId);
      const favoriteIds = (rows || []).map(r => r.drink_id);
      this.setData({ favoriteIds });
      this.updateFavoriteFlags();
      // 缓存到本地，离线也能用
      this.saveFavoriteStatus();
    } catch (e) {
      console.error('加载云端收藏状态失败:', e);
      // 降级到本地收藏
      try {
        const favoriteIds = wx.getStorageSync('favorites_ids') || [];
        this.setData({ favoriteIds });
        this.updateFavoriteFlags();
      } catch (e2) {
        console.error('加载本地收藏状态失败:', e2);
      }
    }
  },

  // 更新收藏标志
  updateFavoriteFlags() {
    const { favoriteIds, coffeeList, keyword } = this.data;
    const favoriteSet = new Set(favoriteIds);
    
    const updatedList = coffeeList.map(drink => ({
      ...drink,
      isFavorite: favoriteSet.has(drink.objectId || drink.name)
    }));
    
    // 如果有搜索关键词，需要重新过滤
    let filteredList = updatedList;
    if (keyword) {
      filteredList = updatedList.filter(item => 
        item.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    
    this.setData({ 
      coffeeList: updatedList,
      filteredList: filteredList
    });
  },

  // 保存收藏状态到本地（作为缓存）
  saveFavoriteStatus() {
    try {
      wx.setStorageSync('favorites_ids', this.data.favoriteIds);
    } catch (e) {
      console.error('保存收藏状态失败:', e);
    }
  },

  // 切换收藏状态
  async toggleFavorite(e) {
    const drink = e.currentTarget.dataset.drink;
    if (!drink) return;

    const { favoriteIds, userId, brandName } = this.data;
    const drinkId = drink.objectId || drink.name; // 优先使用objectId，否则使用名称
    
    let newFavoriteIds = [...favoriteIds];
    const isCurrentlyFavorite = favoriteIds.includes(drinkId);
    
    if (isCurrentlyFavorite) {
      // 取消收藏
      newFavoriteIds = newFavoriteIds.filter(id => id !== drinkId);
      this.setData({ favoriteIds: newFavoriteIds });
      this.saveFavoriteStatus();
      this.updateFavoriteFlags();
      
      // 云端同步
      if (userId) {
        try {
          await dal.removeFavorite(userId, drinkId);
        } catch (e) {
          console.warn('云端取消收藏失败:', e);
        }
      }
      
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
      // 添加收藏
      newFavoriteIds.push(drinkId);
      this.setData({ favoriteIds: newFavoriteIds });
      this.saveFavoriteStatus();
      this.updateFavoriteFlags();
      
      // 云端同步
      if (userId) {
        try {
          // 构造饮品快照
          const drinkSnap = {
            id: drinkId,
            name: drink.name,
            caffeine: drink.small || drink.medium || drink.large || drink.caffeine || 0,
            unit: '/每份',
            category: brandName,
            size_key: drink.size_key || ''
          };
          await dal.addFavorite(userId, drinkSnap);
        } catch (e) {
          console.warn('云端添加收藏失败:', e);
        }
      }
      
      wx.showToast({ title: '已加入收藏', icon: 'success' });
    }
  },

  // 获取品牌logo路径
  getBrandLogoUrl(brandName) {
    const logoMap = {
      '星巴克': '/pages/images/星巴克.png',
      '瑞幸': '/pages/images/瑞幸.png',
      '喜茶': '/pages/images/喜茶.png',
      '古茗': '/pages/images/古茗.png',
      '库迪': '/pages/images/库迪.png',
      '茶百道': '/pages/images/茶百道.png',
      '霸王茶姬': '/pages/images/霸王茶姬.png',
      'Costa': '/pages/images/coffee-icon.png'
    };
    return logoMap[brandName] || '/pages/images/coffee-icon.png';
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 搜索功能
  onSearchInput(e) {
    const keyword = e.detail.value.toLowerCase();
    const filteredList = this.data.coffeeList.filter(item => 
      item.name.toLowerCase().includes(keyword)
    );
    this.setData({ 
      keyword: e.detail.value,
      filteredList: filteredList 
    });
  },

  // 移除跳转到详情页的逻辑，点击饮品不再跳转
  // gotoDrinkDetail(e) {
  //   const name = e.currentTarget.dataset.name;
  //   
  //   // 调用保存到最近的方法
  //   this.addToRecent(this.data.brandName, name);
  // 
  //   wx.navigateTo({
  //     url: `/subpackage/recording/drinkdetail/drinkdetail?name=${encodeURIComponent(name)}&brand=${encodeURIComponent(this.data.brandName)}`
  //   });
  // },
  
  addToRecent(brand, name) {
    let recent = wx.getStorageSync('recentCoffee') || [];
  
    // 先删除相同的
    recent = recent.filter(item => !(item.brand === brand && item.name === name));
  
    // 添加到最前
    recent.unshift({ brand, name, time: Date.now() });
  
    // 限制最大条数
    if (recent.length > 10) {
      recent = recent.slice(0, 10);
    }
  
    wx.setStorageSync('recentCoffee', recent);
  }
  
});