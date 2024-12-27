<template>
  <div class="analysis-capture-info-box" v-if="captureTime">
    <section class="capture-info-box__head">
      <div class="info-wrapper">
        <span class="oculus">{{ oculus }}</span>
        <section class="detail-info">
          <span v-show="follow" class="follow-sign">{{ follow }}</span>
          <span class="detail-info__item capture-time">
            {{
              captureTime
                ? toDateString(captureTime, getDateStandardFormat())
                : ""
            }}
          </span>
          <span class="detail-info__item protocol">
            {{ protocol ? `${protocol}` : "" }}
          </span>
          <span class="detail-info__item ssi">
            {{ ssi ? `, SSI: ${ssi}` : "" }}
          </span>
          <span class="detail-info__item comment">
            {{ comment ? `, ${comment}` : "" }}
          </span>
        </section>
      </div>
      <icon-svg name="edit" class="edit-icon" @click="handleEdit" />
    </section>
    <section class="capture-info-box__body">
      <slot></slot>
    </section>
  </div>
</template>
<script lang="ts" setup>
/**
 * Capture info box component in analysis page
 */
import { toDateString } from "xe-utils";
import { getDateStandardFormat } from "@/utils/index";

defineOptions({
  name: "AnalysisCaptureInfoBox"
});

interface Props {
  oculus: string;
  captureTime: string;
  protocol: string;
  ssi: string;
  comment: string;
  follow?: string;
}

withDefaults(defineProps<Props>(), {
  oculus: "",
  captureTime: "",
  protocol: "",
  ssi: "",
  comment: ""
});

const emit = defineEmits(["edit", "imageError"]);

// handle click
const handleEdit = () => {
  emit("edit");
};
</script>
<style lang="scss" scoped>
$border-color: #19191a;
$card-header-bg-color: #2e2e2f;

.analysis-capture-info-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid $divide-light-color;
}

.capture-info-box__body {
  flex: 1;
}

.capture-info-box__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 4px 0 7px;
  background-color: $card-header-bg-color;

  .info-wrapper {
    display: flex;
    align-items: center;
    width: 95%;
  }

  .detail-info {
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .detail-info__item {
    &:last-child {
      margin-right: 0;
    }
  }

  .capture-time {
    margin-right: 6px;
  }

  .oculus {
    padding: 0 16px;
    margin-right: 12px;
    font-size: 28px;
    font-weight: 700;
    border-right: 1px solid $border-color;
  }

  .follow-sign {
    display: inline-block;
    width: 15px;
    margin-right: 15px;
    font-size: $font-size-small;
    color: $image-bg-color;
    text-align: center;
    background-color: $warning-color;
    border-radius: 1px;
  }
}

.edit-icon {
  cursor: pointer;
}
</style>
