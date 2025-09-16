import { NextFunction, Response } from "express";
import { AuthRequest } from "./authentication";

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log(req.admin);
    if (!req.admin || req.admin.role !== "ADMIN") {
      res.status(403);
      throw new Error("Unauthorized, only admin has access");
    }
    next();
  };
  
  export const userOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log(req.user);
    if (!req.user || req.user.role !== "USER") {
      res.status(403);
      throw new Error("Unauthorized, only user has access");
    }
    next();
  };