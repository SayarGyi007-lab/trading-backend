"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../generated/prisma");
const client_1 = __importDefault(require("../prisma/client"));
const asyncHandler_1 = require("../utils/asyncHandler");
const protect = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    token = req.cookies.token;
    if (!token) {
        res.status(401);
        throw new Error("Unauthorized, no token received");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_TOKEN);
        if (!decoded) {
            res.status(401);
            throw new Error("Unauthorized, Invalid token");
        }
        if (decoded.role === prisma_1.UserRole.ADMIN) {
            req.admin = (yield client_1.default.user.findUnique({
                where: { user_id: Number(decoded.id) },
                select: { user_id: true, name: true, email: true, role: true },
            }));
            if (!req.admin)
                throw new Error("Admin not found");
        }
        else if (decoded.role === prisma_1.UserRole.USER) {
            req.user = (yield client_1.default.user.findUnique({
                where: { user_id: Number(decoded.id) },
                select: { user_id: true, name: true, email: true, role: true },
            }));
            if (!req.user)
                throw new Error("User not found");
        }
        next();
    }
    catch (error) {
        res.status(401);
        console.log(error);
        throw new Error("Unauthorized, No toker or Invalid token");
    }
}));
exports.protect = protect;
