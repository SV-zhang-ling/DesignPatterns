<template>
  <div class="image-settings">
    <div class="image-settings__item">
      <span class="label">{{ $t("analysis.algorithm") }}</span>
      <el-select
        v-model="advancedSegStore.algorithm"
        class="select-list"
        @change="handleAlgorithmChange"
      >
        <el-option
          v-for="item in ALGORITHM_LIST"
          :key="item.value"
          :value="item.value"
          :label="$t(item.labelKey)"
        />
      </el-select>
    </div>
    <div class="image-settings__item">
      <span class="label">{{ $t("analysis.quantizationValue") }}</span>
      <el-select
        v-model="advancedSegStore.quantizationValue"
        class="select-list"
        @change="handleQuanValChange"
      >
        <el-option
          v-for="item in quantizationValueList"
          :key="item.value"
          :value="item.value"
          :label="$t(item.labelKey)"
        />
      </el-select>
    </div>
    <!-- 量化先不做
    <div class="image-settings__item">
      <span class="label">{{ $t("analysis.quantize") }}</span>
      <el-select
        v-model="advancedSegStore.quantize"
        class="select-list"
        @change="handleAngioChange"
      >
        <el-option
          v-for="item in QUANTIZE_LIST"
          :key="item.value"
          :value="item.value"
          :label="$t(item.labelKey)"
        />
      </el-select>
    </div> -->
  </div>
</template>
<script lang="ts" setup>
import { VesselEnum, SRFEnum } from "@/enums";
import { useAdvancedSegStoreHook } from "../store/advancedSeg";
import {
  ALGORITHM_LIST,
  QUANTIZATION_VALUE_SRF_LIST,
  QUANTIZATION_VALUE_VESSEL_LIST
} from "@/utils/constant";

defineOptions({
  name: "AdvanceSegSettings"
});

const advancedSegStore = useAdvancedSegStoreHook();

const quantizationValueList = ref(QUANTIZATION_VALUE_VESSEL_LIST);

const handleAlgorithmChange = (val: string) => {
  advancedSegStore.setAlgorithm(val);
  quantizationValueList.value =
    val == VesselEnum.CVV
      ? QUANTIZATION_VALUE_VESSEL_LIST
      : val == VesselEnum.CVI
      ? QUANTIZATION_VALUE_SRF_LIST
      : [];
  advancedSegStore.setOctLayer(val == VesselEnum.CVV ? 11 : 12);
  // 重置量化值选择第一项
  val == VesselEnum.CVV
    ? advancedSegStore.setQuantizationValue(VesselEnum.CVI)
    : advancedSegStore.setQuantizationValue(SRFEnum.SrfIndex);
  advancedSegStore.updateRecogonizedContentLayer();
  // 切换时需将原识别内容图删除，否则原图会存在
  const recogonizeDom = document.getElementsByClassName(
    "recogonize"
  )[0] as HTMLCanvasElement;
  recogonizeDom.style.display = "none";
  advancedSegStore.setQuantizeIndexName();
};

const handleQuanValChange = (val: string) => {
  advancedSegStore.setQuantizationValue(val);
  advancedSegStore.setQuantizeIndexName();
};
</script>
<style lang="scss" scoped>
.image-settings {
  display: flex;
  align-items: center;
  height: 100%;
}

.image-settings__item {
  display: flex;
  align-items: center;
  margin-right: 50px;

  &:last-child {
    margin-right: 20px;
  }

  .label {
    margin-right: 8px;
  }

  .select-list {
    width: 180px;
  }
}
</style>
