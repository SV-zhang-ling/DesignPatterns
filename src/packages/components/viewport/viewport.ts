// import { isAutoRoomBScan, isBScan } from "@/utils/autoResize";
// import { isAutoRoomBScan as isLineScanAutoRoomBScan } from "@/utils/autoResize/asyncResize";
import { getCustomTagName } from "@/utils/customElementAttr";
import { ContainerNameEnum } from "@/enums";
import { ManualLayerToolEnum } from "@/enums";
import { useManualLayerToolStoreHook } from "@/views/analysis/components/layers/store/manualLayerTool";
import { useContextMenu } from "@/hooks/useContextMenu";
import { updateBscanZoomRuler } from "@/utils/tools/bscanZoomRuler";

export const toolStatus = (type: ManualLayerToolEnum) => {
  const manualLayerToolStore = useManualLayerToolStoreHook();
  return manualLayerToolStore.activeType === type;
};
// 拖拽封装
export const drag = (el: HTMLDivElement) => {
  let origX: number,
    origY: number,
    mouseX: number,
    mouseY: number,
    offsetX = 0,
    offsetY = 0;
  let startMouseX = 0;
  let startMouseY = 0;
  let isDragging = false;

  el.addEventListener("mousedown", function (e: MouseEvent) {
    const customTagName = getCustomTagName(el);
    const isManualBscan = customTagName === ContainerNameEnum.ManualBscan;
    if (isManualBscan && !toolStatus(ManualLayerToolEnum.Drag)) return;
    // const isBscanType = isBScan(customTagName as ContainerNameEnum);
    if (e.button === 0) {
      startMouseX = e.clientX;
      startMouseY = e.clientY;
      e.preventDefault();
      const hasZoom = window.getComputedStyle(el).scale !== "1";
      if (
        hasZoom ||
        isManualBscan ||
        (!hasZoom && customTagName === ContainerNameEnum.LineScanSLO)
      ) {
        isDragging = true;
        origX = el.offsetLeft;
        origY = el.offsetTop;
        mouseX = e.clientX;
        mouseY = e.clientY;
      }
      document.addEventListener("mousemove", function (e: MouseEvent) {
        if (!isDragging) return;
        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;
        const distance = dx * dx + dy * dy;
        if (distance < 100) return;
        offsetX = e.clientX - mouseX;
        offsetY = e.clientY - mouseY;

        // if (isAutoRoomBScan && isBscanType) {
        //   el.style.top = origY + offsetY + "px";
        //   return;
        // }
        el.style.top = origY + offsetY + "px";
        el.style.left = origX + offsetX + "px";
      });
    }
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
  });
  document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });
};

// 视图组件放大封装
export const zoom = (
  zoomableDiv: HTMLDivElement,
  componentName?: ContainerNameEnum,
  captureKey?: string
) => {
  // 监听整个文档的 wheel 事件
  document.addEventListener(
    "wheel",
    function (event) {
      // 检查是否按下了 Ctrl 键
      if (event.ctrlKey) {
        event.preventDefault(); // 阻止默认行为
      }
    },
    { passive: false } // 设置 passive 为 false 以确保 preventDefault() 被调用
  );
  // return;

  let isMouseDown = false;
  // let lastMouseX = 0;
  let lastMouseY = 0;
  let lastScale = 1;
  let baseLeft = 0;
  let baseTop = 0;
  let width = 0;
  let height = 0;
  let startMouseX = 0;
  let startMouseY = 0;
  let centerX = 0;
  let centerY = 0;
  let transformScale = 1;
  zoomableDiv.addEventListener("mousedown", e => {
    const customTagName = getCustomTagName(zoomableDiv);
    const isManualBscan = customTagName === ContainerNameEnum.ManualBscan;
    if (isManualBscan && !toolStatus(ManualLayerToolEnum.Zoom)) return;
    const boundingButton = isManualBscan ? 0 : 2;
    if (e.button === boundingButton) {
      // 检查是否为右键
      isMouseDown = true;
      // lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      // 初始缩放比例 为当前dom比例
      const zoomDivStyle = window.getComputedStyle(zoomableDiv);
      lastScale = Number(zoomDivStyle.scale);
      width = parseFloat(zoomDivStyle.width);
      height = parseFloat(zoomDivStyle.height);
      baseLeft = parseFloat(zoomDivStyle.left);
      baseTop = parseFloat(zoomDivStyle.top);
      const matches = window
        .getComputedStyle(zoomableDiv)
        .transform.match(/[-+]?[0-9]*\.?[0-9]+/g);
      const svgDom = zoomableDiv.querySelector(".coordinates") as HTMLElement;
      const offsetLeft = parseFloat(svgDom.style.left);
      const offsetTop = parseFloat(svgDom.style.top);
      transformScale = matches && matches[0] ? Number(matches[0]) : 1;
      startMouseX = e.clientX;
      startMouseY = e.clientY;
      centerX = offsetLeft ? e.offsetX + offsetLeft : e.offsetX;
      centerY = offsetTop ? e.offsetY + offsetTop : e.offsetY;
    }
    // }
  });
  const zoomHandler = (e: MouseEvent) => {
    if (isMouseDown) {
      const dx = e.clientX - startMouseX;
      const dy = e.clientY - startMouseY;
      const distance = dx * dx + dy * dy;
      if (distance < 100) return;
      // const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;

      /**
       * 限制缩放比例范围
       * 调整 最小缩放值为1.001 避免缩放为1时，无法移动组件的问题，这是一个临时
       * 解决方案，后期会根据浏览器交互特点深入优化
       */
      const customTagName = getCustomTagName(zoomableDiv) as ContainerNameEnum;
      // 暂时定制化微调线扫slo可以缩放到0.5保障看到全部扫描范围，后期根据实际范围限制
      const minScale =
        customTagName === ContainerNameEnum.LineScanSLO
          ? 0.5
          : customTagName === ContainerNameEnum.ManualBscan
          ? 0.85
          : 1.001;
      const scaleDelta = deltaY * -0.01; // 根据移动距离调整缩放比例
      const newScale = lastScale + scaleDelta;
      const scale = Math.min(Math.max(minScale, newScale), 8);
      // 应用缩放
      zoomableDiv.style.scale = String(scale);
      componentName &&
        componentName.toLocaleLowerCase().indexOf("bscan") > -1 &&
        updateBscanZoomRuler(zoomableDiv, componentName, captureKey);
      if (scale >= lastScale) {
        zoomableDiv.style.left = `${
          baseLeft -
          (centerX - width / 2) * (scale - lastScale) * transformScale
        }px`;
        zoomableDiv.style.top = `${
          baseTop -
          (centerY - height / 2) * (scale - lastScale) * transformScale
        }px`;
      } else {
        zoomableDiv.style.left = `${
          baseLeft +
          (centerX - width / 2) * (lastScale - scale) * transformScale
        }px`;
        zoomableDiv.style.top = `${
          baseTop +
          (centerY - height / 2) * (lastScale - scale) * transformScale
        }px`;
      }
    }
  };
  document.addEventListener("mousemove", zoomHandler);

  document.addEventListener("mouseup", e => {
    const customTagName = getCustomTagName(zoomableDiv);
    const isManualBscan = customTagName === ContainerNameEnum.ManualBscan;
    const boundingButton = isManualBscan ? 0 : 2;
    if (e.button === boundingButton) {
      // 检查是否为右键
      isMouseDown = false;
    }
  });
  // 阻止 Ctrl + 鼠标滚轮的默认行为
  document.addEventListener(
    "wheel",
    e => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    },
    { passive: false } // 设置 passive 为 false 以确保 preventDefault() 被调用
  );
  zoomableDiv.addEventListener("mouseout", function () {
    zoomableDiv.removeEventListener("mousemove", zoomHandler);
  });
};

interface innerContainerSize {
  innerWidth: number;
  innerHeight: number;
}
interface innerContainer extends innerContainerSize {
  innerContainerDom: HTMLDivElement;
}

// 初始化innerContainer宽高
export const initInnerContainer = (size: innerContainer) => {
  const { innerContainerDom, innerWidth, innerHeight } = size;
  innerContainerDom.style.width = innerWidth + "px";
  innerContainerDom.style.height = innerHeight + "px";
};
