// ============================================================
// 记仇本 · 同步代理（Cloudflare Worker）
// 作用：转发 OAuth 设备码授权与 Issue 创建请求到 GitHub
//       （GitHub 端点禁止浏览器直接调用，需服务器端转发）
// 数据安全：本代理只转发，看不到名单内容（密文）与你的密码；
//           用户的 GitHub 令牌由浏览器持有并随请求传入。
// 部署：Cloudflare 控制台 → Workers → 新建 Worker → 粘贴本文件
//       → Deploy → 复制 workers.dev 域名 → 填入页面 SYNC_PROXY
// ============================================================

const REPO = "yong-xu/cf-blacklist";
const GITHUB_API = "https://api.github.com";
const GITHUB_LOGIN = "https://github.com";

// 统一 CORS 头：允许任何来源调用（页面部署在 GitHub Pages）
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 预检请求
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 读取 JSON body
    let body = null;
    const ct = request.headers.get("content-type") || "";
    if (ct.includes("json")) {
      try { body = await request.json(); } catch (e) { body = null; }
    }

    // 路由：仅允许本项目需要的三个端点
    let upstream, upstreamHeaders, passToken = false;
    if (path === "/device/code") {
      upstream = GITHUB_LOGIN + "/login/device/code";
      upstreamHeaders = { "Content-Type": "application/json", "Accept": "application/json" };
    } else if (path === "/token") {
      upstream = GITHUB_LOGIN + "/login/oauth/access_token";
      upstreamHeaders = { "Content-Type": "application/json", "Accept": "application/json" };
    } else if (path === "/issues") {
      upstream = GITHUB_API + "/repos/" + REPO + "/issues";
      upstreamHeaders = {
        "Content-Type": "application/json",
        "Accept": "application/vnd.github+json",
      };
      passToken = true; // 页面的 GitHub 令牌随请求头透传
    } else {
      return json({ error: "not found" }, 404);
    }

    // 透传用户令牌（浏览器 → GitHub）
    if (passToken) {
      const auth = request.headers.get("authorization");
      if (auth) upstreamHeaders["Authorization"] = auth;
    }

    // 转发
    const resp = await fetch(upstream, {
      method,
      headers: upstreamHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await resp.text();
    const contentType = resp.headers.get("content-type") || "application/json";
    return new Response(text, {
      status: resp.status,
      headers: { ...CORS_HEADERS, "Content-Type": contentType },
    });
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
