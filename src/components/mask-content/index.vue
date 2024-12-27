<template>
  <div class="loading-mask">
    <div class="mask-spinner">
      <div class="Loadingmsg">
        <img src="@/assets/images/page-loading.gif" class="mgauto" width="60" />
        <span class="msg">{{ $t("common.loadingText") }}</span>
      </div>
    </div>
    <div class="isAwait" v-show="maskContentStore.isAllSaveImages">
      <div class="innner">
        <div class="innnertext">
          <span>{{ $t("common.loadingText") }}</span
          >{{ maskContentStore.process }}%
        </div>
        <div class="loadingBack">
          <div class="loading" :style="{ width: maskContentStore.width }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMaskContentStoreHook } from "@/components/mask-content/store/index";
const maskContentStore = useMaskContentStoreHook();
defineOptions({
  name: "MaskContent"
});
</script>
<style lang="scss" scoped>
$card-header-bg-color: #2e2e2f;

.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  // z-index: 2001;
  display: none;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: $card-header-bg-color;
  // opacity: 0.3;

  .mask-spinner {
    display: none;
    flex-direction: column;

    .msg {
      margin-top: 15px;
    }

    .mgauto {
      margin: auto;
    }
  }

  .isAwait {
    position: absolute;
    z-index: 999999;
    width: 502px;
    height: 120px;
    overflow: hidden;
    cursor: pointer;
    background-color: #3e3e3f;
    border-radius: 4px;
    opacity: 1;

    .innner {
      width: 390px;
      height: 32px;
      margin: auto;
      margin-top: 42px;

      .innnertext {
        display: flex;
        justify-content: space-between;
      }

      .loadingBack {
        height: 8px;
        margin-top: 5px;
        background-color: rgb(255 255 255 / 8%);
        border-radius: 4px;
      }

      .loading {
        width: 0;
        height: 8px;
        background: #276cd3;
        // background: linear-gradient(to right, #276cd3, #87cefa);
        border-radius: 4px;
      }
    }
  }
}
</style>
