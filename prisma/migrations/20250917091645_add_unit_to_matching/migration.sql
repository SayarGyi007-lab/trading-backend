/*
  Warnings:

  - Added the required column `unit` to the `matching_table` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."matching_table" ADD COLUMN     "unit" "public"."UnitEnum" NOT NULL;
