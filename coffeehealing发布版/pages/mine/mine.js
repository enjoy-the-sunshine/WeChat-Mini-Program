// pages/mine/mine.js
const db = require('../../service/db'); // 引入封装好的 db.js
const AV = require('../../libs/av-core-min');

Page({
  data: {
    userInfo: {
      avatarUrl: '../images/avatar.png', // 默认小熊头像
      nickname: '小熊123',                // 默认名字
      level: '咖啡小白',
      recordDays: 0
    },
  },

  async onLoad() {
    try {
      const currentUser = AV.User.current();
      if (!currentUser) {
        console.warn("未登录用户，显示默认头像/昵称");
        return;
      }

      const userId = currentUser.id;
      const profile = await db.getProfile(userId);   // 读取 LeanCloud user_profiles
      const recordDays = await this.getRecordDays(userId); // 获取记录天数
      const level = this.getLevelByDays(recordDays); // 根据天数获取等级

      if (profile) {
        this.setData({
          userInfo: {
            ...this.data.userInfo,
            avatarUrl: profile.avatar ? profile.avatar.url : '../images/avatar.png',
            nickname: profile.display_name && profile.display_name.trim()
              ? profile.display_name
              : (profile.phone_contact ? profile.phone_contact + '的小熊' : '小熊123'),
            recordDays: recordDays,
            level: level
          }
        });
      } else {
        // 即使没有profile，也要更新记录天数和等级
        this.setData({
          userInfo: {
            ...this.data.userInfo,
            recordDays: recordDays,
            level: level
          }
        });
      }
    } catch (err) {
      console.error("加载用户档案失败:", err);
    }
  },

  // 获取用户记录咖啡因的天数
  async getRecordDays(userId) {
    try {
      const currentUser = AV.User.current();
      if (!currentUser) {
        console.warn("未登录用户，无法获取记录天数");
        return 0;
      }

      // 直接查询intakes表，获取当前用户的所有记录
      const query = new AV.Query('intakes');
      query.equalTo('user', currentUser);
      query.ascending('takenAt');
      query.limit(1000); // 限制查询数量，避免数据过多
      
      const intakes = await query.find();
      
      // 统计有记录的不同日期数量
      const uniqueDates = new Set();
      intakes.forEach(intake => {
        const takenAt = intake.get('takenAt');
        if (takenAt) {
          const dateStr = new Date(takenAt).toISOString().slice(0, 10);
          uniqueDates.add(dateStr);
        }
      });
      
      return uniqueDates.size;
    } catch (err) {
      console.error("获取记录天数失败:", err);
      return 0;
    }
  },

  // 根据记录天数获取等级
  getLevelByDays(days) {
    if (days <= 7) {
      return '咖啡萌新';
    } else if (days <= 14) {
      return '咖啡达人';
    } else {
      return '咖啡大师';
    }
  },

  // 跳转到个人资料页面
  navigateToProfile() {
    wx.navigateTo({
      url: '/subpackage/mine/profile/profile',
    })
  },
  
  // 跳转到设置页面
  navigateToSettings() {
    wx.navigateTo({
      url: '/subpackage/mine/settings/settings',
    })
  },
  
  // 跳转到问题反馈页面
  navigateToFeedback() {
    wx.navigateTo({
      url: '/subpackage/mine/feedback/feedback',
    })
  },
});
