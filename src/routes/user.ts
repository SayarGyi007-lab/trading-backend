import { Router } from "express";
import { protect } from "../middlewares/authentication";
import { userLogin, userLogout, userRegister } from "../controller/user";

const route = Router()
route.post("/register",userRegister)
route.post("/login",userLogin)
route.delete('/logout',protect,userLogout)

export default route