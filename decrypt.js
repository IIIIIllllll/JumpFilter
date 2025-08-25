// ===== 配置部分 =====
const whitelist = [
  "ankii.fanbox.cc",
  "fanbox",
  "patreon.com"
];
const blacklist = [
  "kemono",
  "kemono.su",
  "kemono.party",
  "kemono.cr"
];

// 模式： "whitelist" = 只允许白名单通过； "blacklist" = 禁止黑名单
const mode = "whitelist"; 

// ===== 工具函数 =====
function setMessage(text) {
  const el = document.getElementById("message");
  if (el) el.textContent = text;
}

function getQueryParams() {
  const params = {};
  const queryString = window.location.search.substring(1);
  const pairs = queryString.split("&");
  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (key && value) params[decodeURIComponent(key)] = decodeURIComponent(value);
  }
  return params;
}

function checkReferrer(ref) {
  if (!ref) return true; // 没有来源也允许，可改 false

  if (mode === "whitelist") {
    return whitelist.some(domain => ref.includes(domain));
  } else if (mode === "blacklist") {
    return !blacklist.some(domain => ref.includes(domain));
  }
  return true;
}

// ===== 主逻辑 =====
async function main() {
  const params = getQueryParams();
  const key = params["key"];
  const file = params["file"];
  const referrer = document.referrer || "";

  // 1. 检查来源
  if (!checkReferrer(referrer)) {
    setMessage("来源不允许，无法跳转。\nReferrer not allowed, redirect blocked.");
    return;
  }

  // 2. 参数检查
  if (!key || !file) {
    setMessage("缺少必要参数 ?key=xxx&file=yyy / Missing required parameters ?key=xxx&file=yyy");
    return;
  }

  try {
    // 3. 获取密文
    const res = await fetch("data.json?ts=" + Date.now());
    if (!res.ok) {
      setMessage("无法读取数据文件 / Failed to fetch data.json");
      return;
    }
    const db = await res.json();
    const ciphertext = db[file];
    if (!ciphertext) {
      setMessage("未找到对应文件 / File not found");
      return;
    }

    // 4. 解密
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decryptedUrl = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedUrl) {
      setMessage("密钥错误或解密失败 / Wrong key or decryption failed");
      return;
    }

    // 5. 成功跳转
    setMessage("验证成功，正在跳转...\nVerification passed, redirecting...");
    setTimeout(() => {
      window.location.href = decryptedUrl;
    }, 800);
  } catch (e) {
    console.error(e);
    setMessage("读取或解密失败 / Failed to read or decrypt");
  }
}

// 页面加载后执行
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
