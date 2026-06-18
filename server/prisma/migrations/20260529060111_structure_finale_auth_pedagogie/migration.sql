-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN_PRINCIPAL', 'PERSONNEL', 'PARENT');

-- CreateEnum
CREATE TYPE "FonctionPersonnel" AS ENUM ('ENSEIGNANT', 'SURVEILLANT', 'DIRECTION', 'SECRETAIRE', 'COMPTABLE', 'ADMINISTRATIF');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PARENT',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "mobile" VARCHAR(15),
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personnel" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "fonction" "FonctionPersonnel" NOT NULL,
    "telephone" TEXT NOT NULL,
    "departement" TEXT,
    "photo" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'Actif',
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Personnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parents" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(60) NOT NULL,
    "prenom" VARCHAR(60) NOT NULL,
    "telephone" VARCHAR(15),
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Eleve" (
    "matricule" INTEGER NOT NULL,
    "nom" VARCHAR(60) NOT NULL,
    "prenom" VARCHAR(60) NOT NULL,
    "dateNaissance" DATE NOT NULL,
    "lieuNaissance" VARCHAR(30) NOT NULL,
    "sexe" INTEGER NOT NULL DEFAULT 0,
    "langue" TEXT NOT NULL DEFAULT 'Français',
    "photoURL" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'Inscrit',
    "parentId" INTEGER NOT NULL,
    "classroomId" INTEGER,

    CONSTRAINT "Eleve_pkey" PRIMARY KEY ("matricule")
);

-- CreateTable
CREATE TABLE "Classe" (
    "idClasse" SERIAL NOT NULL,
    "libelle" VARCHAR(100) NOT NULL,
    "idCycle" INTEGER NOT NULL,
    "responsableId" INTEGER,

    CONSTRAINT "Classe_pkey" PRIMARY KEY ("idClasse")
);

-- CreateTable
CREATE TABLE "Salle" (
    "idSalle" SERIAL NOT NULL,
    "libelle" VARCHAR(30) NOT NULL,
    "position" TEXT,
    "surface" TEXT,
    "capacite" INTEGER,
    "idClasse" INTEGER NOT NULL,

    CONSTRAINT "Salle_pkey" PRIMARY KEY ("idSalle")
);

-- CreateTable
CREATE TABLE "Cycle" (
    "idCycle" SERIAL NOT NULL,
    "libelle" VARCHAR(255) NOT NULL,

    CONSTRAINT "Cycle_pkey" PRIMARY KEY ("idCycle")
);

-- CreateTable
CREATE TABLE "Cours" (
    "idCours" SERIAL NOT NULL,
    "libelle" VARCHAR(255) NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "idClasse" INTEGER NOT NULL,
    "enseignantId" INTEGER,

    CONSTRAINT "Cours_pkey" PRIMARY KEY ("idCours")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "idEval" SERIAL NOT NULL,
    "note" DOUBLE PRECISION NOT NULL,
    "appreciation" TEXT,
    "matricule" INTEGER NOT NULL,
    "idCours" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("idEval")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Personnel_userId_key" ON "Personnel"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Parents_userId_key" ON "Parents"("userId");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personnel" ADD CONSTRAINT "Personnel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parents" ADD CONSTRAINT "Parents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eleve" ADD CONSTRAINT "Eleve_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eleve" ADD CONSTRAINT "Eleve_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classe"("idClasse") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classe" ADD CONSTRAINT "Classe_idCycle_fkey" FOREIGN KEY ("idCycle") REFERENCES "Cycle"("idCycle") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classe" ADD CONSTRAINT "Classe_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salle" ADD CONSTRAINT "Salle_idClasse_fkey" FOREIGN KEY ("idClasse") REFERENCES "Classe"("idClasse") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cours" ADD CONSTRAINT "Cours_idClasse_fkey" FOREIGN KEY ("idClasse") REFERENCES "Classe"("idClasse") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cours" ADD CONSTRAINT "Cours_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_matricule_fkey" FOREIGN KEY ("matricule") REFERENCES "Eleve"("matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_idCours_fkey" FOREIGN KEY ("idCours") REFERENCES "Cours"("idCours") ON DELETE RESTRICT ON UPDATE CASCADE;
