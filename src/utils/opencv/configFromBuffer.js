/**
 * @Function: configFromBuffer
 * @Description: 从后台返回的arrayBuffer里返回config信息，包含captureId, col, row, surfaceType, cvType等参数
 * @Input: arrayBuffer
 * @Return: config object
 * @param {ArrayBuffer} buffer
 */
// 暂定从0开始取512个字节读取 配置参数，后续接口开发时考虑配置成动态offset
const offset = 0;
const size = 512;
function configFromBuffer(buffer) {
  try {
    const configByteArray = new Uint8Array(buffer, offset, size);
    const configStr = new TextDecoder("utf-8")
      .decode(configByteArray)
      .replace(/\u0000/g, "");
    const config = JSON.parse(configStr);
    return config;
  } catch (err) {
    throw new Error("Error occured in Config parsed.");
  }
}
export { configFromBuffer };
