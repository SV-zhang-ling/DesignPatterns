<template>
  <div class="image-settings__item seperate-label">
    <span class="label">{{ $t("analysis.upper") }}</span>
    <el-select
      v-model="layerForm.ceilingSurf"
      :disabled="disabled"
      @change="handleChange('upper')"
    >
      <el-option
        v-for="item in layerBorderList"
        :key="item.value"
        :value="item.value"
        :label="$t(item.labelKey)"
      />
    </el-select>
  </div>
  <div class="image-settings__item">
    <el-input
      v-model="layerForm.ceilingShift"
      type="text"
      :disabled="disabled"
      @input="validateCellingShiftInput"
      @change="handleChange"
    >
      <template #append>
        <span>μm</span>
      </template>
    </el-input>
    <el-button
      class="layer-adjust-btn add"
      :icon="ArrowUp"
      :disabled="disabled"
      plain
      @click="handleCeilingShiftUp"
    />
    <el-button
      class="layer-adjust-btn minus"
      :icon="ArrowDown"
      :disabled="disabled"
      plain
      @click="handleCeilingShiftDown"
    />
  </div>
  <div class="image-settings__item seperate-label">
    <span class="label">{{ $t("analysis.lower") }}</span>
    <el-select
      v-model="layerForm.floorSurf"
      :disabled="disabled"
      @change="handleChange('lower')"
    >
      <el-option
        v-for="item in layerBorderList"
        :key="item.value"
        :value="item.value"
        :label="$t(item.labelKey)"
      />
    </el-select>
  </div>
  <div class="image-settings__item">
    <el-input
      v-model="layerForm.floorShift"
      type="text"
      :disabled="disabled"
      @input="validateFloorShiftInput"
      @change="handleChange"
    >
      <template #append>
        <span>μm</span>
      </template>
    </el-input>
    <el-button
      class="layer-adjust-btn add"
      :icon="ArrowUp"
      :disabled="disabled"
      plain
      @click="handleFloorShiftUp"
    />
    <el-button
      class="layer-adjust-btn minus"
      :icon="ArrowDown"
      :disabled="disabled"
      plain
      @click="handleFloorShiftDown"
    />
  </div>
  <div class="image-settings__item">
    <span class="label">{{ $t("analysis.shiftLayer") }}</span>
    <div class="ajust-btn-group">
      <el-button
        class="layer-adjust-btn add"
        :icon="ArrowUp"
        :disabled="disabled"
        plain
        @click="handleBothShiftUp"
      />
      <el-button
        class="layer-adjust-btn minus"
        :icon="ArrowDown"
        :disabled="disabled"
        plain
        @click="handleBothShiftDown"
      />
    </div>
  </div>
  <div class="image-settings__item">
    <span class="label">{{ $t("common.resetText") }}</span>
    <el-button
      class="layer-adjust-btn reset"
      :icon="RefreshLeft"
      :disabled="disabled"
      plain
      @click="handleReset"
    />
  </div>
</template>
<script lang="ts" setup>
import { ArrowUp, ArrowDown, RefreshLeft } from "@element-plus/icons-vue";
import { debounce } from "xe-utils";

const REGEXP = /(?!^[-])[^0-9]/g;
const STEP = 5;
const MINUS_SIGN = "-";

defineOptions({
  name: "LayerAdjust"
});

interface Props {
  layerBorderList: LabelKeyValueType[];
  layerAttr: LayerAttrType;
  disabled?: boolean;
}

const props = defineProps<Props>();
const emits = defineEmits(["change", "reset"]);

let layerForm = reactive<LayerAttrType>({
  ceilingSurf: "",
  floorSurf: "",
  ceilingShift: "",
  floorShift: ""
});

watch(
  () => props.layerAttr,
  (layerAttr: LayerAttrType) => {
    layerForm = reactive({ ...layerAttr });
  },
  { immediate: true, deep: true }
);

const validateCellingShiftInput = (value: string) => {
  layerForm.ceilingShift = validate(value);
};

const validateFloorShiftInput = (value: string) => {
  layerForm.floorShift = validate(value);
};

const validate = (value: string) => {
  if (value === MINUS_SIGN) {
    return value;
  }
  return value.replace(REGEXP, "");
};

// handle layer selected
const handleChange = debounce((label?: string) => {
  if (
    String(layerForm.ceilingShift) === MINUS_SIGN ||
    String(layerForm.floorShift) === MINUS_SIGN
  )
    return;
  label === "upper" && (layerForm.ceilingShift = "0");
  label === "lower" && (layerForm.floorShift = "0");

  emits("change", layerForm);
}, 500);

const shiftValue = (num: string, type?: string) => {
  if (num === MINUS_SIGN) {
    num = "0";
  }

  if (type === "up") {
    return String(Number(num) - STEP);
  }

  return String(Number(num) + STEP);
};

const handleCeilingShiftUp = () => {
  layerForm.ceilingShift = shiftValue(layerForm.ceilingShift, "up");
  handleChange();
};

const handleCeilingShiftDown = () => {
  layerForm.ceilingShift = shiftValue(layerForm.ceilingShift);
  handleChange();
};

const handleFloorShiftUp = () => {
  layerForm.floorShift = shiftValue(layerForm.floorShift, "up");
  handleChange();
};

const handleFloorShiftDown = () => {
  layerForm.floorShift = shiftValue(layerForm.floorShift);
  handleChange();
};

const handleBothShiftUp = () => {
  layerForm.ceilingShift = shiftValue(layerForm.ceilingShift, "up");
  layerForm.floorShift = shiftValue(layerForm.floorShift, "up");
  handleChange();
};

const handleBothShiftDown = () => {
  layerForm.ceilingShift = shiftValue(layerForm.ceilingShift);
  layerForm.floorShift = shiftValue(layerForm.floorShift);
  handleChange();
};

const handleReset = () => {
  emits("reset");
};
</script>
<style lang="scss" scoped>
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
