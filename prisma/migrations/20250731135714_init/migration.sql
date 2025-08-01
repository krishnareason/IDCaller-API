-- CreateTable
CREATE TABLE "public"."account_users" (
    "uniqueId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userNumber" TEXT NOT NULL,
    "userEmail" TEXT,
    "userPassword" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_users_pkey" PRIMARY KEY ("uniqueId")
);

-- CreateTable
CREATE TABLE "public"."user_contacts" (
    "uniqueId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userNumber" TEXT NOT NULL,
    "userEmail" TEXT,
    "accountUserId" TEXT NOT NULL,

    CONSTRAINT "user_contacts_pkey" PRIMARY KEY ("uniqueId")
);

-- CreateTable
CREATE TABLE "public"."spam_alerts" (
    "uniqueId" TEXT NOT NULL,
    "reportedNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountUserId" TEXT NOT NULL,

    CONSTRAINT "spam_alerts_pkey" PRIMARY KEY ("uniqueId")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_users_userNumber_key" ON "public"."account_users"("userNumber");

-- AddForeignKey
ALTER TABLE "public"."user_contacts" ADD CONSTRAINT "user_contacts_accountUserId_fkey" FOREIGN KEY ("accountUserId") REFERENCES "public"."account_users"("uniqueId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."spam_alerts" ADD CONSTRAINT "spam_alerts_accountUserId_fkey" FOREIGN KEY ("accountUserId") REFERENCES "public"."account_users"("uniqueId") ON DELETE CASCADE ON UPDATE CASCADE;
