/**
 * 提取packages 内公用type定义，方便跨组件使用和后期迁移
 */

import ImageViewer from "./components/image-viewer";
import ViewPort from "./components/viewport";
import SloOct from "./components/b-scan";

// component type

type ELImageViewer = InstanceType<typeof ImageViewer> | null;
type ELViewPort = InstanceType<typeof ViewPort> | null;
type ELSloOct = InstanceType<typeof SloOct> | null;
// Fn type
export type ProcessorFnType = (mat: Mat) => Mat; // 图片处理函数类型
