import React, { useState } from 'react';
import { User, Mail, Lock, Phone, Briefcase, GraduationCap } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState<'PARENT' | 'PERSONNEL'>('PARENT');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
    fonction: 'ENSEIGNANT' // Par défaut pour le personnel
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage("✅ Demande envoyée ! Votre compte est en attente de validation par l'administrateur.");
      } else {
        setMessage("❌ " + data.error);
      }
    } catch (err) {
      setMessage("❌ Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Rejoindre l'établissement
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Créez votre compte pour accéder à l'application
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {/* Sélecteur de Rôle */}
          <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setRole('PARENT')}
              className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-medium transition ${role === 'PARENT' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
            >
              <User className="w-4 h-4 mr-2" /> Parent
            </button>
            <button
              onClick={() => setRole('PERSONNEL')}
              className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-medium transition ${role === 'PERSONNEL' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
            >
              <Briefcase className="w-4 h-4 mr-2" /> Personnel
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Champs Communs */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nom"
                required
                className="block w-full border border-gray-300 rounded-md px-3 py-2"
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
              />
              <input
                type="text"
                placeholder="Prénom"
                required
                className="block w-full border border-gray-300 rounded-md px-3 py-2"
                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Adresse Email"
                required
                className="block w-full border border-gray-300 rounded-md pl-10 pr-3 py-2"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                placeholder="Téléphone"
                required
                className="block w-full border border-gray-300 rounded-md pl-10 pr-3 py-2"
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
              />
            </div>

            {/* Champ Spécifique au Personnel */}
            {role === 'PERSONNEL' && (
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <select
                  className="block w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 appearance-none"
                  onChange={(e) => setFormData({...formData, fonction: e.target.value})}
                >
                  <option value="ENSEIGNANT">Enseignant</option>
                  <option value="SURVEILLANT">Surveillant</option>
                  <option value="COMPTABLE">Comptable</option>
                  <option value="DIRECTION">Direction</option>
                </select>
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Mot de passe"
                required
                className="block w-full border border-gray-300 rounded-md pl-10 pr-3 py-2"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Envoyer ma demande
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;