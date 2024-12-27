import { ElDisplayEnum } from "@/enums";

export function useImageActions() {
  const handleNavLineVisible = (visible: boolean) => {
    const crosshairs = document.querySelectorAll(".crosshair-path");
    for (let i = 0; i < crosshairs.length; i++) {
      const crossLine = crosshairs[i] as HTMLElement;
      crossLine.style.display = visible
        ? ElDisplayEnum.BLOCK
        : ElDisplayEnum.NONE;
    }
  };

  const handleScanLineVisible = (visible: boolean) => {
    const lines = document.querySelectorAll(".dashed-line");
    for (let i = 0; i < lines.length; i++) {
      const lineDom = lines[i] as HTMLElement;
      lineDom.style.display = visible
        ? ElDisplayEnum.BLOCK
        : ElDisplayEnum.NONE;
    }
  };

  const handleLayerVisible = (visible: boolean) => {
    const segmentations = document.querySelectorAll(".segmentation-path");
    for (let i = 0; i < segmentations.length; i++) {
      const segmentationDom = segmentations[i] as HTMLElement;
      segmentationDom.style.display = visible
        ? ElDisplayEnum.BLOCK
        : ElDisplayEnum.NONE;
    }
  };

  return {
    handleNavLineVisible,
    handleScanLineVisible,
    handleLayerVisible
  };
}
