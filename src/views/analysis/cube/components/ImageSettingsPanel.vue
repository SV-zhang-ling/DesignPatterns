<template>
  <div class="image-settings">
    <el-collapse v-model="activeNames">
      <sv-collapse-item :title="$t('analysis.showSetting')" name="showSetting">
        <div class="image-settings__item" v-if="!cubeStore.isAsCube">
          <span class="label">{{ $t("analysis.cscan") }}</span>
          <el-switch v-model="showCScan" @change="handleChange" />
        </div>
        <div class="image-settings__item seperate-label">
          <div class="label with-value">
            <span>{{ $t("analysis.structTransparency") }}</span>
            <span>{{ cubeStore.structTransparency }}%</span>
          </div>
          <el-slider
            v-model="cubeStore.structTransparency"
            :show-tooltip="false"
          />
        </div>
        <div class="image-settings__item">
          <el-button class="reseet-btn" plain @click="handleReset">
            <icon-svg name="restore" class="restore-icon" />
            {{ $t("common.restore") }}
          </el-button>
        </div>
      </sv-collapse-item>
    </el-collapse>
  </div>
</template>
<script lang="ts" setup>
import { useCubeStoreHook } from "../store/index";

defineOptions({
  name: "ImageSettingsPanel"
});

const cubeStore = useCubeStoreHook();
const activeNames = ref(["showSetting"]); // default expand all items
const showCScan = ref<boolean>(false);

const handleChange = (show: boolean) => {
  cubeStore.showCScan = show;
};

// Reset
const handleReset = () => {
  cubeStore.reset = true;
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

    .with-value {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
  }

  .reseet-btn {
    width: 100%;
    color: $font-main-color;

    &:hover {
      color: $font-main-color;
    }

    .restore-icon {
      margin-right: 12px;
    }
  }
}

::v-deep(.el-slider__runway) {
  background-color: $slider-bg-color;

  .el-slider__bar {
    background-color: $slider-bar-color;
  }

  .el-slider__button {
    width: 14px;
    height: 14px;
    border: none;
  }
}
</style>
