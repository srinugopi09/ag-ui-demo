const echarts = require('echarts');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Chart configurations matching the demo
const charts = [
  {
    name: '01-line-chart-revenue-trend',
    width: 600,
    height: 400,
    option: {
      title: { text: 'Monthly Revenue Trend', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 10, data: ['2024', '2025'] },
      xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
      yAxis: { type: 'value', name: 'Revenue ($K)' },
      series: [
        { name: '2024', type: 'line', smooth: true, data: [820, 932, 901, 934, 1290, 1330, 1320, 1450, 1520, 1680, 1750, 1890] },
        { name: '2025', type: 'line', smooth: true, data: [920, 1032, 1101, 1234, 1490, 1530, 1620, null, null, null, null, null] }
      ],
      color: ['#5470c6', '#91cc75']
    }
  },
  {
    name: '02-bar-chart-revenue-by-category',
    width: 600,
    height: 400,
    option: {
      title: { text: 'Revenue by Category', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 10, data: ['Q1', 'Q2', 'Q3', 'Q4'] },
      xAxis: { type: 'category', data: ['Software', 'Services', 'Hardware', 'Support', 'Training'] },
      yAxis: { type: 'value', name: 'Revenue ($K)' },
      series: [
        { name: 'Q1', type: 'bar', data: [320, 280, 150, 120, 80] },
        { name: 'Q2', type: 'bar', data: [380, 310, 170, 140, 95] },
        { name: 'Q3', type: 'bar', data: [420, 350, 190, 160, 110] },
        { name: 'Q4', type: 'bar', data: [480, 390, 210, 180, 125] }
      ],
      color: ['#5470c6', '#91cc75', '#fac858', '#ee6666']
    }
  },
  {
    name: '03-area-chart-cumulative-sales',
    width: 600,
    height: 400,
    option: {
      title: { text: 'Cumulative Sales Growth', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', boundaryGap: false, data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
      yAxis: { type: 'value', name: 'Sales ($M)' },
      series: [{
        name: 'Cumulative Sales',
        type: 'line',
        areaStyle: { opacity: 0.7 },
        smooth: true,
        data: [1.2, 2.8, 4.5, 6.8, 9.2, 12.5]
      }],
      color: ['#73c0de']
    }
  },
  {
    name: '04-combo-chart-budget-vs-actual',
    width: 600,
    height: 400,
    option: {
      title: { text: 'Budget vs Actual', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 10, data: ['Budget', 'Actual', 'Variance %'] },
      xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
      yAxis: [
        { type: 'value', name: 'Amount ($K)', position: 'left' },
        { type: 'value', name: 'Variance %', position: 'right', axisLabel: { formatter: '{value}%' } }
      ],
      series: [
        { name: 'Budget', type: 'bar', data: [500, 520, 540, 560, 580, 600] },
        { name: 'Actual', type: 'bar', data: [480, 550, 520, 590, 610, 580] },
        { name: 'Variance %', type: 'line', yAxisIndex: 1, data: [-4, 5.8, -3.7, 5.4, 5.2, -3.3] }
      ],
      color: ['#5470c6', '#91cc75', '#ee6666']
    }
  },
  {
    name: '05-waterfall-chart-variance',
    width: 600,
    height: 400,
    option: {
      title: { text: 'Revenue Variance Analysis', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['Starting', 'Product A', 'Product B', 'Product C', 'Returns', 'Ending'] },
      yAxis: { type: 'value', name: 'Revenue ($K)' },
      series: [
        {
          name: 'Placeholder',
          type: 'bar',
          stack: 'Total',
          itemStyle: { borderColor: 'transparent', color: 'transparent' },
          data: [0, 1000, 1300, 1450, 1650, 0]
        },
        {
          name: 'Value',
          type: 'bar',
          stack: 'Total',
          data: [
            { value: 1000, itemStyle: { color: '#5470c6' } },
            { value: 300, itemStyle: { color: '#91cc75' } },
            { value: 150, itemStyle: { color: '#91cc75' } },
            { value: 200, itemStyle: { color: '#91cc75' } },
            { value: -100, itemStyle: { color: '#ee6666' } },
            { value: 1550, itemStyle: { color: '#5470c6' } }
          ]
        }
      ]
    }
  },
  {
    name: '06-pie-chart-budget-distribution',
    width: 500,
    height: 400,
    option: {
      title: { text: 'Budget Distribution', left: 'center' },
      tooltip: { trigger: 'item', formatter: '{b}: ${c}K ({d}%)' },
      legend: { orient: 'vertical', left: 'left', top: 'middle' },
      series: [{
        name: 'Budget',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{d}%' },
        data: [
          { value: 450, name: 'Engineering' },
          { value: 280, name: 'Marketing' },
          { value: 180, name: 'Operations' },
          { value: 120, name: 'Sales' },
          { value: 70, name: 'HR' }
        ]
      }],
      color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
    }
  },
  {
    name: '07-gauge-chart-performance',
    width: 400,
    height: 350,
    option: {
      title: { text: 'Performance Score', left: 'center' },
      series: [{
        name: 'Performance',
        type: 'gauge',
        radius: '80%',
        progress: { show: true, width: 18 },
        axisLine: { lineStyle: { width: 18 } },
        axisTick: { show: false },
        splitLine: { length: 15, lineStyle: { width: 2, color: '#999' } },
        axisLabel: { distance: 25, color: '#999', fontSize: 12 },
        anchor: { show: true, showAbove: true, size: 20, itemStyle: { borderWidth: 8 } },
        detail: { valueAnimation: true, fontSize: 28, offsetCenter: [0, '70%'], formatter: '{value}%' },
        data: [{ value: 78, name: 'Score' }]
      }]
    }
  },
  {
    name: '08-bullet-chart-targets',
    width: 600,
    height: 300,
    option: {
      title: { text: 'Sales Target Progress', left: 'center' },
      tooltip: { trigger: 'axis' },
      grid: { left: '15%', right: '10%', top: '25%', bottom: '15%' },
      xAxis: { type: 'value', max: 120 },
      yAxis: { type: 'category', data: ['Q4', 'Q3', 'Q2', 'Q1'] },
      series: [
        { name: 'Range', type: 'bar', barWidth: 30, itemStyle: { color: '#e0e0e0' }, data: [100, 100, 100, 100], z: 1 },
        { name: 'Target', type: 'bar', barWidth: 30, barGap: '-100%', itemStyle: { color: '#90caf9' }, data: [85, 80, 75, 70], z: 2 },
        { name: 'Actual', type: 'bar', barWidth: 15, barGap: '-100%', itemStyle: { color: '#1976d2' }, data: [92, 78, 82, 68], z: 3 }
      ]
    }
  },
  {
    name: '09-radar-chart-team-performance',
    width: 500,
    height: 400,
    option: {
      title: { text: 'Team Performance Metrics', left: 'center' },
      legend: { bottom: 10, data: ['Team A', 'Team B'] },
      radar: {
        indicator: [
          { name: 'Productivity', max: 100 },
          { name: 'Quality', max: 100 },
          { name: 'Collaboration', max: 100 },
          { name: 'Innovation', max: 100 },
          { name: 'Delivery', max: 100 }
        ]
      },
      series: [{
        type: 'radar',
        data: [
          { value: [85, 90, 78, 82, 88], name: 'Team A', areaStyle: { opacity: 0.3 } },
          { value: [78, 85, 92, 75, 80], name: 'Team B', areaStyle: { opacity: 0.3 } }
        ]
      }],
      color: ['#5470c6', '#91cc75']
    }
  },
  {
    name: '10-heatmap-resource-utilization',
    width: 600,
    height: 400,
    option: {
      title: { text: 'Resource Utilization Matrix', left: 'center' },
      tooltip: { position: 'top', formatter: (p) => `${p.data[1]} - ${p.data[0]}: ${p.data[2]}%` },
      grid: { top: '15%', bottom: '15%', left: '15%', right: '10%' },
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], splitArea: { show: true } },
      yAxis: { type: 'category', data: ['Dev Team', 'QA Team', 'Design', 'DevOps'], splitArea: { show: true } },
      visualMap: { min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: '3%', inRange: { color: ['#e3f2fd', '#1976d2'] } },
      series: [{
        name: 'Utilization',
        type: 'heatmap',
        data: [
          [0, 0, 85], [1, 0, 90], [2, 0, 78], [3, 0, 88], [4, 0, 72],
          [0, 1, 65], [1, 1, 70], [2, 1, 82], [3, 1, 75], [4, 1, 68],
          [0, 2, 92], [1, 2, 88], [2, 2, 95], [3, 2, 80], [4, 2, 85],
          [0, 3, 78], [1, 3, 82], [2, 3, 75], [3, 3, 90], [4, 3, 88]
        ],
        label: { show: true, formatter: (p) => p.data[2] + '%' }
      }]
    }
  },
  {
    name: '11-treemap-budget-breakdown',
    width: 600,
    height: 450,
    option: {
      title: { text: 'Budget Breakdown by Department', left: 'center' },
      tooltip: { formatter: '{b}: ${c}K' },
      series: [{
        name: 'Budget',
        type: 'treemap',
        roam: false,
        breadcrumb: { show: true },
        label: { show: true, formatter: '{b}\n${c}K' },
        data: [
          {
            name: 'Engineering',
            value: 450,
            children: [
              { name: 'Frontend', value: 150 },
              { name: 'Backend', value: 180 },
              { name: 'DevOps', value: 120 }
            ]
          },
          {
            name: 'Marketing',
            value: 280,
            children: [
              { name: 'Digital', value: 120 },
              { name: 'Content', value: 90 },
              { name: 'Events', value: 70 }
            ]
          },
          {
            name: 'Operations',
            value: 180,
            children: [
              { name: 'Support', value: 80 },
              { name: 'Admin', value: 60 },
              { name: 'Facilities', value: 40 }
            ]
          }
        ]
      }]
    }
  },
  {
    name: '12-funnel-sales-pipeline',
    width: 500,
    height: 400,
    option: {
      title: { text: 'Sales Pipeline', left: 'center' },
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      series: [{
        name: 'Pipeline',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: { show: true, position: 'inside', formatter: '{b}\n{c}' },
        data: [
          { value: 100, name: 'Leads' },
          { value: 80, name: 'Qualified' },
          { value: 60, name: 'Proposals' },
          { value: 40, name: 'Negotiations' },
          { value: 20, name: 'Closed Won' }
        ]
      }],
      color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
    }
  },
  {
    name: '13-gantt-project-timeline',
    width: 700,
    height: 350,
    option: {
      title: { text: 'Project Timeline', left: 'center' },
      tooltip: {},
      grid: { left: '20%', right: '5%', top: '20%', bottom: '10%' },
      xAxis: {
        type: 'value',
        min: 0,
        max: 12,
        axisLabel: { formatter: (v) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][v] || '' }
      },
      yAxis: {
        type: 'category',
        data: ['Planning', 'Design', 'Development', 'Testing', 'Deployment'],
        inverse: true
      },
      series: [{
        type: 'custom',
        renderItem: (params, api) => {
          const categoryIndex = api.value(0);
          const start = api.coord([api.value(1), categoryIndex]);
          const end = api.coord([api.value(2), categoryIndex]);
          const height = api.size([0, 1])[1] * 0.6;
          return {
            type: 'rect',
            shape: { x: start[0], y: start[1] - height / 2, width: end[0] - start[0], height: height },
            style: api.style()
          };
        },
        encode: { x: [1, 2], y: 0 },
        data: [
          { value: [0, 0, 2], itemStyle: { color: '#5470c6' } },
          { value: [1, 1, 4], itemStyle: { color: '#91cc75' } },
          { value: [2, 3, 8], itemStyle: { color: '#fac858' } },
          { value: [3, 7, 10], itemStyle: { color: '#ee6666' } },
          { value: [4, 10, 12], itemStyle: { color: '#73c0de' } }
        ]
      }]
    }
  }
];

// KPI Cards (rendered as simple canvas)
const kpiCards = [
  { title: 'Total Revenue', value: '$12.5M', change: '+15.3%', changeType: 'positive' },
  { title: 'Active Projects', value: '47', change: '+5', changeType: 'positive' },
  { title: 'Team Utilization', value: '82%', change: '-3%', changeType: 'negative' },
  { title: 'Customer Satisfaction', value: '4.8/5', change: '+0.2', changeType: 'positive' }
];

function renderKpiCards() {
  const canvas = createCanvas(800, 200);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, 800, 200);

  const cardWidth = 180;
  const cardSpacing = 20;
  const startX = 20;

  kpiCards.forEach((kpi, index) => {
    const x = startX + index * (cardWidth + cardSpacing);
    const y = 20;

    // Card background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, cardWidth, 160);

    // Card border
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, cardWidth, 160);

    // Title
    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial';
    ctx.fillText(kpi.title, x + 15, y + 30);

    // Value
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(kpi.value, x + 15, y + 75);

    // Change indicator
    ctx.fillStyle = kpi.changeType === 'positive' ? '#4caf50' : '#f44336';
    ctx.font = '16px Arial';
    const arrow = kpi.changeType === 'positive' ? '▲' : '▼';
    ctx.fillText(`${arrow} ${kpi.change}`, x + 15, y + 110);

    // Sparkline simulation
    ctx.strokeStyle = kpi.changeType === 'positive' ? '#4caf50' : '#f44336';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const sparkData = kpi.changeType === 'positive'
      ? [140, 135, 130, 128, 132, 125, 120]
      : [120, 125, 130, 128, 132, 138, 140];
    sparkData.forEach((val, i) => {
      const sx = x + 15 + i * 22;
      const sy = y + val;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.stroke();
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(screenshotsDir, '00-kpi-cards.png'), buffer);
  console.log('Generated: 00-kpi-cards.png');
}

function renderChart(config) {
  const canvas = createCanvas(config.width, config.height);

  // Initialize ECharts with canvas
  const chart = echarts.init(canvas);
  chart.setOption(config.option);

  // Get image buffer
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(screenshotsDir, `${config.name}.png`), buffer);

  chart.dispose();
  console.log(`Generated: ${config.name}.png`);
}

// Generate all screenshots
console.log('Generating chart screenshots...\n');

renderKpiCards();

charts.forEach(config => {
  try {
    renderChart(config);
  } catch (error) {
    console.error(`Error generating ${config.name}:`, error.message);
  }
});

console.log('\nScreenshots saved to:', screenshotsDir);
