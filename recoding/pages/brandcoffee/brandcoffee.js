// pages/brandcoffee/brandcoffee.js
Page({
  data: {
    brand: '',
    keyword: '',
    coffeeList: [],
    filteredList: []
  },

  onLoad(options) {
    const brand = decodeURIComponent(options.brand || '');
    this.setData({ brand });
  
    let list = [];
  
    if (brand === '最近') {
      // 从本地存储读取最近列表
      list = wx.getStorageSync('recentCoffee') || [];
    } else if (brand === '星巴克') {
      list = [
        { name: '美式' },
        { name: '冷萃' },
        { name: '拿铁' },
        { name: '卡布奇诺' },
        { name: '馥芮白' },
        { name: '摩卡' },
        { name: '红茶拿铁' }
      ];
    } else if (brand === '瑞幸') {
      list = [
        { name: '山茶花·Dirty' },
        { name: '天堂庄园·Dirty' },
        { name: '耶加·生椰 Dirty' },
        { name: '花魁·生椰 Dirty' },
        { name: '耶加·Dirty' },
        { name: '天堂庄园·生椰 Dirty' },
        { name: '花魁·Dirty' },
        { name: '卡美罗·Dirty' },
        { name: '摩卡' },
        { name: '厚乳茶' },
        { name: '轻乳茶' },
        { name: '热巧克力' },
        { name: '抹茶好喝椰' },
        { name: '生椰爱摩卡' },
        { name: '挂耳咖啡' },
        { name: '鲜萃咖啡液' },
        { name: '元气弹系列01' },
        { name: '元气弹系列02' },
        { name: '元气弹系列03' },
        { name: '风味漫游系列·峡谷晨曦' },
        { name: '风味漫游系列·河谷长廊' },
        { name: '风味漫游系列·SOE耶加雪菲' },
        { name: '拿铁' },
        { name: '椰云拿铁' },
        { name: '榛果拿铁' },
        { name: '丝绒拿铁' },
        { name: '焦糖拿铁' },
        { name: '卡布奇诺' },
        { name: '生椰拿铁' },
        { name: '厚乳拿铁' },
        { name: '生酪拿铁' },
        { name: '小白拿铁' },
        { name: '酱香拿铁' },
        { name: '抹茶拿铁' },
        { name: '陨石拿铁' },
        { name: '元气厚乳拿铁' },
        { name: '冠军燕麦拿铁' },
        { name: '冰吸生椰拿铁' },
        { name: '冲绳黑糖拿铁' },
        { name: '夏日青提拿铁' },
        { name: '抓马西瓜拿铁' },
        { name: '抹茶燕麦拿铁' },
        { name: '摸鱼生椰拿铁' },
        { name: '杏花乌龙拿铁' },
        { name: '香草拿铁' },
        { name: '冰厚乳拿铁' },
        { name: '姜饼人拿铁' },
        { name: '焦糖玛奇朵' },
        { name: '精萃澳瑞白' },
        { name: '棒香燕麦拿铁' },
        { name: '陨石燕麦拿铁' },
        { name: '陨石生椰拿铁' },
        { name: '香草丝绒拿铁' },
        { name: '生椰丝绒拿铁' },
        { name: '碧螺知春拿铁' },
        { name: '新鸳鸯红茶拿铁' },
        { name: '茉莉海盐拿铁' },
        { name: '橙之海生酪拿铁' },
        { name: '茉莉花香拿铁' },
        { name: '陨石厚乳拿铁' },
        { name: '瓦尔登滑雪拿铁' },
        { name: '太妃榛香厚乳拿铁' },
        { name: '海盐芝士厚乳拿铁' },
        { name: '花魁·拿铁' },
        { name: '海盐芝士鸳鸯拿铁' },
        { name: '花魁·澳瑞白' },
        { name: '蓝丝绒冰雪拿铁' },
        { name: '虎年啾鸣丝绒拿铁' },
        { name: '天堂庄园·拿铁' },
        { name: '九州草莓丝绒拿铁' },
        { name: '冲绳黑糖丝绒拿铁' },
        { name: '耶加雪菲·拿铁' },
        { name: '冲绳黑糖燕麦拿铁' },
        { name: '圣诞初雪丝绒拿铁' },
        { name: '云南小柑橘·拿铁' },
        { name: '天堂庄园·澳瑞白' },
        { name: '耶加雪菲·澳瑞白' },
        { name: '云南小柑橘·澳瑞白' },
        { name: '巧克力瑞纳冰' },
        { name: '抹茶瑞纳冰' },
        { name: '摩卡瑞纳冰' },
        { name: '卡布奇诺瑞纳冰' },
        { name: '经典拿铁瑞纳冰' },
        { name: '陨石拿铁瑞纳冰' },
        { name: '标准美式' },
        { name: '橙C美式' },
        { name: '加浓美式' },
        { name: '椰青冰萃美式' },
        { name: '橘金气泡美式' },
        { name: '焦糖加浓美式' },
        { name: '焦糖标准美式' },
        { name: '黑金气泡美式' },
        { name: '葡萄冰萃美式' },
        { name: '花魁·美式' },
        { name: '天堂庄园·美式' },
        { name: '耶加雪菲·美式' },
        { name: '云南小柑橘·冰美式' }
      ];
    } else if (brand === '库迪') {
      list = [
        { name: '美式' },
        { name: '拿铁' }
      ];
    } else if (brand === '霸王茶姬') {
      list = [
        { name: '伯牙绝弦' },
        { name: '山野栀子' },
        { name: '醒时春山' },
        { name: '青青糯山' },
        { name: '桂馥兰香' },
        { name: '白雾红尘' },
        { name: '去云南·玫瑰普洱' },
        { name: '花田乌龙' },
        { name: '万山红·金丝小种' },
        { name: '青沫观音' },
        { name: '桂子飘飘' },
        { name: '关山木兰' },
        { name: '春日韬韬' },
        { name: '千山雪·金丝小种' },
        { name: '杨枝甘露' },
        { name: '云海芒芒' },
        { name: '神仙椰水' },
        { name: '观音仙椰' },
        { name: '茉莉仙椰' },
        { name: '海盐电解·柠檬茶' },
        { name: '清凉因子·柠檬茶' },
        { name: '浮生梦媞' },
        { name: '葡萄碎玉' },
        { name: '千峰翠' },
        { name: '琥珀光' },
        { name: '橙香四季' },
        { name: '七里香' },
        { name: '折桂令' },
        { name: '酌红袍' },
        { name: '云中绿' },
        { name: '花田坞' },
        { name: '野栀子' },
        { name: '木兰辞' },
        { name: '观音韵' },
        { name: '陈柑普洱茶拿铁' },
        { name: '大红袍茶拿铁' },
        { name: '正山小种茶拿铁' },
        { name: '七窨·茉莉雪芽' },
        { name: '慢焙·金观音' },
        { name: '轻酵·金桂乌龙' },
        { name: '生晒·陈柑普洱' },
        { name: '混捻·糯香绿茶' }
      ];
    } else if (brand === '喜茶') {
      list = [
        { name: '去火*纤体瓶' },
        { name: '羽衣纤体瓶' },
        { name: '多肉桃李' },
        { name: '清爽芭乐提' },
        { name: '多肉葡萄' },
        { name: '轻芝多肉葡萄' },
        { name: '芒芒甘露' },
        { name: '超多肉芒芒甘露' },
        { name: '椰椰芒芒' },
        { name: '鸭喜香轻柠茶' },
        { name: '绿妍轻柠茶' },
        { name: '多肉青提' },
        { name: '多肉芒芒' },
        { name: '满杯红柚' },
        { name: '咸酪厚抹' },
        { name: '芝芝抹茶' },
        { name: '三倍厚抹' },
        { name: '小奶茉' },
        { name: '芝芝绿妍茶后' },
        { name: '纯绿妍茶后' },
        { name: '牦牛乳酥油茶' },
        { name: '烤布蕾油切乌龙冰' },
        { name: '烤布蕾抹茶冰' },
        { name: '抹茶波波冰' },
        { name: '烤布蕾奶茶冰' },
        { name: '奶茶波波冰' },
        { name: '烤黑糖波波牛乳茶' },
        { name: '嫣红牛乳茶' },
        { name: '热烤黑糖波波牛乳茶' },
        { name: '热烤黑糖波波牛乳' },
        { name: '热咸酪厚抹' },
        { name: '热芝芝抹茶' },
        { name: '热小奶茉' },
        { name: '热三倍厚抹' },
        { name: '芝芝多肉葡萄' },
        { name: '芝芝多肉青提' },
        { name: '芝芝芒芒' }
      ];
    }
  
    this.setData({ coffeeList: list, filteredList: list });
    wx.setNavigationBarTitle({ title: brand });
  },
  
  

  gotoDrinkDetail(e) {
    const name = e.currentTarget.dataset.name;
    
    // 调用保存到最近的方法
    this.addToRecent(this.data.brand, name);
  
    wx.navigateTo({
      url: `/pages/drinkdetail/drinkdetail?name=${encodeURIComponent(name)}`
    });
  },
  
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
