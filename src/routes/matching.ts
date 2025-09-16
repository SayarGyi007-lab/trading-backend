import { Router } from "express";
import { protect } from "../middlewares/authentication";
import { adminOnly } from "../middlewares/role";
import { getAllMatchings, getUserMatching } from "../controller/matching";

const route = Router()
route.get("/",protect,adminOnly,getAllMatchings)
route.get("/matchings",protect,getUserMatching)

export default route