-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SALES', 'SERVICE', 'EDITOR');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('SUV', 'CROSSOVER', 'SEDAN', 'HATCHBACK', 'PICKUP', 'MPV', 'VAN');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'PLUGIN_HYBRID', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC', 'DCT', 'CVT');

-- CreateEnum
CREATE TYPE "Drivetrain" AS ENUM ('FWD', 'RWD', 'AWD', 'FOUR_WD');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('IN_TRANSIT', 'AVAILABLE', 'RESERVED', 'SOLD');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('NEW', 'CERTIFIED_PRE_OWNED', 'USED');

-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('GENERAL', 'QUOTE', 'TEST_DRIVE', 'SERVICE', 'PARTS', 'FINANCE', 'FLEET', 'CALLBACK');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'SSP');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'SALES',
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "bodyType" "BodyType" NOT NULL,
    "seats" INTEGER NOT NULL,
    "startingPriceUsd" DECIMAL(12,2),
    "priceOnRequest" BOOLEAN NOT NULL DEFAULT false,
    "year" INTEGER NOT NULL,
    "heroImageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "brochureUrl" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceUsd" DECIMAL(12,2),
    "engine" TEXT,
    "powerHp" INTEGER,
    "torqueNm" INTEGER,
    "fuelType" "FuelType" NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "drivetrain" "Drivetrain" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelColor" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hexCode" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ModelColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelImage" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'exterior',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ModelImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecGroup" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SpecGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecItem" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SpecItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureBlock" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "layout" TEXT NOT NULL DEFAULT 'image-right',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FeatureBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryUnit" (
    "id" TEXT NOT NULL,
    "stockNumber" TEXT NOT NULL,
    "vin" TEXT,
    "modelId" TEXT NOT NULL,
    "variantId" TEXT,
    "year" INTEGER NOT NULL,
    "colorName" TEXT NOT NULL,
    "mileageKm" INTEGER NOT NULL DEFAULT 0,
    "condition" "Condition" NOT NULL DEFAULT 'NEW',
    "status" "StockStatus" NOT NULL DEFAULT 'IN_TRANSIT',
    "priceUsd" DECIMAL(12,2),
    "arrivalDate" TIMESTAMP(3),
    "soldAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryImage" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InventoryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "type" "LeadType" NOT NULL DEFAULT 'GENERAL',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT,
    "modelId" TEXT,
    "source" TEXT,
    "pageUrl" TEXT,
    "assigneeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadNote" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "authorId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestDriveBooking" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "modelId" TEXT,
    "preferredDate" DATE NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'Showroom - Juba Town',
    "notes" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "assigneeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestDriveBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceBooking" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "vehicleModel" TEXT NOT NULL,
    "plateNumber" TEXT,
    "vin" TEXT,
    "mileageKm" INTEGER,
    "serviceType" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "assigneeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "body" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "tags" TEXT[],
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "authorId" UUID NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorTitle" TEXT,
    "company" TEXT,
    "quote" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "data" JSONB NOT NULL,
    "usdToSsp" DECIMAL(12,4) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" UUID,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sequence" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "RateLimitHit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitHit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Model_slug_key" ON "Model"("slug");

-- CreateIndex
CREATE INDEX "Model_status_isFeatured_idx" ON "Model"("status", "isFeatured");

-- CreateIndex
CREATE INDEX "Model_bodyType_idx" ON "Model"("bodyType");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_modelId_name_key" ON "Variant"("modelId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryUnit_stockNumber_key" ON "InventoryUnit"("stockNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryUnit_vin_key" ON "InventoryUnit"("vin");

-- CreateIndex
CREATE INDEX "InventoryUnit_status_idx" ON "InventoryUnit"("status");

-- CreateIndex
CREATE INDEX "InventoryUnit_modelId_idx" ON "InventoryUnit"("modelId");

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_type_idx" ON "Lead"("type");

-- CreateIndex
CREATE UNIQUE INDEX "TestDriveBooking_reference_key" ON "TestDriveBooking"("reference");

-- CreateIndex
CREATE INDEX "TestDriveBooking_status_preferredDate_idx" ON "TestDriveBooking"("status", "preferredDate");

-- CreateIndex
CREATE UNIQUE INDEX "TestDriveBooking_preferredDate_timeSlot_key" ON "TestDriveBooking"("preferredDate", "timeSlot");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceBooking_reference_key" ON "ServiceBooking"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_createdAt_idx" ON "AuditLog"("entity", "createdAt");

-- CreateIndex
CREATE INDEX "RateLimitHit_key_createdAt_idx" ON "RateLimitHit"("key", "createdAt");

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelColor" ADD CONSTRAINT "ModelColor_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelImage" ADD CONSTRAINT "ModelImage_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecGroup" ADD CONSTRAINT "SpecGroup_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecItem" ADD CONSTRAINT "SpecItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "SpecGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureBlock" ADD CONSTRAINT "FeatureBlock_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryUnit" ADD CONSTRAINT "InventoryUnit_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryUnit" ADD CONSTRAINT "InventoryUnit_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryImage" ADD CONSTRAINT "InventoryImage_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "InventoryUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestDriveBooking" ADD CONSTRAINT "TestDriveBooking_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestDriveBooking" ADD CONSTRAINT "TestDriveBooking_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
