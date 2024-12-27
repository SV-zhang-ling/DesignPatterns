import {
  initResizeObserver,
  disconnectResizeObserver
} from "@/utils/autoResize/asyncResize";

export function useResizeObserver() {
  onBeforeMount(() => {
    initResizeObserver();
  });

  onUnmounted(() => {
    disconnectResizeObserver();
  });
}
