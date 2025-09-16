import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { UserRole } from "../../generated/prisma";
import prisma from "../prisma/client";
import { asyncHandler } from "../utils/asyncHandler";

export interface AuthRequest extends Request {
    admin?:{
        name: string,
        email: string,
        role: "ADMIN",
        user_id: number
    };
    user?: {
        name: string,
        email: string,
        role: "USER",
        user_id: number
    };
  }

 interface User{
    name: string,
    email : string,
    role: "USER",
    user_id: number
}

interface Admin{
    name: string,
    email : string,
    role: "ADMIN",
     user_id: number
}


  
  const protect = asyncHandler(async(req:AuthRequest, res:Response, next:NextFunction)=>{
    let token;

    token = req.cookies.token

    if(!token){
        res.status(401)
        throw new Error("Unauthorized, no token received")
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_TOKEN!) as JwtPayload

        if(!decoded){
            res.status(401)
            throw new Error("Unauthorized, Invalid token")
        }

        if(decoded.role === UserRole.ADMIN){
            req.admin = await prisma.user.findUnique({
                where: {user_id: Number(decoded.id)},
                select: { user_id: true, name: true, email: true, role: true },
            }) as Admin
            if (!req.admin) throw new Error("Admin not found")
        }

        else if(decoded.role === UserRole.USER){
            req.user = await prisma.user.findUnique({
                where: {user_id: Number(decoded.id)},
                select: { user_id: true, name: true, email: true, role: true },
            }) as User
            if (!req.user) throw new Error("User not found")
        }

        next()

    } catch (error) {
        res.status(401)
        console.log(error);
        throw new Error("Unauthorized, No toker or Invalid token")
    }
  })

  export {protect}