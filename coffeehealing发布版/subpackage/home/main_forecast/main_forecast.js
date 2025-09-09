// subpackage/home/main_forecast/main_forecast.js
import AV from '../../../libs/av-core-min.js';
import * as echarts from '../components/ec-canvas/echarts.js';
const db = require('../../../service/db.js');

/* ================== 常量（原有 + 新增自适配参数） ================== */
const K_BASE = Math.LN2 / 4;        // 基准代谢速率 ln(2)/4 ≈ 0.173

// ↓↓↓ 新增：自适配参数（不影响原有功能） ↓↓↓
const PAGE_PAD_RPX = 32;            // 页面左右留白（如果你的 WXML/WXSS 是别的值，可改成一致）
const HEIGHT_RATIO  = 0.62;         // 画布高 ≈ 内容宽 * 这个比例
const MIN_H_PX      = 260;          // 画布最小高度(px)
const MAX_H_PX      = 420;          // 画布最大高度(px)
/* =================================================================== */

let chart1Instance = null;
let chart2Instance = null;
let chart1Resolve, chart2Resolve;
const chart1Ready = new Promise(resolve => (chart1Resolve = resolve));
const chart2Ready = new Promise(resolve => (chart2Resolve = resolve));

Page({
  data: {
    hasTestDrink: false,
    timeInterval: 2,        // 默认2小时间隔
    testTimeInterval: 2,    // 测试图表默认2小时间隔

    // ↓↓↓ 新增：用于在 WXML 里控制画布高度/位置（不改 WXML 也不影响原功能） ↓↓↓
    chartH1: 400,            // rpx（图1高度）
    chartH2: 400,            // rpx（图2高度）
    chartOffset1: 0,         // rpx（图1视觉下移微调）
    chartOffset2: 0,         // rpx（图2视觉下移微调）
    wrapPadTop1: 0,          // rpx（容器整体下移微调-图1）
    wrapPadTop2: 0,          // rpx（容器整体下移微调-图2）
    // ↑↑↑ 如需微调位置，可直接 setData 改这些值 ↑↑↑

    ec1: {
      onInit(canvas, width, height, dpr) {
        chart1Instance = echarts.init(canvas, null, { width, height, devicePixelRatio: dpr });
        canvas.setChart(chart1Instance);
        chart1Resolve();
        return chart1Instance;
      }
    },
    ec2: {
      onInit(canvas, width, height, dpr) {
        chart2Instance = echarts.init(canvas, null, { width, height, devicePixelRatio: dpr });
        canvas.setChart(chart2Instance);
        chart2Resolve();
        return chart2Instance;
      }
    }
  },

  /* ====================== 生命周期 ====================== */
  onLoad() {
    // 新增：进入页面先根据机型计算一次高度/位置
    this.recalculateChartSize();

    // 新增：横竖屏/窗口变化时，重算并 resize 图表
    wx.onWindowResize(this.recalculateChartSize);
  },

  onUnload() {
    wx.offWindowResize(this.recalculateChartSize);
  },

  onShow() {
    // 先检查是否有新的测试饮品数据
    this.checkAndAddTestDrinkData();
    
    chart1Ready.then(async () => {
      await this.fetchForecastData();
    });
    
    // 如果有测试饮品数据，确保测试图表也更新
    if (this.testDrinkData) {
      chart2Ready.then(() => {
        this.updateTestChart();
      });
    }
  },

  // 检查并添加测试饮品数据
  checkAndAddTestDrinkData() {
    try {
      const testDrinkData = wx.getStorageSync('testDrinkData');
      console.log('从本地存储获取的测试饮品数据:', testDrinkData);
      if (testDrinkData) {
        // 清除存储的测试数据，避免重复使用
        wx.removeStorageSync('testDrinkData');
        console.log('已清除本地存储的测试数据');
        
        // 添加测试饮品数据
        // 确保takenTime是Date对象
        const takenTime = new Date(testDrinkData.takenTime);
        console.log('转换后的takenTime:', takenTime);
        
        this.addTestDrinkData({
          caffeine: testDrinkData.caffeine,
          takenTime: takenTime
        });
      } else {
        console.log('没有找到测试饮品数据');
      }
    } catch (err) {
      console.error('获取测试饮品数据失败', err);
    }
  },

  /* =============== 自适配尺寸（新增，不改原有功能） =============== */
  recalculateChartSize: function () {
    const info = wx.getSystemInfoSync();
    const { windowWidth, windowHeight, pixelRatio } = info || {};

    // 1rpx 对应 px
    const pxPerRpx = windowWidth / 750;

    // 内容宽度：两边各 PAGE_PAD_RPX
    const contentWpx = windowWidth - 2 * (PAGE_PAD_RPX * pxPerRpx);

    // 目标高度（像素）
    const targetHpX = contentWpx * HEIGHT_RATIO;
    const finalHpX  = Math.max(MIN_H_PX, Math.min(MAX_H_PX, targetHpX));

    // 转 rpx
    const finalHrpx = Math.round(finalHpX / pxPerRpx);

    // 针对矮屏微调一点视觉下移（可按需调整/删除）
    const offsetRpx = windowHeight < 640 ? 8 : 0;

    this.setData({
      chartH1: finalHrpx,
      chartH2: finalHrpx,
      chartOffset1: offsetRpx,
      chartOffset2: offsetRpx,
      // 如需整体更靠下，可把 wrapPadTop* 设成 16~32
      wrapPadTop1: 0,
      wrapPadTop2: 0
    });

    // 如果已初始化，resize 一下以匹配容器变化
    if (chart1Instance) chart1Instance.resize();
    if (chart2Instance) chart2Instance.resize();
  },

  /* ===================== 阈值获取（修改为从main_record_setting获取） ===================== */
  async getThresholdValues() {
    // 从main_record_setting同步的本地存储获取阈值
    const dailyLimit = Number(wx.getStorageSync('dailyLimit')) || 300;
    const sleepCaffeine = Number(wx.getStorageSync('sleepCaffeine')) || 50;
    
    return { dailyLimit, sleepThreshold: sleepCaffeine };
  },

  /* ===================== 主图表数据（原有） ===================== */
  async fetchForecastData() {
    const { dailyLimit, sleepThreshold } = await this.getThresholdValues();
    const currentUser = AV.User.current();
    if (!currentUser) {
      console.warn('未登录用户，跳过查询');
      return;
    }

    // 个性化代谢速率
    const kPersonal = await db.getPersonalK(currentUser.id).catch(err => {
      console.warn('计算个性化代谢速率失败，使用基准值', err);
      return K_BASE;
    });
    this._kPersonal = kPersonal;

    const chartStartTime = new Date();
    chartStartTime.setMinutes(0, 0, 0); // 当前小时整点
    const chartEndTime = new Date(chartStartTime.getTime() + 38 * 3600 * 1000);

    // 查询过去 24 小时数据
    const queryStartTime = new Date(chartStartTime.getTime() - 24 * 3600 * 1000);

    const query = new AV.Query('intakes');
    query.equalTo('user', currentUser);
    query.greaterThanOrEqualTo('takenAt', queryStartTime);
    query.lessThan('takenAt', chartEndTime);
    query.ascending('takenAt');

    try {
      const records = await query.find();
      const times = [];
      const values = [];
      const datePoints = [];

      const interval = this.data.timeInterval;
      const totalHours = 38;
      const steps = totalHours / interval;

      for (let i = 0; i <= steps; i++) {
        const pointTime = new Date(chartStartTime.getTime() + i * interval * 3600 * 1000);
        datePoints.push(pointTime);

        let label;
        if (pointTime.getHours() === 0) {
          label = `${pointTime.getMonth() + 1}月${pointTime.getDate()}日`;
        } else {
          label = `${pointTime.getHours()}:00`;
        }
        times.push(label);

        let caffeineSum = 0;
        records.forEach(item => {
          const amount = item.get('caffeine_total_mg') || 0;
          if (amount <= 0) return;

          let takenDate = item.get('takenAt');
          if (!(takenDate instanceof Date)) {
            takenDate = new Date(takenDate);
          }

          const timeStr = item.get('takenAt_time') || '00:00';
          const [hh, mm] = timeStr.split(':').map(n => parseInt(n, 10) || 0);
          const takenDateTime = new Date(
            takenDate.getFullYear(),
            takenDate.getMonth(),
            takenDate.getDate(),
            hh,
            mm
          );

          const hoursPassed = (pointTime - takenDateTime) / 3600000;
          if (hoursPassed >= 0) {
            const remaining = amount * Math.exp(-kPersonal * hoursPassed);
            if (remaining > 0) caffeineSum += remaining;
          }
        });

        values.push(Math.round(caffeineSum));
      }

      // 保存数据
      this.baseChart1Values   = values.slice();
      this.currentChart1Values = values.slice();
      this.currentTimes       = datePoints;
      this.currentLabels      = times;

      updateChart(chart1Instance, dailyLimit, sleepThreshold, times, values);
    } catch (err) {
      console.error('获取预测数据失败', err);
    }
  },

  /* ===================== 交互（原有） ===================== */
  addTestDrink() {
    wx.navigateTo({
      url: '/subpackage/home/test_drink/test_drink'
    });
  },

  setTimeInterval(e) {
    const interval = parseInt(e.currentTarget.dataset.interval);
    this.setData({ timeInterval: interval });
    this.fetchForecastData();
  },

  setTestTimeInterval(e) {
    const interval = parseInt(e.currentTarget.dataset.interval);
    this.setData({ testTimeInterval: interval });

    chart2Ready.then(() => {
      this.updateTestChart();
    });
  },

  addTestDrinkData({ caffeine, takenTime }) {
    console.log('addTestDrinkData 被调用，参数:', { caffeine, takenTime });
    console.log('baseChart1Values:', this.baseChart1Values);
    console.log('currentTimes:', this.currentTimes);
    
    // 先设置测试饮品状态，让UI立即更新
    this.setData({ hasTestDrink: true });
    this.testDrinkData = { caffeine, takenTime };
    console.log('已设置hasTestDrink为true');
    
    if (!this.baseChart1Values || !this.currentTimes) {
      console.warn('chart1 基础数据未加载，延迟更新测试图表');
      // 延迟重试更新图表
      setTimeout(() => {
        this.updateTestChart();
      }, 1000);
      return;
    }
    
    console.log('添加测试饮品数据成功，开始更新图表');
    chart2Ready.then(() => {
      console.log('chart2 已准备就绪，开始更新测试图表');
      this.updateTestChart();
    });
  },

  /* ===================== 测试图表（原有） ===================== */
  async updateTestChart() {
    console.log('updateTestChart 被调用');
    console.log('baseChart1Values:', this.baseChart1Values);
    console.log('currentTimes:', this.currentTimes);
    console.log('testDrinkData:', this.testDrinkData);
    console.log('chart2Instance:', chart2Instance);
    
    if (!this.baseChart1Values || !this.currentTimes || !this.testDrinkData) {
      console.warn('updateTestChart: 缺少必要数据，退出');
      return;
    }
    if (!chart2Instance) {
      console.warn('chart2 实例未初始化');
      return;
    }

    const { caffeine, takenTime } = this.testDrinkData;
    const testInterval = this.data.testTimeInterval;
    console.log('测试数据:', { caffeine, takenTime, testInterval });

    // 使用与主图表相同的时间轴
    const testTimes = [...this.currentLabels];
    const testDatePoints = [...this.currentTimes];
    
    // 重新计算测试图表的数值，使用测试间隔
    const testValues = [];
    const totalHours = 38;
    const steps = totalHours / testInterval;
    
    // 重新生成测试时间点（使用测试间隔）
    const testTimesNew = [];
    const testDatePointsNew = [];
    
    const chartStartTime = new Date();
    chartStartTime.setMinutes(0, 0, 0);
    
    for (let i = 0; i <= steps; i++) {
      const pointTime = new Date(chartStartTime.getTime() + i * testInterval * 3600 * 1000);
      testDatePointsNew.push(pointTime);

      let label;
      if (pointTime.getHours() === 0) {
        label = `${pointTime.getMonth() + 1}月${pointTime.getDate()}日`;
      } else {
        label = `${pointTime.getHours()}:00`;
      }
      testTimesNew.push(label);
    }

    // 计算测试饮品在各个时间点的剩余咖啡因，并与主图表数据叠加
    const testValuesNew = testDatePointsNew.map((pointTime) => {
      // 计算测试饮品的剩余咖啡因
      const hoursPassed = (pointTime - takenTime) / 3600000;
      let testRemaining = 0;
      if (hoursPassed >= 0) {
        const k = this._kPersonal || K_BASE;
        testRemaining = caffeine * Math.exp(-k * hoursPassed);
      }
      
      // 找到对应时间点的主图表咖啡因值
      let baseCaffeine = 0;
      if (this.currentTimes && this.baseChart1Values) {
        // 找到最接近的时间点
        let closestIndex = 0;
        let minDiff = Math.abs(pointTime - this.currentTimes[0]);
        
        for (let i = 1; i < this.currentTimes.length; i++) {
          const diff = Math.abs(pointTime - this.currentTimes[i]);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
          }
        }
        
        baseCaffeine = this.baseChart1Values[closestIndex] || 0;
      }
      
      // 返回叠加后的咖啡因值
      return Math.round(baseCaffeine + testRemaining);
    });

    console.log('测试图表计算结果:', { 
      testTimesNew, 
      testValuesNew,
      baseChart1Values: this.baseChart1Values,
      currentTimes: this.currentTimes
    });

    if (testValuesNew.length > 0 && testTimesNew.length > 0) {
      const { dailyLimit, sleepThreshold } = await this.getThresholdValues();

      if (chart2Instance) {
        updateChart(chart2Instance, dailyLimit, sleepThreshold, testTimesNew, testValuesNew);
        console.log('测试图表已更新');
      } else {
        console.warn('chart2Instance未初始化，延迟更新图表');
        setTimeout(async () => {
          if (chart2Instance) {
            const { dailyLimit, sleepThreshold } = await this.getThresholdValues();
            updateChart(chart2Instance, dailyLimit, sleepThreshold, testTimesNew, testValuesNew);
            console.log('延迟更新测试图表完成');
          } else {
            console.error('chart2Instance仍然未初始化');
          }
        }, 100);
      }
    } else {
      console.warn('测试图表数据为空');
    }
  },

  // 调试方法：手动触发测试图表更新（原有）
  debugUpdateTestChart() {
    if (this.testDrinkData) {
      console.log('手动更新测试图表，数据:', this.testDrinkData);
      this.updateTestChart();
    } else {
      console.log('没有测试饮品数据');
    }
  },

  // 调试方法：检查当前状态
  debugCheckStatus() {
    console.log('=== 调试状态检查 ===');
    console.log('hasTestDrink:', this.data.hasTestDrink);
    console.log('testDrinkData:', this.testDrinkData);
    console.log('baseChart1Values:', this.baseChart1Values);
    console.log('currentTimes:', this.currentTimes);
    console.log('chart1Instance:', chart1Instance);
    console.log('chart2Instance:', chart2Instance);
    console.log('_kPersonal:', this._kPersonal);
    console.log('==================');
  }
});

/* ===================== 画图（原有，小幅微调不改功能） ===================== */
function updateChart(chartInstance, dailyLimit, sleepCaffeine, times, values) {
  if (!chartInstance) {
    console.warn('updateChart: chartInstance为null，无法更新图表');
    return;
  }
  const nowIndex = getCurrentTimeIndex(times);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      borderRadius: 8,
      textStyle: { color: '#333', fontSize: 12 },
      formatter: params => {
        const barData = params.find(p => p.seriesType === 'bar');
        return `${barData.axisValue}<br/>咖啡因含量: ${barData.value} mg`;
      }
    },
    // 小幅调整 grid：上下对称一些，视觉更“居中”
    grid: { left: 20, right: 20, top: 24, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: times,
      axisLabel: { interval: 0, rotate: 45, fontSize: 10, color: '#666' },
      axisLine:   { lineStyle: { color: '#e0e0e0' } },
      axisTick:   { lineStyle: { color: '#e0e0e0' } }
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLabel: { color: '#666', fontSize: 10 },
      axisLine:  { lineStyle: { color: '#e0e0e0' } },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
    },
    series: [
      {
        name: '咖啡因',
        type: 'bar',
        barWidth: '60%',
        data: values.map((v, idx) => ({
          value: v,
          itemStyle: {
            color: idx === nowIndex ? '#ff9900' : '#c59782',
            borderRadius: [4, 4, 0, 0]
          }
        }))
      },
      {
        name: '每日限额',
        type: 'line',
        data: Array(times.length).fill(dailyLimit),
        symbol: 'none',
        lineStyle: { type: 'dashed', color: '#ff6b6b', width: 2 }
      },
      {
        name: '睡眠水平',
        type: 'line',
        data: Array(times.length).fill(sleepCaffeine),
        symbol: 'none',
        lineStyle: { type: 'dashed', color: '#4ecdc4', width: 2 }
      }
    ]
  };

  chartInstance.setOption(option, true);
}

function getCurrentTimeIndex(times) {
  const now = new Date();
  const nowStr = `${now.getHours()}:00`;
  const idx = times.findIndex(t => typeof t === 'string' && t.includes(nowStr));
  return idx >= 0 ? idx : 0;
}
