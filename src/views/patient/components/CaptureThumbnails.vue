<template>
  <div class="thumbnails">
    <template v-if="isMosaic">
      <div class="thumbnail mosaic">
        <general-image-viewer
          :src="`${preUrl}&type=AngioMosaicInnerRetina&isMosaic=1`"
          @error="handleImageLoadError"
        />
      </div>
      <div class="thumbnail mosaic">
        <general-image-viewer
          :src="`${preUrl}&type=AngioMosaicAvascular&isMosaic=1`"
          @error="handleImageLoadError"
        />
      </div>
      <div class="thumbnail mosaic">
        <general-image-viewer
          :src="`${preUrl}&type=AngioMosaicChoriocapillaris&isMosaic=1`"
          @error="handleImageLoadError"
        />
      </div>
    </template>
    <template v-else-if="isBiometry">
      <div class="thumbnail slo">
        <general-image-viewer
          :src="`${preUrl}&type=oct2&isBiometryPro=1`"
          @error="handleImageLoadError"
        />
      </div>
      <div class="thumbnail biometry">
        <general-image-viewer
          :src="`${preUrl}&type=oct&isBiometryPro=1`"
          @error="handleImageLoadError"
        />
      </div>
    </template>
    <template v-else>
      <div class="thumbnail slo">
        <SLOThumbnailViewer
          :slo="sloRect"
          :enface="enfaceRect"
          :isStarScan="isStarScan"
          :isCubeData="isCubeScan(activeData.Protocol)"
        />
      </div>
      <div class="thumbnail bscan">
        <general-image-viewer
          :src="`${preUrl}&type=oct`"
          @error="handleImageLoadError"
        />
      </div>
      <div v-if="isAngio || isCube" class="thumbnail angio">
        <general-image-viewer
          :src="`${preUrl}&type=enface`"
          @error="handleImageLoadError"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { AxiosHttpResponse } from "@/utils/http/types";
import { useCaptureStoreHook } from "../store/capture";
import {
  isAngioProtocol,
  isMosaicProtocol,
  isBiometryProProtocol,
  isCubeProtocol,
  isStarScanData,
  isCubeScan
} from "@/utils/protocol";
import { doLogout } from "@/utils/auth";
import { getCaptureThumbnailImage } from "@/api/image";
import { CaptureThumbnailParams } from "@/api/types";
import { SLOInfoType, SLOEnfaceInfoType } from "../utils/patient.d";
import { CaptureType } from "../utils/patient";

defineOptions({
  name: "CaptureThumbnails"
});

const captureStore = useCaptureStoreHook();

const sloRect = ref<SLOInfoType>({
  src: "",
  // width: 800,
  // height: 600,
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

interface Props {
  activeData: CaptureType;
}

const props = withDefaults(defineProps<Props>(), {
  activeData: () => {
    return {};
  }
});

watch(
  () => props.activeData.captureKey,
  async () => {
    const { Time, Protocol } = props.activeData;
    if (!Time || isMosaicProtocol(Protocol)) {
      return;
    }
    await nextTick();
    queryThumbnailSLOImage();
  },
  { immediate: true }
);

const preUrl = computed(
  () =>
    `${process.env.VUE_APP_BASE_API_URL}${process.env.VUE_APP_VANGOGH_VERSION}/capture/thumbnail?captureKey=${props.activeData.captureKey}`
);

// Angio protocol will display the enface thumbnail
const isAngio = computed(() => isAngioProtocol(props.activeData?.Protocol));

// Cube protocol will display the enface thumbnail as well
const isCube = computed(() => isCubeProtocol(props.activeData?.Protocol));

// Mosaic protocol will display InnerRetina, Avascular and Choriocapillaris thumbnails
const isMosaic = computed(() => isMosaicProtocol(props.activeData?.Protocol));

// Biometry protocol will display two oct thumbnails
const isBiometry = computed(() =>
  isBiometryProProtocol(props.activeData?.Protocol)
);

const isStarScan = computed(() => isStarScanData(props.activeData.Protocol));

const handleResponse = (response: AxiosHttpResponse) => {
  const xOCTInfo = response.headers["x-oct-info"];
  if (!xOCTInfo) return false;

  const headerInfo = JSON.parse(atob(xOCTInfo));
  // console.log("headerInfo::", headerInfo);
  const blob = URL.createObjectURL(response.data);
  sloRect.value.src = blob;
  if (!headerInfo) return false;

  sloRect.value.transform = headerInfo.xform_slo;
  enfaceRect.value = {
    width: headerInfo.dim_fast,
    height: isStarScan.value
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
  if (!props.activeData.captureKey) return;

  sloRect.value.src = "";
  const params: CaptureThumbnailParams = {
    captureKey: props.activeData.captureKey,
    type: "slo"
  };
  const res = await getCaptureThumbnailImage(params);
  const response = res as AxiosHttpResponse;
  if (response) {
    const sloRes = handleResponse(response);
    !sloRes && (sloRect.value.src = "null");
  } else {
    const params: CaptureThumbnailParams = {
      captureKey: props.activeData.captureKey,
      type: "slo",
      timestamp: new Date().getTime()
    };
    const res = await getCaptureThumbnailImage(params);
    const response = res as AxiosHttpResponse;
    if (response) {
      console.log(response, "again");
      const sloRes = handleResponse(response);
      !sloRes && (sloRect.value.src = "null");
    }
  }
};

// handle image loading error, redirect to login
const handleImageLoadError = () => {
  doLogout();
};
</script>

<style lang="scss" scoped>
$three-col-width: calc((100% - 32px) / 3);

.thumbnails {
  display: flex;
  min-width: 640px;
  height: 292px;
  padding-top: 18px;

  .thumbnail {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    margin-right: 16px;
    // background-color: $thumbnail-image-bg-color;
    background-color: $image-bg-color;

    &:last-child {
      margin-right: 0;
    }
  }

  .mosaic {
    width: $three-col-width;
  }

  .biometry,
  .bscan {
    flex: 1;
  }

  .slo,
  .angio {
    width: $three-col-width;
  }
}
</style>
