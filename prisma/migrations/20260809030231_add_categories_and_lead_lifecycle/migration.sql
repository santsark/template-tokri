/*
  Warnings:

  - A unique constraint covering the columns `[convertedOrderId]` on the table `CustomOrderLead` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `category` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "LeadStatus" ADD VALUE 'CANCELLED';

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- AlterTable
ALTER TABLE "CustomOrderLead" ADD COLUMN     "amountQuoted" INTEGER,
ADD COLUMN     "convertedOrderId" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentLinkId" TEXT,
ADD COLUMN     "paymentLinkUrl" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "customTitle" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "category" TYPE TEXT USING "category"::text;

-- DropEnum
DROP TYPE "ProductCategory";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CustomOrderLead_convertedOrderId_key" ON "CustomOrderLead"("convertedOrderId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderLead" ADD CONSTRAINT "CustomOrderLead_convertedOrderId_fkey" FOREIGN KEY ("convertedOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
