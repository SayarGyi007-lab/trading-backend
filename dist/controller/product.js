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
exports.getAllProduct = exports.deleteProduct = exports.addProduct = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const client_1 = __importDefault(require("../prisma/client"));
exports.addProduct = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    if (!name) {
        res.status(400);
        throw new Error("All fields are required");
    }
    const product = yield client_1.default.product.create({
        data: { name },
    });
    res.status(201).json({
        message: "Product added successfully",
        product,
    });
}));
exports.deleteProduct = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { product_id } = req.params;
    if (!product_id) {
        res.status(400);
        throw new Error("Product ID is required");
    }
    const product = yield client_1.default.product.findUnique({
        where: { product_id: Number(product_id) },
    });
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }
    yield client_1.default.product.delete({
        where: { product_id: Number(product_id) },
    });
    res.status(200).json({
        message: "Product deleted successfully",
    });
}));
exports.getAllProduct = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield client_1.default.product.findMany({});
    res.status(200).json({ products });
}));
