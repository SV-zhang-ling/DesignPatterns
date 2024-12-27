<template>
  <div class="image-settings">
    <el-collapse v-model="activeNames">
      <sv-collapse-item
        :title="$t('analysis.advancedFeatures')"
        name="advancedFeatures"
      >
        <div class="image-settings__item" v-if="showPar">
          <span class="label">{{ $t("analysis.par") }}</span>
          <el-switch v-model="settingForm.par" @change="() => handleChange()" />
        </div>
        <div class="image-settings__item seperate-label" v-if="showOverlayMode">
          <span class="label">{{ $t("analysis.overlayMode") }}</span>
          <el-select
            v-model="settingForm.projType"
            @change="() => handleChange()"
          >
            <el-option
              v-for="item in OCT_PROJECT_MODE_LIST"
              :key="item.value"
              :value="item.value"
              :label="$t(item.labelKey)"
            />
          </el-select>
        </div>
      </sv-collapse-item>
      <sv-collapse-item :title="$t('analysis.layered')" name="layered">
        <LayerAdjust
          :layerBorderList="layerBorderList"
          :layerAttr="{
            ceilingSurf: settingForm.ceilingSurf,
            floorSurf: settingForm.floorSurf,
            ceilingShift: settingForm.ceilingShift,
            floorShift: settingForm.floorShift
          }"
          @change="handleChange"
          @reset="handleReset"
        />
      </sv-collapse-item>
    </el-collapse>
  </div>
</template>
<script lang="ts" setup>
import LayerAdjust from "@/views/analysis/components/LayerAdjust.vue";
import { ProjectTypeEnum } from "@/enums";
import {
  OCT_PROJECT_MODE_LIST,
  POSTERIOR_OCT_LAYER_BORDER_LIST,
  ANTERIOR_OCT_LAYER_BORDER_LIST
} from "@/utils/constant";
import { useStructuralProjStoreHook, AttrType } from "../store/index";
import { useOCTLayerStoreHook } from "./store/octLayer";

defineOptions({
  name: "ImageSettingsPanel"
});

interface Props {
  showPar?: boolean;
  showOverlayMode?: boolean;
}
withDefaults(defineProps<Props>(), {
  showPar: false,
  showOverlayMode: true
});

let settingForm = reactive<AttrType>({
  par: true,
  projType: ProjectTypeEnum.MEAN,
  ceilingSurf: "",
  floorSurf: "",
  ceilingShift: "",
  floorShift: ""
});

const octLayerStore = useOCTLayerStoreHook();
const structuralProjStore = useStructuralProjStoreHook();
const activeNames = ref(["advancedFeatures", "layered"]); // default expand all items

const initSettingForm = () => {
  const { layerType, octSurfaceInfoArr } = structuralProjStore;
  const surfaceInfo = octSurfaceInfoArr?.[Number(layerType)];
  if (!surfaceInfo) return;
  settingForm.ceilingSurf = surfaceInfo.ceilingSurf;
  settingForm.ceilingShift = String(surfaceInfo.ceilingShift);
  settingForm.floorSurf = surfaceInfo.floorSurf;
  settingForm.floorShift = String(surfaceInfo.floorShift);
};

const layerBorderList = computed(() =>
  structuralProjStore.isAs
    ? ANTERIOR_OCT_LAYER_BORDER_LIST
    : POSTERIOR_OCT_LAYER_BORDER_LIST
);

watch(
  [
    () => octLayerStore.activeLayerType,
    () =>
      structuralProjStore.octSurfaceInfoArr[
        Number(octLayerStore.activeLayerType)
      ]
  ],
  () => {
    initSettingForm();
  },
  { immediate: true, deep: true }
);

// handle layer selected
const handleChange = (layerAttr?: LayerAttrType) => {
  if (layerAttr) {
    settingForm.ceilingSurf = layerAttr.ceilingSurf;
    settingForm.ceilingShift = layerAttr.ceilingShift;
    settingForm.floorSurf = layerAttr.floorSurf;
    settingForm.floorShift = layerAttr.floorShift;
  }
  structuralProjStore.setAttrs(settingForm);
};

const handleReset = () => {
  structuralProjStore.resetOctLayer();
};
</script>
<style lang="scss" scoped>
.image-settings {
  position: relative;
  height: 100%;
}

.image-settings__item,
::v-deep .image-settings__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  &.seperate-label {
    flex-direction: column;
    align-items: start;

    .label {
      margin-bottom: 5px;
    }
  }
}
</style>
