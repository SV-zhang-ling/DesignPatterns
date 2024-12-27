<template>
  <div class="angio-image-settings">
    <el-collapse v-model="activeNames">
      <sv-collapse-item
        :title="$t('analysis.advancedFeatures')"
        name="advancedFeatures"
      >
        <div class="angio-image-settings__item" v-if="showPar">
          <span class="label">{{ $t("analysis.par") }}</span>
          <el-switch
            v-model="settingForm.par"
            @change="() => handleAngioChange()"
          />
        </div>
        <div class="angio-image-settings__item">
          <span class="label">{{ $t("analysis.removeStripLine") }}</span>
          <el-switch
            v-model="settingForm.removeStripLine"
            :disabled="isPhotocoagulation"
            @change="() => handleAngioChange()"
          />
        </div>
        <div class="angio-image-settings__item">
          <span class="label">{{ $t("analysis.angioEnhance") }}</span>
          <el-switch
            v-model="settingForm.enhance"
            :disabled="isPhotocoagulation"
            @change="() => handleAngioChange()"
          />
        </div>
        <div
          class="angio-image-settings__item seperate-label"
          v-if="showOverlayMode"
        >
          <span class="label">{{ $t("analysis.overlayMode") }}</span>
          <el-select
            v-model="settingForm.projType"
            @change="() => handleAngioChange()"
          >
            <el-option
              v-for="item in PROJECT_MODE_LIST"
              :key="item.value"
              :value="item.value"
              :label="$t(item.labelKey)"
            />
          </el-select>
        </div>
        <div class="angio-image-settings__item" style="display: none">
          <el-button type="primary" style="width: 100%" disabled>
            {{ $t("analysis.locateCNV") }}
          </el-button>
        </div>
      </sv-collapse-item>
      <sv-collapse-item
        :title="$t('analysis.quantitativeAnalysis')"
        style="display: none"
        name="quantitativeAnalysis"
      >
        <div class="angio-image-settings__item seperate-label">
          <span class="label">{{ $t("analysis.measure") }}</span>
          <el-select
            v-model="settingForm.measure"
            @change="() => handleAngioChange()"
          >
            <el-option
              v-for="item in MEASURE_LIST"
              :key="item.value"
              :value="item.value"
              :label="$t(item.labelKey)"
            />
          </el-select>
        </div>
        <div class="angio-image-settings__item seperate-label">
          <span class="label">{{ $t("analysis.quantize") }}</span>
          <el-select
            v-model="settingForm.quantize"
            @change="() => handleAngioChange()"
          >
            <el-option
              v-for="item in QUANTIZE_LIST"
              :key="item.value"
              :value="item.value"
              :label="$t(item.labelKey)"
            />
          </el-select>
        </div>
      </sv-collapse-item>
      <sv-collapse-item :title="$t('analysis.layered')" name="layered">
        <LayerAdjust
          :layerBorderList="LAYER_BORDER_LIST"
          :layerAttr="{
            ceilingSurf: settingForm.ceilingSurf,
            floorSurf: settingForm.floorSurf,
            ceilingShift: settingForm.ceilingShift,
            floorShift: settingForm.floorShift
          }"
          :disabled="isPhotocoagulation"
          @change="handleAngioChange"
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
  PROJECT_MODE_LIST,
  MEASURE_LIST,
  QUANTIZE_LIST,
  LAYER_BORDER_LIST
} from "@/utils/constant";
import { useAngioStoreHook } from "../store/angiography";
import { AngioAttrType } from "../utils/angiography.d";
import { useAngioLayerStoreHook } from "./store/angioLayer";

const RetinaPhotocoagulationLayerType = "15";

defineOptions({
  name: "AngioImageSettings"
});

interface Props {
  showPar?: boolean;
  showOverlayMode?: boolean;
}
withDefaults(defineProps<Props>(), {
  showPar: true,
  showOverlayMode: true
});

let settingForm = reactive<AngioAttrType>({
  par: true,
  removeStripLine: true,
  enhance: true,
  projType: ProjectTypeEnum.MAX,
  measure: "0",
  quantize: "0",
  ceilingSurf: "",
  floorSurf: "",
  ceilingShift: "",
  floorShift: ""
});

const angioStore = useAngioStoreHook();
const angioLayerStore = useAngioLayerStoreHook();
const activeNames = ref([
  "advancedFeatures",
  "quantitativeAnalysis",
  "layered"
]); // default expand all items

const initSettingForm = () => {
  const { angioLayer, angioSurfaceInfoArr } = angioStore;
  const surfaceInfo = angioSurfaceInfoArr?.[Number(angioLayer)];
  if (!surfaceInfo) return;
  settingForm.ceilingSurf = surfaceInfo.ceilingSurf;
  settingForm.ceilingShift = String(surfaceInfo.ceilingShift);
  settingForm.floorSurf = surfaceInfo.floorSurf;
  settingForm.floorShift = String(surfaceInfo.floorShift);
};

// whether Retina Photocoagulation layer selected
const isPhotocoagulation = computed(
  () => angioLayerStore.activeAngioLayerType === RetinaPhotocoagulationLayerType
);

watch(
  [
    () => angioLayerStore.activeAngioLayerType,
    () =>
      angioStore.angioSurfaceInfoArr[
        Number(angioLayerStore.activeAngioLayerType)
      ]
  ],
  () => {
    initSettingForm();
  },
  { immediate: true, deep: true }
);

// handle layer selected
const handleAngioChange = (layerAttr?: LayerAttrType) => {
  if (layerAttr) {
    settingForm.ceilingSurf = layerAttr.ceilingSurf;
    settingForm.ceilingShift = layerAttr.ceilingShift;
    settingForm.floorSurf = layerAttr.floorSurf;
    settingForm.floorShift = layerAttr.floorShift;
  }
  angioStore.setAngioAttrs(settingForm);
};

const handleReset = () => {
  angioStore.resetPosteriorAngioLayer();
};
</script>
<style lang="scss" scoped>
.angio-image-settings {
  position: relative;
  height: 100%;
}

.angio-image-settings__item,
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

.layer-adjust-btn,
.layer-adjust-btn:hover {
  width: 28px;
  padding: 0 5px;
  font-size: 18px;
  color: $font-main-color;

  &.add {
    margin-left: 8px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &.minus {
    margin-left: 1px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  &.reset {
    width: 57px;
  }
}
</style>
