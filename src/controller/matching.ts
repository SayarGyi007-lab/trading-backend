import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../prisma/client";
import { AuthRequest } from "../middlewares/authentication";

export const getAllMatchings = asyncHandler(async(req:Request, res:Response)=>{
    const matchings = await prisma.matching_table.findMany({
        include: {
            product: { select: { name: true } },
            seller: { select: { name: true } },
            buyer: { select: { name: true } },
        },
        orderBy: { timestamp: "desc" },
    });
    res.status(200).json({matchings})
})


export const getMatchingByUserId = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401);
        throw new Error("Unauthorized, user not found");
    }

    const matchings = await prisma.matching_table.findMany({
        where: {
            OR: [
                { buyer_user_id: req.user.user_id },
                { seller_user_id: req.user.user_id },
            ],
        },
        include: {
            product: { select: { name: true } },
            seller: { select: { name: true } },
            buyer: { select: { name: true } },
        },
        orderBy: { timestamp: "desc" },
    });

    res.status(200).json({ matchings });
});

