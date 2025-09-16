import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import userRoute from "./routes/user"
import productRoute from "./routes/product"
import orderRoute from "./routes/order"
import matchingRoute from "./routes/matching"

const app = express()

dotenv.config({
    path: ".env"
})

const whitelist = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL
  ].filter(Boolean);
  

const corsOptions = {
    origin: function (origin: any, callback: any) {
        if (!origin) return callback(null, 'http://localhost:5174'); 
        if (whitelist.includes(origin)) {
            callback(null, origin); 
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions))

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
