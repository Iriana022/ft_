import React from 'react';

const Profile = () => {
  const token = localStorage.getItem('access_token');
  
  // Extraction sécurisée des données du token
  let userData = { username: 'Utilisateur', role: 'CLIENT', sub: 0 };
  if (token) {
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      userData = {
        username: payload.username || 'Inconnu',
        role: payload.role || 'GUEST',
        sub: payload.sub || 0
      };
    } catch (e) {
      console.error("Erreur de lecture du token", e);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header du profil */}
      <div className="flex items-center gap-6 p-6 bg-base-100 rounded-3xl shadow-sm border border-base-300">
        <div className="avatar placeholder">
          <div className="bg-primary text-primary-content rounded-full w-24 ring ring-primary ring-offset-base-100 ring-offset-2">
            <span className="text-3xl font-bold">{userData.username.slice(0, 3).toUpperCase()}</span>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold">{userData.username}</h1>
          <div className="flex gap-2 mt-1">
            <span className="badge badge-primary font-bold">{userData.role}</span>
            <span className="badge badge-ghost opacity-50 italic uppercase text-[10px]">ID: {userData.sub}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne de gauche : Infos personnelles */}
        <div className="md:col-span-2 card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Informations du compte</h2>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Nom d'utilisateur</span>
              </label>
              <input 
                type="text" 
                value={userData.username} 
                className="input input-bordered w-full bg-base-200 cursor-not-allowed" 
                readOnly 
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Rôle système</span>
              </label>
              <input 
                type="text" 
                value={userData.role} 
                className="input input-bordered w-full bg-base-200 cursor-not-allowed" 
                readOnly 
              />
            </div>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-disabled btn-sm">Sauvegarder les modifications</button>
            </div>
          </div>
        </div>

        {/* Colonne de droite : Paramètres rapides */}
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-6 text-center">
              <h3 className="font-bold opacity-50 mb-2">Sécurité</h3>
              <button className="btn btn-outline btn-error btn-sm w-full">
                Changer le mot de passe
              </button>
            </div>
          </div>
          
          <div className="card bg-primary text-primary-content shadow-xl">
            <div className="card-body p-6">
              <h3 className="font-bold">Aide & Support</h3>
              <p className="text-xs">Besoin d'aide avec votre compte ?</p>
              <button className="btn btn-xs btn-neutral mt-2">Contacter le support</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;