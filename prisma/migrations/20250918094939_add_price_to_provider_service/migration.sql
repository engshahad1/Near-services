-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_provider_services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "provider_services_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "provider_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_provider_services" ("createdAt", "id", "isActive", "providerId", "serviceId") SELECT "createdAt", "id", "isActive", "providerId", "serviceId" FROM "provider_services";
DROP TABLE "provider_services";
ALTER TABLE "new_provider_services" RENAME TO "provider_services";
CREATE INDEX "provider_services_providerId_idx" ON "provider_services"("providerId");
CREATE INDEX "provider_services_serviceId_idx" ON "provider_services"("serviceId");
CREATE UNIQUE INDEX "provider_services_providerId_serviceId_key" ON "provider_services"("providerId", "serviceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
