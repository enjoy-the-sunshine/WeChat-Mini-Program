import * as echarts from '../../components/ec-canvas/echarts.js';

let chart1 = null;
let chart2 = null;

Page({
  data: {
    ec1: {
      onInit: function (canvas, width, height, dpr) {
        chart1 = echarts.init(canvas, null, { width, height, devicePixelRatio: dpr });
        canvas.setChart(chart1);
        updateChart(chart1, 300, 50);
        return chart1;
      }
    },
    ec2: {
      onInit: function (canvas, width, height, dpr) {
        chart2 = echarts.init(canvas, null, { width, height, devicePixelRatio: dpr });
        canvas.setChart(chart2);
        updateChart(chart2, 300, 50, true); // 测试咖啡因
        return chart2;
      }
    }
  },

  addTestDrink() {
    wx.showToast({
      title: '添加测试饮品',
      icon: 'none'
    });
  }
});

function updateChart(chartInstance, dailyLimit, sleepCaffeine, isTest = false) {
  const mockData = generateMockData(isTest);
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
    grid: { left: 35, right: 15, top: 20, bottom: 35, containLabel: true },
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
          lineStyle: { type: 'dashed', color: 'red', width: 2 },
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
          lineStyle: { type: 'dashed', color: 'blue', width: 2 },
          data: [{ yAxis: sleepCaffeine }]
        }
      }
    ]
  };

  chartInstance.setOption(option, true);
}

function generateMockData(isTest) {
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

    const base = isTest ? 500 : 400;
    values.push(Math.max(0, Math.round(base * Math.exp(-0.15 * i))));
  }

  return { times, values };
}

function getCurrentTimeIndex(times) {
  const now = new Date();
  const nowStr = `${now.getHours()}:00`;
  const idx = times.findIndex(t => t.includes(nowStr));
  return idx >= 0 ? idx : 0;
}
