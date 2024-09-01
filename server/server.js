import express from 'express';
import database from "./config/dbConfig.js";
import cors from 'cors';
import AccountRoutes from './routes/accountRoutes.js';
import DocumentRoutes from './routes/documentRoutes.js';
import AuditLog from './routes/auditRoutes.js';
import session from "express-session";

// Setup Accounts
import AuthRoutes from './routes/authGoogle.js';
import passportSetup from './passport.js';
import "dotenv/config"

const app = express();

//Database Connection

const port = 5000 || process.env.PORT;

try {
    await database.authenticate();
    console.log("Successfully Connected to the database");
    console.log
} catch (error) {
    console.log("Failed to connect!", error);
}

app.use(session({
    name: 'session',
    keys: ['dcskey'],
    secret: 'dcm',
    maxAge: 24 * 60 * 60 * 1000,
    cookie: { secure: false },
    resave: false,
}));

app.use(passportSetup.initialize());
app.use(passportSetup.session());

app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));
app.use(express.json());


app.use('/', AccountRoutes);
app.use('/documents', DocumentRoutes);
app.use('/audit-logs', AuditLog);
app.use('/auth', AuthRoutes);

// Check Health
app.get('/health', (_req, res) => res.status(200).send("OK"));

app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});