module.exports = {
  apps: [
    {
      name: "taboom-web",
      script: "serve",
      env: {
        PM2_SERVE_PATH: "./dist",
        PM2_SERVE_PORT: 8081,
        PM2_SERVE_SPA: "true"
      }
    }
  ]
};
