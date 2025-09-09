import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routerCategory from "./routers/routeCategory"
import routerDashboard from "./routers/routeDashboard";
import routerTask from "./routers/routeTask";
import routerUsers from "./routers/routeUsers";
import routerSalesGrowth from "./routers/routeSalesGrowth";
import routerWorkProgress from "./routers/routeWorkProgress";
import routesale from "./routers/routeSale";
import jwt from "./middleware/auth"
dotenv.config();
const app = express();

app.use(cors({
    origin: ["https://cv.thongmai.id.vn", "*", "http://localhost:80", "https://xxxx.cloudfront.net"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use('/api', routerUsers);
app.use(express.json());
app.use(jwt);
app.use('/api', routerCategory);
app.use('/api', routerDashboard);
app.use('/api', routerTask);
app.use('/api', routerSalesGrowth);
app.use('/api', routerWorkProgress);
app.use('/api', routesale);
app.get('/', (req, res) => {
    res.send('Hello World!');
}
);


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});