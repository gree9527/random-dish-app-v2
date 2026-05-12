# 今天吃什么

一款个人美食记录与随机选菜手机 App。拍照记录你做过的菜、填写做法步骤，在想不出吃什么时用转盘随机抽取一道菜。

## 技术栈

- **前端框架**: Vue 3 + TypeScript + Vite
- **移动端打包**: Capacitor（将 Vue 网页打包为原生 iOS/Android App）
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: Tailwind CSS v4
- **本地存储**: localStorage（菜品元数据）+ Capacitor Filesystem（照片文件）
- **原生插件**:
  - `@capacitor/camera` — 拍照/选图
  - `@capacitor/filesystem` — 本地文件持久化
  - `@capacitor-community/keep-awake` — 详情页屏幕常亮
- **图片处理**: browser-image-compression
- **备份**: JSZip

## 环境要求

- Node.js >= 18
- npm >= 9
- Android Studio（如需打包 Android App）
- Xcode + macOS（如需打包 iOS App）

## 安装依赖

```bash
npm install
```

如果 `@capacitor/cli` 运行时报 `Cannot find module 'tslib'`，请单独安装：

```bash
npm install --save tslib
```

## 本地开发（浏览器）

```bash
npm run dev
```

浏览器会打开 `http://localhost:5173/`（或附近端口）。

> **注意**：浏览器环境下无法调用原生相机和文件系统，因此拍照功能会 fallback 到 `<input type="file">` 选择图片，存储使用内存/URL 对象。完整功能请在真机或模拟器中测试。

## 构建 Web 产物

```bash
npm run build
```

构建产物输出到 `dist/` 目录，供 Capacitor 同步到原生工程。

## Android 真机/模拟器调试

### 1. 添加 Android 平台（仅需执行一次）

```bash
npx cap add android
```

### 2. 同步 Web 代码到 Android 工程

每次修改前端代码后，重新构建并同步：

```bash
npm run build
npx cap sync
```

### 3. 用 Android Studio 打开并运行

```bash
npx cap open android
```

在 Android Studio 中：
- 连接真机或启动模拟器
- 点击 **Run**（或按 `Shift + F10`）将 App 安装到设备

### Android 权限说明

`android/app/src/main/AndroidManifest.xml` 中已声明以下权限：

- `CAMERA` — 拍照
- `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` — 文件读写
- `READ_MEDIA_IMAGES` — Android 13+ 媒体访问

首次使用相机时，系统会自动弹出权限申请。

## iOS 真机/模拟器调试（需 macOS）

### 1. 添加 iOS 平台（仅需执行一次）

```bash
npx cap add ios
```

### 2. 同步并打开 Xcode

```bash
npm run build
npx cap sync
npx cap open ios
```

在 Xcode 中：
- 选择目标设备或模拟器
- 点击 **Run**（或按 `Cmd + R`）

### iOS 权限说明

首次构建前，需在 `ios/App/App/Info.plist` 中添加以下描述：

```xml
<key>NSCameraUsageDescription</key>
<string>需要访问相机来拍摄菜品照片</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>需要访问相册来选择菜品照片</string>
```

## 项目结构

```
random-dish-app-v2/
├── android/                  # Android 原生工程（Capacitor 生成）
├── ios/                      # iOS 原生工程（Capacitor 生成，macOS only）
├── src/
│   ├── components/
│   │   ├── DishCard.vue      # 菜品卡片（列表页）
│   │   ├── SpinWheel.vue     # 转盘组件（首页）
│   │   └── StepInput.vue     # 步骤输入（增删排序）
│   ├── views/
│   │   ├── HomeView.vue      # 转盘首页
│   │   ├── ListView.vue      # 菜谱列表
│   │   ├── DetailView.vue    # 菜品详情（步骤 + 全屏大字模式）
│   │   ├── AddEditView.vue   # 添加/编辑菜谱
│   │   └── SettingsView.vue  # 设置（导入/导出备份）
│   ├── stores/
│   │   └── dishStore.ts      # Pinia 状态管理（CRUD + 权重算法）
│   ├── composables/
│   │   ├── useCamera.ts      # 拍照 + 图片压缩
│   │   ├── useFilesystem.ts  # 本地文件读写
│   │   └── useBackup.ts      # Zip 备份导入/导出
│   ├── router/
│   │   └── index.ts          # 路由配置
│   ├── types/
│   │   └── dish.ts           # 类型定义
│   ├── App.vue               # 根布局（底部 Tab 导航）
│   ├── main.ts               # 入口文件
│   └── style.css             # 全局样式 + Tailwind 主题
├── capacitor.config.ts       # Capacitor 配置
├── vite.config.ts            # Vite 配置
├── index.html
├── package.json
└── tsconfig.json
```

## 核心功能说明

### 转盘权重算法

转盘不是纯随机，而是基于以下因素加权：
- **基础权重**: 评分（1-5 星，默认 3）
- **时间加成**: 距离上次被抽中的天数（每天 +1，上限 7）
- **避雷**: 如果抽中的菜 2 天内刚吃过，会提示"最近刚吃过"
- **最小扇区**: 菜品不足 8 道时，自动循环填充，保证转盘视觉完整

### 图片双图策略

拍照/选图后自动压缩为两张：
- **原图**: ~1000px 宽，用于详情页大图
- **缩略图**: ~300px 宽，用于列表页卡片

### 数据备份与恢复

设置页支持将「所有菜品元数据 + 照片原图/缩略图」打包成 `.zip` 文件导出，可随时导入恢复。

## 常见问题

**Q: 浏览器里拍照按钮没反应？**  
A: 浏览器环境不支持 Capacitor Camera，请点击「从相册选择」旁边的按钮，或直接用 `<input type="file">` 选择图片。完整拍照功能需要在真机 App 中测试。

**Q: 如何清空测试数据？**  
A: 进入「设置」页，点击「清空所有数据」，或直接在浏览器控制台执行 `localStorage.clear()` 后刷新页面。

**Q: 换手机后如何迁移数据？**  
A: 在原手机的设置页「导出备份」保存 `.zip` 文件，新手机安装 App 后「导入备份」选择该文件即可。
