<template>
  <div class="bscan-direction">
    <span class="direction">{{ oculusType === "OD" ? "T" : "N" }}</span>
    <span class="bscan-direction__box">
      <icon-svg class="arrow" name="arrow-right" :style="`rotate: ${deg}deg`" />
    </span>
    <span class="direction">{{ oculusType === "OD" ? "N" : "T" }}</span>
  </div>
</template>
<script lang="ts" setup>
/**
 * BScan direction component
 */
defineOptions({
  name: "BscanDirection"
});

interface Props {
  deg: number;
  oculusType: string;
}

defineProps<Props>();
</script>
<style lang="scss" scoped>
.bscan-direction {
  position: relative;
  display: flex;
  align-items: center;

  .bscan-direction__box {
    width: 15px;
    height: 15px;
    padding: 1px;
    // padding-left: 4px;
    margin: 0 5px;
    border: 1px solid $font-main-color;
    box-shadow: inset 2px 1px $border-color-dark, 2px 1px $border-color-dark;

    .arrow {
      position: relative;
      top: 3px;
      left: 1px;
    }
  }

  .direction {
    text-shadow: 2px 1px $border-color-dark;
  }
}
</style>
