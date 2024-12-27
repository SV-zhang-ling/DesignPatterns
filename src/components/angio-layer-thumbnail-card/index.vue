<template>
  <div class="angio-layer-thumbnail-card" @click="handleClicked">
    <section class="angio-layer-thumbnail-card__head">
      <!-- hide currently
         <el-checkbox @click.stop="handleCheckboxClicked" />
      -->
      <div class="layer">
        {{ layerLabel }}
      </div>
    </section>
    <section class="angio-layer-thumbnail-card__body">
      <general-image-viewer :src="src" @error="handleImageLoadError" />
    </section>
  </div>
</template>
<script lang="ts" setup>
/**
 * Angio layer thumbnail card component
 */
defineOptions({
  name: "AngioLayerThumbnailCard"
});

interface Props {
  src: string;
  layerLabel: string;
  layerType: string;
}

withDefaults(defineProps<Props>(), {
  src: "",
  layerLabel: "",
  layerType: ""
});

const emit = defineEmits(["select", "imageError"]);

// handle click
const handleClicked = () => {
  window.noLoadingMask = true;
  emit("select");
  nextTick(() => {
    window.noLoadingMask = false;
  });
};

// layer checkbox checked
// const handleCheckboxClicked = () => {
//   console.log("handleCheckboxClicked::", props.layerLabel);
// };

const handleImageLoadError = () => {
  emit("imageError");
};
</script>
<style lang="scss" scoped>
$card-header-bg-color: #3d3d3d;

.angio-layer-thumbnail-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 158px;
  height: 185px;
  cursor: pointer;
  border: 1px solid transparent;

  &:hover,
  &.active {
    border-color: $radio-active-color;

    .angio-layer-thumbnail-card__head {
      background-color: $table-row-highlight-color;
    }
  }
}

.angio-layer-thumbnail-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 27px;
  padding: 0 4px 0 7px;
  background-color: $card-header-bg-color;

  .layer {
    width: 88%;
    overflow: hidden;
    font-size: $font-size-middle;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.angio-layer-thumbnail-card__body {
  flex: 1;

  .general-image-viewer {
    // reset the styles of the general-image-viewer
    border: none;
  }
}
</style>
