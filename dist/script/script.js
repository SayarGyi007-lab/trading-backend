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
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = __importDefault(require("../prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
const createAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const phone = 123456789;
        const existed = yield client_1.default.user.findUnique({
            where: { email: adminEmail },
        });
        if (existed) {
            console.log("Super admin already exists");
            return;
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(adminPassword, 10);
        // Create super admin
        yield client_1.default.user.create({
            data: {
                name: "Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "ADMIN",
                phone
            },
        });
        console.log("Super admin successfully created 🎉");
    }
    catch (err) {
        console.error("Error creating super admin:", err);
    }
});
createAdmin();
