<script setup lang="ts">
import { unref, defineOptions } from "vue";
import { useRouter } from "vue-router";

defineOptions({
  name: "RedirectView"
});

const { currentRoute, replace } = useRouter();

const { params, query } = unref(currentRoute);
const { path } = params;

const _path = Array.isArray(path) ? path.join("/") : path;

replace({
  path: "/" + _path,
  query
});
</script>
