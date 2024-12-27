let ws;
// let reconnectInterval = 5 * 1000; // 尝试重新连接的时间间隔
let isHttps = location.protocol === "https:";
let protocol = isHttps ? "wss:" : "ws:";
let host = isHttps ? location.host : `${location.hostname}:6009`;
let wsUrl = `${protocol}//${host}/communication`;

function connectWebSocket() {
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    self.postMessage({ event: "open" });
  };

  ws.onmessage = messageEvent => {
    self.postMessage({ event: "message", data: messageEvent.data });
  };

  ws.onclose = () => {
    console.log("Websocket close called.");
    self.postMessage({ event: "close" });
    // 尝试重新连接
    // setTimeout(() => {
    //   connectWebSocket();
    // }, reconnectInterval);
  };

  ws.onerror = error => {
    self.postMessage({ event: "error", data: error });
    ws.close();
  };
}

self.onmessage = function (event) {
  switch (event.data.action) {
    case "connect":
      console.log("connectWebSocket called.");
      connectWebSocket();
      break;
    case "send":
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(event.data.message);
      }
      break;
    case "close":
      ws && ws.close();
      break;
    default:
      break;
  }
};
