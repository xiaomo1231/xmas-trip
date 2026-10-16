# 海天公路跨年雪旅 · 网站部署说明

一个纯静态网站，没有后端。整个 `trip-site` 文件夹约 69 MB，509 个文件，最大的是 `map/region.pmtiles`（30.7 MB）。

## 文件夹里有什么

| 路径 | 内容 |
| --- | --- |
| `index.html` | 页面本身：三版行程、地图、车票、住宿、预算、待办清单 |
| `config.js` | 共享清单设置（默认不同步） |
| `map/region.pmtiles` | 离线矢量地图：温哥华—列治文—Squamish—惠斯勒，缩放 0–15 级 |
| `map/terrain/` | 地形高程瓦片（山体阴影和 3D 地形用） |
| `map/style-light.json` / `style-dark.json` | 地图配色（浅色 / 深色） |
| `map/routes.json` | 每段路线沿真实道路的走向 |
| `fonts/` | 地图上英文地名用的字体（中文用手机系统字体） |
| `vendor/` | MapLibre GL 5.6.0、PMTiles 4.3.0 |
| `serve.py` | 本地预览服务器 |

## 在电脑上预览

地图需要按片段读取 `region.pmtiles`。直接双击 `index.html` 打不开地图，Python 自带的 `python -m http.server` 也不行。请用附带的脚本：

```bash
python serve.py
```

然后在浏览器打开 http://localhost:8000 。

## 放到网上（推荐 GitHub Pages）

GitHub Pages 免费，支持按片段读取文件，单个文件上限 100 MB，这个网站可以直接放。

1. 在 GitHub 新建一个仓库，例如 `xmas-trip`。设为 Public 才能免费使用 Pages。
2. 把 `trip-site` 文件夹里的**所有内容**（不是文件夹本身）放到仓库根目录，然后提交并推送：
   ```bash
   cd trip-site
   git init
   git add .
   git commit -m "trip site"
   git branch -M main
   git remote add origin https://github.com/你的用户名/xmas-trip.git
   git push -u origin main
   ```
3. 在仓库的 **Settings → Pages** 中，Source 选 `Deploy from a branch`，Branch 选 `main` 和 `/ (root)`，然后保存。
4. 等 1–2 分钟，页面会显示网址，例如 `https://你的用户名.github.io/xmas-trip/`。把这个网址发给朋友，用手机就能打开。

> 注意：仓库是公开的，拿到网址的人都能看到行程。页面里没有姓名、电话、订单号这类个人信息。以后订好酒店，也不要把订单号写进页面。

**不推荐 Cloudflare Pages**：它限制单个文件不超过 25 MB，`region.pmtiles` 超过了这个限制。

## 共享待办清单（Firebase，可选）

默认情况下，每个人的勾选只保存在自己手机的浏览器里。想让四个人实时看到彼此的勾选：

1. 打开 https://console.firebase.google.com ，新建一个项目。不需要开启 Google Analytics。
2. 在左侧选择 **Build → Firestore Database → Create database**。位置选离你们近的区域，比如 `northamerica-northeast1`，模式先选 Production。
3. 在 Firestore 的 **Rules** 标签页中，把规则换成下面这段，然后点 Publish：
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /trip-todos/{id} {
         allow read: if true;
         allow write: if request.resource.data.keys().hasOnly(['done', 'by', 'at'])
                      && request.resource.data.done is bool
                      && request.resource.data.by is string
                      && request.resource.data.by.size() <= 12
                      && request.resource.data.at is number;
       }
     }
   }
   ```
   这段规则只允许读写清单这一个集合，并且只接受勾选状态、名字和时间三个字段。拿到网址的人都能勾选，对四人行程清单来说够用了。
4. 回到 **Project settings → General → Your apps**，点 `</>` 添加一个 Web 应用，复制它给出的 `firebaseConfig`。
5. 打开 `config.js`，把 `window.TRIP_FIREBASE = null;` 改成：
   ```js
   window.TRIP_FIREBASE = {
     apiKey: "…",
     authDomain: "…",
     projectId: "…",
     appId: "…",
     collection: "trip-todos"
   };
   ```
   Firebase 的 Web 配置本来就是公开的，可以放进公开仓库；真正控制读写权限的是上面那段规则。
6. 提交并推送，GitHub Pages 会自动更新。页面清单下方显示“已连接共享清单”，就说明设置好了。

## 重新生成地图数据（一般不需要）

生成脚本在上一级的 `tools/` 文件夹里：

- `extract_tiles.py`：从 Protomaps 的每日全球地图中截取行程区域
- `fetch_terrain.py`：下载地形高程瓦片
- `geocode.py`：用 OpenStreetMap Nominatim 核对地点坐标
- `routes.py`：用 OSRM 生成沿真实道路的路线
- `make_style.js`：生成浅色和深色地图配色
- `build_site.py`：用 `../trip-map.html` 生成 `index.html`

## 数据来源与许可

- 地图数据：© OpenStreetMap 贡献者，ODbL 许可；由 Protomaps 打包
- 地形：AWS Open Data Terrain Tiles（Mapzen）
- 路线：OSRM，routing.openstreetmap.de（FOSSGIS）
- 价格和时刻：页面底部列出了来源，均为 2026-10-15 查询；所有项目都还没有预订
