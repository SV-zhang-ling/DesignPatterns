<template>
  <div class="container">
    <div class="top" v-if="showTopTabs">
      <el-radio-group size="small" v-model="scope" @change="toggleScope">
        <el-radio-button :label="ContainerNameEnum.FullScope">
          {{ $t("analysis.fullScope") }}
        </el-radio-button>
        <el-radio-button :label="ContainerNameEnum.OCTScope">
          {{ $t("analysis.octScope") }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="middle">
      <FullScope
        v-if="scope === ContainerNameEnum.FullScope"
        :slo="slo"
        :oct="oct"
        :x="x"
        :y="y"
        :spacing="spacing"
        :processorsType="processorsType"
        :opacity="opacity"
        :commitCrosshairPosition="commitCrosshairPosition"
        :brightness="sloBrightness"
        :contrast="sloContrast"
        :setBrightnessContrast="setBrightnessContrast"
        v-bind="$attrs"
      />
      <OctScope
        v-else
        :slo="slo"
        :oct="oct"
        :x="x"
        :y="y"
        :spacing="spacing"
        :processorsType="processorsType"
        :opacity="opacity"
        :brightness="octBrightness"
        :contrast="octContrast"
        :commitCrosshairPosition="commitCrosshairPosition"
        :setBrightnessContrast="setBrightnessContrast"
        v-bind="$attrs"
      />
    </div>
    <div class="bottom" v-if="showOpacity">
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
import { ContextmenuTypeEnum, ContainerNameEnum } from "@/enums";
import FullScope from "./FullScope.vue";
import OctScope from "./OctScope.vue";
import { OCT_OPACITY_LIST } from "@/utils/constant";
import { handleResizeAtFullScope } from "@/utils/autoResize";
import { changeOctMeasureDraw } from "@/utils/tools/measureTools/index";
defineOptions({
  name: "SloOct"
});

const scope = ref<string | number | boolean>(ContainerNameEnum.FullScope);

const opacity = ref<number>(1);

interface imageParamsType {
  transform: number[];
  src: string;
  width: number;
  height: number;
}
interface Props {
  slo: imageParamsType;
  oct: imageParamsType;
  defaultOpacity?: number;
  x: number;
  y: number;
  spacing: number[];
  processorsType?: ContextmenuTypeEnum.Gray | ContextmenuTypeEnum.Inverse; // 图片处理器，接收一个mat,返回一个mat,可选
  commitCrosshairPosition: ({ x, y }: { x?: number; y?: number }) => void;
  showTopTabs?: boolean;
  showOpacity?: boolean;
  sloBrightness: number;
  sloContrast: number;
  octBrightness: number;
  octContrast: number;
  setBrightnessContrast: ({
    sloB,
    sloC,
    octB,
    octC
  }: {
    sloB?: number;
    sloC?: number;
    octB?: number;
    octC?: number;
  }) => void;
}

const props = withDefaults(defineProps<Props>(), {
  slo: () => ({ transform: [], src: "", width: 0, height: 0 }),
  oct: () => ({ transform: [], src: "", width: 0, height: 0 }),
  processorsType: ContextmenuTypeEnum.Gray,
  x: 0,
  y: 0,
  spacing: () => [],
  showTopTabs: true,
  showOpacity: true
});

watch(
  () => scope.value,
  async () => {
    await changeOctMeasureDraw();
  }
);
watch(
  () => props.defaultOpacity,
  (val: number | undefined) => {
    val !== undefined && (opacity.value = val);
  },
  {
    immediate: true
  }
);

const toggleScope = (scopeType: string | number | boolean) => {
  scope.value = scopeType;
  // 触发一次autosize
  handleResizeAtFullScope(scope.value as ContainerNameEnum);
};
</script>
<style scoped lang="scss">
.container {
  position: relative;
  height: 100%;
}

.top {
  height: 36px;
}

.middle {
  flex-grow: 1;
  height: calc(100% - 36px);
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
