import React, { useState } from 'react';
import axios from 'axios';
import { notifySuccess, notifyError } from '../../utils/notifications';
const AffectationForm = ({ personels, matieres, classes }) => {
  const [formData, setFormData] = useState({
    personnelId: '',
    idMatiere: '',
    idClasse: '',
    coefficient: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/personnel/affecter', formData);
      notifySuccess("Enseignant affecté avec succès !");
    } catch (err) {
      notifyError("Erreur lors de l'affectation");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-card">
      <div className="admin-card-header">
        <h2>Affectation des matières</h2>
      </div>
      <div className="admin-form">
        <div className="admin-field">
          <label>Enseignant</label>
          <select onChange={(e) => setFormData({...formData, personnelId: e.target.value})}>
            <option>Choisir un enseignant...</option>
            {personels.map(p => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
          </select>
        </div>
        <div className="admin-form-row">
          <div className="admin-field">
            <label>Matière</label>
            <select onChange={(e) => setFormData({...formData, idMatiere: e.target.value})}>
              <option>Choisir...</option>
              {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label>Classe</label>
            <select onChange={(e) => setFormData({...formData, idClasse: e.target.value})}>
              <option>Choisir...</option>
              {classes.map(c => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" className="btn-admin w-full justify-center">
          Valider l'affectation
        </button>
      </div>
    </form>
  );
};