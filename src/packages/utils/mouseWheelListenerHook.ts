import { onMounted, onUnmounted, Ref } from "vue";
import { ELViewPort } from "../types";
interface MouseWheelOptions {
  target: Ref<ELViewPort>;
  downCallback: () => void;
  upCallback: () => void;
}
const useMouseWheel = ({
  target,
  downCallback,
  upCallback
}: MouseWheelOptions) => {
  const handleMouseWheel = (event: WheelEvent) => {
    if (event.ctrlKey) return;
    if (event.deltaY > 0) {
      downCallback();
    } else if (event.deltaY < 0) {
      upCallback();
    }
  };

  onMounted(() => {
    const viewportDom = target.value?.getViewportDom() as HTMLDivElement;
    if (viewportDom) {
      viewportDom.addEventListener("wheel", handleMouseWheel);
    }
  });

  onUnmounted(() => {
    const viewportDom = target.value?.getViewportDom() as HTMLDivElement;
    if (viewportDom) {
      viewportDom.removeEventListener("wheel", handleMouseWheel);
    }
  });
};

export default useMouseWheel;
