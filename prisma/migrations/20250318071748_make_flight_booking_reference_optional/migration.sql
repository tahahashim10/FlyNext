-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FlightBooking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "flightBookingReference" TEXT,
    "flightIds" JSONB,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passportNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FlightBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FlightBooking" ("createdAt", "email", "firstName", "flightBookingReference", "flightIds", "id", "lastName", "passportNumber", "status", "updatedAt", "userId") SELECT "createdAt", "email", "firstName", "flightBookingReference", "flightIds", "id", "lastName", "passportNumber", "status", "updatedAt", "userId" FROM "FlightBooking";
DROP TABLE "FlightBooking";
ALTER TABLE "new_FlightBooking" RENAME TO "FlightBooking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
