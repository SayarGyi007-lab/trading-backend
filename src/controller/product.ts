import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../prisma/client";

interface IProduct {
    name: string
}

export const addProduct = asyncHandler(async (req: Request<{}, {}, IProduct>, res: Response) => {
    const { name } = req.body

    if (!name) {
        res.status(400)
        throw new Error("All fields are required")
    }
    const product = await prisma.product.create({
        data: { name },
    });

    res.status(201).json({
        message: "Product added successfully",
        product,
    });
})

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const { product_id } = req.params;

    if (!product_id) {
        res.status(400);
        throw new Error("Product ID is required");
    }

    const product = await prisma.product.findUnique({
        where: { product_id: Number(product_id) },
    });

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    await prisma.product.delete({
        where: { product_id: Number(product_id) },
    });

    res.status(200).json({
        message: "Product deleted successfully",
    });
})

export const getAllProduct = asyncHandler(async(req:Request,res:Response)=>{
    const products = await prisma.product.findMany({})
    res.status(200).json({products})
})

