<template>
  <div class="image-actions">
    <section
      v-if="showNavigation"
      class="image-actions__item"
      @click="handleActionClick('navigation-line')"
    >
      <icon-svg
        :name="navigationLineIcon"
        :class="['action-icon', 'show-nav-line', navigationLineIcon]"
      />
      {{ $t("analysis.navigationLine") }}
    </section>
    <section
      v-if="showLayerOnBscan"
      :class="['image-actions__item', disableLayerOnBscan ? 'disabled' : '']"
      style="margin-right: 10px"
      @click="handleActionClick('layer-on-bscan')"
    >
      <icon-svg
        :name="layerOnBscanIcon"
        :class="['layer-on-bscan-item action-icon', layerOnBscanIcon]"
      />
      {{ $t("analysis.layerOnBscan") }}
    </section>
    <section
      v-if="showLayerEdit"
      class="image-actions__item edit"
      @click="handleActionClick('layer-edit')"
    >
      <span>{{ $t("analysis.edit") }}</span>
    </section>
    <section
      v-if="showAngioColor"
      class="image-actions__item"
      @click="handleActionClick('angio-color')"
    >
      <icon-svg :name="angioColorIcon" class="action-icon" />
      {{ $t("analysis.angioColor") }}
    </section>
    <section
      v-if="showRecogonized"
      class="image-actions__item"
      @click="handleActionClick('recogonized-content')"
    >
      <icon-svg :name="recogonizedContentIcon" class="action-icon" />
      {{ $t("analysis.recogonizedContent") }}
    </section>
    <section
      v-if="showScanLineAction && (showScanLine || showStarLine)"
      class="image-actions__item"
      @click="handleActionClick('scan-line')"
    >
      <icon-svg :name="scanLineIcon" class="action-icon" />
      {{ $t("analysis.scanLine") }}
    </section>
  </div>
</template>
<script lang="ts" setup>
import { ImageActionEnum } from "@/enums";
import { useImageActionStoreHook } from "./store/imageAction";

const EMPTY_RECT_ICON = "rectangle";

defineOptions({
  name: "AngioActions"
});

interface Props {
  defaultShowNav?: boolean;
  showNavigation?: boolean;
  showLayerOnBscan?: boolean;
  showAngioColor?: boolean;
  showScanLineAction?: boolean;
  showRecogonized?: boolean;
  showScanLine?: boolean;
  showStarLine?: boolean;
  disableLayerOnBscan?: boolean;
  showLayerEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showNavigation: false,
  defaultShowNav: true,
  showLayerOnBscan: false,
  showAngioColor: false,
  showRecogonized: false,
  showScanLine: false,
  showStarLine: false,
  showLayerEdit: false
});

const emit = defineEmits(["change"]);

const imageActionStore = useImageActionStoreHook();

const navigationLineIcon = computed(() =>
  imageActionStore.navigationLine ? ImageActionEnum.Navigation : EMPTY_RECT_ICON
);

const layerOnBscanIcon = computed(() =>
  imageActionStore.layerOnBscan ? ImageActionEnum.LayerOnBscan : EMPTY_RECT_ICON
);

const angioColorIcon = computed(() =>
  imageActionStore.angioColor ? ImageActionEnum.AngioColor : EMPTY_RECT_ICON
);
const recogonizedContentIcon = computed(() =>
  imageActionStore.recogonizedContent
    ? ImageActionEnum.RecogonizedContent
    : EMPTY_RECT_ICON
);

const scanLineIcon = computed(() =>
  imageActionStore.scanLine
    ? props.showScanLine
      ? ImageActionEnum.ScanLine
      : ImageActionEnum.StarLine
    : EMPTY_RECT_ICON
);

const initStatus = async () => {
  await nextTick();
  imageActionStore.setNavigationStatus(props.defaultShowNav);
  emit("change", ...[ImageActionEnum.Navigation, props.defaultShowNav]);
};

onMounted(() => {
  initStatus();
});

// handle layer selected
const handleActionClick = (type: string) => {
  switch (type) {
    case ImageActionEnum.Navigation:
      imageActionStore.setNavigationStatus(!imageActionStore.navigationLine);
      emit("change", ...[type, imageActionStore.navigationLine]);
      break;
    case ImageActionEnum.LayerOnBscan:
      if (props.disableLayerOnBscan) return;
      imageActionStore.setLayerOnBscan(!imageActionStore.layerOnBscan);
      emit("change", ...[type, imageActionStore.layerOnBscan]);
      break;
    case ImageActionEnum.LayerEdit:
      emit("change", ...[type, imageActionStore.layerEdit]);
      break;
    case ImageActionEnum.AngioColor:
      imageActionStore.setAngioColor(!imageActionStore.angioColor);
      emit("change", ...[type, imageActionStore.angioColor]);
      break;
    case ImageActionEnum.RecogonizedContent:
      imageActionStore.setRecogonizedContent(
        !imageActionStore.recogonizedContent
      );
      emit("change", ...[type, imageActionStore.recogonizedContent]);
      break;
    case ImageActionEnum.ScanLine:
      imageActionStore.setScanLine(!imageActionStore.scanLine);
      emit("change", ...[type, imageActionStore.scanLine]);
      break;
    default:
      throw new Error(`No such action ${type}`);
  }
};

onUnmounted(() => {
  imageActionStore.$reset();
});
</script>
<style lang="scss" scoped>
.image-actions {
  display: flex;
  align-items: center;
  height: 100%;
}

.image-actions__item {
  display: flex;
  align-items: center;
  margin-right: 24px;
  cursor: pointer;

  .action-icon {
    margin-right: 8px;
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  &.edit {
    padding: 2px 20px;
    background-color: $dialog-bg-color;
  }
}
</style>
