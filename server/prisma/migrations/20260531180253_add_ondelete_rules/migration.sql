/*
  Warnings:

  - Added the required column `niveau` to the `EnrollmentRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EnrollmentRequest" ADD COLUMN     "niveau" VARCHAR(20) NOT NULL;

-- CreateTable
CREATE TABLE "Epreuve" (
    "id" SERIAL NOT NULL,
    "evaluation" TEXT NOT NULL,
    "anneeAcad" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "sujetUrl" TEXT,
    "corrigeUrl" TEXT,
    "idMatiere" INTEGER NOT NULL,
    "idClasse" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Epreuve_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Epreuve" ADD CONSTRAINT "Epreuve_idMatiere_fkey" FOREIGN KEY ("idMatiere") REFERENCES "Matiere"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Epreuve" ADD CONSTRAINT "Epreuve_idClasse_fkey" FOREIGN KEY ("idClasse") REFERENCES "Classe"("idClasse") ON DELETE CASCADE ON UPDATE CASCADE;
