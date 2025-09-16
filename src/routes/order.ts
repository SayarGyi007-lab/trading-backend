import { Router } from "express";
import { protect } from "../middlewares/authentication";
import { userOnly } from "../middlewares/role";
import { createOrder, deleteOrder, getOrdersByUserId, updateOrder } from "../controller/order";

const route = Router()
route.post("/create",protect,userOnly,createOrder)
route.delete("/delete/:orderId", protect, deleteOrder);
route.put("/update/:orderId", protect, updateOrder);
route.get("/user/:userId", protect, getOrdersByUserId);



export default route