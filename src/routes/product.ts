import { Router } from "express";
import { protect } from "../middlewares/authentication";
import { adminOnly } from "../middlewares/role";
import { addProduct, deleteProduct, getAllProduct } from "../controller/product";

const route = Router()
route.post("/add",protect,adminOnly,addProduct)
route.delete('/delete/:product_id',protect,adminOnly,deleteProduct)
route.get("/",getAllProduct)

export default route