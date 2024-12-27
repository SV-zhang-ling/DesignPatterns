import { ref, onMounted, onBeforeUnmount } from "vue";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useEditLayersStoreHook } from "@/views/analysis/components/layers/store/editLayers";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";
import { stashEditSurface } from "@/utils/tools/segmentation/manualLayer";
import { useReportPrintStoreHook } from "@/views/analysis/components/store/report";

const useArrowKeysListener = (
  commitCrosshairPosition: ({ x, y }: { x?: number; y?: number }) => void,
  captureKey?: string
) => {
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
  const editLayersStore = useEditLayersStoreHook();
  const reportPrintStore = useReportPrintStoreHook();
  const direction = ref("");

  const handleKeyDown = async (event: KeyboardEvent) => {
    if (window.isMeasureStatus || reportPrintStore.reportDlgVisible) return;
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        direction.value = "Up";
        if (
          analysisMultipleCommonStore.activeCaptureCard &&
          analysisMultipleCommonStore.activeCaptureCard?.captureKey ===
            captureKey
        ) {
          // multiple
          const { activeCaptureCard } = analysisMultipleCommonStore;
          activeCaptureCard?.y > 0 &&
            commitCrosshairPosition({
              y: activeCaptureCard?.y - 1
            });
        } else if (editLayersStore.showEditLayerDig) {
          if (window.anchors.length > 0 || editLayersStore.isAsBorderEdit) {
            await stashEditSurface();
          }
          editLayersStore.y > 0 &&
            commitCrosshairPosition({ y: editLayersStore.y - 1 });
        } else if (!captureKey) {
          // single
          analysisCommonStore.y > 0 &&
            commitCrosshairPosition({ y: analysisCommonStore.y - 1 });
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        direction.value = "Down";
        if (
          analysisMultipleCommonStore.activeCaptureCard &&
          analysisMultipleCommonStore.activeCaptureCard?.captureKey ===
            captureKey
        ) {
          // multiple
          const { activeCaptureCard } = analysisMultipleCommonStore;
          activeCaptureCard?.y < activeCaptureCard.dim_slow - 1 &&
            commitCrosshairPosition({
              y: activeCaptureCard?.y + 1
            });
        } else if (editLayersStore.showEditLayerDig) {
          if (window.anchors.length > 0 || editLayersStore.isAsBorderEdit) {
            await stashEditSurface();
          }
          editLayersStore.y < analysisCommonStore.dim_slow - 1 &&
            commitCrosshairPosition({ y: editLayersStore.y + 1 });
        } else if (!captureKey) {
          // single
          analysisCommonStore.y < analysisCommonStore.dim_slow - 1 &&
            commitCrosshairPosition({ y: analysisCommonStore.y + 1 });
        }
        break;
      case "ArrowLeft":
        event.preventDefault();
        direction.value = "Left";
        if (
          analysisMultipleCommonStore.activeCaptureCard &&
          analysisMultipleCommonStore.activeCaptureCard?.captureKey ===
            captureKey
        ) {
          // multiple
          const { activeCaptureCard } = analysisMultipleCommonStore;
          activeCaptureCard?.x > 0 &&
            commitCrosshairPosition({
              x: activeCaptureCard?.x - 1
            });
        } else if (editLayersStore.showEditLayerDig) {
          editLayersStore.x > 0 &&
            commitCrosshairPosition({ x: editLayersStore.x - 1 });
        } else if (!captureKey) {
          // single
          analysisCommonStore.x > 0 &&
            commitCrosshairPosition({ x: analysisCommonStore.x - 1 });
        }
        break;
      case "ArrowRight":
        event.preventDefault();
        direction.value = "Right";
        if (
          analysisMultipleCommonStore.activeCaptureCard &&
          analysisMultipleCommonStore.activeCaptureCard?.captureKey ===
            captureKey
        ) {
          // multiple
          const { activeCaptureCard } = analysisMultipleCommonStore;
          activeCaptureCard?.x < activeCaptureCard.dim_fast - 1 &&
            commitCrosshairPosition({
              x: activeCaptureCard?.x + 1
            });
        } else if (editLayersStore.showEditLayerDig) {
          editLayersStore.x < analysisCommonStore.dim_fast - 1 &&
            commitCrosshairPosition({ x: editLayersStore.x + 1 });
        } else if (!captureKey) {
          // single
          analysisCommonStore.x < analysisCommonStore.dim_fast - 1 &&
            commitCrosshairPosition({ x: analysisCommonStore.x + 1 });
        }
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
