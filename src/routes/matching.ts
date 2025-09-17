import { Router } from "express";
import { protect } from "../middlewares/authentication";
import { adminOnly } from "../middlewares/role";
import { getAllMatchings, getMatchingByUserId } from "../controller/matching";

const route = Router()
route.get("/",protect,adminOnly,getAllMatchings)
route.get("/matchings",protect, getMatchingByUserId)

export default route