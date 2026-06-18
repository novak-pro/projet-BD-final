/*
  Warnings:

  - You are about to drop the column `libelle` on the `Cours` table. All the data in the column will be lost.
  - Added the required column `idMatiere` to the `Cours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `niveau` to the `Eleve` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ORANGE_MONEY', 'MTN_MOMO', 'CARTE_BANCAIRE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'VALIDATED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SalleEtat" AS ENUM ('DISPONIBLE', 'EN_SERVICE', 'EN_RENOVATION', 'EN_CONSTRUCTION', 'FERMEE_TEMPORAIREMENT');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('RETARD', 'ABSENCE_INJUSTIFIEE', 'COMPORTEMENT', 'AUTRE');

-- CreateEnum
CREATE TYPE "JourSemaine" AS ENUM ('LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI');

-- AlterTable
ALTER TABLE "Cours" DROP COLUMN "libelle",
ADD COLUMN     "idMatiere" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Eleve" ADD COLUMN     "niveau" TEXT NOT NULL,
ADD COLUMN     "salleId" INTEGER,
ADD COLUMN     "soldePoints" INTEGER NOT NULL DEFAULT 20;

-- AlterTable
ALTER TABLE "Salle" ADD COLUMN     "actif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "etat" "SalleEtat" NOT NULL DEFAULT 'DISPONIBLE';

-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "valeur" DOUBLE PRECISION NOT NULL,
    "evaluation" TEXT NOT NULL,
    "idMatiere" INTEGER NOT NULL,
    "eleveId" INTEGER NOT NULL,
    "dateSaisie" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" SERIAL NOT NULL,
    "type" "IncidentType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gravite" TEXT NOT NULL,
    "pointsDeduits" INTEGER NOT NULL DEFAULT 0,
    "commentaire" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "eleveId" INTEGER NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeConfig" (
    "id" SERIAL NOT NULL,
    "niveau" TEXT NOT NULL,
    "montantTotal" DOUBLE PRECISION NOT NULL,
    "montantTranche" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FeeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "nombreTranches" INTEGER NOT NULL,
    "methode" "PaymentMethod" NOT NULL,
    "transactionRef" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "eleveId" INTEGER NOT NULL,
    "parentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Livre" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "maisonEdition" TEXT,
    "description" TEXT,
    "cycle" TEXT NOT NULL,
    "classeConcernee" TEXT NOT NULL,
    "langue" TEXT NOT NULL,
    "couvertureUrl" TEXT,
    "pdfUrl" TEXT,
    "idMatiere" INTEGER NOT NULL,

    CONSTRAINT "Livre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matiere" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT,

    CONSTRAINT "Matiere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploiDuTemps" (
    "id" SERIAL NOT NULL,
    "jour" "JourSemaine" NOT NULL,
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,
    "idCours" INTEGER NOT NULL,
    "idSalle" INTEGER NOT NULL,

    CONSTRAINT "EmploiDuTemps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeeConfig_niveau_key" ON "FeeConfig"("niveau");

-- CreateIndex
CREATE UNIQUE INDEX "Matiere_nom_key" ON "Matiere"("nom");

-- CreateIndex
CREATE INDEX "EmploiDuTemps_idCours_idx" ON "EmploiDuTemps"("idCours");

-- CreateIndex
CREATE INDEX "EmploiDuTemps_idSalle_idx" ON "EmploiDuTemps"("idSalle");

-- AddForeignKey
ALTER TABLE "Eleve" ADD CONSTRAINT "Eleve_salleId_fkey" FOREIGN KEY ("salleId") REFERENCES "Salle"("idSalle") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cours" ADD CONSTRAINT "Cours_idMatiere_fkey" FOREIGN KEY ("idMatiere") REFERENCES "Matiere"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_idMatiere_fkey" FOREIGN KEY ("idMatiere") REFERENCES "Matiere"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve"("matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve"("matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve"("matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livre" ADD CONSTRAINT "Livre_idMatiere_fkey" FOREIGN KEY ("idMatiere") REFERENCES "Matiere"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploiDuTemps" ADD CONSTRAINT "EmploiDuTemps_idCours_fkey" FOREIGN KEY ("idCours") REFERENCES "Cours"("idCours") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploiDuTemps" ADD CONSTRAINT "EmploiDuTemps_idSalle_fkey" FOREIGN KEY ("idSalle") REFERENCES "Salle"("idSalle") ON DELETE RESTRICT ON UPDATE CASCADE;
