import { http } from "@/utils/http";
import { ResponseTypeEnum } from "@/enums";

// const slowMainQueque: number[] = [];
// const slowAttachQueque: number[] = [];
// const fastQueque = [];
const transformBlobToBitmap = async (blob: Blob) => {
  const imageBitmap = await createImageBitmap(blob);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const offscreen = new window.OffscreenCanvas(
    imageBitmap.width,
    imageBitmap.height
  );
  const offscreenCtx = offscreen.getContext("2d");

  offscreenCtx?.drawImage(imageBitmap, 0, 0);

  const imageData = offscreenCtx?.getImageData(
    0,
    0,
    offscreen.width,
    offscreen.height
  );

  // 创建 Mat 对象
  // const start = performance.now();
  const mat = cv.matFromImageData(imageData);
  // console.log(performance.now() - start, "----");
  return mat;
};
export const loadImageByXhr = async (
  src: string,
  index?: number,
  bscanType?: string
) => {
  // 目前实测 两次mousemove之间添加100ms的宏任务倒计时请求可以确保
  // 最后一帧的校准，暂时注释请求队列设计，因为设计血流和bscan的协同
  // 比较复杂，后续有需要可以再针对协同设计
  // console.log(bscanType);
  // if (bscanType === "SlowBScanMain") {
  //   slowMainQueque.push(index);
  // } else if (bscanType === "SlowBScanAttach") {
  //   slowAttachQueque.push(index);
  // } else {
  //   fastQueque.push(index);
  // }
  const blob: Blob = await http.get(src.replace("/api", ""), {
    responseType: ResponseTypeEnum.BLOB
  });

  if (!blob) return;

  const mat = await transformBlobToBitmap(blob);
  return mat;
};
