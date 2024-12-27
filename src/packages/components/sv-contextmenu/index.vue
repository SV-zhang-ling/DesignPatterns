<template>
  <Teleport to="body">
    <div class="contextmenu-container contextmenu" ref="angioMenuRef">
      <template v-for="item in contextmenuStore.menuList" :key="item.name">
        <div
          v-show="item.visible"
          :class="menuItemClass(item)"
          @mousedown.stop="handleClick(item)"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <span class="check-icon">
            <icon-svg
              v-show="item.showActive && item.active"
              name="check-active"
            />
            <icon-svg v-if="item.icon" :name="item.icon" />
          </span>
          <span class="menu-label">
            {{ item.label }}
          </span>

          <el-icon v-show="hasSubMenu(item)" class="more-icon">
            <CaretRight />
          </el-icon>
          <div v-show="hasSubMenu(item)" class="sub-menu-item-wrapper">
            <div
              v-for="subItem in item.children"
              :key="subItem.name"
              class="menu-item"
              @mousedown.stop="handleClick(subItem, item.children)"
            >
              <span class="check-icon">
                <icon-svg
                  v-show="subItem.showActive && subItem.active"
                  name="check-active"
                />
              </span>
              <span class="menu-label">{{ subItem.label }}</span>
            </div>
          </div>
        </div>
        <div v-show="item.divided" class="divider"></div>
      </template>
    </div>
  </Teleport>
</template>
<script lang="ts" setup>
import { CaretRight } from "@element-plus/icons-vue";
import { useContextmenuStore } from "@/store/modules/contextmenu";

defineOptions({
  name: "SvContextmenu"
});

interface POSITION {
  top: number;
  left: number;
}

const contextmenuStore = useContextmenuStore();

const position = reactive<POSITION>({
  top: 0,
  left: 0
});

watch(
  () => contextmenuStore.position,
  async value => {
    if (!value) {
      return;
    }

    await nextTick();
    position.top = value.y;
    position.left = value.x;
    onShow();
  },
  {
    deep: true,
    immediate: true
  }
);

const angioMenuRef = ref<Element | null>(null);

const hasSubMenu = computed(() => {
  return (menuItem: ContextmenuItem) => menuItem.children?.length;
});

const menuItemClass = computed(() => {
  return (menuItem: ContextmenuItem) => [
    "menu-item",
    menuItem.children?.length ? "has-sub-menu" : ""
  ];
});

const onShow = () => {
  const menuRefDom = angioMenuRef.value as HTMLElement;
  menuRefDom.style.display = "block";
  menuRefDom.style.left = `${getLeft()}px`;
  menuRefDom.style.top = `${getTop()}px`;
};

const getLeft = () => {
  const bodyRect = document.body.getBoundingClientRect();
  const menuRect = getMenuRect();
  const leftDis = position.left + menuRect.width;
  if (leftDis >= bodyRect.width) {
    return position.left - menuRect.width;
  }
  return position.left;
};

const getTop = () => {
  const bodyRect = document.body.getBoundingClientRect();
  const menuRect = getMenuRect();
  const topDis = position.top + menuRect.height;
  if (topDis >= bodyRect.height) {
    return position.top - menuRect.height;
  }
  return position.top;
};

const getMenuRect = () => {
  const menuRefDom = angioMenuRef.value as HTMLElement;
  return menuRefDom.getBoundingClientRect();
};

const handleMouseEnter = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const subMenuEl = target?.querySelector(".sub-menu-item-wrapper");
  if (!subMenuEl) {
    return;
  }

  const bodyRect = document.body.getBoundingClientRect();
  const subMenuDom = subMenuEl as HTMLElement;
  subMenuDom.style.display = "block";
  const menuRect = getMenuRect();
  const subMenuRect = subMenuDom.getBoundingClientRect();
  const subMenuLeft = position.left + menuRect.width + subMenuRect.width;
  const subLeft =
    subMenuLeft > bodyRect.width ? -subMenuRect.width : menuRect.width;
  subMenuDom.style.left = `${subLeft}px`;
};

const handleMouseLeave = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const subMenuEl = target?.querySelector(".sub-menu-item-wrapper");
  subMenuEl && ((subMenuEl as HTMLElement).style.display = "none");
};

// handle menu clicked
const handleClick = (
  item: ContextmenuItem,
  subItemList?: ContextmenuItem[] | undefined
) => {
  if (item.children) {
    // has sub menu, itself can't be clicked
    return;
  }

  subItemList?.forEach((subItem: ContextmenuItem) => (subItem.active = false));
  item.active = !item.active;
  contextmenuStore.setActiveMenu(item);
};
</script>
<style lang="scss" scoped>
$menu-height: 32px;

.contextmenu-container {
  position: absolute;
  z-index: 9999;
  display: none;
  padding: 8px 0;
  background-color: $dialog-bg-color;
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  height: $menu-height;
  padding: 0 16px;
  line-height: $menu-height;
  cursor: pointer;

  .menu-label {
    padding-right: 36px;
  }

  &:hover {
    background-color: $highlight-color;
  }

  .check-icon {
    width: 20px;
    margin-right: 8px;
  }
}

.has-sub-menu {
  position: relative;

  .more-icon {
    position: absolute;
    right: 32px;
  }

  .sub-menu-item-wrapper {
    position: absolute;
    top: -8px;
    display: none;
    padding: 8px 0;
    background-color: $dialog-bg-color;

    .menu-label {
      width: max-content;
      padding-right: 20px;
    }
  }
}

.divider {
  margin: 8px 0;
  border-bottom: 1px solid $divide-light-color;
}
</style>
