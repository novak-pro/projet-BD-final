-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
CREATE SEQUENCE eleve_matricule_seq;
ALTER TABLE "Eleve" ALTER COLUMN "matricule" SET DEFAULT nextval('eleve_matricule_seq');
ALTER SEQUENCE eleve_matricule_seq OWNED BY "Eleve"."matricule";

-- CreateTable
CREATE TABLE "EnrollmentRequest" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(60) NOT NULL,
    "prenom" VARCHAR(60) NOT NULL,
    "dateNaissance" DATE NOT NULL,
    "lieuNaissance" VARCHAR(30) NOT NULL,
    "sexe" INTEGER NOT NULL DEFAULT 0,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "parentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnrollmentRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EnrollmentRequest" ADD CONSTRAINT "EnrollmentRequest_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
