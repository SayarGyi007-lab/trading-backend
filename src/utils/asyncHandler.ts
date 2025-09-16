import { NextFunction, Request, Response } from "express";

export const asyncHandler = (
    ControlFn:(
        req: Request,
        res: Response,
        next: NextFunction
    )=> Promise<void>
)=>(
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    Promise.resolve(ControlFn(req,res,next)).catch(next)
}