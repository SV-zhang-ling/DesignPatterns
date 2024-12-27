/**
 * scan protocol related
 * detail: https://github.com/SVisions/Picasso-ProductAndFE/issues/206
 */

// Angio protocol
export const isAngioProtocol = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("angio") : false;

// Cube protocol
export const isCubeProtocol = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("cube") : false;

// Mosaic protocol
export const isMosaicProtocol = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("mosaic") : false;

// BiometryPro protocol
export const isBiometryProProtocol = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("cataract") : false;

// Biometry protocol
export const isBiometryProtocol = (protocol: string | undefined) =>
  protocol
    ? protocol.toLowerCase().includes("biometry") &&
      !isBiometryProProtocol(protocol)
    : false;

// Scleral scan protocol
export const isScleralScanProtocol = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("scleral") : false;

// Scleral 3D Shape protocol
export const isScleral3DShapeProtocol = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("scleral 3d shape") : false;

// Fundus Shape protocol
export const isFundusProtocol = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("fundus shape") : false;

// ScleralLens3DFitting protocol
export const isScleralLens3DFittingProtocol = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("scleral lens 3d") : false;

// Glaucoma scan protocol
export const isGlaucomaScanProtocol = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("onh") : false;

// ONH scan protocol, now it is the same as Glaucoma protocol
export const isONHScanProtocol = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("onh") : false;

//ICLScan 2D protocol
export const isICLScan2DProtocol = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("vault") : false;

// ICL Scan protocol
export const isICLScanProtocol = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("icl") : false;

// ICL Scan 3D protocol
export const isICLScan3DProtocol = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("as icl 3d") : false;

// As Cornea protocol
export const isAsCorneaProtocol = (protocol: string | undefined) =>
  protocol
    ? isAnteriorScan(protocol) && protocol.toLowerCase().includes("cornea")
    : false;

export const isAsSegmentProtocol = (protocol: string | undefined) =>
  protocol
    ? isAnteriorScan(protocol) && protocol.toLowerCase().includes("segment")
    : false;

// Single Line Scan protocol
export const isSingleLineScanProtocol = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("single-line") : false;

// isMultilineScan
export const isMultilineScanProtocol = (protocol: string | undefined) =>
  protocol
    ? !isSingleLineScanProtocol(protocol) &&
      !isCubeProtocol(protocol) &&
      !isAngioProtocol(protocol) &&
      !isONHScanProtocol(protocol)
    : false;

// Star Scan protocol
export const isStarScanProtocol = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("star") : false;

// Line scan protocol
export const isLineScanProtocol = (protocol: string | undefined) =>
  protocol
    ? isSingleLineScanProtocol(protocol) ||
      isStarScanProtocol(protocol) ||
      isMultilineScanProtocol(protocol)
    : false;

// TO-DO: isCubeAndEqualOrMoreThan6x6mm

// anterior scan
export const isAnteriorScan = (protocol: string | undefined) =>
  protocol
    ? protocol.toLowerCase().includes("as") || isScleralScanProtocol(protocol)
    : false;

// Anterior Cornea scan
export const isAnteriorCorneaScan = (protocol: string | undefined) =>
  protocol ? protocol.toLowerCase().includes("as cornea") : false;

// 是否为体数据
export const isCubeScan = (protocol: string | undefined) =>
  protocol
    ? isAngioProtocol(protocol) ||
      isCubeProtocol(protocol) ||
      isONHScanProtocol(protocol)
    : false;

// 是否为星扫数据
export const isStarScanData = (protocol: string | undefined) =>
  protocol
    ? isStarScanProtocol(protocol) ||
      isAsCorneaProtocol(protocol) ||
      isBiometryProtocol(protocol) ||
      isBiometryProProtocol(protocol) ||
      isScleralScanProtocol(protocol) ||
      isAsSegmentProtocol(protocol)
    : false;
