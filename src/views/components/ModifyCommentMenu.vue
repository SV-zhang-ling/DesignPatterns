<template>
  <div class="modify-comment-menu contextmenu" ref="commentMenuRef">
    <div class="modify-comment-menu__item" @mousedown.stop="handleClick">
      {{ $t("common.modifyComment") }}
    </div>
  </div>
</template>
<script lang="ts" setup>
const CommentMenuWidth = 217;
const CommentMenuHeight = 48;

defineOptions({
  name: "ModifyCommentMenu"
});

interface Props {
  position: Point;
}

const props = defineProps<Props>();
const commentMenuRef = ref<Element | null>(null);

const onShow = async () => {
  const commentMenuRefDom = commentMenuRef.value as HTMLDivElement;
  if (!commentMenuRefDom) {
    return;
  }

  const { width, height } = document.body.getBoundingClientRect();
  const left =
    props.position.x + CommentMenuWidth > width
      ? width - CommentMenuWidth
      : props.position.x;
  const top =
    props.position.y + CommentMenuHeight > height
      ? height - CommentMenuHeight
      : props.position.y;
  commentMenuRefDom.style.display = "block";
  commentMenuRefDom.style.left = `${left}px`;
  commentMenuRefDom.style.top = `${top}px`;
};

watch(
  () => props.position,
  () => {
    onShow();
  },
  {
    immediate: true,
    deep: true
  }
);

const emits = defineEmits(["edit"]);
// handle menu clicked
const handleClick = () => {
  emits("edit");
};
</script>
<style lang="scss" scoped>
$menu-container-width: 217px;
$menu-height: 32px;

.modify-comment-menu {
  position: absolute;
  z-index: 1000;
  display: none;
  width: $menu-container-width;
  padding: 8px;
  background-color: $dialog-bg-color;
}

.modify-comment-menu__item {
  height: $menu-height;
  padding: 0 20px;
  line-height: $menu-height;
  cursor: pointer;

  &:hover {
    background-color: $highlight-color;
  }
}
</style>
