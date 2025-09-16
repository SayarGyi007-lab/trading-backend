import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../prisma/client";
import bcrypt from "bcrypt"
import { AuthRequest } from "../middlewares/authentication";
import generateToken from "../utils/token";

interface IUser {
    name: string;
    email: string;
    password: string;
    phone: string; 
  }

export const userRegister = asyncHandler(async(req:Request<{}, {}, IUser>, res:Response)=>{
    const {name,email,password,phone} = req.body
    if(!name || !email || !password || !phone){
        res.status(400)
        throw new Error("All fields are required")
    }
    
    const existed = await prisma.user.findFirst({where: {email}})

    if(existed){
        res.status(409)
        throw new Error("Eamil already existed")
    }

    const hashedPassword = await bcrypt.hash(password,10)

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            phone,
            role: "USER",
          },
    })

    res.status(200).json({message:"User Registeration successful",user})

})

export const userLogin = asyncHandler(async(req:AuthRequest, res:Response)=>{
    const {email , password} = req.body 

    if(!email || !password){
        res.status(400)
        throw new Error("All fields are required")
    }

    const existed = await prisma.user.findUnique({where: {email}})

    if(!existed){
        res.status(404)
        throw new Error("User not found")
    }

    if(!(await bcrypt.compare(password,existed.password))){
        res.status(401)
        throw new Error("No password matched")
    }

    generateToken(res, existed.user_id, existed.role)
    res.status(200).json({
        _id: existed.user_id,
        name: existed.name,
        email: existed.email,
        role: existed.role,
        phone: existed.phone
    })

})

export const userLogout = asyncHandler(async(req:AuthRequest,res:Response)=>{
    res.cookie("token",{
        httpOnly: true,
        expires: new Date(0)
    })
    res.status(200).json({message: "User logout successfully"})
})