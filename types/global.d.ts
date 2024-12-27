type Mat = any;
interface Window {
  cv: any;
  ceilingSurfMat: Mat;
  floorSurfMat: Mat;
  isMeasureStatus: Boolean;
  noLoadingMask: boolean;
  isSaveImages: boolean;
  isAllSaveImages: boolean;
  isMoveCrossHair: boolean;
  originSlice: number;
  [key: string]: any;
}

const cv = window.cv;
declare global {
  var cv: cv;
  var ceilingSurfMat: [];
  var floorSurfMat: [];
}

interface Point {
  x: number;
  y: number;
}

interface ContextmenuItem {
  label: string;
  icon?: string;
  name: string;
  divided?: boolean;
  disabled?: boolean;
  children?: Array<ContextmenuItem>;
  active?: boolean;
  showActive?: boolean;
  visible: boolean;
}

interface SurfaceInfoType {
  ceilingSurf: string;
  ceilingShift: number;
  floorSurf: string;
  floorShift: number;
}

interface AcitveCaptureInfo {
  patientID: string;
  captureKey: string;
  captureID: string;
  ip: string;
  path: string;
}

interface Operation {
  [key: string]: (visible: boolean) => void;
}

interface LabelKeyValueType {
  value: string;
  labelKey: string;
  name?: string;
}

interface LayerAttrType {
  ceilingSurf: string;
  floorSurf: string;
  ceilingShift: string;
  floorShift: string;
}

interface KeyValueType {
  key: string;
  value: string;
}
