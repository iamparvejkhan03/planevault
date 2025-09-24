import express from "express";
import "dotenv/config";
import dbConnect from "./db/index.js";
import cors from "cors";
import { configureCloudinary } from "./utils/cloudinary.js";
import compression from "compression";
import userRouter from "./routes/user.route.js";

const app = express();
app.use(compression());
dbConnect();
configureCloudinary();

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ limit: '16kb' }));

app.use(cors({
    origin: ['https://www.planevault.com', 'http://localhost:5173'],
    credentials: true,
}));

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/v1/users', userRouter);


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));