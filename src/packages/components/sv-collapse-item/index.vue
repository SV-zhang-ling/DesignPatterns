<template>
  <el-collapse-item v-bind="$attrs">
    <template #title>
      <span class="collapse-title">{{ title }}</span>
    </template>
    <slot></slot>
  </el-collapse-item>
</template>
<script lang="ts" setup>
/**
 * collapse item component
 */

defineOptions({
  name: "SvCollapseItem"
});

interface Props {
  title: string;
}

withDefaults(defineProps<Props>(), {
  title: ""
});
</script>
<style lang="scss">
.collapse-title {
  margin-left: 22px;
}
</style>
