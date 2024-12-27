import { ref, onMounted, onBeforeUnmount } from "vue";
import { PageRoute } from "@/utils/route";
import router from "@/router";
import { useMultipleLineScanStoreHook } from "@/views/analysis/lineScan/multiple/store";
import { useReportPrintStoreHook } from "@/views/analysis/components/store/report";
import { KeydownEnum } from "@/enums";

const useArrowKeysListener = (
  arrowDown: () => void,
  arrowUp: () => void,
  key?: string
) => {
  const direction = ref("");

  const handleKeyDown = (event: KeyboardEvent) => {
    const { path } = router.currentRoute.value;
    const multipleLineScanStore = useMultipleLineScanStoreHook();
    const reportPrintStore = useReportPrintStoreHook();
    if (window.isMeasureStatus || reportPrintStore.reportDlgVisible) return;

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        direction.value = "Up";
        if (path === PageRoute.MultipleLineScan) {
          multipleLineScanStore.setActiveSliceByKeydown(KeydownEnum.UP, key);
          return;
        }
        arrowUp();
        break;
      case "ArrowDown":
        event.preventDefault();
        direction.value = "Down";
        if (path === PageRoute.MultipleLineScan) {
          multipleLineScanStore.setActiveSliceByKeydown(KeydownEnum.DOWN, key);
          return;
        }
        arrowDown();
        break;
      default:
        direction.value = "";
        break;
    }
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  return { direction };
};

export default useArrowKeysListener;
