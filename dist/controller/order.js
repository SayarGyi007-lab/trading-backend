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
exports.getOrdersByUserId = exports.updateOrder = exports.deleteOrder = exports.createOrder = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const client_1 = __importDefault(require("../prisma/client"));
const prisma_1 = require("../../generated/prisma");
const tradingSystem_1 = require("../services/tradingSystem");
exports.createOrder = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { product_name, order_type, price, volume, timestamp } = req.body;
    if (!req.user) {
        res.status(401);
        throw new Error("Unauthorized, user not found");
    }
    if (!product_name || !order_type || !price || !volume) {
        res.status(400);
        throw new Error("All fields are required");
    }
    const product = yield client_1.default.product.findUnique({ where: { name: product_name } });
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }
    const orderType = yield client_1.default.orders_type.findFirst({ where: { name: order_type } });
    if (!orderType) {
        res.status(404);
        throw new Error("Order type not found");
    }
    const order = yield client_1.default.orders.create({
        data: {
            user_id: req.user.user_id,
            product_id: product.product_id,
            order_type_id: orderType.order_type_id,
            price,
            volume,
            timestamp
        },
        include: {
            product: true,
            order_type: true,
            user: true,
        },
    });
    const result = yield (0, tradingSystem_1.processNewOrder)(order.order_id);
    res.status(201).json({ message: "Order created successfully", order, matchingResult: result });
}));
exports.deleteOrder = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    if (!orderId) {
        res.status(400);
        throw new Error("Order ID is required");
    }
    const order = yield client_1.default.orders.findUnique({ where: { order_id: Number(orderId) } });
    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }
    if (req.user && order.user_id !== req.user.user_id) {
        res.status(403);
        throw new Error("Forbidden: you can only delete your own orders");
    }
    yield client_1.default.orders.delete({ where: { order_id: Number(orderId) } });
    res.status(200).json({ message: "Order deleted successfully" });
}));
exports.updateOrder = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    const { product_name, order_type, price, volume } = req.body;
    if (!orderId) {
        res.status(400);
        throw new Error("Order ID is required");
    }
    const existingOrder = yield client_1.default.orders.findUnique({
        where: { order_id: Number(orderId) },
    });
    if (!existingOrder) {
        res.status(404);
        throw new Error("Order not found");
    }
    if (req.user && existingOrder.user_id !== req.user.user_id) {
        res.status(403);
        throw new Error("Forbidden: you can only update your own orders");
    }
    let productId = existingOrder.product_id;
    let orderTypeId = existingOrder.order_type_id;
    if (product_name) {
        const product = yield client_1.default.product.findUnique({ where: { name: product_name } });
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }
        productId = product.product_id;
    }
    if (order_type) {
        const type = yield client_1.default.orders_type.findFirst({ where: { name: order_type } });
        if (!type) {
            res.status(404);
            throw new Error("Order type not found");
        }
        orderTypeId = type.order_type_id;
    }
    const updatedOrder = yield client_1.default.orders.update({
        where: { order_id: Number(orderId) },
        data: {
            product_id: productId,
            order_type_id: orderTypeId,
            price: price !== null && price !== void 0 ? price : existingOrder.price,
            volume: volume !== null && volume !== void 0 ? volume : existingOrder.volume,
        },
        include: {
            product: true,
            order_type: true,
            user: true,
        },
    });
    const result = yield (0, tradingSystem_1.processNewOrder)(updatedOrder.order_id);
    res.status(200).json({ message: "Order updated successfully", updatedOrder, matchingResult: result });
}));
exports.getOrdersByUserId = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId } = req.params;
    if (!userId) {
        res.status(400);
        throw new Error("User ID is required");
    }
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === prisma_1.UserRole.USER && req.user.user_id !== Number(userId)) {
        res.status(403);
        throw new Error("Forbidden: You can only view your own orders");
    }
    if (((_b = req.admin) === null || _b === void 0 ? void 0 : _b.role) === prisma_1.UserRole.ADMIN || (req.user && req.user.user_id === Number(userId))) {
        const orders = yield client_1.default.orders.findMany({
            where: { user_id: Number(userId) },
            include: {
                product: true,
                order_type: true,
                user: {
                    select: {
                        user_id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                timestamp: "desc",
            },
        });
        if (!orders.length) {
            res.status(404);
            throw new Error("No orders found for this user");
        }
        res.status(200).json({ count: orders.length, orders });
    }
    res.status(403);
    throw new Error("Unauthorized: Access denied");
}));
