// ===== 配置部分 =====

// 白名单和黑名单（可自行添加/修改）
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

// ===== 主逻辑 =====
window.onload = function () {
  const params = new URLSearchParams(window.location.search);
  const key = params.get("key");
  const file = params.get("file");

  const messageEl = document.getElementById("message");

  // 1. 检查来源站点
  const referrer = document.referrer || "";
  if (!checkReferrer(referrer)) {
    messageEl.innerText = "来源不允许，无法跳转。\nReferrer not allowed, redirect blocked.";
    return;
  }

  // 2. 参数检查
  if (!key || !file) {
    messageEl.innerText = "缺少参数！请检查链接。\nMissing parameters! Please check the link.";
    return;
  }

  // 3. 解密
  try {
    const bytes = CryptoJS.AES.decrypt(file, key);
    const decryptedUrl = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedUrl) {
      messageEl.innerText = "密钥错误或解密失败。\nWrong key or decryption failed.";
      return;
    }

    // 跳转
    messageEl.innerText = "验证成功，正在跳转...\nVerification passed, redirecting...";
    setTimeout(() => {
      window.location.href = decryptedUrl;
    }, 1200);
  } catch (e) {
    messageEl.innerText = "解密出错。\nDecryption error.";
  }
};

// ===== 检查来源函数 =====
function checkReferrer(ref) {
  if (!ref) return true; // 没有来源则允许（可改成 false）

  if (mode === "whitelist") {
    return whitelist.some(domain => ref.includes(domain));
  } else if (mode === "blacklist") {
    return !blacklist.some(domain => ref.includes(domain));
  }
  return true;
}
