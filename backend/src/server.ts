import "dotenv/config";
import { createServer } from "http";
import app from "./app.js";
import { setupSocket } from "./config/socketEvents.js";

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
setupSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});