### 添加 playground 路由 到 route

```js
  {
    path: "/playground",
    name: "Playground",
    component: () => import("@/views/PlaygroundView.vue")
  },
```

### PlaygroundView 文件已放到 gitignore 里，只需维护自己本地的 PlaygroundView 即可
