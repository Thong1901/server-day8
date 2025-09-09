"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const controllerDashboard_1 = require("../controllers/controllerDashboard");
router.get('/dashboard', controllerDashboard_1.getDashboardSummary);
exports.default = router;
