// JavaScript to create and control the overlay
function showOverlay(tips) {
  // Create overlay div
  var overlay = document.createElement("div");
  overlay.id = "overlay";

  // Apply styles to overlay
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0)"; // semi-transparent black
  overlay.style.zIndex = 9999; // ensure it's on top
  overlay.style.color = "white";
  overlay.style.fontSize = "24px";
  overlay.style.textAlign = "center";
  overlay.style.paddingTop = "24%";

  // Create text div
  var text = document.createElement("div");
  text.id = "overlayText";
  text.innerText = tips;

  // Append text to overlay
  overlay.appendChild(text);

  // Append overlay to body
  document.body.appendChild(overlay);
}

function hideOverlay() {
  var overlay = document.getElementById("overlay");
  if (overlay) {
    document.body.removeChild(overlay);
  }
}
// 创建一个 BroadcastChannel
const channel = new BroadcastChannel("my_channel");
// 接收消息
channel.onmessage = event => {
  if ("new tab" === event.data) {
    const tips =
      JSON.parse(localStorage.getItem("_PicassoPersistedPrefix_lang")) ===
      "zh-CN"
        ? "当前另一个标签页处于激活状态！"
        : "Another tab has been activated!";
    showOverlay(tips);
  }
};
window.onload = function () {
  channel.postMessage("new tab");
};
