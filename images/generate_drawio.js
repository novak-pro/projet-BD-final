const fs = require('fs');
const path = require('path');

const TYPES = {
  ACTOR: 'actor',
  USECASE: 'usecase',
  CLASS: 'class',
  PARTICIPANT: 'participant',
  DATABASE: 'database',
  NOTE: 'note',
  ARROW: 'arrow',
};

function drawio(className, diagramName, cells) {
  let idCounter = 2;
  const ids = {};
  const getId = () => idCounter++;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-07-09T10:00:00.000Z" agent="Mozilla/5.0" version="24.0.0">
  <diagram id="${getId()}" name="${diagramName}">
    <mxGraphModel dx="1000" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="900" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>`;

  const cellIds = {};
  for (const cell of cells) {
    const cid = getId();
    cellIds[cell.id] = cid;
    if (cell.type === TYPES.ACTOR) {
      xml += `
        <mxCell id="${cid}" value="${cell.value}" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;" vertex="1" parent="1">
          <mxGeometry x="${cell.x}" y="${cell.y}" width="${cell.w||30}" height="${cell.h||60}" as="geometry"/>
        </mxCell>`;
    } else if (cell.type === TYPES.USECASE) {
      xml += `
        <mxCell id="${cid}" value="${cell.value}" style="ellipse;shape=umlUseCase;whiteSpace=wrap;html=1;verticalAlign=middle;" vertex="1" parent="1">
          <mxGeometry x="${cell.x}" y="${cell.y}" width="${cell.w||120}" height="${cell.h||50}" as="geometry"/>
        </mxCell>`;
    } else if (cell.type === TYPES.CLASS) {
      xml += `
        <mxCell id="${cid}" value="${cell.value}" style="swimlane;html=1;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;" vertex="1" parent="1">
          <mxGeometry x="${cell.x}" y="${cell.y}" width="${cell.w||140}" height="${cell.h||60}" as="geometry"/>
        </mxCell>`;
    } else if (cell.type === TYPES.PARTICIPANT) {
      xml += `
        <mxCell id="${cid}" value="${cell.value}" style="rectangle;whiteSpace=wrap;html=1;verticalAlign=middle;align=center;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="${cell.x}" y="${cell.y}" width="${cell.w||130}" height="${cell.h||40}" as="geometry"/>
        </mxCell>`;
    } else if (cell.type === TYPES.DATABASE) {
      xml += `
        <mxCell id="${cid}" value="${cell.value}" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#f5f5f5;strokeColor=#666666;" vertex="1" parent="1">
          <mxGeometry x="${cell.x}" y="${cell.y}" width="${cell.w||120}" height="${cell.h||80}" as="geometry"/>
        </mxCell>`;
    }
  }

  for (const cell of cells) {
    if (cell.type === TYPES.ARROW && cell.source && cell.target) {
      const sid = cellIds[cell.source];
      const tid = cellIds[cell.target];
      const cid = getId();
      const style = `edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;${cell.dashed ? 'dashed=1;' : ''}exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;`;
      xml += `
        <mxCell id="${cid}" style="${style}" edge="1" parent="1" source="${sid}" target="${tid}">
          <mxGeometry relative="1" as="geometry">
            <Array as="points"/>
          </mxGeometry>
        </mxCell>`;
    }
  }

  xml += `
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  return xml;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================================
// 1. Diagramme de cas d'utilisation
// ============================================================
function generateUseCase() {
  const cells = [
    { id: 'actor_admin', type: TYPES.ACTOR, x: 40, y: 200, value: 'Administrateur' },
    { id: 'actor_teacher', type: TYPES.ACTOR, x: 40, y: 380, value: 'Enseignant' },
    { id: 'actor_parent', type: TYPES.ACTOR, x: 40, y: 560, value: 'Parent' },

    { id: 'uc_inscrire', type: TYPES.USECASE, x: 200, y: 50, w: 160, h: 40, value: "Soumettre une demande d'inscription" },
    { id: 'uc_valider', type: TYPES.USECASE, x: 200, y: 110, w: 140, h: 40, value: 'Valider les inscriptions' },
    { id: 'uc_eleves', type: TYPES.USECASE, x: 400, y: 50, w: 140, h: 40, value: "Gérer les élèves" },
    { id: 'uc_personnel', type: TYPES.USECASE, x: 400, y: 110, w: 140, h: 40, value: 'Gérer le personnel' },
    { id: 'uc_classes', type: TYPES.USECASE, x: 580, y: 50, w: 160, h: 40, value: 'Gérer les classes et cycles' },
    { id: 'uc_matieres', type: TYPES.USECASE, x: 580, y: 110, w: 140, h: 40, value: 'Gérer les matières' },
    { id: 'uc_salles', type: TYPES.USECASE, x: 400, y: 180, w: 140, h: 40, value: 'Gérer les salles' },
    { id: 'uc_planning', type: TYPES.USECASE, x: 580, y: 180, w: 160, h: 40, value: "Planifier l'emploi du temps" },

    { id: 'uc_notes', type: TYPES.USECASE, x: 200, y: 260, w: 140, h: 40, value: 'Saisir les notes' },
    { id: 'uc_bulletins', type: TYPES.USECASE, x: 200, y: 190, w: 140, h: 40, value: 'Générer les bulletins' },
    { id: 'uc_paiements', type: TYPES.USECASE, x: 400, y: 260, w: 160, h: 40, value: 'Effectuer un paiement' },
    { id: 'uc_validpaiement', type: TYPES.USECASE, x: 400, y: 330, w: 160, h: 40, value: 'Valider les paiements' },
    { id: 'uc_discipline', type: TYPES.USECASE, x: 580, y: 260, w: 160, h: 40, value: 'Signaler un incident' },
    { id: 'uc_biblio', type: TYPES.USECASE, x: 580, y: 330, w: 160, h: 40, value: 'Gérer la bibliothèque' },
    { id: 'uc_messages', type: TYPES.USECASE, x: 200, y: 360, w: 160, h: 40, value: 'Messagerie et annonces' },
    { id: 'uc_academique', type: TYPES.USECASE, x: 400, y: 400, w: 160, h: 40, value: 'Gérer années académiques' },

    { id: 'uc_incident', type: TYPES.USECASE, x: 780, y: 260, w: 160, h: 40, value: 'Signalement incident' },
    { id: 'uc_consulter_notes', type: TYPES.USECASE, x: 780, y: 50, w: 160, h: 40, value: 'Consulter notes et bulletins' },
    { id: 'uc_suivi_discipline', type: TYPES.USECASE, x: 780, y: 110, w: 160, h: 40, value: 'Suivi disciplinaire' },
    { id: 'uc_consulter_biblio', type: TYPES.USECASE, x: 780, y: 170, w: 160, h: 40, value: 'Consulter la bibliothèque' },
    { id: 'uc_consulter_cours', type: TYPES.USECASE, x: 780, y: 330, w: 160, h: 40, value: 'Consulter mes cours' },

    // Flèches admin
    { id: 'a_admin_uc1', type: TYPES.ARROW, source: 'actor_admin', target: 'uc_valider' },
    { id: 'a_admin_uc2', type: TYPES.ARROW, source: 'actor_admin', target: 'uc_eleves' },
    { id: 'a_admin_uc3', type: TYPES.ARROW, source: 'actor_admin', target: 'uc_personnel' },
    { id: 'a_admin_uc4', type: TYPES.ARROW, source: 'actor_admin', target: 'uc_classes' },
    { id: 'a_admin_uc5', type: TYPES.ARROW, source: 'actor_admin', target: 'uc_matieres' },
    { id: 'a_admin_uc6', type: TYPES.ARROW, source: 'actor_admin', target: 'uc_salles' },
    { id: 'a_admin_uc7', type: TYPES.ARROW, source: 'actor_admin', target: 'uc_planning' },
    { id: 'a_admin_uc8', type: TYPES.ARROW, source: 'actor_admin', target: 'uc_bulletins' },
    { id: 'a_admin_uc9', type: TYPES.ARROW, source: 'actor_admin', target: 'uc_validpaiement' },
    { id: 'a_admin_uc10', type: TYPES.ARROW, source: 'actor_admin', target: 'uc_biblio' },
    { id: 'a_admin_uc11', type: TYPES.ARROW, source: 'actor_admin', target: 'uc_academique' },

    // Flèches enseignant
    { id: 'a_teacher_uc1', type: TYPES.ARROW, source: 'actor_teacher', target: 'uc_notes' },
    { id: 'a_teacher_uc2', type: TYPES.ARROW, source: 'actor_teacher', target: 'uc_incident' },
    { id: 'a_teacher_uc3', type: TYPES.ARROW, source: 'actor_teacher', target: 'uc_messages' },
    { id: 'a_teacher_uc4', type: TYPES.ARROW, source: 'actor_teacher', target: 'uc_consulter_cours' },

    // Flèches parent
    { id: 'a_parent_uc1', type: TYPES.ARROW, source: 'actor_parent', target: 'uc_inscrire' },
    { id: 'a_parent_uc2', type: TYPES.ARROW, source: 'actor_parent', target: 'uc_consulter_notes' },
    { id: 'a_parent_uc3', type: TYPES.ARROW, source: 'actor_parent', target: 'uc_suivi_discipline' },
    { id: 'a_parent_uc4', type: TYPES.ARROW, source: 'actor_parent', target: 'uc_paiements' },
    { id: 'a_parent_uc5', type: TYPES.ARROW, source: 'actor_parent', target: 'uc_consulter_biblio' },
  ];
  return drawio('usecase', 'Diagramme de cas d\'utilisation', cells);
}

// ============================================================
// 2. Diagramme de classes (simplifié)
// ============================================================
function generateClassDiagram() {
  const classes = [
    { id: 'User', x: 40, y: 20, w: 180, h: 120, value: '<b>User</b><hr><small>id: Int<br>email: String<br>password: String<br>role: Role<br>status: UserStatus</small>' },
    { id: 'Admin', x: 280, y: 20, w: 160, h: 80, value: '<b>Admin</b><hr><small>id: Int<br>nom: String<br>mobile: String?</small>' },
    { id: 'Personnel', x: 40, y: 200, w: 180, h: 120, value: '<b>Personnel</b><hr><small>id: Int<br>nom, prenom: String<br>fonction: Fonction<br>telephone: String<br>statut: String</small>' },
    { id: 'Parents', x: 280, y: 200, w: 180, h: 100, value: '<b>Parents</b><hr><small>id: Int<br>nom, prenom: String<br>telephone: String?</small>' },
    { id: 'Eleve', x: 500, y: 160, w: 200, h: 130, value: '<b>Eleve</b><hr><small>matricule: Int<br>nom, prenom: String<br>dateNaissance: DateTime<br>niveau: String<br>soldePoints: Int</small>' },
    { id: 'Classe', x: 760, y: 20, w: 180, h: 90, value: '<b>Classe</b><hr><small>idClasse: Int<br>libelle: String<br>idCycle: Int</small>' },
    { id: 'Cycle', x: 760, y: 150, w: 180, h: 70, value: '<b>Cycle</b><hr><small>idCycle: Int<br>libelle: String</small>' },
    { id: 'Salle', x: 760, y: 260, w: 180, h: 90, value: '<b>Salle</b><hr><small>idSalle: Int<br>libelle: String<br>capacite: Int?<br>etat: SalleEtat</small>' },
    { id: 'Matiere', x: 40, y: 380, w: 180, h: 80, value: '<b>Matiere</b><hr><small>id: Int<br>nom: String<br>code: String?</small>' },
    { id: 'Cours', x: 280, y: 380, w: 180, h: 90, value: '<b>Cours</b><hr><small>idCours: Int<br>coefficient: Float<br>idMatiere: Int</small>' },
    { id: 'Note', x: 500, y: 380, w: 180, h: 90, value: '<b>Note</b><hr><small>id: Int<br>valeur: Float<br>evaluation: String<br>dateSaisie: DateTime</small>' },
    { id: 'Incident', x: 500, y: 520, w: 200, h: 110, value: '<b>Incident</b><hr><small>id: Int<br>type: IncidentType<br>gravite: String<br>pointsDeduits: Int<br>status: String</small>' },
    { id: 'Payment', x: 280, y: 510, w: 180, h: 100, value: '<b>Payment</b><hr><small>id: Int<br>montant: Float<br>methode: PaymentMethod<br>status: PaymentStatus</small>' },
    { id: 'Scolarite', x: 760, y: 390, w: 180, h: 80, value: '<b>Scolarite</b><hr><small>id: Int<br>montantInscription: Float<br>montantPension: Float</small>' },
    { id: 'Tranche', x: 760, y: 520, w: 180, h: 80, value: '<b>Tranche</b><hr><small>id: Int<br>libelle: String<br>montant: Float<br>dateLimite: DateTime</small>' },
    { id: 'Message', x: 40, y: 510, w: 180, h: 100, value: '<b>Message</b><hr><small>id: Int<br>content: String<br>type: String<br>status: String</small>' },
    { id: 'AnneeAcad', x: 40, y: 660, w: 200, h: 90, value: '<b>AnneeAcademique</b><hr><small>idAcademi: Int<br>libelle: String<br>active: Boolean</small>' },
    { id: 'Trimestre', x: 280, y: 660, w: 180, h: 80, value: '<b>Trimestre</b><hr><small>idTrimestre: Int<br>libelle: String</small>' },
  ];

  const rels = [
    ['User', 'Admin'], ['User', 'Personnel'], ['User', 'Parents'],
    ['Parents', 'Eleve'], ['Parents', 'Payment'],
    ['Eleve', 'Note'], ['Eleve', 'Incident'], ['Eleve', 'Payment'],
    ['Eleve', 'Classe'], ['Classe', 'Cycle'], ['Classe', 'Cours'],
    ['Classe', 'Scolarite'], ['Scolarite', 'Tranche'],
    ['Matiere', 'Cours'], ['Cours', 'Note'],
    ['AnneeAcad', 'Trimestre'],
  ];

  const cells = classes.map(c => ({
    id: c.id, type: TYPES.CLASS, x: c.x, y: c.y, w: c.w, h: c.h,
    value: c.value
  }));

  for (const [src, tgt] of rels) {
    cells.push({ id: `r_${src}_${tgt}`, type: TYPES.ARROW, source: src, target: tgt });
  }

  return drawio('classes', 'Diagramme de classes', cells);
}

// ============================================================
// 3. Diagramme de séquence - Authentification
// ============================================================
function generateSeqAuth() {
  const cells = [
    { id: 'p1', type: TYPES.PARTICIPANT, x: 30, y: 20, w: 80, h: 40, value: 'Utilisateur' },
    { id: 'p2', type: TYPES.PARTICIPANT, x: 150, y: 20, w: 100, h: 40, value: 'Frontend React' },
    { id: 'p3', type: TYPES.PARTICIPANT, x: 290, y: 20, w: 80, h: 40, value: 'API Express' },
    { id: 'p4', type: TYPES.PARTICIPANT, x: 410, y: 20, w: 100, h: 40, value: 'Middleware JWT' },
    { id: 'p5', type: TYPES.PARTICIPANT, x: 550, y: 20, w: 100, h: 40, value: 'PostgreSQL' },

    // Ligne de vie de l'utilisateur vers les participants
    { id: 'l1', type: TYPES.ARROW, source: 'p1', target: 'p2' },
    { id: 'l2', type: TYPES.ARROW, source: 'p2', target: 'p3' },
    { id: 'l3', type: TYPES.ARROW, source: 'p3', target: 'p4' },
    { id: 'l4', type: TYPES.ARROW, source: 'p4', target: 'p5' },
  ];
  return drawio('seq_auth', 'Séquence - Authentification', cells);
}

// ============================================================
// 4. Diagramme de séquence - Ajout d'un élève
// ============================================================
function generateSeqEleve() {
  const cells = [
    { id: 'p1', type: TYPES.PARTICIPANT, x: 30, y: 20, w: 80, h: 40, value: 'Admin' },
    { id: 'p2', type: TYPES.PARTICIPANT, x: 150, y: 20, w: 100, h: 40, value: 'Frontend React' },
    { id: 'p3', type: TYPES.PARTICIPANT, x: 290, y: 20, w: 80, h: 40, value: 'API Express' },
    { id: 'p4', type: TYPES.PARTICIPANT, x: 410, y: 20, w: 100, h: 40, value: 'JWT + Multer' },
    { id: 'p5', type: TYPES.PARTICIPANT, x: 550, y: 20, w: 100, h: 40, value: 'PostgreSQL' },
  ];
  return drawio('seq_eleve', 'Séquence - Ajout élève', cells);
}

// ============================================================
// 5. Diagramme de séquence - Paiement
// ============================================================
function generateSeqPaiement() {
  const cells = [
    { id: 'p1', type: TYPES.PARTICIPANT, x: 20, y: 20, w: 70, h: 40, value: 'Parent' },
    { id: 'p2', type: TYPES.PARTICIPANT, x: 130, y: 20, w: 100, h: 40, value: 'Frontend React' },
    { id: 'p3', type: TYPES.PARTICIPANT, x: 270, y: 20, w: 80, h: 40, value: 'API Express' },
    { id: 'p4', type: TYPES.PARTICIPANT, x: 390, y: 20, w: 100, h: 40, value: 'PostgreSQL' },
    { id: 'p5', type: TYPES.PARTICIPANT, x: 530, y: 20, w: 90, h: 40, value: 'Administrateur' },
  ];
  return drawio('seq_paiement', 'Séquence - Paiement', cells);
}

// ============================================================
// Write all files
// ============================================================
const outDir = 'C:\\Users\\YANN GUESSONG\\Desktop\\projet-BDfinal\\images';

const files = {
  'diagramme_cas_utilisation.drawio': generateUseCase(),
  'diagramme_classes.drawio': generateClassDiagram(),
  'seq_authentification.drawio': generateSeqAuth(),
  'seq_ajout_eleve.drawio': generateSeqEleve(),
  'seq_paiement.drawio': generateSeqPaiement(),
};

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), content);
  console.log(`OK: ${name} (${content.length} bytes)`);
}
