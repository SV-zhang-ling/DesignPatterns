<template>
  <div class="angio-image-settings">
    <el-collapse v-model="activeNames">
      <sv-collapse-item :title="$t('analysis.layered')" name="layered">
        <el-select v-model="activeLayer" @change="handleChange">
          <el-option
            v-for="item in ANGIO_LAYER_THUMBNAIL_LIST"
            :key="item.value"
            :value="item.value"
            :label="$t(item.labelKey)"
          />
        </el-select>
      </sv-collapse-item>
    </el-collapse>
  </div>
</template>
<script lang="ts" setup>
import { useRoute } from "vue-router";
import { AnalysisModeEnum } from "@/enums";
import { ANGIO_LAYER_THUMBNAIL_LIST } from "@/utils/constant";
import { useMultipleAngioStoreHook } from "../store/index";

defineOptions({
  name: "ImageSettingsPanel"
});

const route = useRoute();
const multipleAngioStore = useMultipleAngioStoreHook();
const activeNames = ref(["layered"]); // default expand all items
const activeLayer = ref<string>("0");

const initActiveLayer = () => {
  const mode = route.query.m;
  activeLayer.value =
    mode === AnalysisModeEnum.OU
      ? multipleAngioStore.ouActiveLayer
      : multipleAngioStore.changeActiveLayer;
};

watch(
  () => route.query.m,
  () => {
    initActiveLayer();
  },
  {
    immediate: true
  }
);

// handle layer selected
const handleChange = (layer: string) => {
  const { m } = route.query;
  const item = ANGIO_LAYER_THUMBNAIL_LIST.find(x => x.value === layer);
  if (m === AnalysisModeEnum.OU) {
    multipleAngioStore.ouActiveLayer = layer;
    item && (multipleAngioStore.ouActiveLayerName = item?.name);
    multipleAngioStore.setAngioLayer();
    return;
  }
  multipleAngioStore.changeActiveLayer = layer;
  item && (multipleAngioStore.changeActiveLayerName = item?.name);
  multipleAngioStore.setAngioLayer();
};
</script>
<style lang="scss" scoped>
.angio-image-settings {
  position: relative;
  height: 100%;
}
</style>
