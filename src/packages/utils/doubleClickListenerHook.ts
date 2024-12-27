import { loadImage } from "./handleImage";
import { onMounted, onUnmounted, Ref } from "vue";
import { ELViewPort } from "../types";
import { ContainerNameEnum } from "@/enums";
import { enterFullScreen, exitFullScreen } from "@/utils/contextmenu";
import { useImageActionStoreHook } from "@/views/analysis/components/store/imageAction";
import {
  dblEnterMeasureDraw,
  dblSelectMeasureDraw,
  dblSaveMeasureDraw
} from "@/utils/tools/measureTools/index";

const MEASURE_CLASS_NAMES = ["Rulers", "Arrows", "Texts"];

interface DblclickOptions {
  target: Ref<ELViewPort>;
  componentName: ContainerNameEnum;
  cols?: number;
  rows?: number;
  offsetX?: number | { value: number };
  offsetY?: number | { value: number };
  spacing?: number[];
  dblClickCallback?: ({ x, y }: Point) => void;
}
let clickTimeout: number;
let isDoubleClick = false;
let startMouseX = 0;
let startMouseY = 0;
const useDoubleClick = ({
  target,
  componentName,
  cols = 0,
  rows = 0,
  offsetX = 0,
  offsetY = 0,
  spacing = [0, 0],
  dblClickCallback
}: DblclickOptions) => {
  const handleDoubleClick = (event: MouseEvent) => {
    const { x, y } = event;
    window.clearTimeout(clickTimeout); // Clear the timeout for the single click event
    isDoubleClick = true; // Set the flag for double click
    // Double click logic here
    console.log("Double Click");
    const viewportDom = target.value?.getViewportDom() as HTMLDivElement;
    // 测量尺编辑状态下，双击触发保存，如果双击在测量尺区域，选中当前区域
    const clickTarget = event.target as HTMLElement;
    const clickAreaClass = clickTarget?.getAttribute("class");
    if (window.isMeasureStatus) {
      if (clickAreaClass && MEASURE_CLASS_NAMES.includes(clickAreaClass)) {
        // 设置选中状态
        dblSelectMeasureDraw({ viewportDom, target: clickTarget, x, y });
      } else {
        // 测量行为结束，保存
        dblSaveMeasureDraw(viewportDom);
      }
    } else {
      if (clickAreaClass && MEASURE_CLASS_NAMES.includes(clickAreaClass)) {
        // 切换到测量尺编辑状态
        dblEnterMeasureDraw({ viewportDom, target: clickTarget, x, y });
      } else {
        [...viewportDom?.classList].includes("full-screen")
          ? exitFullScreen(viewportDom, componentName)
          : enterFullScreen(viewportDom, componentName);
      }
    }
  };
  const handleClick = (event: MouseEvent) => {
    // 设置一个延迟，在延迟时间内检查是否有双击事件发生
    isDoubleClick = false; // Reset the flag for the next click
    // Set a timeout for the single click event
    clickTimeout = window.setTimeout(function () {
      if (!isDoubleClick) {
        //  click locate to that point
        const [spaceX, spaceY] = spacing;
        // console.log({ cols, rows, offsetX, offsetY, spacing });
        const OFFSETX = typeof offsetX === "number" ? offsetX : offsetX.value;
        const OFFSETY = typeof offsetY === "number" ? offsetY : offsetY.value;
        if (componentName === ContainerNameEnum.FullScope) {
          const x = parseInt((event.offsetX - OFFSETX) / spaceX);
          const y = parseInt((event.offsetY - OFFSETY) / spaceY);
          dblClickCallback && dblClickCallback({ x, y });
        } else {
          if (
            event.offsetX >= OFFSETX &&
            event.offsetX <= OFFSETX + cols * spaceX &&
            event.offsetY >= OFFSETY &&
            event.offsetY <= OFFSETY + rows * spaceY
          ) {
            const x = parseInt((event.offsetX - OFFSETX) / spaceX);
            const y = parseInt((event.offsetY - OFFSETY) / spaceY);
            dblClickCallback && dblClickCallback({ x, y });
          }
        }
      }
    }, 300); // Adjust the delay as needed
  };
  const handleMousedown = (e: MouseEvent) => {
    if (e.button === 0) {
      // 检查是否为左键
      startMouseX = e.clientX;
      startMouseY = e.clientY;
    }
  };
  const handleMouseup = (e: MouseEvent) => {
    const imageActionStore = useImageActionStoreHook();
    if (e.button === 0) {
      const target = e.target as SVGElement;
      const isTarget = target.classList.contains("coordinates");
      // 测量尺编辑状态下，导航线不触发重定位
      if (
        !isTarget ||
        !imageActionStore.navigationLine ||
        window.isMeasureStatus
      )
        return;
      // 确定为左键
      const deltaX = e.clientX - startMouseX;
      const deltaY = e.clientY - startMouseY;
      const distance = deltaX * deltaX + deltaY * deltaY;
      if (distance > 200) return;
      //  click locate to that point
      handleClick(e);
    }
  };
  onMounted(() => {
    const viewportDom = target.value?.getViewportDom() as HTMLDivElement;
    if (viewportDom) {
      viewportDom.addEventListener("dblclick", handleDoubleClick);
      viewportDom.addEventListener("mousedown", handleMousedown);
      viewportDom.addEventListener("mouseup", handleMouseup);
      viewportDom.addEventListener("mouseout", handleMousedown);
    }
  });

  onUnmounted(() => {
    const viewportDom = target.value?.getViewportDom() as HTMLDivElement;
    if (viewportDom) {
      viewportDom.removeEventListener("dblclick", handleDoubleClick);
      viewportDom.removeEventListener("mousedown", handleMousedown);
      viewportDom.removeEventListener("mouseup", handleMouseup);
    }
  });
};

export default useDoubleClick;
