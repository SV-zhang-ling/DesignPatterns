<template>
  <div ref="appWrapperRef" class="app-wrapper">
    <TopHeader />
    <router-view />
  </div>
  <MeasureTextDialog />
  <sv-contextmenu />
</template>
<script lang="ts" setup>
import MeasureTextDialog from "@/packages/components/measure-tools/MeasureTextDialog.vue";
import TopHeader from "./components/TopHeader.vue";
import { WEBSOCKET_WORKER } from "@/utils/constant";

// 创建并初始化 Web Worker
const worker = new Worker("/websocketWorker.js");
window.wsWorker = worker;

// 创建后就建立逻辑
worker.postMessage({ action: "connect" });

provide(WEBSOCKET_WORKER, worker);
</script>
<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: $page-bg-color;

  &::after {
    display: table;
    clear: both;
    content: "";
  }
}
</style>
