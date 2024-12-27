/**
 * @Author       : Yahui Yang(yahui.yang@intalight.com)
 * @Description  : 集中自动导入opencv自定义方法
 */

const initOpencv = cv => {
  // 通过webpack内置的require.context功能，自动获取所有非index.js导出模块内容
  const moduleCtx = require.context(".", false, /\.js$/);
  const modules = moduleCtx.keys().reduce((genModule, modulePath) => {
    let module = moduleCtx(modulePath);
    genModule = { ...genModule, ...module };
    return genModule;
  }, {});
  // 自动挂载自定义matFromBuffer,colorMap等方法到cv对象
  Object.keys(modules).forEach(key => {
    cv[key] = modules[key];
  });
  /**
   * cv基本没有需要递归冻结的二级属性，目前采用浅冻结的方式来封闭冻结cv全局对象在业务代码内的扩展和修改渠道，
   * 通过这种方式减少因业务代码内扩展或修改而导致cv方法属性的污染，进而减少难以排查的bug，
   * 如果想扩展cv方法，必须在opencv挂载后和VUE初始化前在utils/opencv模块内统一扩展，
   * 通过这种方式来为cv对象提供较高完整性级别保护措施
   */
  Object.freeze(cv);
};

export { initOpencv };
