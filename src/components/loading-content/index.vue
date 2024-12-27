<template>
  <div class="loading-content">
    <div class="loading-tip">
      <img src="@/assets/images/page-loading.gif" width="60" />
      <span class="msg">{{ $t("common.loadingText") }}</span>
    </div>
    <div class="image-oper-tip">
      <span class="des-msg">{{ $t("common.imageOperTips") }}</span>
      <div class="oper-tip">
        <div class="oper-tip-item">
          <icon-svg name="drag-left-button" />
          <div class="oper-mag">
            <span class="label-msg">{{ $t("common.move") }}</span>
            <span class="des-msg">{{ $t("common.dragLeftButton") }}</span>
          </div>
        </div>
        <div class="oper-tip-item">
          <icon-svg name="drag-right-button" />
          <div class="oper-mag">
            <span class="label-msg">{{ $t("common.zoom") }}</span>
            <span class="des-msg">{{ $t("common.dragRightButton") }}</span>
          </div>
        </div>
        <div class="oper-tip-item">
          <icon-svg name="drag-mid-button" />
          <div class="oper-mag">
            <span class="label-msg">{{ $t("common.adjust") }}</span>
            <span class="des-msg">{{ $t("common.dragMidButton") }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "LoadingContent"
});
</script>
<style lang="scss" scoped>
$border-color: #19191a;
$card-header-bg-color: #2e2e2f;

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding-top: 20%;
  background-color: $image-bg-color;

  .loading-tip {
    .msg {
      margin-top: 15px;
    }
  }

  .image-oper-tip {
    padding-top: 10%;

    .oper-tip {
      display: flex;
      flex-direction: row;
      margin-top: 12px;

      .oper-tip-item {
        display: flex;
        flex-direction: row;
        margin-right: 25px;

        .oper-mag {
          display: flex;
          flex-direction: column;
          padding-top: 8px;
        }
      }
    }

    .des-msg {
      font-size: 12px;
      color: rgb(226 226 226 / 60%);
    }

    .label-msg {
      padding-bottom: 4px;
      font-size: 16px;
      font-weight: normal;
      color: #e2e2e2;
    }
  }
}
</style>
