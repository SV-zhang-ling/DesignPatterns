const { defineConfig } = require("@vue/cli-service");
const TerserPlugin = require("terser-webpack-plugin");
const AutoImport = require("unplugin-auto-import/webpack");

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.plugin("html").tap(args => {
      args[0].title = process.env.VUE_APP_TITLE;
      return args;
    });
    // 支持yml文件解析
    config.module
      .rule("yaml")
      .test(/\.ya?ml$/)
      .use("yaml")
      .loader("js-yaml-loader");
  },
  configureWebpack: {
    devtool:
      process.env.NODE_ENV === "production" &&
      process.env.WITH_SOURCE_MAP === "with"
        ? "source-map"
        : "cheap-module-source-map",
    plugins: [
      AutoImport({
        imports: ["vue"], // 全局导入，我这边目前只用到vue，如果需要其他的也可以导入
        dts: "./auto-imports.d.ts" // 支持TS类型提示
      })
    ],
    optimization: {
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: true // Removes console.* statements
            },
            sourceMap: false // Disable source maps generation
          },
          extractComments: false
        })
      ]
    }
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "~@/assets/styles/variables.scss";`
      }
    }
  },
  devServer: {
    client: {
      logging: "info",
      // Can be used only for `errors`/`warnings`
      //
      // overlay: {
      //   errors: true,
      //   warnings: true,
      // }
      overlay: false,
      progress: true
    },
    port: 8888,
    proxy: {
      [`${process.env.VUE_APP_BASE_API_URL}`]: {
        target: "http://10.8.6.194:6009", // shanghai server
        // target: "http://192.168.71.60:6009", // luoyang server
        changeOrigin: true,
        headers: {
          Connection: "keep-alive"
        },
        pathRewrite: {
          ["^" + process.env.VUE_APP_BASE_API_URL]: ""
        }
      }
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }
      const mockMiddleware = require("./mock/index.ts");
      mockMiddleware(devServer.app);
      return middlewares;
    }
  }
});
