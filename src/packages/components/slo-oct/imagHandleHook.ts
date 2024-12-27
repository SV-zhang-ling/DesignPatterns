import { ref, onMounted, onUnmounted, Ref } from "vue";

interface MousePosition {
  x: Ref<number>;
  y: Ref<number>;
}

export default function useImagHandleHook(): MousePosition {
  const x = ref(0);
  const y = ref(0);

  const updateMouse = (e: MouseEvent) => {
    x.value = e.pageX;
    y.value = e.pageY;
  };

  onMounted(() => {
    document.addEventListener("click", updateMouse);
  });

  onUnmounted(() => {
    document.removeEventListener("click", updateMouse);
  });

  return { x, y };
}