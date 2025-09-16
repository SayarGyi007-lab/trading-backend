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
exports.processNewOrder = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const processNewOrder = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    const newOrder = yield client_1.default.orders.findUnique({ where: { order_id: orderId },
        include: { order_type: true }
    });
    if (!newOrder) {
        throw new Error("No orders found");
    }
    const isBuy = newOrder.order_type.name === "BUY";
    const isSell = newOrder.order_type.name === "SELL";
    if (!isBuy && !isSell) {
        throw new Error("Invalid new order");
    }
    let remainingVolume = newOrder.volume;
    if (isBuy) {
        const sellOrder = yield client_1.default.orders.findMany({
            where: {
                product_id: newOrder.product_id,
                order_type: { name: "SELL" },
                price: { lt: newOrder.price },
                volume: { gt: 0 }
            },
            orderBy: [{ price: "asc" }, { timestamp: "asc" }]
        });
        for (const sell of sellOrder) {
            if (remainingVolume <= 0)
                break;
            const tradeVolume = Math.min(remainingVolume, sell.volume);
            yield client_1.default.matching_table.create({
                data: {
                    seller_user_id: sell.user_id,
                    buyer_user_id: newOrder.user_id,
                    product_id: newOrder.product_id,
                    price: sell.price,
                    buy_price: newOrder.price,
                    volume: tradeVolume,
                }
            });
            yield client_1.default.orders.update({
                where: { order_id: sell.order_id },
                data: { volume: sell.volume - tradeVolume }
            });
            remainingVolume -= tradeVolume;
        }
    }
    else if (isSell) {
        const buyOrders = yield client_1.default.orders.findMany({
            where: {
                product_id: newOrder.product_id,
                order_type: { name: "BUY" },
                price: { gt: newOrder.price },
                volume: { gt: 0 },
            },
            orderBy: [{ price: "desc" }, { timestamp: "asc" }],
        });
        for (const buy of buyOrders) {
            if (remainingVolume <= 0)
                break;
            const tradeVolume = Math.min(remainingVolume, buy.volume);
            yield client_1.default.matching_table.create({
                data: {
                    seller_user_id: newOrder.user_id,
                    buyer_user_id: buy.user_id,
                    product_id: newOrder.product_id,
                    price: newOrder.price,
                    buy_price: buy.price,
                    volume: tradeVolume,
                },
            });
            yield client_1.default.orders.update({
                where: { order_id: buy.order_id },
                data: { volume: buy.volume - tradeVolume },
            });
            remainingVolume -= tradeVolume;
        }
    }
    yield client_1.default.orders.update({
        where: { order_id: newOrder.order_id },
        data: { volume: remainingVolume },
    });
    return { message: "Order processed", remainingVolume };
});
exports.processNewOrder = processNewOrder;
