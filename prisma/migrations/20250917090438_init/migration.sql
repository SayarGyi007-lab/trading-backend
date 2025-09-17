-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."OrderTypeEnum" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "public"."UnitEnum" AS ENUM ('Kilogram', 'Item', 'Liter', 'Meter', 'Bag', 'Pack', 'Centimeter', 'Gram');

-- CreateTable
CREATE TABLE "public"."user" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."orders_type" (
    "order_type_id" SERIAL NOT NULL,
    "name" "public"."OrderTypeEnum" NOT NULL,

    CONSTRAINT "orders_type_pkey" PRIMARY KEY ("order_type_id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "order_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "order_type_id" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "volume" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unit" "public"."UnitEnum" NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "public"."product" (
    "product_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "public"."matching_table" (
    "matching_id" SERIAL NOT NULL,
    "seller_user_id" INTEGER NOT NULL,
    "buyer_user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "buy_price" DECIMAL(65,30),
    "volume" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matching_table_pkey" PRIMARY KEY ("matching_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "product_name_key" ON "public"."product"("name");

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_order_type_id_fkey" FOREIGN KEY ("order_type_id") REFERENCES "public"."orders_type"("order_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matching_table" ADD CONSTRAINT "matching_table_seller_user_id_fkey" FOREIGN KEY ("seller_user_id") REFERENCES "public"."user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matching_table" ADD CONSTRAINT "matching_table_buyer_user_id_fkey" FOREIGN KEY ("buyer_user_id") REFERENCES "public"."user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matching_table" ADD CONSTRAINT "matching_table_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
