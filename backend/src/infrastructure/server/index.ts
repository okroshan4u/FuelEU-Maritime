import express from "express";
import cors from "cors";
import routeRouter from "./routes";

const app = express();
app.use(cors());
app.use(express.json());

// all backend APIs start with /api
app.use("/api", routeRouter);

app.listen(4000, () => {
  console.log("✅ Backend running at http://localhost:4000");
});
