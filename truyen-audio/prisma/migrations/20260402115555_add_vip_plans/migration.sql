-- CreateTable
CREATE TABLE "VipPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipPlan_pkey" PRIMARY KEY ("id")
);
