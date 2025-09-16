"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_1 = __importDefault(require("./routes/user"));
const product_1 = __importDefault(require("./routes/product"));
const order_1 = __importDefault(require("./routes/order"));
const matching_1 = __importDefault(require("./routes/matching"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
dotenv_1.default.config({
    path: ".env"
});
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/user", user_1.default);
app.use("/product", product_1.default);
app.use('/order', order_1.default);
app.use("/matching", matching_1.default);
const PORT = process.env.PORT || 4000;
app.listen((PORT), () => {
    console.log("Server is running on PORT", PORT);
});
