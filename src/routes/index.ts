import express, { Application } from "express";
import metaRouter from "./meta.router";
import saleRouter from "./sale.router";
import authRouter from "./auth.router";

function routerApi(app: Application) {
  const router = express.Router();
  app.use("/api", router);

  // Register routes
  router.use("/auth", authRouter);
  router.use("/meta", metaRouter);
  router.use("/sales", saleRouter);
}

export default routerApi;
