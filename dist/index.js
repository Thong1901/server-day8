"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const routeCategory_1 = __importDefault(require("./routers/routeCategory"));
const routeDashboard_1 = __importDefault(require("./routers/routeDashboard"));
const routeTask_1 = __importDefault(require("./routers/routeTask"));
const routeUsers_1 = __importDefault(require("./routers/routeUsers"));
const routeSalesGrowth_1 = __importDefault(require("./routers/routeSalesGrowth"));
const routeWorkProgress_1 = __importDefault(require("./routers/routeWorkProgress"));
const routeSale_1 = __importDefault(require("./routers/routeSale"));
const auth_1 = __importDefault(require("./middleware/auth"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ["https://cv.thongmai.id.vn", "http://localhost:80", "https://dfur451rldoz.cloudfront.net"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use('/api', routeUsers_1.default);
app.use(auth_1.default);
app.use('/api', routeCategory_1.default);
app.use('/api', routeDashboard_1.default);
app.use('/api', routeTask_1.default);
app.use('/api', routeSalesGrowth_1.default);
app.use('/api', routeWorkProgress_1.default);
app.use('/api', routeSale_1.default);
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
