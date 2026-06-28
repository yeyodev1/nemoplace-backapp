import 'dotenv/config';
import { dbConnect } from "../src/config/mongo";
import { createApp } from "../src/app";

dbConnect();

const { app } = createApp();
export default app;
