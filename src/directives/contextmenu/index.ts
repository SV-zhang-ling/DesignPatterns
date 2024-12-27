import type { Directive, DirectiveBinding, WatchStopHandle } from "vue";
import { useEventListener } from "@vueuse/core";
import { useContextmenuStoreHook } from "@/store/modules/contextmenu";
import { hideAllContextmenu } from "@/utils";
import { useContextMenu } from "@/hooks/useContextMenu";
import { rightClickSaveMeasureDraw } from "@/utils/tools/measureTools/index";

const contextmenuStore = useContextmenuStoreHook();

interface ElementType extends HTMLElement {
  _unwatch: WatchStopHandle;
}

let pressStartTime: number;

export const cxt: Directive = {
  mounted(el: ElementType, binding: DirectiveBinding) {
    const { value } = binding;
    if (!value) {
      return;
    }
    let startMouseX = 0;
    let startMouseY = 0;
    const handleRightClick = (event: MouseEvent) => {
      if (!window.isMeasureStatus) {
        const dx = event.clientX - startMouseX;
        const dy = event.clientY - startMouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 10) return;
        event.preventDefault();
        const { clientX, clientY } = event;
        const pos = {
          x: clientX,
          y: clientY
        };
        contextmenuStore.setPosition(pos);
        contextmenuStore.setTargetName(value);
      } else {
        const pressDuration = new Date().getTime() - pressStartTime;
        if (pressDuration < 300) {
          rightClickSaveMeasureDraw(el);
        }
      }
    };

    // bind right click handler
    useEventListener(el, "contextmenu", handleRightClick);

    // left click to hide all contextmenu
    useEventListener(
      document.body,
      "mousedown",
      (event: MouseEvent) => {
        startMouseX = event.clientX;
        startMouseY = event.clientY;
        // event.stopPropagation();
        const target = event.target as HTMLElement;
        const pNode = target.closest(".menu-item") as HTMLElement;
        if (pNode?.classList.contains("has-sub-menu")) {
          // no action when click the menu which has sub menus
          return;
        }
        if (window.isMeasureStatus) {
          pressStartTime = new Date().getTime();
        }
        hideAllContextmenu();
      },
      true
    );

    const { handleMenuClick } = useContextMenu();
    const unwatch = watch(
      () => contextmenuStore.activeMenu,
      () => {
        if (
          !contextmenuStore.activeMenu ||
          value !== contextmenuStore.targetName
        ) {
          return;
        }
        handleMenuClick({
          el,
          targetName: value,
          captureKey: el.dataset.captureKey ?? ""
        });
      },
      { immediate: true, deep: true }
    );

    el._unwatch = unwatch;
  },
  unmounted(el: ElementType) {
    if (el && el._unwatch) {
      el._unwatch();
    }
  }
};
