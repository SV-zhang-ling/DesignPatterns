// opencv.js 暂不支持ts类型，暂时用js书写，等后期会考虑改造成ts版本
export const ColorMap_Rainbow = [
  [0, 0, 0, 0],
  [85, 0, 170, 255],
  [128, 0, 255, 0],
  [170, 255, 255, 0],
  [213, 255, 0, 0],
  [255, 255, 255, 255]
];

export const ColorMap_Hot = [
  [0, 0, 0, 0],
  [95, 255, 0, 0],
  [191, 255, 255, 0],
  [255, 255, 255, 255]
];

export const ColorMap_Classic = [
  [0, 0, 0, 0],
  [64, 2, 17, 47],
  [128, 15, 178, 49],
  [178, 235, 224, 0],
  [230, 217, 0, 0],
  [255, 255, 0, 0]
];

export const ColorMap_Photocoagulation = [
  [0, 0, 0, 0],
  [126, 255, 0, 0],
  [127, 0, 0, 0],
  [255, 0, 255, 255]
];
export function thicknessToGs(thickness) {
  return Math.round((255.0 / 500) * thickness);
}

export const ColorMap_Gray = [
  [0, 0, 0, 0],
  [255, 255, 255, 255]
];

export const ColorMap_Range500 = [
  [thicknessToGs(0), 0, 0, 0],
  [thicknessToGs(150), 160, 160, 160],
  [thicknessToGs(220), 0, 0, 123],
  [thicknessToGs(300), 0, 255, 0],
  [thicknessToGs(360), 255, 255, 0],
  [thicknessToGs(450), 255, 0, 0],
  [thicknessToGs(500), 255, 255, 255]
];
export function CONVERT(value) {
  const min = 0;
  const scale = 1.0;
  return Math.round(min + value * scale);
}
export const ColorMap_VesselDensity = [
  [0, 0, 0, 123],
  [CONVERT(28.3), 0, 0, 123],
  [CONVERT(56.6), 0, 0, 244],
  [CONVERT(84.9), 9, 132, 243],
  [CONVERT(113.2), 20, 255, 250],
  [CONVERT(141.5), 137, 255, 129],
  [CONVERT(169.8), 254, 255, 9],
  [CONVERT(198.1), 239, 123, 4],
  [CONVERT(226.4), 232, 0, 0],
  [CONVERT(255), 116, 0, 1]
];
export function createColorTable(colorMap) {
  let lutTable = [];
  for (let c = 0; c < 3; c++) {
    lutTable[c] = [];
  }
  for (let i = 0; i < colorMap.length - 1; i++) {
    const start = colorMap[i];
    const end = colorMap[i + 1];
    const startGray = start[0];
    const endGray = end[0];
    const grayRange = endGray - startGray;
    for (let j = 0; j < grayRange; j++) {
      for (let c = 0; c < 3; c++) {
        const ratio = (end[1 + c] - start[1 + c]) / grayRange;
        const interpolatedValue = Math.round(start[1 + c] + ratio * j);
        lutTable[c][startGray + j] = interpolatedValue;
      }
    }
  }
  return lutTable;
}

export function applyColorMap(img, colorMap) {
  let matVec = new cv.MatVector();
  for (let c = 0; c < colorMap.length; c++) {
    let lut = cv.matFromArray(1, 256, cv.CV_8UC1, colorMap[c]);
    let channel = new cv.Mat();
    cv.LUT(img, lut, channel);
    matVec.push_back(channel);
    lut.delete();
    channel.delete();
  }
  let dst = new cv.Mat();
  cv.merge(matVec, dst);
  matVec.delete();
  return dst;
}

export function createColorMapBarImage(colorMap) {
  let matVec = new cv.MatVector();
  for (let c = 0; c < 3; c++) {
    let lut = cv.matFromArray(1, 255, cv.CV_8UC1, colorMap[c]);
    matVec.push_back(lut);
    lut.delete();
  }
  let dst = new cv.Mat();
  cv.merge(matVec, dst);
  matVec.delete();
  cv.resize(dst, dst, new cv.Size(255, 10), 0, 0, cv.INTER_AREA);
  return dst;
}

// 单色血流
export function createAngioSignalColorTable() {
  let table = [];
  for (let c = 0; c < 4; c++) {
    table[c] = [];
  }
  let middle = Math.floor(255 / 2);

  for (let i = 0; i <= 255; i++) {
    if (i <= middle) {
      table[0].push(2 * i);
      table[1].push(0);
      table[2].push(0);
      table[3].push(2 * i);
    } else {
      table[0].push(255);
      table[1].push(i - middle);
      table[2].push(0);
      table[3].push(255);
    }
  }
  return table;
}
// 双色血流
export function createAngioSignalDualColorTable() {
  let table = [];
  for (let c = 0; c < 4; c++) {
    table[c] = [];
  }
  const middle = Math.floor(127 / 2);
  for (let i = 0; i <= 127; i++) {
    if (i <= middle) {
      table[0].push(4 * i);
      table[1].push(0);
      table[2].push(0);
      table[3].push(4 * i);
    } else {
      table[0].push(255);
      table[1].push(2 * (i - middle));
      table[2].push(0);
      table[3].push(255);
    }
  }
  for (let j = 128; j <= 255; ++j) {
    table[0].push(161);
    table[1].push(58);
    table[2].push(0);
    table[3].push((j - 128) * 2);
  }
  return table;
}
export function createAngioSignalMultipleColorTable() {
  let table = createAngioSignalDualColorTable();

  let table2 = [];
  for (let c = 0; c < 4; c++) {
    table2[c] = [];
  }

  for (let i = 0; i <= 127; i++) {
    table2[0].push(table[0][2 * i]);
    table2[1].push(table[1][2 * i]);
    table2[2].push(table[2][2 * i]);
    table2[3].push(table[3][2 * i]);
  }

  // fill the rest with the color for SSPIM.
  for (let j = 128; j <= 255; ++j) {
    table[0].push(0);
    table[1].push(255);
    table[2].push(128);
    table[3].push((j - 128) * 2);
  }
  return table2;
}

// 反色图
export function revertColor(src) {
  let lutTable = [];
  for (let i = 0; i < 256; i++) {
    lutTable[i] = 255 - i;
  }
  let lut = cv.matFromArray(1, 256, cv.CV_8UC1, lutTable);
  let dst = new cv.Mat();
  cv.LUT(src, lut, dst);
  lut.delete();
  return dst;
}
