/**
 * @Function: matFromBuffer
 * @Description: 相对于opencv原生提供的matFromArray，增加了一种针对于输入参数为arrayBuffer，更简单的获取mat对象的方法，采用策略模式映射，封装了数据转化时繁琐的type映射。参考文档：https://docs.opencv.org/3.4/de/d06/tutorial_js_basic_ops.html
 * @Input: arrayBuffer
 * @Return: Mat 对象
 * @Author : Yahui Yang(yahui.yang@intalight.com)
 * @param {number} rows   mat数据的rows
 * @param {number} cols   mat数据的cols
 * @param {number} type   mat类型的
 * @param {ArrayBuffer} buffer 后台返回的arrayBuffer（二进制数据），一般由 const  buffer =  await response.arrayBuffer()获取
 * @param {number} offset (可选,默认从0开始读) buffer 的字节偏移量，也就是从哪个起始地址开始读取
 * @param {number} size   (可选，默认为传入buffer的maxByteLength) 需要读取的数据字节总量，也就是从起始地址开始往后读取多少个字节
 */

/**
   * 类型映射参考：
  +-----------------+----------+------------------------+----------+
  | Data Properties | C++ Type | JavaScript Typed Array | Mat Type |
  |-----------------|----------|------------------------|----------|
  | data            | uchar    | Uint8Array             | CV_8U    |
  |-----------------|----------|------------------------|----------|
  | data8S          | char     | Int8Array              | CV_8S    |
  |-----------------|----------|------------------------|----------|
  | data16U         | ushort   | Uint16Array            | CV_16U   |
  |-----------------|----------|------------------------|----------|
  | data16S         | short    | Int16Array             | CV_16S   |
  |-----------------|----------|------------------------|----------|
  | data32S         | int      | Int32Array             | CV_32S   |
  |-----------------|----------|------------------------|----------|
  | data32F         | float    | Float32Array           | CV_32F   |
  |-----------------|----------|------------------------|----------|
  | data64F         | double   | Float64Array           | CV_64F   |
  +-----------------+----------+------------------------+----------+
   */
function matFromBuffer(rows, cols, type, buffer, offset, size) {
  let array;
  const params = [
    buffer,
    offset ?? 0 // offset 不存在的话，默认取0，一直取到最后
    // size ? size : buffer.maxByteLength - (offset ?? 0),
  ];
  try {
    let mat = new cv.Mat(rows, cols, type);
    switch (type) {
      case cv.CV_8U:
      case cv.CV_8UC1:
      case cv.CV_8UC2:
      case cv.CV_8UC3:
      case cv.CV_8UC4: {
        array = new Uint8Array(...params);
        mat.data.set(array);
        break;
      }
      case cv.CV_8S:
      case cv.CV_8SC1:
      case cv.CV_8SC2:
      case cv.CV_8SC3:
      case cv.CV_8SC4: {
        array = new Int8Array(...params);
        mat.data8S.set(array);
        break;
      }
      case cv.CV_16U:
      case cv.CV_16UC1:
      case cv.CV_16UC2:
      case cv.CV_16UC3:
      case cv.CV_16UC4: {
        array = new Uint16Array(...params);
        mat.data16U.set(array);
        break;
      }
      case cv.CV_16S:
      case cv.CV_16SC1:
      case cv.CV_16SC2:
      case cv.CV_16SC3:
      case cv.CV_16SC4: {
        array = new Int16Array(...params);
        mat.data16S.set(array);
        break;
      }
      case cv.CV_32S:
      case cv.CV_32SC1:
      case cv.CV_32SC2:
      case cv.CV_32SC3:
      case cv.CV_32SC4: {
        array = new Int32Array(...params);
        mat.data32S.set(array);
        break;
      }
      case cv.CV_32F:
      case cv.CV_32FC1:
      case cv.CV_32FC2:
      case cv.CV_32FC3:
      case cv.CV_32FC4: {
        array = new Float32Array(...params);
        mat.data32F.set(array);
        break;
      }
      case cv.CV_64F:
      case cv.CV_64FC1:
      case cv.CV_64FC2:
      case cv.CV_64FC3:
      case cv.CV_64FC4: {
        array = new Float64Array(...params);
        mat.data64F.set(array);
        break;
      }
      default: {
        throw new Error("Type is unsupported");
      }
    }
    return mat;
  } catch (error) {
    console.info(error);
  }
}
export { matFromBuffer };
