import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import userRoute from "./routes/user"
import productRoute from "./routes/product"
import orderRoute from "./routes/order"
import matchingRoute from "./routes/matching"

const app = express()

app.use(cors())
dotenv.config({
    path: ".env"
})
app.use(express.json())
app.use(cookieParser())

app.use("/user",userRoute)
app.use("/product",productRoute)
app.use('/order',orderRoute)
app.use("/matching",matchingRoute)

const PORT=process.env.PORT || 4000

app.listen((PORT),()=>{
    console.log("Server is running on PORT",PORT);
    
})
