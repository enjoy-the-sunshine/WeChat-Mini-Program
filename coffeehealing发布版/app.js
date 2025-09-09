// app.js
const AV = require('./libs/av-core-min');
const adapters = require('./libs/leancloud-adapters-weapp.js');

AV.setAdapters(adapters);
AV.init({
    appId:'VAyAzQrtMRhhd9MlJA7PLdnd-gzGzoHsz',
    appKey:'ZHOIKnk8GosgUUka9lAOIFWf',
    serverURLs:"https://vayazqrt.lc-cn-n1-shared.com",
});
App({
  onLaunch() {
    console.log("CoffeeHealing 小程序启动了")
  },
  onShow() {
    console.log("CoffeeHealing 小程序显示")
  },
  onHide() {
    console.log("CoffeeHealing 小程序隐藏")
  },
  globalData: {
    userInfo: null
  }
})
