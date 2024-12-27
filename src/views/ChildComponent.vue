<template>
  <Suspense>
    <Child />
    <template #fallback> Loading... </template>
  </Suspense>
</template>

<script setup lang="ts"></script>
<style>
h1 {
  color: black;
}
</style>
