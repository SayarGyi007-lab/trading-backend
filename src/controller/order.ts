import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authentication";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../prisma/client";
import { UserRole } from "../../generated/prisma";
import { processNewOrder } from "../services/tradingSystem";

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { product_name, order_type, price, volume, timestamp, unit } = req.body as {
        product_name: string;
        order_type: "BUY" | "SELL";
        price: number;
        volume: number;
        unit:  "Kilogram" | "Item" | "Liter" | "Meter" | "Bag" | "Pack" | "Centimeter" | "Gram",
        timestamp: Date
    };

    if (!req.user) {
        res.status(401);
        throw new Error("Unauthorized, user not found");
    }

    if (!product_name || !order_type || !price || !volume || !unit) {
        res.status(400);
        throw new Error("All fields are required");
    }

    const product = await prisma.product.findUnique({ where: { name: product_name } });
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    const orderType = await prisma.orders_type.findFirst({ where: { name: order_type } });
    if (!orderType) {
        res.status(404);
        throw new Error("Order type not found");
    }

    const order = await prisma.orders.create({
        data: {
            user_id: req.user.user_id,
            product_id: product.product_id,
            order_type_id: orderType.order_type_id,
            price,
            volume,
            unit,
            timestamp
        },
        include: {
            product: true,
            order_type: true,
            user: true,
        },
    });

    const result = await processNewOrder(order.order_id)

    res.status(201).json({ message: "Order created successfully", order, matchingResult: result });
});


export const deleteOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;

    if (!orderId) {
        res.status(400);
        throw new Error("Order ID is required");
    }

    const order = await prisma.orders.findUnique({ where: { order_id: Number(orderId) } });
    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    if (req.user && order.user_id !== req.user.user_id) {
        res.status(403);
        throw new Error("Forbidden: you can only delete your own orders");
    }

    await prisma.orders.delete({ where: { order_id: Number(orderId) } });

    res.status(200).json({ message: "Order deleted successfully" });
});

export const updateOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const { product_name, order_type, price, volume, unit } = req.body as {
        product_name?: string;
        order_type?: "BUY" | "SELL";
        price?: number;
        volume?: number;
        unit?:  "Kilogram" | "Item" | "Liter" | "Meter" | "Bag" | "Pack" | "Centimeter" | "Gram",
    };

    if (!orderId) {
        res.status(400);
        throw new Error("Order ID is required");
    }

    const existingOrder = await prisma.orders.findUnique({
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
        const product = await prisma.product.findUnique({ where: { name: product_name } });
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }
        productId = product.product_id;
    }

    if (order_type) {
        const type = await prisma.orders_type.findFirst({ where: { name: order_type } });
        if (!type) {
            res.status(404);
            throw new Error("Order type not found");
        }
        orderTypeId = type.order_type_id;
    }

    const updatedOrder = await prisma.orders.update({
        where: { order_id: Number(orderId) },
        data: {
            product_id: productId,
            order_type_id: orderTypeId,
            price: price ?? existingOrder.price,
            volume: volume ?? existingOrder.volume,
            unit: unit ?? existingOrder.unit
        },
        include: {
            product: true,
            order_type: true,
            user: true,
        },
    });

    const result = await processNewOrder(updatedOrder.order_id);


    res.status(200).json({ message: "Order updated successfully", updatedOrder, matchingResult: result });
});

export const getOrdersByUserId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        res.status(400);
        throw new Error("User ID is required");
    }

    if (req.user?.role === UserRole.USER && req.user.user_id !== Number(userId)) {
        res.status(403);
        throw new Error("Forbidden: You can only view your own orders");
    }

    if (req.admin?.role === UserRole.ADMIN || (req.user && req.user.user_id === Number(userId))) {
        const orders = await prisma.orders.findMany({
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

        res.status(200).json({ orders });
    }

    res.status(403);
    throw new Error("Unauthorized: Access denied");
});

export const getAllOrders = asyncHandler(async(req: Request, res: Response) => {
    const orders = await prisma.orders.findMany({
      include: {
        product: { select: { name: true } },
        order_type: { select: { name: true } },
        user: { select: { user_id: true, name: true, email: true } },
      },
      orderBy: {
        timestamp: "desc",
      },
    });
  
    if (!orders.length) {
      res.status(404);
      throw new Error("No orders found");
    }
  
    res.status(200).json({ orders });
  });