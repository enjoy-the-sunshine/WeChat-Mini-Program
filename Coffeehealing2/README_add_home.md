# 咖啡因健康管理小程序 - add_home 页面

## 页面功能概述

`add_home` 页面是咖啡因健康管理小程序的核心功能页面，主要用于"寻找并添加今日饮品"。用户可以通过该页面浏览不同品牌的咖啡饮品，查看咖啡因含量，管理收藏和自定义饮品。

## 页面结构

### 左侧侧边栏
- **最近**: 显示用户最近浏览过的饮品
- **收藏**: 显示用户收藏的饮品列表
- **自定义**: 显示用户自定义添加的饮品
- **品牌列表**: 各大咖啡品牌入口
  - 星巴克
  - 瑞幸咖啡
  - KCOFFEE (肯德基咖啡)
  - McCafé (麦咖啡)
  - Tims
  - Manner
  - 三顿半
  - 雀巢咖啡
  - 喜茶

### 右侧饮品列表
- 显示当前分类下的饮品信息
- 每个饮品包含：图标、名称、咖啡因含量
- 支持收藏功能
- 空状态提示

### 顶部功能
- **+ 自定义咖啡**: 添加自定义饮品入口

## 文件结构

```
pages/add_home/
├── add_home.wxml    # 页面结构
├── add_home.wxss    # 页面样式
├── add_home.js      # 页面逻辑
└── add_home.json    # 页面配置

utils/
└── database.js      # 数据库接入模板
```

## 数据库接入说明

### 当前状态
目前页面使用模拟数据，所有饮品信息存储在 `add_home.js` 的 `allDrinks` 对象中。

### 数据库集成步骤

#### 1. 选择数据库类型

**推荐方案：微信云开发**
- 无需自建服务器
- 与微信小程序完美集成
- 提供完整的数据库、存储、云函数服务

**备选方案：自建API服务器**
- 使用 Node.js + Express + MongoDB
- 或使用其他后端技术栈

#### 2. 数据库设计

**品牌表 (brands)**
```javascript
{
  _id: "品牌ID",
  name: "品牌名称",
  logo: "品牌logo地址",
  description: "品牌描述",
  createTime: "创建时间"
}
```

**饮品表 (drinks)**
```javascript
{
  _id: "饮品ID",
  brandId: "品牌ID",
  name: "饮品名称",
  caffeine: "咖啡因含量(mg)",
  unit: "单位(/每份、/杯等)",
  icon: "饮品图标地址",
  description: "饮品描述",
  category: "分类",
  createTime: "创建时间"
}
```

**用户收藏表 (user_favorites)**
```javascript
{
  _id: "记录ID",
  userId: "用户ID",
  drinkId: "饮品ID",
  drink: "饮品完整信息",
  createTime: "收藏时间"
}
```

**用户自定义表 (user_custom)**
```javascript
{
  _id: "记录ID",
  userId: "用户ID",
  name: "饮品名称",
  caffeine: "咖啡因含量",
  unit: "单位",
  icon: "图标地址",
  isCustom: true,
  createTime: "创建时间"
}
```

**用户最近浏览表 (user_recent)**
```javascript
{
  _id: "记录ID",
  userId: "用户ID",
  drinkId: "饮品ID",
  drink: "饮品完整信息",
  viewTime: "浏览时间"
}
```

#### 3. 集成步骤

1. **配置数据库连接**
   - 修改 `utils/database.js` 中的配置信息
   - 设置云环境ID或API服务器地址

2. **替换模拟数据**
   - 在 `add_home.js` 中引入数据库服务
   - 将 `allDrinks` 对象替换为数据库查询
   - 修改相关方法使用数据库操作

3. **示例代码修改**

```javascript
// 在 add_home.js 顶部引入数据库服务
const { dbService } = require('../../utils/database.js')

// 修改 onLoad 方法
onLoad: function (options) {
  // 获取用户ID (需要实现用户系统)
  const userId = this.getUserId()
  
  // 从数据库加载品牌列表
  dbService.getBrands((brands) => {
    this.setData({ brands })
  })
  
  // 加载用户数据
  this.loadUserData(userId)
},

// 添加加载用户数据方法
loadUserData: function (userId) {
  // 加载收藏
  dbService.getUserFavorites(userId, (favorites) => {
    this.setData({ favoriteDrinks: favorites })
  })
  
  // 加载自定义饮品
  dbService.getCustomDrinks(userId, (custom) => {
    this.setData({ customDrinks: custom })
  })
  
  // 加载最近浏览
  dbService.getRecent(userId, 20, (recent) => {
    this.setData({ recentDrinks: recent })
  })
}
```

#### 4. 图片资源准备

需要准备以下图片资源：

**品牌Logo (建议尺寸: 100x100px)**
```
images/brands/
├── starbucks.png
├── luckin.png
├── kfc.png
├── mccafe.png
├── tims.png
├── manner.png
├── saturnbird.png
├── nescafe.png
└── heytea.png
```

**饮品图标 (建议尺寸: 120x120px)**
```
images/drinks/
├── americano.png
├── latte.png
├── cappuccino.png
├── mocha.png
├── caramel_macchiato.png
├── oat_latte.png
├── custom.png
└── empty.png
```

**功能图标 (建议尺寸: 80x80px)**
```
images/icons/
├── recent.png
├── favorite.png
├── custom.png
└── empty.png
```

## 功能特性

### 1. 分类切换
- 支持在最近、收藏、自定义、品牌之间切换
- 自动更新右侧饮品列表
- 保持用户操作状态

### 2. 收藏功能
- 点击星形图标收藏/取消收藏
- 收藏状态实时同步
- 数据持久化存储

### 3. 自定义饮品
- 支持添加自定义饮品
- 可设置名称、咖啡因含量、单位
- 自定义饮品独立管理

### 4. 最近浏览
- 自动记录用户浏览的饮品
- 按时间倒序排列
- 限制数量避免数据过多

### 5. 响应式设计
- 适配不同屏幕尺寸
- 流畅的动画效果
- 现代化的UI设计

## 使用说明

### 开发环境
1. 确保已安装微信开发者工具
2. 导入项目到微信开发者工具
3. 配置小程序AppID
4. 如需使用云开发，开启云开发功能

### 测试数据
页面已包含完整的测试数据，包括：
- 9个主要咖啡品牌
- 20+种常见咖啡饮品
- 不同咖啡因含量的饮品示例

### 自定义配置
可以通过修改以下文件进行自定义：
- `add_home.js`: 修改品牌列表、饮品数据
- `add_home.wxss`: 调整页面样式
- `add_home.wxml`: 修改页面结构

## 注意事项

1. **图片资源**: 确保所有图片资源路径正确，建议使用CDN或云存储
2. **数据同步**: 实现用户系统后，需要处理多设备数据同步
3. **性能优化**: 大量数据时考虑分页加载
4. **错误处理**: 添加网络错误、数据加载失败的处理
5. **用户体验**: 添加加载状态、错误提示等交互反馈

## 扩展功能建议

1. **搜索功能**: 添加饮品搜索功能
2. **筛选功能**: 按咖啡因含量范围筛选
3. **推荐功能**: 基于用户历史推荐饮品
4. **分享功能**: 分享饮品信息给好友
5. **统计功能**: 显示用户咖啡因摄入统计
