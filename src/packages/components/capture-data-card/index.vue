<template>
  <div
    class="capture-data-card"
    @click="handleClicked"
    @dblclick.once="handleDbClicked"
  >
    <section class="capture-data-card__head">
      <div class="protocol" :title="protocol">{{ protocol }}</div>
      <div :class="dataCardClass">
        {{ oculus }}
      </div>
    </section>
    <section class="capture-data-card__body">
      <general-image-viewer
        v-if="!isSlo"
        :src="src"
        @error="handleImageLoadError"
      />
      <SLOThumbnailViewer
        v-else
        :slo="sloRect"
        :enface="enfaceRect"
        :isStarScan="isStarScan"
        :isCubeData="isCubeData"
      />
    </section>
    <section class="capture-data-card__bottom">
      <div v-show="follow" class="follow">
        <span class="follow-sign">{{ follow }}</span>
      </div>
      <div class="bottom-info">
        <div class="ssi">{{ hideSsi ? "&nbsp;" : `SSI:${ssi}` }}</div>
        <div class="time">{{ time }}</div>
      </div>
    </section>
  </div>
</template>
<script lang="ts" setup>
/**
 * Capture data card component
 */
import { AxiosHttpResponse } from "@/utils/http/types";
import { OculusTypeEnum } from "@/packages/utils/enums";
import { SLOInfoType, SLOEnfaceInfoType } from "@/views/patient/utils/patient";
import { CaptureThumbnailParams } from "@/api/types";
import { getCaptureThumbnailImage } from "@/api/image";

defineOptions({
  name: "CaptureDataCard"
});

interface Props {
  captureKey: string;
  src: string;
  protocol: string;
  oculus: string;
  ssi?: string;
  hideSsi?: boolean;
  time?: string;
  follow?: string;
  isStarScan: boolean;
  isCubeData: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  src: "",
  protocol: "",
  oculus: "",
  ssi: "",
  time: ""
});

const sloRect = ref<SLOInfoType>({
  src: "",
  // width: 1000,
  // height: 1000,
  transform: []
});
const enfaceRect = ref<SLOEnfaceInfoType>({
  width: 0,
  height: 0,
  spacingX: 0,
  spacingY: 0,
  selected: 0,
  transform: [],
  rotate: 0
});

const emit = defineEmits(["select", "dblclick", "imageError"]);

const dataCardClass = computed(() => [
  "oculus",
  `${props.oculus === OculusTypeEnum.OD ? "od" : "os"}`
]);

const isSlo = computed(() => props.src.includes("type=slo"));

watch(
  () => props.src,
  async (src: string) => {
    await nextTick();
    src.includes("type=slo") && queryThumbnailSLOImage();
  },
  {
    immediate: true
  }
);
const handleResponse = (response: AxiosHttpResponse) => {
  const xOCTInfo = response.headers["x-oct-info"];
  if (!xOCTInfo) return false;

  const headerInfo = JSON.parse(atob(xOCTInfo));
  const blob = URL.createObjectURL(response.data);
  sloRect.value.src = blob;
  if (!headerInfo) return false;

  sloRect.value.transform = headerInfo.xform_slo;
  enfaceRect.value = {
    width: headerInfo.dim_fast,
    height: props.isStarScan
      ? headerInfo.dim_slow
      : headerInfo.dim_slow === 1
      ? 1
      : headerInfo.dim_slow - 1,
    selected: Math.floor(headerInfo.dim_slow / 2),
    transform: headerInfo.xform_enface,
    spacingX: headerInfo.spacingX_um,
    spacingY: headerInfo.spacingY_um,
    rotate: headerInfo.rotation_deg
  };
  return true;
};
const queryThumbnailSLOImage = async () => {
  sloRect.value.src = "";
  const params: CaptureThumbnailParams = {
    captureKey: props.captureKey,
    type: "slo"
  };
  const res = await getCaptureThumbnailImage(params);
  const response = res as AxiosHttpResponse;
  if (response) {
    const sloRes = handleResponse(response);
    !sloRes && (sloRect.value.src = "null");
  } else {
    const params: CaptureThumbnailParams = {
      captureKey: props.captureKey,
      type: "slo",
      timestamp: new Date().getTime()
    };
    const res = await getCaptureThumbnailImage(params);
    const response = res as AxiosHttpResponse;
    if (response) {
      const sloRes = handleResponse(response);
      !sloRes && (sloRect.value.src = "null");
    }
  }
};

// handle click
const handleClicked = () => {
  emit("select");
};

// double cliced
const handleDbClicked = () => {
  emit("dblclick");
};

const handleImageLoadError = () => {
  emit("imageError");
};
</script>
<style lang="scss" scoped>
$card-header-bg-color: #3d3d3d;

.capture-data-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 150px;
  height: 140px;
  cursor: pointer;

  &:hover,
  &.active {
    .capture-data-card__head {
      background-color: $table-row-highlight-color;
    }
  }
}

.capture-data-card.disabled {
  cursor: not-allowed;
  opacity: 0.4;

  &:hover {
    .capture-data-card__head {
      background-color: $card-header-bg-color;
    }
  }
}

.capture-data-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 28px;
  padding: 0 4px 0 8px;
  background-color: $card-header-bg-color;

  .protocol {
    width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .oculus {
    width: 35px;
    height: 18px;
    padding: 0 5px;
    font-weight: 700;
    line-height: 18px;
    text-align: center;
    background: rgb(255 255 255 / 15%);
    border-radius: 30px;

    &.od {
      color: $oculus-od-color;
    }

    &.os {
      color: $oculus-os-color;
    }
  }
}

.capture-data-card__body {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: $image-bg-color;
}

.capture-data-card__bottom {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 8px;

  .follow {
    line-height: 18px;
    text-align: right;
  }

  .follow-sign {
    display: inline-block;
    width: 15px;
    height: 13px;
    font-size: $font-size-small;
    line-height: 13px;
    color: $image-bg-color;
    text-align: center;
    background-color: $warning-color;
    border-radius: 1px;
  }

  .bottom-info {
    display: flex;
    line-height: 25px;
    color: #f0f0f0;
    text-shadow: 1px 1px 0 rgb(0 0 0 / 90%);
  }

  .time {
    position: absolute;
    right: 8px;
  }
}
</style>
