const app = getApp();
const dal = require('../../../service/db.js');
const dbService = require('../../../utils/database.js').dbService;

Page({
  data: {
    inputMessage: '',
    messages: [],
    isLoading: false,
    scrollTop: 0,
    autoFocus: false,
    hasMoreHistory: true,
    isLoadingHistory: false,
    pollingIntervalId: null, // 轮询定时器ID
    // 新增：存储三个提示问题（初始值为默认问题）
    quickQuestions: [
      "帮我分析下我的咖啡饮用情况。",
      "现在我还能喝一杯咖啡吗？",
      "不同人群喝咖啡有啥不同建议？"
    ],
    // 新增：用户数据和饮品数据缓存
    userProfile: null,
    userIntakes: [],
    drinksData: []
  },

  onLoad: function() {
    this.setData({
      autoFocus: true
    });
    // 分别加载用户数据和饮品数据
    this.loadUserProfile();
    this.loadDrinksData();
  },

  onShow: function() {
    // 页面显示时刷新咖啡摄入记录
    console.log('页面显示，刷新咖啡摄入记录...');
    this.loadCoffeeIntakeRecords();
  },

  // 新增：获取用户档案信息（不包含摄入记录）
  loadUserProfile: async function() {
    try {
      console.log('开始加载用户档案...');
      
      // 检查多种可能的用户存储方式
      let currentUser = wx.getStorageSync('currentUser');
      if (!currentUser) {
        // 尝试从全局数据获取
        currentUser = app.globalData.userInfo;
      }
      if (!currentUser) {
        // 尝试从LeanCloud获取当前用户
        const AV = require('../../../libs/av-core-min');
        const user = AV.User.current();
        if (user) {
          currentUser = { id: user.id, ...user.toJSON() };
        }
      }
      
      console.log('当前用户信息:', currentUser);
      
      if (!currentUser || !currentUser.id) {
        console.log('用户未登录，无法获取用户档案');
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      const userId = currentUser.id;
      console.log('用户ID:', userId);
      
      // 获取用户档案
      const profile = await dal.getProfile(userId, { ensure: false });
      console.log('获取到的用户档案:', profile);

      this.setData({
        userProfile: profile
      });

      console.log('用户档案加载完成:', { 
        profile: profile ? '已获取' : '未获取', 
        hasHeight: profile && profile.height_cm,
        hasWeight: profile && profile.weight_kg,
        hasAge: profile && profile.age,
        userId: userId
      });
    } catch (error) {
      console.error('加载用户档案失败:', error);
      wx.showToast({
        title: '加载用户档案失败',
        icon: 'none'
      });
    }
  },

  // 新增：获取咖啡摄入记录（使用recording页面的方式）
  loadCoffeeIntakeRecords: async function() {
    try {
      console.log('开始加载咖啡摄入记录...');
      
      const AV = require('../../../libs/av-core-min');
      const user = AV.User.current();
      
      if (!user) {
        console.log('用户未登录，无法获取咖啡摄入记录');
        this.setData({ userIntakes: [] });
        return;
      }
      
      console.log('当前用户:', user.id);
      
      // 获取今日的摄入记录
      const today = new Date().toISOString().slice(0, 10);
      const todayDate = new Date(`${today}T00:00:00`);
      console.log('查询今日摄入记录:', { today, todayDate, userId: user.id });
      
      const todayQuery = new AV.Query('intakes');
      todayQuery.equalTo('takenAt', todayDate);
      todayQuery.equalTo('user', user); // 使用Pointer查询
      todayQuery.ascending('takenAt_time');
      const todayRows = await todayQuery.find();
      const todayIntakes = todayRows.map(obj => ({
        objectId: obj.id,
        brand: obj.get('brand') || '',
        product: obj.get('product') || '',
        drink_name: obj.get('product') || '',
        caffeine_total_mg: obj.get('caffeine_total_mg') || 0,
        caffeine_mg: obj.get('caffeine_total_mg') || 0,
        takenAt: obj.get('takenAt'),
        takenAt_time: obj.get('takenAt_time') || '',
        servings: obj.get('servings') || 1,
        isLocal: false
      }));
      console.log('今日摄入记录:', todayIntakes);
      
      // 获取最近30天的摄入记录
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      console.log('查询摄入记录时间范围:', {
        startDate: startDate.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10),
        userId: user.id
      });
      
      const rangeQuery = new AV.Query('intakes');
      rangeQuery.greaterThanOrEqualTo('takenAt', startDate);
      rangeQuery.lessThanOrEqualTo('takenAt', endDate);
      rangeQuery.equalTo('user', user); // 使用Pointer查询
      rangeQuery.addAscending('takenAt').addAscending('takenAt_time');
      rangeQuery.limit(1000);
      const rangeRows = await rangeQuery.find();
      let intakes = rangeRows.map(obj => ({
        objectId: obj.id,
        brand: obj.get('brand') || '',
        product: obj.get('product') || '',
        drink_name: obj.get('product') || '',
        caffeine_total_mg: obj.get('caffeine_total_mg') || 0,
        caffeine_mg: obj.get('caffeine_total_mg') || 0,
        takenAt: obj.get('takenAt'),
        takenAt_time: obj.get('takenAt_time') || '',
        servings: obj.get('servings') || 1,
        isLocal: false
      }));
      console.log('获取到的摄入记录:', intakes);
      
      // 如果最近30天没有记录，尝试获取所有记录
      if (!intakes || intakes.length === 0) {
        console.log('最近30天无记录，尝试获取所有记录...');
        try {
          const allQuery = new AV.Query('intakes');
          allQuery.equalTo('user', user); // 使用Pointer查询
          allQuery.addAscending('takenAt').addAscending('takenAt_time');
          allQuery.limit(1000);
          const allRows = await allQuery.find();
          intakes = allRows.map(obj => ({
            objectId: obj.id,
            brand: obj.get('brand') || '',
            product: obj.get('product') || '',
            drink_name: obj.get('product') || '',
            caffeine_total_mg: obj.get('caffeine_total_mg') || 0,
            caffeine_mg: obj.get('caffeine_total_mg') || 0,
            takenAt: obj.get('takenAt'),
            takenAt_time: obj.get('takenAt_time') || '',
            servings: obj.get('servings') || 1,
            isLocal: false
          }));
          console.log('获取到的所有摄入记录:', intakes);
        } catch (error) {
          console.error('获取所有摄入记录失败:', error);
          intakes = [];
        }
      }
      
      // 合并今日记录和历史记录，去重
      const allIntakes = [...(todayIntakes || []), ...(intakes || [])];
      const uniqueIntakes = allIntakes.filter((intake, index, self) => 
        index === self.findIndex(t => t.objectId === intake.objectId)
      );
      intakes = uniqueIntakes;
      
      // 处理摄入记录数据，确保字段正确
      if (intakes && intakes.length > 0) {
        console.log('处理摄入记录数据...');
        intakes = intakes.map(intake => {
          console.log('原始摄入记录:', intake);
          return {
            ...intake,
            // 确保字段名正确
            drink_name: intake.drink_name || intake.product || intake.name || '未知饮品',
            brand: intake.brand || intake.category || '未知品牌',
            caffeine_mg: intake.caffeine_mg || intake.caffeine || intake.caffeine_per_serving_mg || 0,
            takenAt: intake.takenAt || intake.date || intake.createdAt,
            takenAt_time: intake.takenAt_time || intake.time || '未知时间',
            servings: intake.servings || 1
          };
        });
        console.log('处理后的摄入记录:', intakes);
      }

      this.setData({
        userIntakes: intakes
      });

      console.log('咖啡摄入记录加载完成:', { 
        intakesCount: intakes.length,
        userLoggedIn: !!user,
        userId: user ? user.id : '未登录'
      });
      
      // 如果有摄入记录，显示详细信息
      if (intakes && intakes.length > 0) {
        console.log('摄入记录详情:', intakes.map(intake => ({
          product: intake.product || intake.drink_name,
          brand: intake.brand,
          caffeine: intake.caffeine_total_mg || intake.caffeine_mg,
          date: intake.takenAt,
          time: intake.takenAt_time
        })));
      }
    } catch (error) {
      console.error('加载咖啡摄入记录失败:', error);
      wx.showToast({
        title: '加载咖啡摄入记录失败',
        icon: 'none'
      });
    }
  },

  // 新增：获取饮品数据
  loadDrinksData: async function() {
    try {
      // 获取所有品牌
      const brands = await dbService.getBrands();
      
      // 获取每个品牌的热门饮品（前10个）
      const allDrinks = [];
      for (const brand of brands.slice(0, 5)) { // 限制前5个品牌避免请求过多
        const drinks = await dbService.getDrinks(brand.id, { pageSize: 10 });
        allDrinks.push(...drinks);
      }

      this.setData({
        drinksData: allDrinks
      });

      console.log('饮品数据加载完成:', { brandsCount: brands.length, drinksCount: allDrinks.length });
    } catch (error) {
      console.error('加载饮品数据失败:', error);
    }
  },

  onUnload: function() {
    // 页面卸载时清理定时器
    if (this.data.pollingIntervalId) {
      clearInterval(this.data.pollingIntervalId);
    }
  },

  onInput: function(e) {
    this.setData({
      inputMessage: e.detail.value
    });
  },

  sendMessage: function() {
    const message = this.data.inputMessage.trim();
    if (!message || this.data.isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message
    };
    const newMessages = [...this.data.messages, userMessage];
    
    this.setData({
      messages: newMessages,
      inputMessage: '',
      isLoading: true
    }, () => {
      this.scrollToBottom();
      this.callCozeAPI(message);
    });
  },

  sendQuickQuestion: function(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({
      inputMessage: question
    }, () => {
      this.sendMessage();
    });
  },

  callCozeAPI: function(message) {
    const that = this;
    
    // 构建包含用户数据和饮品数据的上下文信息
    const contextData = this.buildContextData();
    console.log('构建的上下文数据:', contextData);
    
    // 将用户数据和饮品数据作为上下文添加到消息中
    const enhancedMessage = this.enhanceMessageWithContext(message, contextData);
    console.log('增强后的消息内容:', enhancedMessage);
    
    wx.request({
      url: 'https://api.coze.cn/v3/chat',
      method: 'POST',
      header: {
        'Authorization': `Bearer pat_zyStm62wwk7JH9aseDB52xii9mOfTqEfLp9mbgja46ZCkPJirRqWzNSpjPN4L5XX`,
        'Content-Type': 'application/json'
      },
      data: {
        bot_id: "7545298396384002086",
        user_id: "123456789",
        additional_messages: [
          {
            role: "user",
            type: "question",
            content_type: "text",
            content: enhancedMessage
          }
        ],
        stream: false
      },
      success: function(res) {
        if (res.data && res.data.code === 0) {
          let conversation_id = res.data.data.conversation_id;
          let chat_id = res.data.data.id;
          wx.showLoading({
            title: '思考中...',
            mask: true
          });
          that.pollStatus(chat_id, conversation_id);
        } else {
          that.setData({ isLoading: false });
          that.handleError(`API调用失败: ${res.data?.msg || '未知错误'}`);
        }
      },
      fail: function(err) {
        that.setData({ isLoading: false });
        that.handleError(`网络请求失败: ${err.errMsg}`);
      }
    });
  },

  // 新增：构建上下文数据
  buildContextData: function() {
    const { userProfile, userIntakes, drinksData } = this.data;
    
    const context = {
      userProfile: userProfile ? {
        displayName: userProfile.display_name,
        age: userProfile.age,
        height: userProfile.height_cm,
        weight: userProfile.weight_kg,
        bedtimeTarget: userProfile.bedtime_target,
        caffeineThreshold: userProfile.bedtime_caffeine_threshold_mg,
        // 个性化代谢因子
        onboardingAnswers: {
          gene: userProfile.onboarding_answers1, // 基因代谢速度
          smoking: userProfile.onboarding_answers2, // 是否吸烟
          pregnancy: userProfile.onboarding_answers3, // 是否怀孕
          medication: userProfile.onboarding_answers4, // 是否服用避孕药/激素
          liverHealth: userProfile.onboarding_answers5 // 肝功能状况
        }
      } : null,
      
      recentIntakes: userIntakes.map(intake => ({
        date: intake.takenAt,
        time: intake.takenAt_time,
        drinkName: intake.drink_name,
        brand: intake.brand,
        caffeineAmount: intake.caffeine_mg,
        servings: intake.servings
      })),
      
      availableDrinks: drinksData.map(drink => ({
        name: drink.name,
        brand: drink.category,
        caffeine: drink.caffeine,
        size: drink.size_key,
        unit: drink.unit
      }))
    };
    
    return context;
  },

  // 新增：增强消息内容，添加上下文信息
  enhanceMessageWithContext: function(message, contextData) {
    let enhancedMessage = message;
    
    // 如果有用户数据，添加用户信息
    if (contextData.userProfile) {
      const profile = contextData.userProfile;
      enhancedMessage += `\n\n【用户信息】\n`;
      enhancedMessage += `姓名：${profile.displayName || '未设置'}\n`;
      if (profile.age) enhancedMessage += `年龄：${profile.age}岁\n`;
      if (profile.height) enhancedMessage += `身高：${profile.height}cm\n`;
      if (profile.weight) enhancedMessage += `体重：${profile.weight}kg\n`;
      if (profile.bedtimeTarget) enhancedMessage += `目标入睡时间：${profile.bedtimeTarget}\n`;
      if (profile.caffeineThreshold) enhancedMessage += `睡前咖啡因阈值：${profile.caffeineThreshold}mg\n`;
      
      // 添加个性化代谢信息
      const answers = profile.onboardingAnswers;
      if (answers.gene !== null) {
        const geneTypes = ['快代谢', '慢代谢', '正常代谢'];
        enhancedMessage += `基因代谢类型：${geneTypes[answers.gene] || '未知'}\n`;
      }
      if (answers.smoking !== null) enhancedMessage += `吸烟状态：${answers.smoking ? '是' : '否'}\n`;
      if (answers.pregnancy !== null) enhancedMessage += `怀孕状态：${answers.pregnancy ? '是' : '否'}\n`;
      if (answers.medication !== null) enhancedMessage += `服用避孕药/激素：${answers.medication ? '是' : '否'}\n`;
      if (answers.liverHealth !== null) enhancedMessage += `肝功能：${answers.liverHealth ? '有肝病' : '健康'}\n`;
    }
    
    // 如果有最近的摄入记录，添加饮用历史
    if (contextData.recentIntakes && contextData.recentIntakes.length > 0) {
      enhancedMessage += `\n【咖啡摄入记录】\n`;
      enhancedMessage += `总记录数：${contextData.recentIntakes.length}条\n`;
      
      // 按日期分组显示
      const groupedIntakes = {};
      const today = new Date().toISOString().slice(0, 10);
      
      contextData.recentIntakes.slice(0, 20).forEach(intake => {
        const date = intake.date || intake.takenAt || '未知日期';
        if (!groupedIntakes[date]) {
          groupedIntakes[date] = [];
        }
        groupedIntakes[date].push(intake);
      });
      
      // 特别显示今日记录
      if (groupedIntakes[today] && groupedIntakes[today].length > 0) {
        enhancedMessage += `\n【今日摄入记录】\n`;
        const todayTotalCaffeine = groupedIntakes[today].reduce((sum, intake) => {
          return sum + ((intake.caffeineAmount || intake.caffeine_mg || 0) * (intake.servings || 1));
        }, 0);
        
        groupedIntakes[today].forEach(intake => {
          const time = intake.time || intake.takenAt_time || '未知时间';
          const brand = intake.brand || '未知品牌';
          const drinkName = intake.drinkName || intake.drink_name || '未知饮品';
          const caffeine = intake.caffeineAmount || intake.caffeine_mg || 0;
          const servings = intake.servings || 1;
          enhancedMessage += `  ${time} - ${brand} ${drinkName} (${caffeine}mg咖啡因 x${servings}份)\n`;
        });
        enhancedMessage += `今日总咖啡因摄入：${todayTotalCaffeine}mg\n`;
      } else {
        enhancedMessage += `\n【今日摄入记录】\n暂无今日记录\n`;
      }
      
      // 显示历史记录（排除今日）
      const sortedDates = Object.keys(groupedIntakes)
        .filter(date => date !== today)
        .sort()
        .reverse()
        .slice(0, 6);
      
      if (sortedDates.length > 0) {
        enhancedMessage += `\n【历史摄入记录】\n`;
        sortedDates.forEach(date => {
          enhancedMessage += `\n${date}：\n`;
          groupedIntakes[date].forEach(intake => {
            const time = intake.time || intake.takenAt_time || '未知时间';
            const brand = intake.brand || '未知品牌';
            const drinkName = intake.drinkName || intake.drink_name || '未知饮品';
            const caffeine = intake.caffeineAmount || intake.caffeine_mg || 0;
            const servings = intake.servings || 1;
            enhancedMessage += `  ${time} - ${brand} ${drinkName} (${caffeine}mg咖啡因 x${servings}份)\n`;
          });
        });
      }
      
      // 计算总咖啡因摄入量
      const totalCaffeine = contextData.recentIntakes.reduce((sum, intake) => {
        return sum + ((intake.caffeineAmount || intake.caffeine_mg || 0) * (intake.servings || 1));
      }, 0);
      enhancedMessage += `\n最近总咖啡因摄入：${totalCaffeine}mg\n`;
    } else {
      enhancedMessage += `\n【咖啡摄入记录】\n暂无记录\n`;
    }
    
    // 如果有饮品数据，添加可用饮品信息
    if (contextData.availableDrinks && contextData.availableDrinks.length > 0) {
      enhancedMessage += `\n【可用饮品数据库】\n`;
      const brandGroups = {};
      contextData.availableDrinks.forEach(drink => {
        if (!brandGroups[drink.brand]) brandGroups[drink.brand] = [];
        brandGroups[drink.brand].push(drink);
      });
      
      Object.keys(brandGroups).slice(0, 3).forEach(brand => {
        enhancedMessage += `${brand}：`;
        brandGroups[brand].slice(0, 5).forEach(drink => {
          enhancedMessage += `${drink.name}(${drink.caffeine}mg) `;
        });
        enhancedMessage += `\n`;
      });
    }
    
    return enhancedMessage;
  },

  // 新增：刷新用户数据和饮品数据
  refreshData: function() {
    wx.showLoading({
      title: '刷新数据中...',
      mask: true
    });
    
    Promise.all([
      this.loadUserProfile(),
      this.loadCoffeeIntakeRecords(),
      this.loadDrinksData()
    ]).then(() => {
      wx.hideLoading();
      wx.showToast({
        title: '数据刷新成功',
        icon: 'success'
      });
    }).catch((error) => {
      wx.hideLoading();
      wx.showToast({
        title: '数据刷新失败',
        icon: 'none'
      });
      console.error('刷新数据失败:', error);
    });
  },

  // 新增：刷新咖啡摄入记录
  refreshCoffeeIntakeRecords: async function() {
    try {
      console.log('刷新咖啡摄入记录...');
      await this.loadCoffeeIntakeRecords();
    } catch (error) {
      console.error('刷新咖啡摄入记录失败:', error);
    }
  },

  // 新增：测试用户档案获取
  testUserProfile: function() {
    console.log('=== 测试用户档案获取 ===');
    console.log('当前页面数据:', this.data);
    console.log('用户档案:', this.data.userProfile);
    
    wx.showModal({
      title: '用户档案调试信息',
      content: `用户档案: ${this.data.userProfile ? '已获取' : '未获取'}\n身高: ${this.data.userProfile?.height_cm || '未设置'}\n体重: ${this.data.userProfile?.weight_kg || '未设置'}\n年龄: ${this.data.userProfile?.age || '未设置'}`,
      showCancel: false
    });
  },

  // 新增：测试咖啡摄入记录获取
  testCoffeeIntakeRecords: function() {
    console.log('=== 测试咖啡摄入记录获取 ===');
    console.log('当前页面数据:', this.data);
    console.log('摄入记录:', this.data.userIntakes);
    
    // 测试构建上下文数据
    const contextData = this.buildContextData();
    console.log('构建的上下文数据:', contextData);
    
    // 测试消息增强
    const testMessage = "测试消息";
    const enhancedMessage = this.enhanceMessageWithContext(testMessage, contextData);
    console.log('增强后的测试消息:', enhancedMessage);
    
    wx.showModal({
      title: '咖啡摄入记录调试信息',
      content: `摄入记录: ${this.data.userIntakes?.length || 0}条\n今日记录: ${this.data.userIntakes?.filter(intake => {
        const today = new Date().toISOString().slice(0, 10);
        const intakeDate = intake.takenAt || intake.date;
        return intakeDate === today;
      }).length || 0}条`,
      showCancel: false
    });
  },

  // 新增：专门测试饮用记录获取
  testIntakeRecords: async function() {
    console.log('=== 测试饮用记录获取 ===');
    
    try {
      // 检查用户登录状态
      let currentUser = wx.getStorageSync('currentUser');
      if (!currentUser) {
        currentUser = app.globalData.userInfo;
      }
      if (!currentUser) {
        const AV = require('../../../libs/av-core-min');
        const user = AV.User.current();
        if (user) {
          currentUser = { id: user.id, ...user.toJSON() };
        }
      }
      
      if (!currentUser || !currentUser.id) {
        wx.showModal({
          title: '错误',
          content: '用户未登录，无法获取饮用记录',
          showCancel: false
        });
        return;
      }
      
      const userId = currentUser.id;
      console.log('测试用户ID:', userId);
      
      // 尝试不同的查询方式
      console.log('1. 尝试获取今日记录...');
      const today = new Date().toISOString().slice(0, 10);
      let todayIntakes = await dal.listIntakesByDate(today, userId);
      console.log('今日记录:', todayIntakes);
      
      console.log('2. 尝试获取最近30天记录...');
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      let intakes = await dal.listIntakesInRange(
        startDate.toISOString().slice(0, 10),
        endDate.toISOString().slice(0, 10),
        userId
      );
      console.log('最近30天记录:', intakes);
      
      if (!intakes || intakes.length === 0) {
        console.log('3. 尝试获取所有记录...');
        intakes = await dal.listIntakesInRange(
          '2020-01-01',
          endDate.toISOString().slice(0, 10),
          userId
        );
        console.log('所有记录:', intakes);
      }
      
      // 显示结果
      const todayCount = todayIntakes ? todayIntakes.length : 0;
      const totalCount = intakes ? intakes.length : 0;
      const todaySample = todayIntakes && todayIntakes.length > 0 ? todayIntakes[0] : null;
      const totalSample = intakes && intakes.length > 0 ? intakes[0] : null;
      
      let content = `今日记录: ${todayCount}条\n总记录: ${totalCount}条\n`;
      if (todaySample) {
        content += `\n今日示例:\n${JSON.stringify(todaySample, null, 2)}`;
      }
      if (totalSample && totalSample !== todaySample) {
        content += `\n\n历史示例:\n${JSON.stringify(totalSample, null, 2)}`;
      }
      
      wx.showModal({
        title: '饮用记录测试结果',
        content: content,
        showCancel: false
      });
      
    } catch (error) {
      console.error('测试饮用记录失败:', error);
      wx.showModal({
        title: '错误',
        content: `测试失败: ${error.message}`,
        showCancel: false
      });
    }
  },

  // 新增：专门测试今日摄入记录
  testTodayIntake: async function() {
    console.log('=== 测试今日摄入记录 ===');
    
    try {
      // 检查用户登录状态
      let currentUser = wx.getStorageSync('currentUser');
      if (!currentUser) {
        currentUser = app.globalData.userInfo;
      }
      if (!currentUser) {
        const AV = require('../../../libs/av-core-min');
        const user = AV.User.current();
        if (user) {
          currentUser = { id: user.id, ...user.toJSON() };
        }
      }
      
      if (!currentUser || !currentUser.id) {
        wx.showModal({
          title: '错误',
          content: '用户未登录，无法获取今日摄入记录',
          showCancel: false
        });
        return;
      }
      
      const userId = currentUser.id;
      const today = new Date().toISOString().slice(0, 10);
      
      console.log('查询今日摄入记录:', { today, userId });
      
      // 尝试多种查询方式
      console.log('1. 使用userId查询...');
      let todayIntakes = await dal.listIntakesByDate(today, userId);
      console.log('使用userId查询结果:', todayIntakes);
      
      if (!todayIntakes || todayIntakes.length === 0) {
        console.log('2. 使用AV.User.current()查询...');
        const AV = require('../../../libs/av-core-min');
        const user = AV.User.current();
        if (user) {
          // 直接使用LeanCloud查询，不通过dal
          const q = new AV.Query('intakes');
          const todayDate = new Date(`${today}T00:00:00`);
          q.equalTo('takenAt', todayDate);
          q.equalTo('user', user); // 使用Pointer查询
          q.ascending('takenAt_time');
          const rows = await q.find();
          todayIntakes = rows.map(row => row.toJSON());
          console.log('使用AV.User.current()查询结果:', todayIntakes);
        }
      }
      
      if (!todayIntakes || todayIntakes.length === 0) {
        console.log('3. 查询所有intakes记录...');
        const AV = require('../../../libs/av-core-min');
        const q = new AV.Query('intakes');
        const rows = await q.find();
        const allIntakes = rows.map(row => row.toJSON());
        console.log('所有intakes记录:', allIntakes);
        
        // 过滤今日记录
        const todayDate = new Date(`${today}T00:00:00`);
        todayIntakes = allIntakes.filter(intake => {
          const intakeDate = intake.takenAt;
          return intakeDate && new Date(intakeDate).getTime() === todayDate.getTime();
        });
        console.log('过滤后的今日记录:', todayIntakes);
      }
      
      if (todayIntakes && todayIntakes.length > 0) {
        const totalCaffeine = todayIntakes.reduce((sum, intake) => {
          const caffeine = intake.caffeine_total_mg || intake.caffeine_mg || intake.caffeine || intake.caffeine_per_serving_mg || 0;
          const servings = intake.servings || 1;
          return sum + (caffeine * servings);
        }, 0);
        
        let content = `今日摄入记录: ${todayIntakes.length}条\n总咖啡因: ${totalCaffeine}mg\n\n`;
        todayIntakes.forEach((intake, index) => {
          const time = intake.takenAt_time || intake.time || '未知时间';
          const brand = intake.brand || '未知品牌';
          const drinkName = intake.product || intake.drink_name || '未知饮品';
          const caffeine = intake.caffeine_total_mg || intake.caffeine_mg || intake.caffeine || intake.caffeine_per_serving_mg || 0;
          const servings = intake.servings || 1;
          content += `${index + 1}. ${time} - ${brand} ${drinkName} (${caffeine}mg x${servings}份)\n`;
        });
        
        wx.showModal({
          title: '今日摄入记录',
          content: content,
          showCancel: false
        });
      } else {
        wx.showModal({
          title: '今日摄入记录',
          content: '今日暂无摄入记录',
          showCancel: false
        });
      }
      
    } catch (error) {
      console.error('测试今日摄入记录失败:', error);
      wx.showModal({
        title: '错误',
        content: `测试失败: ${error.message}`,
        showCancel: false
      });
    }
  },

  // 新增：测试数据存储和获取
  testDataStorage: async function() {
    console.log('=== 测试数据存储和获取 ===');
    
    try {
      const AV = require('../../../libs/av-core-min');
      const user = AV.User.current();
      
      if (!user) {
        wx.showModal({
          title: '错误',
          content: '用户未登录',
          showCancel: false
        });
        return;
      }
      
      console.log('当前用户:', user.id);
      
      // 1. 查询所有intakes记录
      const allQuery = new AV.Query('intakes');
      const allRows = await allQuery.find();
      const allIntakes = allRows.map(obj => ({
        objectId: obj.id,
        brand: obj.get('brand') || '',
        product: obj.get('product') || '',
        caffeine_total_mg: obj.get('caffeine_total_mg') || 0,
        takenAt: obj.get('takenAt'),
        takenAt_time: obj.get('takenAt_time') || '',
        user: obj.get('user')
      }));
      console.log('数据库中所有intakes记录:', allIntakes);
      
      // 2. 查询当前用户的记录
      const userQuery = new AV.Query('intakes');
      userQuery.equalTo('user', user);
      const userRows = await userQuery.find();
      const userIntakes = userRows.map(obj => ({
        objectId: obj.id,
        brand: obj.get('brand') || '',
        product: obj.get('product') || '',
        caffeine_total_mg: obj.get('caffeine_total_mg') || 0,
        takenAt: obj.get('takenAt'),
        takenAt_time: obj.get('takenAt_time') || ''
      }));
      console.log('当前用户的intakes记录:', userIntakes);
      
      // 3. 查询今日记录
      const today = new Date().toISOString().slice(0, 10);
      const todayDate = new Date(`${today}T00:00:00`);
      const todayQuery = new AV.Query('intakes');
      todayQuery.equalTo('takenAt', todayDate);
      todayQuery.equalTo('user', user);
      const todayRows = await todayQuery.find();
      const todayIntakes = todayRows.map(obj => ({
        objectId: obj.id,
        brand: obj.get('brand') || '',
        product: obj.get('product') || '',
        caffeine_total_mg: obj.get('caffeine_total_mg') || 0,
        takenAt: obj.get('takenAt'),
        takenAt_time: obj.get('takenAt_time') || ''
      }));
      console.log('今日intakes记录:', todayIntakes);
      
      // 显示结果
      let content = `数据库总记录: ${allIntakes.length}条\n`;
      content += `当前用户记录: ${userIntakes.length}条\n`;
      content += `今日记录: ${todayIntakes.length}条\n\n`;
      
      if (todayIntakes.length > 0) {
        content += '今日记录详情:\n';
        todayIntakes.forEach((intake, index) => {
          content += `${index + 1}. ${intake.brand} ${intake.product} (${intake.caffeine_total_mg}mg) ${intake.takenAt_time}\n`;
        });
      }
      
      wx.showModal({
        title: '数据存储测试结果',
        content: content,
        showCancel: false
      });
      
    } catch (error) {
      console.error('测试数据存储失败:', error);
      wx.showModal({
        title: '错误',
        content: `测试失败: ${error.message}`,
        showCancel: false
      });
    }
  },

  pollStatus: function(chat_id, conversation_id) {
    const that = this;
    const maxAttempts = 20;
    const pollInterval = 3000;
    let attempts = 0;
    
    if (this.data.pollingIntervalId) {
      clearInterval(this.data.pollingIntervalId);
    }
    
    const intervalId = setInterval(() => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(intervalId);
        that.setData({ 
          isLoading: false,
          pollingIntervalId: null
        });
        wx.hideLoading();
        wx.showToast({
          title: '请求超时，请稍后重试',
          icon: 'none'
        });
        return;
      }
      
      wx.request({
        url: 'https://api.coze.cn/v3/chat/retrieve',
        method: 'GET',
        header: {
          'Authorization': `Bearer pat_zyStm62wwk7JH9aseDB52xii9mOfTqEfLp9mbgja46ZCkPJirRqWzNSpjPN4L5XX`,
          'Content-Type': 'application/json'
        },
        data: {
          conversation_id: conversation_id,
          chat_id: chat_id
        },
        success: (statusRes) => {
          if (statusRes.data && statusRes.data.code === 0) {
            const status = statusRes.data.data.status;
            switch (status) {
              case 'completed':
                clearInterval(intervalId);
                that.setData({ 
                  isLoading: false,
                  pollingIntervalId: null
                });
                wx.hideLoading();
                that.getAgentMessage(chat_id, conversation_id);
                break;
              case 'in_progress':
                console.log('智能体处理中，继续等待...');
                break;
              case 'failed':
                clearInterval(intervalId);
                that.setData({ 
                  isLoading: false,
                  pollingIntervalId: null
                });
                wx.hideLoading();
                wx.showToast({
                  title: '智能体处理失败',
                  icon: 'none'
                });
                break;
              default:
                clearInterval(intervalId);
                that.setData({ 
                  isLoading: false,
                  pollingIntervalId: null
                });
                wx.hideLoading();
                wx.showToast({
                  title: `未知状态: ${status}`,
                  icon: 'none'
                });
                break;
            }
          } else {
            clearInterval(intervalId);
            that.setData({ 
              isLoading: false,
              pollingIntervalId: null
            });
            wx.hideLoading();
            wx.showToast({
              title: statusRes.data?.msg || '状态查询失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('状态查询请求失败:', err);
        }
      });
    }, pollInterval);
    
    this.setData({
      pollingIntervalId: intervalId
    });
  },

  getAgentMessage: function(chat_id, conversation_id) {
    const that = this;
    
    wx.request({
      url: 'https://api.coze.cn/v3/chat/message/list',
      method: 'GET',
      header: {
        'Authorization': `Bearer pat_zyStm62wwk7JH9aseDB52xii9mOfTqEfLp9mbgja46ZCkPJirRqWzNSpjPN4L5XX`,
        'Content-Type': 'application/json'
      },
      data: {
        conversation_id: conversation_id,
        chat_id: chat_id
      },
      success: function(res) {
        if (res.data && res.data.code === 0) {
          console.log(res)
          that.handleAgentMessages(res.data); // 调用核心消息处理方法
        } else {
          wx.showToast({
            title: '获取消息失败',
            icon: 'none'
          });
          that.handleSuccessResponse(res.data);
        }
      },
      fail: function(err) {
        console.error('获取消息请求失败:', err);
        wx.showToast({
          title: '网络错误，获取消息失败',
          icon: 'none'
        });
        that.handleSuccessResponse({});
      }
    });
  },

  // 核心修改：同时处理 answer（输出内容）和 follow_up（替换提示问题）
  handleAgentMessages: function(responseData) {
    console.log(responseData)
    if (responseData.data && responseData.data.length > 0) {
      // 1. 保留原有功能：收集 type 为 answer 的 content（用于输出和展示）
      const answerContents = [];
      // 2. 新增功能：收集 type 为 follow_up 的 content（用于替换提示问题）
      const followUpContents = [];
      
      // 遍历消息列表，同时收集两种类型的内容
      responseData.data.forEach(msg => {
        // 保留：处理 answer 类型，输出 content 到控制台
        if (msg.type === 'answer') {
          answerContents.push(msg.content);
          console.log('找到answer类型消息:', msg.content); // 输出answer内容（原有功能）
        }
        // 新增：处理 follow_up 类型，收集 content 用于替换提示
        if (msg.type === 'follow_up') {
          followUpContents.push(msg.content);
          console.log('找到follow_up类型消息:', msg.content);
        }
      });

      // ---------------------- 新增：替换三个提示问题 ----------------------
      if (followUpContents.length > 0) {
        let newQuickQuestions = [...this.data.quickQuestions]; // 复制原有提示数组
        // 按顺序替换（最多替换3个，避免数组越界）
        for (let i = 0; i < followUpContents.length && i < newQuickQuestions.length; i++) {
          newQuickQuestions[i] = followUpContents[i];
        }
        this.setData({
          quickQuestions: newQuickQuestions // 更新提示问题到页面
        });
      }

      // ---------------------- 保留：展示 answer 类型的消息到聊天界面 ----------------------
      const agentMessages = responseData.data.filter(msg => 
        msg.role === 'assistant' || msg.role === 'bear'
      );
      
      if (agentMessages.length > 0) {
        const latestMessage = agentMessages[agentMessages.length - 1];
        // 优先使用 answer 类型的最后一条内容（原有逻辑），无则用默认智能体消息
        const messageContent = answerContents.length > 0 
          ? answerContents[answerContents.length - 1] 
          : latestMessage.content;
        
        const botMessage = {
          id: Date.now().toString(),
          role: 'bear',
          content: messageContent // 聊天界面展示 answer 内容
        };
        
        const newMessages = [...this.data.messages, botMessage];
        this.setData({
          messages: newMessages
        }, () => {
          this.scrollToBottom();
        });
        return;
      }
    }
    
    this.handleSuccessResponse(responseData);
  },

  // 另一种似乎可行的方法
  handleSuccessResponse: function(responseData) {
    if (responseData.data && responseData.data.messages && responseData.data.messages.length > 0) {
      const messageContent = responseData.data.messages[0].content;
      const botMessage = {
        id: Date.now().toString(),
        role: 'bear',
        content: messageContent
      };
      const newMessages = [...this.data.messages, botMessage];
      this.setData({
        messages: newMessages
      }, () => {
        this.scrollToBottom();
      });
    } else {
      wx.showToast({
        title: '未收到有效回复',
        icon: 'none'
      });
    }
  },

  extractResponse: function(responseData) {
    if (responseData.data && responseData.data.messages && responseData.data.messages.length > 0) {
      return responseData.data.messages[0].content;
    }
    return '抱歉，我没有理解您的问题，请再试一次。';
  },

  handleError: function(errorMsg) {
    console.error('错误:', errorMsg);
    const errorMessage = { 
      id: (Date.now() + 2).toString(),
      role: 'bear', 
      content: '抱歉，暂时无法处理您的请求，请稍后再试。' 
    };
    const newMessages = [...this.data.messages, errorMessage];
    this.setData({
      messages: newMessages,
      isLoading: false
    }, () => {
      this.scrollToBottom();
    });
    wx.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 3000
    });
  },

  scrollToBottom: function() {
    const query = wx.createSelectorQuery().in(this);
    query.select('.message-list').boundingClientRect();
    query.select('.message-container').boundingClientRect();
    query.exec((res) => {
      if (res && res.length >= 2 && res[0] && res[1]) {
        const messageListHeight = res[0].height;
        const containerHeight = res[1].height;
        if (messageListHeight && containerHeight && messageListHeight > containerHeight) {
          this.setData({
            scrollTop: messageListHeight - containerHeight
          });
        }
      }
    });
  },

  onScroll: function(e) {
    this.setData({
      currentScrollTop: e.detail.scrollTop
    });
  },

  onScrollToLower: function() {
    if (!this.data.isLoadingHistory && this.data.hasMoreHistory) {
      this.loadMoreHistory();
    }
  },

  loadMoreHistory: function() {
    this.setData({
      isLoadingHistory: true
    });
    setTimeout(() => {
      const historyMessages = [
        {
          id: (Date.now() - 10000).toString(),
          role: 'bear',
          content: '这是一条历史消息，显示更早的对话内容。'
        },
        {
          id: (Date.now() - 20000).toString(),
          role: 'user',
          content: '我想了解更多历史消息'
        }
      ];
      const newMessages = [...historyMessages, ...this.data.messages];
      const currentScrollTop = this.data.currentScrollTop || 0;
      const historyHeight = 200;
      this.setData({
        messages: newMessages,
        scrollTop: currentScrollTop + historyHeight,
        isLoadingHistory: false,
        hasMoreHistory: false
      });
    }, 1000);
  }
});