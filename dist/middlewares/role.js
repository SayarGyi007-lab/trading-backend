"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userOnly = exports.adminOnly = void 0;
const adminOnly = (req, res, next) => {
    console.log(req.admin);
    if (!req.admin || req.admin.role !== "ADMIN") {
        res.status(403);
        throw new Error("Unauthorized, only admin has access");
    }
    next();
};
exports.adminOnly = adminOnly;
const userOnly = (req, res, next) => {
    console.log(req.user);
    if (!req.user || req.user.role !== "USER") {
        res.status(403);
        throw new Error("Unauthorized, only user has access");
    }
    next();
};
exports.userOnly = userOnly;
