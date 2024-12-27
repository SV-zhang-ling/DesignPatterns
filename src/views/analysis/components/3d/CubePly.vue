<template>
  <div class="three-dimension-container">
    <img
      v-if="showLoading"
      class="loading"
      src="@/assets/images/page-loading.gif"
      width="60"
    />
    <div ref="cubeContainer" class="cube-container"></div>
  </div>
</template>
<script setup lang="ts">
import { ElNotification } from "element-plus";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { VueI18n } from "@/locales/i18n";
import router from "@/router";
import { PageRoute } from "@/utils/route";
import { OculusTypeEnum } from "@/enums";

const MINI_VIEWPORT_WIDTH = 85;
const MINI_VIEWPORT_HEIGHT = 85;

interface Props {
  transparency: number;
  needReset: boolean;
  screenshotTaking?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  transparency: 4,
  needReset: false
});

const emits = defineEmits(["reset", "screenshot"]);

const analysisCommonStore = useAnalysisCommonStoreHook();
const showLoading = ref<boolean>(true);
const cubeContainer = ref<HTMLElement | null>(null);
const pointsMaterial = ref<THREE.PointsMaterial | null>(null);

let sceneWidth: number;
let sceneHeight: number;

let scene: THREE.Scene | null = null;
let mainCamera: THREE.PerspectiveCamera | null = null;
let mainControls: OrbitControls | null = null;
let renderer: THREE.WebGLRenderer | null = null;

let miniScene: THREE.Scene | null = null;
let miniCamera: THREE.PerspectiveCamera | null = null;
let miniControls: OrbitControls | null = null;

// 保存初始状态
const initialPosition = ref<THREE.Vector3 | null>(null);
const initialTarget = ref();
const initialMiniPosition = ref<THREE.Vector3 | null>(null);
const initialMiniTarget = ref();

const isAsCube = computed(
  () => router.currentRoute.value.path === PageRoute.AsCube
);

const isOD = computed(
  () => analysisCommonStore.oculusType === OculusTypeEnum.OD
);

const initCube = () => {
  if (!cubeContainer.value) return;

  sceneWidth = cubeContainer.value.offsetWidth;
  sceneHeight = cubeContainer.value.offsetHeight;

  scene = new THREE.Scene();
  mainCamera = new THREE.PerspectiveCamera(
    15,
    sceneWidth / sceneHeight,
    1000,
    2000000
  );

  const { spacingX_um, spacingY_um, dim_fast, dim_slow } = analysisCommonStore;
  const ADJUST_VAL = isAsCube.value ? 11 : 5.5;
  const pos =
    Math.sqrt(
      Math.pow((spacingX_um * dim_fast) / 2, 2) +
        Math.pow((spacingY_um * dim_slow) / 2, 2)
    ) * ADJUST_VAL;
  mainCamera.position.set(pos, pos, pos);

  // 用户控制
  mainControls = new OrbitControls(mainCamera, cubeContainer.value);
  mainControls.enablePan = false; // 禁用平移功能
  mainControls.minDistance = 10000; // 设置最近缩放距离
  mainControls.maxDistance = 250000; // 设置最远缩放距离
  // 保存初始状态
  initialPosition.value = mainCamera.position.clone();
  initialTarget.value = mainControls.target.clone();

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // 开启抗锯齿功能 { antialias: true }
  renderer.setSize(sceneWidth, sceneHeight);
  renderer.setClearColor(0xffffff, 0); // 背景透明
  // 启用剪裁功能，确保每个视口只渲染它自己的区域
  renderer.setScissorTest(true);

  initAxes();
  // 将渲染器的DOM元素（canvas）添加到指定的元素上
  cubeContainer.value.appendChild(renderer.domElement);

  // 加载PLY模型
  new PLYLoader().load(
    `/api/vangogh/v1/capture/oct/cscan?cscanType=0&captureKey=${router.currentRoute.value.query.captureKey}`,
    function (geometry: THREE.BufferGeometry) {
      if (!scene) return;
      // 确保几何体包含顶点颜色
      geometry.computeVertexNormals();
      pointsMaterial.value = new THREE.PointsMaterial({
        vertexColors: true,
        transparent: true, // 启用透明度
        opacity: 1 - props.transparency / 100 // 设置透明度
      });
      const points = new THREE.Points(geometry, pointsMaterial.value);
      scene.add(points);

      // 调整几何体的中心
      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox?.getCenter(center);
      points.geometry.center();
      showLoading.value = false;

      animate();
      addFullscreen();
    },
    undefined,
    (error: unknown) => {
      ElNotification({
        type: "warning",
        message: VueI18n("common.loadCubeFail"),
        customClass: "custom-notification-center"
      });
      console.error(error);
    }
  );

  window.addEventListener("resize", onWindowResize, false);
};

const initAxes = () => {
  if (!cubeContainer.value || !renderer) return;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  // 创建一个新的场景
  miniScene = new THREE.Scene();
  miniScene.environment = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0
  ).texture;

  pmremGenerator.dispose(); // 生成后释放 PMREMGenerator

  // add mini camera
  miniCamera = new THREE.PerspectiveCamera(10, 1, 0.01, 20); // 第一个参数会影响眼球的渲染结果，设置的大会变形
  miniCamera.position.set(1.5, 1.5, 1.5);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  light.position.set(0, 20, 0);
  miniScene.add(light);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 10, 10);
  miniScene.add(directionalLight);

  // add mini control
  miniControls = new OrbitControls(miniCamera, cubeContainer.value);
  miniControls.enablePan = false; // 禁用平移功能
  miniControls.enableZoom = false; // 禁用缩放
  initialMiniPosition.value = miniCamera.position.clone();
  initialMiniTarget.value = miniControls.target.clone();

  // 加载 GLTF 模型
  const gltfUrl = isOD.value ? "/eyeball_od.gltf" : "/eyeball_os.gltf";
  new GLTFLoader().load(gltfUrl, function (gltf) {
    if (!miniScene || !miniCamera) return;

    const model = gltf.scene;
    model.rotation.y = isOD.value ? Math.PI / 2 : -Math.PI / 2;
    miniScene.add(model);
  });
};

const animate = () => {
  requestAnimationFrame(animate);
  if (
    renderer &&
    scene &&
    mainCamera &&
    cubeContainer.value &&
    miniScene &&
    miniCamera
  ) {
    renderer.setViewport(0, 0, sceneWidth, sceneHeight);
    renderer.setScissor(0, 0, sceneWidth, sceneHeight);
    renderer.clear(); // 清除画布（颜色和深度）
    renderer.render(scene, mainCamera);

    // 在渲染第二个视口之前，清除深度缓冲区
    renderer.clearDepth();

    // 渲染小视图 (在左下角)
    renderer.setViewport(5, 25, MINI_VIEWPORT_WIDTH, MINI_VIEWPORT_HEIGHT);
    renderer.setScissor(5, 25, MINI_VIEWPORT_WIDTH, MINI_VIEWPORT_HEIGHT);
    renderer.clear();

    renderer.render(miniScene, miniCamera);
  }
};

const onWindowResize = () => {
  if (!cubeContainer.value) return;

  if (mainCamera && renderer) {
    sceneWidth = cubeContainer.value.offsetWidth;
    sceneHeight = cubeContainer.value.offsetHeight;
    mainCamera.aspect = sceneWidth / sceneHeight;
    mainCamera.updateProjectionMatrix();
    mainCamera.updateMatrixWorld();

    renderer.setSize(sceneWidth, sceneHeight);
  }
};

// 重置相机位置和控制目标
const resetControls = () => {
  if (mainControls && initialPosition.value && initialTarget.value) {
    mainControls.object.position.copy(initialPosition.value);
    mainControls.target.copy(initialTarget.value);
    mainControls.update();

    if (miniControls && initialMiniPosition.value && initialMiniTarget.value) {
      miniControls.object.position.copy(initialMiniPosition.value);
      miniControls.target.copy(initialMiniTarget.value);
      miniControls.update();
    }

    emits("reset");
  }
};

const getCubeScreenshot = async () => {
  if (!cubeContainer.value || !renderer) return;

  return new Promise((resolve, reject) => {
    try {
      requestAnimationFrame(() => {
        // 获取canvas 图片
        if (renderer) {
          const cubeCanvas = renderer.domElement;
          const sceneImageDataURL = cubeCanvas.toDataURL("image/png");

          // 创建一个 Image 元素
          const sceneImageEl = new Image();
          sceneImageEl.src = sceneImageDataURL;
          sceneImageEl.style.width = `${cubeCanvas.width}px`;
          sceneImageEl.style.height = `${cubeCanvas.height}px`;
          cubeContainer.value?.replaceChild(sceneImageEl, cubeCanvas);
          resolve(sceneImageEl);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};

const addResizeObserver = () => {
  const container = document.querySelector(".cube-col");
  if (!container) return;

  // 创建 ResizeObserver 监听容器大小变化
  const resizeObserver = new ResizeObserver(onWindowResize);

  // 观察容器
  resizeObserver.observe(container);
};

watch(
  () => props.screenshotTaking,
  async (screenshotTaking: boolean) => {
    if (screenshotTaking) {
      await getCubeScreenshot();
      emits("screenshot");
    } else {
      renderer &&
        cubeContainer.value?.replaceChild(
          renderer.domElement,
          cubeContainer.value?.firstChild as Node
        );
    }
  }
);

watch(
  () => props.transparency,
  (val: number) => {
    if (pointsMaterial.value) {
      pointsMaterial.value.opacity = 1 - val / 100;
    }
  }
);

watch(
  () => props.needReset,
  (needReset: boolean) => {
    if (needReset) {
      resetControls();
    }
  }
);

const addFullscreen = () => {
  const container = document.querySelector(".three-dimension-container");
  container &&
    container.addEventListener("dblclick", () => {
      container.classList.contains("full-screen")
        ? container.classList.remove("full-screen")
        : container.classList.add("full-screen");
      window.isCubeFullScreen = true;
      onWindowResize();
    });
};

onMounted(() => {
  initCube();
  addResizeObserver();
});

const cleanState = () => {
  window.removeEventListener("resize", onWindowResize);
  scene?.clear();
  mainCamera?.clear();
  mainCamera = null;
  renderer?.dispose();
  miniScene?.clear();
  miniCamera?.clear();
  miniCamera = null;
};

onUnmounted(() => {
  cleanState();
});
</script>
<style lang="scss" scoped>
.three-dimension-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.cube-container {
  width: 100%;
  height: 100%;
  background-color: $image-bg-color;
}

canvas {
  display: block;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
}
</style>
