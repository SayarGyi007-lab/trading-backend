import { Response } from "express";
import jwt from "jsonwebtoken"


const generateToken = (res: Response, id: number, role: string)=>{
    const token = jwt.sign({id,role},process.env.JWT_TOKEN!,{
        expiresIn: "10h"
    })
    res.cookie("token", token,{
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 10 * 60 * 60 * 1000,
    })
}

export default generateToken
