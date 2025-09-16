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
exports.userLogout = exports.userLogin = exports.userRegister = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const client_1 = __importDefault(require("../prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_1 = __importDefault(require("../utils/token"));
exports.userRegister = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
        res.status(400);
        throw new Error("All fields are required");
    }
    const existed = yield client_1.default.user.findUnique({ where: { email } });
    if (existed) {
        res.status(409);
        throw new Error("Eamil already existed");
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const user = yield client_1.default.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            phone,
            role: "USER",
        },
    });
    res.status(200).json({ message: "User Registeration successful", user });
}));
exports.userLogin = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are required");
    }
    const existed = yield client_1.default.user.findUnique({ where: { email } });
    if (!existed) {
        res.status(404);
        throw new Error("User not found");
    }
    if (!(yield bcrypt_1.default.compare(password, existed.password))) {
        res.status(401);
        throw new Error("No password matched");
    }
    (0, token_1.default)(res, existed.user_id, existed.role);
    res.status(200).json({
        _id: existed.user_id,
        name: existed.name,
        email: existed.email,
        role: existed.role,
        phone: existed.phone
    });
}));
exports.userLogout = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("token", {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: "User logout successfully" });
}));
