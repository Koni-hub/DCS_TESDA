import express from "express";
import database from "./config/dbConfig.js";
import cors from "cors";
import AccountRoutes from "./routes/accountRoutes.js";
import RegistryRoutes from "./routes/registryRoutes.js";
import AuditLog from "./routes/auditRoutes.js";
import Office from "./routes/officeRoutes.js";
import DocumentTypes from "./routes/documentTypesRoutes.js";
import RecordDocument from "./routes/recordDocumentRoutes.js";
import session from "express-session";
import fileUpload from "express-fileupload";
import Recipient from "./routes/recipientRoutes.js";
import DocAuditLogs from "./routes/DocumentAuditRoutes.js";

import "./model/associations.js";

import "dotenv/config";

const app = express();


const port = 5000;

try {
  await database.authenticate();
  console.info("Successfully Connected to the database");
} catch (error) {
  console.error("Failed to connect!", error);
}

app.use(
  session({
    name: "session",
    keys: ["DocumentControllerSystem"],
    secret: "documentsystem",
    maxAge: 24 * 60 * 60 * 1000,
    cookie: { secure: false },
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static("public"));
app.use(fileUpload({ createParentPath: true }));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://documentcontrollersystem.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/", AccountRoutes);
app.use("/registry", RegistryRoutes);
app.use("/audit-logs", AuditLog);
app.use("/offices", Office);
app.use("/document-types", DocumentTypes);
app.use("/record-docs", RecordDocument);
app.use("/recipients", Recipient);
app.use("/document_audits", DocAuditLogs);

app.get("/health", (_req, res) => res.status(200).send("OK"));

app.listen(port, () => {
  console.info(`Server listening on ${port}`);
});