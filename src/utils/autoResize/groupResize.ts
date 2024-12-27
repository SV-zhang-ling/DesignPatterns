/**
 * 这三个类型只在auto room下用于区分对齐图和自动对齐图
 * ref: 下参考的目标元素，一般是血流投射图
 * align: 自动对齐的元素，一般是自动对齐图
 * other: 其他元素
 */
import { ContainerNameEnum } from "@/enums";
import { updateBscanZoomRuler } from "@/utils/tools/bscanZoomRuler";

interface innerContainerSize {
  innerWidth: number;
  innerHeight: number;
}
interface innerContainer extends innerContainerSize {
  innerContainerDom: HTMLDivElement;
}
interface resizeParams extends innerContainer {
  viewportDom: HTMLDivElement;
  componentName: ContainerNameEnum;
  captureKey: string;
}
interface groups {
  refEl?: HTMLElement;
  alignEls?: HTMLElement[];
  otherEls?: HTMLElement[];
}

interface Data {
  ref?: resizeParams;
  align?: resizeParams;
}

type GroupResizeTargetMap = {
  [key: string]: Data;
};
const getAlignType = (componentName: string) =>
  componentName === "SlowBScanMain" ? "align" : "ref";
const GroupResizeTarget: GroupResizeTargetMap = {};
export const addGroupResizeTarget = (target: resizeParams) => {
  // resizeTargets.set(componentName, payload);
  const { captureKey, componentName } = target;
  const type = getAlignType(componentName);
  if (!GroupResizeTarget[captureKey]) {
    GroupResizeTarget[captureKey] = {};
  }
  GroupResizeTarget[captureKey][type] = target;
};
interface GroupResizeObserverParams {
  groupBox: HTMLElement;
  captureKey: string;
}

class GroupResizeObserver {
  private groupBox: HTMLElement; // 存储需要监听的 DOM 元素数组
  private observer: ResizeObserver; // 创建 ResizeObserver 实例
  private captureKey: string; // 创建 ResizeObserver 实例

  constructor({ groupBox, captureKey }: GroupResizeObserverParams) {
    this.groupBox = groupBox;
    this.captureKey = captureKey;
    this.observer = new ResizeObserver(entries => this.onResize(entries));
    this.init();
  }

  private init(): void {
    if (!this.groupBox) return;

    // 为groupBox元素添加观察
    this.observer.observe(this.groupBox);

    // 初始调整
    this.adjustElement();
  }

  private onResize(entries: ResizeObserverEntry[]): void {
    // 当观察到变化时，调整元素
    this.adjustElement();
  }

  private adjustElement(): void {
    // 这里可以添加自适应调整的逻辑
    if (!GroupResizeTarget[this.captureKey]) return;
    const { ref, align } = GroupResizeTarget[this.captureKey];
    if (ref) {
      handleResize({ ...ref, captureKey: this.captureKey });
    }
    if (align) {
      handleResize({ ...align, captureKey: this.captureKey });
    }
  }
}
const handleResize = ({
  viewportDom,
  innerContainerDom,
  innerWidth,
  innerHeight,
  componentName,
  captureKey
}: resizeParams) => {
  if (!viewportDom) return;
  const contentRect = viewportDom.getBoundingClientRect();
  const { width, height, top, bottom } = contentRect;
  const outerRatio: number = width / height; //外部容器宽高比
  const innerRation: number = innerWidth / innerHeight; //内部容器宽高比
  // 根据内外宽高比的大小选择不同的缩放基准和定位策略
  const scaleRatio: number =
    outerRatio > innerRation ? height / innerHeight : width / innerWidth;
  innerContainerDom.style.scale = "1";
  // resizeInnerContainer
  innerContainerDom.style.left = (width - innerWidth) / 2 + "px";
  const cachedTop = (height - innerHeight) / 2;
  innerContainerDom.style.top = cachedTop + "px";
  innerContainerDom.style.transform = `scale(${scaleRatio})`;
  componentName.toLocaleLowerCase().indexOf("bscan") > -1 &&
    updateBscanZoomRuler(innerContainerDom, componentName, captureKey);
};
// image viewer 全屏/退出全屏时，再resize一次
export const handleGroupResizeAtFullScreen = (
  componentName: ContainerNameEnum,
  fullScreen: boolean,
  captureKey: string
) => {
  const type = getAlignType(componentName);
  const targets = GroupResizeTarget[captureKey];
  const target = targets[type] as resizeParams;
  if (target) {
    handleResize(target);
  }
};
export const resetGroupResizeView = (
  el: HTMLElement,
  componentName: ContainerNameEnum,
  captureKey: string
) => {
  const type = getAlignType(componentName);
  const targets = GroupResizeTarget[captureKey];
  if (!targets) return;
  const target = targets[type] as resizeParams;
  if (target) {
    handleResize(target);
  }
};
export default GroupResizeObserver;
