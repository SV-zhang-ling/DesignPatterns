<template>
  <div class="bscan-thumbnail-card" @click="handleClicked">
    <!-- <section class="bscan-thumbnail-card__header">
      <el-checkbox @click.stop="handleCheckboxClicked" />
    </section> -->
    <section class="bscan-thumbnail-card__body">
      <general-image-viewer :src="src" />
    </section>
    <section class="bscan-thumbnail-card__footer">
      <div class="footer-wrapper">
        <span>{{ index + 1 }}</span>
        <bscan-direction
          :oculusType="oculusType"
          :deg="isStar ? index * arrowDeg - 90 : arrowDeg"
        />
      </div>
    </section>
  </div>
</template>
<script lang="ts" setup>
/**
 * BScan thumbnail card component
 */
defineOptions({
  name: "BscanThumbnailCard"
});

interface Props {
  src: string;
  index: number;
  oculusType: string;
  arrowDeg: number;
  width: number;
  height: number;
  transform: number[];
  isStar: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  src: "",
  index: 1
});

const emit = defineEmits(["select", "imageError"]);

// handle click
const handleClicked = () => {
  emit("select", props.index);
};

// layer checkbox checked
// const handleCheckboxClicked = () => {
//   console.log("handleCheckboxClicked::", props.index);
// };
</script>
<style lang="scss" scoped>
$card-header-bg-color: #3d3d3d;

.bscan-thumbnail-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 186px;
  height: 128px;
  color: $font-highlight-color;
  text-shadow: 2px 1px $border-color-dark;
  cursor: pointer;
  border: 1px solid $divide-light-color;
  border-radius: $base-border-radius;

  &:hover,
  &.active {
    border-color: $radio-active-color;

    .angio-layer-thumbnail-card__head {
      background-color: $table-row-highlight-color;
    }
  }
}

.bscan-thumbnail-card__header {
  position: absolute;
  right: 5px;
  height: 27px;
}

.bscan-thumbnail-card__body {
  flex: 1;

  .general-image-viewer {
    // reset the styles of the general-image-viewer
    border: none;
  }
}

.bscan-thumbnail-card__footer {
  position: absolute;
  bottom: 8px;
  width: 100%;

  .footer-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 8px;
  }
}
</style>
