<template>
  <div
    :class="isBscan ? 'b-c-info' : 'brightness-contrast-info'"
    v-if="showBcInfo"
  >
    <div class="info-item icon">
      <icon-svg name="reset" class="reset-icon" @click="handleResetBc" />
    </div>
    <div class="info-item brightness">
      <span class="label">{{ $t("analysis.brightness") }}:</span>
      <span class="value">{{ Number(brightness.toFixed(0)) }}</span>
    </div>
    <div class="info-item contrast">
      <span class="label">{{ $t("analysis.contrast") }}:</span>
      <span class="value">{{ Number(contrast.toFixed(0)) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "BrightnessContrastCard"
});

interface Props {
  brightness: number;
  contrast: number;
  isBscan?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  brightness: 0,
  contrast: 0,
  isBscan: false
});

const emit = defineEmits(["handleResetBc"]);

const showBcInfo = computed(
  () =>
    Math.abs(Number(props.brightness.toFixed(0))) !== 0 ||
    Math.abs(Number(props.contrast.toFixed(0))) !== 0
);

const handleResetBc = () => {
  emit("handleResetBc");
};
</script>

<style scoped lang="scss">
.brightness-contrast-info {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: normal;
  line-height: 18px;
  color: #fff;
  text-align: right;
  user-select: none;
}

.b-c-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.info-item {
  &.icon {
    cursor: pointer;
  }

  &.icon,
  &.brightness {
    margin-right: 4px;
  }
}
</style>
