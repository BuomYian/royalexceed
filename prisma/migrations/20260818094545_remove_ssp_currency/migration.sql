-- Site currency is USD only (client confirmed no dual USD/SSP pricing needed).
-- Drops the now-unused exchange-rate column and the unused Currency enum type
-- (declared in the spec's starting-point schema but never attached to a field).
ALTER TABLE "SiteSetting" DROP COLUMN "usdToSsp";
DROP TYPE "Currency";
