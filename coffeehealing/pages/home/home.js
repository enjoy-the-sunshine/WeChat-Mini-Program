import * as echarts from '../../components/ec-canvas/echarts.js';

let chart = null;

Page({
  data: {
    caffeineNow: 125,
    caffeineTotal: 300,
    energyTime: '17:00',
    ec: {
      onInit: initChart
    },
    dailyLimit: 300,
    sleepCaffeine: 50
  },

  // 跳转到 second 页面
  goToSecond() {
    wx.navigateTo({
      url: '/pages/home/main_record/main_record'
    });
  },

  // 跳转到 third 页面
  goToThird() {
    wx.navigateTo({
      url: '/pages/home/main_forecast/main_forecast'
    });
  },
  // 跳转到 brandselect 页面
  goToBrandSelect() {
    wx.navigateTo({
      url: '/pages/recording/brandselect/brandselect'
    });
  },

  onShow() {
    const limit = wx.getStorageSync('dailyLimit') || 300;
    const sleepLevel = wx.getStorageSync('sleepCaffeine') || 50;
    this.setData({
      dailyLimit: limit,
      sleepCaffeine: sleepLevel
    });
    if (chart) {
      updateChart(chart, this.data.dailyLimit, this.data.sleepCaffeine);
    }
  }
});

function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width,
    height,
    devicePixelRatio: dpr
  });
  canvas.setChart(chart);
  updateChart(chart, 300, 50);
  return chart;
}

function updateChart(chartInstance, dailyLimit, sleepCaffeine) {
  const mockData = generateMockData();
  const nowIndex = getCurrentTimeIndex(mockData.times);

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const barData = params.find(p => p.seriesType === 'bar');
        return `${barData.axisValue}<br/>咖啡因含量: ${barData.value} mg`;
      }
    },
    // 调小 grid 边距，让图表整体更大
    grid: { left: 35, right: 15, top: 40, bottom: 35, containLabel: true },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        height: 18,
        bottom: 6,
        fillerColor: 'rgba(63, 81, 181, 0.3)',
        borderColor: 'transparent',
        backgroundColor: '#f0f0f0',
        handleSize: '80%',
        handleStyle: {
          color: '#3f51b5',
          borderColor: '#3f51b5'
        },
        textStyle: {
          color: 'transparent'
        }
      },
      { type: 'inside', xAxisIndex: [0] }
    ],
    xAxis: {
      type: 'category',
      data: mockData.times,
      axisLabel: { interval: 0, rotate: 45, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: '咖啡因 (mg)',
      min: 0,
      axisLabel: { fontSize: 10 }
    },
    series: [
      {
        name: '咖啡因',
        type: 'bar',
        barWidth: 20,
        data: mockData.values.map((v, idx) => ({
          value: v,
          itemStyle: { color: idx === nowIndex ? '#ff9900' : '#c59782' }
        }))
      },
      {
        name: '每日限额',
        type: 'line',
        data: Array(mockData.times.length).fill(dailyLimit),
        symbol: 'none',
        lineStyle: { type: 'dashed', color: 'red', width: 2 },
        markLine: {
          symbol: 'none',
          label: {
            show: true,
            position: 'middle',
            formatter: '每日限额',
            color: 'red',
            fontSize: 12
          },
          lineStyle: {
            type: 'dashed',
            color: 'red',
            width: 2
          },
          data: [{ yAxis: dailyLimit }]
        }
      },
      {
        name: '睡眠水平',
        type: 'line',
        data: Array(mockData.times.length).fill(sleepCaffeine),
        symbol: 'none',
        lineStyle: { type: 'dashed', color: 'blue', width: 2 },
        markLine: {
          symbol: 'none',
          label: {
            show: true,
            position: 'middle',
            formatter: '睡眠水平',
            color: 'blue',
            fontSize: 12
          },
          lineStyle: {
            type: 'dashed',
            color: 'blue',
            width: 2
          },
          data: [{ yAxis: sleepCaffeine }]
        }
      }
    ]
  };

  chartInstance.setOption(option, true);
}

function generateMockData() {
  const times = [];
  const values = [];

  const startTime = new Date();
  startTime.setHours(22, 0, 0, 0);
  startTime.setDate(startTime.getDate() - 1);

  const totalHours = 38;
  const steps = totalHours / 2;

  for (let i = 0; i <= steps; i++) {
    const time = new Date(startTime.getTime() + i * 2 * 3600 * 1000);
    let label;
    if (time.getHours() === 0) {
      label = `${time.getMonth() + 1}月${time.getDate()}日`;
    } else {
      label = `${time.getHours()}:00`;
    }
    times.push(label);
    values.push(Math.max(0, Math.round(400 * Math.exp(-0.15 * i))));
  }

  return { times, values };
}

function getCurrentTimeIndex(times) {
  const now = new Date();
  const nowStr = `${now.getHours()}:00`;
  const idx = times.findIndex(t => t.includes(nowStr));
  return idx >= 0 ? idx : 0;
}

