module.exports = app => {
  app.get(`${process.env.VUE_APP_BASE_API_URL}/user/userinfo`, (req, res) => {
    res.json({ username: "张三", age: 12 });
  });
};
