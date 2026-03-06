-- CreateTable
CREATE TABLE "Detection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "animal" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "imageurl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stream_url" TEXT NOT NULL
);
