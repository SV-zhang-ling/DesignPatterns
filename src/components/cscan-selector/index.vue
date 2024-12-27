<template>
  <div class="cscan-selector">
    <div class="label">CScan -</div>
    <el-select class="selector" v-model="selectedType" @change="handleChange">
      <el-option
        v-for="item in options"
        :key="item.value"
        :value="item.value"
        :label="$t(item.labelKey)"
      />
    </el-select>
  </div>
</template>
<script lang="ts" setup>
/**
 * Cscan dropdown selector
 */
defineOptions({
  name: "CscanSelector"
});

interface Props {
  options?: LabelKeyValueType[];
  defaultSelected: string;
}

const props = defineProps<Props>();

const selectedType = ref<string>(props.defaultSelected);

watch(
  () => props.defaultSelected,
  (selected: string) => {
    selectedType.value = selected;
  }
);

const emit = defineEmits(["change"]);

// handle selection change
const handleChange = (type: string) => {
  emit("change", type);
};
</script>
<style lang="scss" scoped>
$border-color: #19191a;
$card-header-bg-color: #2e2e2f;

.cscan-selector {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 10px 0 7px;
  background-color: $card-header-bg-color;

  .selector {
    width: 45%;
  }

  .label {
    margin-right: 8px;
  }

  ::v-deep(.el-divider) {
    border-left-color: $font-main-color;
  }
}
</style>
