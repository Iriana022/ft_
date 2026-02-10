import React from 'react';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="opacity-60 text-sm">Gérez vos préférences et les configurations de l'application.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Section Interface */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-primary border-b pb-2 mb-4">Interface & Apparence</h2>
            
            <div className="form-control">
              <label className="label cursor-pointer flex justify-between">
                <div>
                  <span className="label-text font-bold">Mode Sombre</span>
                  <p className="text-xs opacity-50">Activer le thème sombre automatiquement</p>
                </div>
                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              </label>
            </div>

            <div className="divider my-0"></div>

            <div className="form-control">
              <label className="label cursor-pointer flex justify-between">
                <div>
                  <span className="label-text font-bold">Notifications Push</span>
                  <p className="text-xs opacity-50">Recevoir des alertes en temps réel</p>
                </div>
                <input type="checkbox" className="toggle toggle-secondary" />
              </label>
            </div>
          </div>
        </div>

        {/* Section Application */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-secondary border-b pb-2 mb-4">Préférences Système</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Langue par défaut</span>
                </label>
                <select className="select select-bordered w-full" defaultValue="fr">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="mg">Malagasy</option>
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Fuseau horaire</span>
                </label>
                <select className="select select-bordered w-full" defaultValue="eat">
                  <option value="eat">Antananarivo (EAT)</option>
                  <option value="utc">UTC</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section Danger Zone */}
        <div className="card border-2 border-error/20 bg-error/5 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-error font-black">Zone de danger</h2>
            <p className="text-sm opacity-70">Ces actions sont irréversibles et affectent votre compte.</p>
            <div className="card-actions justify-end">
              <button className="btn btn-error btn-outline btn-sm">Supprimer le compte</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;