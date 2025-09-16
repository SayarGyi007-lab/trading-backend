"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserMatching = exports.getAllMatchings = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const client_1 = __importDefault(require("../prisma/client"));
exports.getAllMatchings = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const matching = yield client_1.default.matching_table.findMany({
        orderBy: { timestamp: "desc" }
    });
    res.status(200).json({ matching });
}));
exports.getUserMatching = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let matchings;
    if (req.admin) {
        matchings = yield client_1.default.matching_table.findMany({
            include: { product: true, seller: true, buyer: true },
            orderBy: { timestamp: "desc" },
        });
    }
    else if (req.user) {
        matchings = yield client_1.default.matching_table.findMany({
            where: {
                OR: [
                    { buyer_user_id: req.user.user_id },
                    { seller_user_id: req.user.user_id },
                ],
            },
            include: { product: true, seller: true, buyer: true },
            orderBy: { timestamp: "desc" },
        });
    }
    else {
        res.status(401);
        throw new Error("Unauthorized, user not found");
    }
    res.status(200).json({ matchings });
}));
