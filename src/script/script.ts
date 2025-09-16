import dotenv from "dotenv"
import prisma from "../prisma/client"
import bcrypt from "bcrypt"

dotenv.config()

const createAdmin = async()=>{
    try {
        const adminEmail = process.env.ADMIN_EMAIL!
        const adminPassword = process.env.ADMIN_PASSWORD!
        const phone = 123456789

        const existed = await prisma.user.findUnique({
            where: { email: adminEmail },
          });
        
          if (existed) {
            console.log("Super admin already exists");
            return;
          }
        
          // Hash password
          const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
          // Create super admin
          await prisma.user.create({
            data: {
              name: "Admin",
              email: adminEmail,
              password: hashedPassword,
              role: "ADMIN", 
              phone
            },
          });
        
          console.log("Super admin successfully created 🎉");
    } catch (err) {
        console.error("Error creating super admin:", err)
    }

}

createAdmin()
