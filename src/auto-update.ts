let lastScripts: string[]; //上一次硬取到的script地址

const scriptRegExp = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;

const getNewScripts = async () => {
  const html = await fetch(`/?timestamp=${Date.now()}`).then(res => res.text());
  scriptRegExp.lastIndex = 0;
  const result = [];
  let match = null;
  while ((match = scriptRegExp.exec(html))) {
    result.push(match[0]);
  }
  return result;
};

// 检查是否有系统更新
const checkUpdate = async () => {
  const newScripts = await getNewScripts();
  // console.log("lastScripts::", lastScripts, "newScripts::", newScripts);
  if (!lastScripts) {
    lastScripts = newScripts;
    return false;
  }

  if (newScripts.length !== lastScripts.length) {
    return true;
  }

  let res = false;
  for (let i = 0; i < lastScripts.length; i++) {
    if (lastScripts[i] !== newScripts[i]) {
      res = true;
      break;
    }
  }
  lastScripts = newScripts;
  return res;
};

// 获取新的href
const getNewHref = () => {
  const currUrl = window.location.href;
  const timestamp = new Date().getTime();

  if (currUrl.includes("_t=")) {
    // 如果 URL 包含 _t 参数，更新其值
    const updatedUrl = currUrl.replace(/_t=\d+/, `_t=${timestamp}`);
    return updatedUrl;
  }

  // 如果 URL 不包含 _t 参数，添加时间戳参数
  const separator = currUrl.includes("?") ? "&" : "?";
  return `${currUrl}${separator}_t=${timestamp}`;
};

const AUTO_REFRESH_TIME = 60 * 1000; // 每隔1分钟检查一次
const autoRefresh = () => {
  setInterval(async () => {
    const updated = await checkUpdate();
    if (updated) {
      const result = confirm("系统有更新，点击确定刷新页面。");
      if (result) {
        window.location.href = getNewHref();
      }
    }
  }, AUTO_REFRESH_TIME);
};

autoRefresh();
