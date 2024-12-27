<template>
  <div class="capture-info-card" v-if="captureTime">
    <div class="info-wrapper">
      <span class="oculus">{{ oculus }}</span>
      <section class="detail-info">
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
        <span class="detail-info__item ssi" v-if="!isMosaicProtocol(protocol)">
          {{ ssi ? `, SSI: ${ssi}` : "" }}
        </span>
        <span class="detail-info__item comment">
          {{ comment ? `, ${comment}` : "" }}
        </span>
      </section>
    </div>
    <icon-svg name="edit" class="edit-icon" @click="handleEdit" />
  </div>
</template>
<script lang="ts" setup>
/**
 * Capture info card component in analysis page
 */
import { toDateString } from "xe-utils";
import { isMosaicProtocol } from "@/utils/protocol";
import { getDateStandardFormat } from "@/utils/index";

defineOptions({
  name: "CaptureInfoCard"
});

interface Props {
  oculus: string;
  captureTime: string;
  protocol: string;
  ssi: string;
  comment: string;
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

.capture-info-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 10px 0 7px;
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
}

.edit-icon {
  cursor: pointer;
}
</style>
