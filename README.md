# 记仇本

> 玩游戏最扫兴的从来不是输，是遇到那些**开局速抓、团战挂机、输了甩锅、赢了嘲讽**的人。
>
> 所以我把每一个在游戏里恶心过我的人都记了下来——**见一个，记一个，下次匹配见到，绕道走。**

一个私人维护的玩家记仇名单：把游戏里遇到的捣乱玩家记进小本本，随时随地查、多设备秒级同步，从此不被同一块石头绊倒两次。

**在线使用：https://yong-xu.github.io/cf-blacklist/**

---

## 版本

**v2.0.0**（前后端分离架构 · 无密码 · 打开即用 · 秒级同步）

- v1.x：单文件 + 密码解锁 + 匿名 Issue 同步（已停用）
- v2.0：前端（GitHub Pages）+ 后端（Cloudflare Worker 代理）分离；去掉密码锁，打开直接显示数据；数据仍加密存放云端，保存/删除/改密立即同步，任何设备打开即最新

## 功能

- **无密码，打开即用**：打开页面直接显示名单，不再需要每次输密码
- **秒级同步**：保存 / 删除立即写入云端（认证 Issue 通道，秒级生效），任何设备打开自动合并最新数据
- **即输即搜**：按玩家名或关键词实时搜索，记过什么一眼看到
- **高危标记**：多次捣乱自动标"多次"，记了 3 次以上直接标"高危"，一眼识别惯犯
- **3 套主题**：Element / 战术暗 / 极简，一键切换
- **导出 / 导入**：明文 JSON / CSV 导出，换设备、防丢失都靠它
- **旧版数据迁移**：检测到 v1 数据（本机或云端）时提示输入旧密码，一次性迁移到 v2

## 快速开始

1. 打开 https://yong-xu.github.io/cf-blacklist/ ，直接看到名单
2. 「记一笔」随手记下捣乱的人，点玩家可展开明细、删除记录
3. 设置 → GitHub 账号 →「连接 GitHub 账号」：打开 github.com/login/device 输入设备码授权一次（此后 token 自动续期约 6 个月），即可秒级同步

## 架构（前后端分离）

```
浏览器（GitHub Pages 前端 index.html）
   │  读：基线文件 + 最新 Issue（匿名，公开数据）
   │  写：OAuth 令牌 → Cloudflare Worker 代理 → GitHub Issue（秒级）
   ▼
Cloudflare Worker（worker.js，仅做转发，看不到名单内容）
   ▼
GitHub 仓库（data/encrypted.json 密文 + sync issue）
   └─ Actions 工作流自动把 Issue 落库为基线
```

- **前端**：`index.html`，部署于 GitHub Pages
- **后端**：`worker.js`，部署于 Cloudflare Workers（免费），为 GitHub OAuth 端点提供浏览器可调用的代理
- **数据**：`data/encrypted.json`（AES-256-GCM 加密，内置密钥，防普通浏览；明文仅存在于浏览器内存）
- **同步**：`.github/workflows/sync.yml` 监听 sync Issue 自动落库

## 部署 Worker（一次性，约 5 分钟）

1. 打开 https://dash.cloudflare.com → Workers & Pages → Create → Worker
2. 名称填 `cf-sync-proxy`，把本仓库 `worker.js` 内容粘贴进编辑器
3. Deploy → 复制你的 workers.dev 域名（形如 `https://cf-sync-proxy.xxx.workers.dev`）
4. 把域名填入 `index.html` 顶部常量 `SYNC_PROXY`，提交推送，完成

## 安全说明

- 数据以 AES-256-GCM 加密存入公开仓库，仓库内**看不到明文名单**（内置密钥，懂技术的人理论上可解，请勿存放极端敏感信息）
- 你的 GitHub 令牌（8 小时有效）只存在各设备本机浏览器，随请求头经代理转发，代理与仓库均不落盘
- 不要将明文名单提交进仓库

## 免责声明

本项目仅用于个人游戏社交记录，内容来自个人游戏经历的主观记录。请理性看待游戏输赢与玩家行为，不对任何人进行人身攻击或网络暴力。
