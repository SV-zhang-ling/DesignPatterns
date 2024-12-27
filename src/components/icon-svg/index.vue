<template>
  <img
    align="absmiddle"
    :src="require(`@/assets/icons/${name}.svg`)"
    :alt="name"
    v-bind="$attrs"
    @click="excute"
    :class="{ disabled }"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: "IconSvg"
});

interface Props {
  name: string;
  disabled?: boolean;
}

interface Emits {
  (e: "click"): void;
}

withDefaults(defineProps<Props>(), {
  name: ""
});
const emit = defineEmits<Emits>();

function excute() {
  emit("click");
}
</script>
