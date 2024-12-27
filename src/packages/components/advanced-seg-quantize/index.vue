<template>
  <div class="container">
    <div class="main">
      <QuantizeScope
        v-if="scope === ContainerNameEnum.AdvancedSegQuantize"
        :algorithm="algorithm"
        :oct="oct"
        :quantize="quantize"
        :x="x"
        :y="y"
        :quantizeIndexName="quantizeIndexName"
        :brightness="quantizeBrightness"
        :contrast="quantizeContrast"
        :setBrightnessContrast="setBrightnessContrast"
        :opacity="opacity"
        :commitCrosshairPosition="commitCrosshairPosition"
        v-bind="$attrs"
      />
    </div>
    <div class="bottom">
      <div class="opacity-wrapper">
        <icon-svg name="opacity" />
        <el-select v-model="opacity">
          <el-option
            v-for="item in OCT_OPACITY_LIST"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ContainerNameEnum, AlgorithmEnum } from "@/enums";
import QuantizeScope from "./QuantizeScope.vue";
import { OCT_OPACITY_LIST } from "@/utils/constant";

defineOptions({
  name: "AdvancedSegQuantize"
});

export interface imageParamsType {
  transform: number[];
  src: string;
  width: number;
  height: number;
}
interface Props {
  algorithm: AlgorithmEnum;
  oct: imageParamsType;
  quantize: imageParamsType;
  x: number;
  y: number;
  commitCrosshairPosition: ({ x, y }: { x?: number; y?: number }) => void;
  quantizeBrightness: number;
  quantizeContrast: number;
  setBrightnessContrast: ({
    quantizeB,
    quantizeC
  }: {
    quantizeB?: number;
    quantizeC?: number;
  }) => void;
  quantizeIndexName: string;
}

defineProps<Props>();

const scope = ref<string | number | boolean>(
  ContainerNameEnum.AdvancedSegQuantize
);

const opacity = ref<number>(1);
</script>
<style scoped lang="scss">
.container {
  position: relative;
  height: 100%;
}

.main {
  display: flex;
  height: 100%;
}

.bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 99;

  .opacity-wrapper {
    display: flex;
    align-items: center;
    width: 110px;
    margin: 0 0 5px 15px;
  }

  ::v-deep(.el-select .el-select__wrapper) {
    background-color: transparent;
  }
}
</style>
