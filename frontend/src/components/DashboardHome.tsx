import React from 'react';

const DashboardHome = () => {
  const token = localStorage.getItem('access_token');
  const username = token ? JSON.parse(window.atob(token.split('.')[1])).username : 'Ami';

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold">Ravi de vous revoir, <span className="text-primary">{username}</span> ! 👋</h1>
        <p className="py-2 opacity-70">Voici ce qui se passe sur votre projet aujourd'hui.</p>
      </div>

      {/* Stats DaisyUI */}
      <div className="stats shadow w-full bg-base-100 border border-primary/10">
        <div className="stat">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div className="stat-title">Connexions</div>
          <div className="stat-value text-primary">25.6K</div>
          <div className="stat-desc">Jan 1st - Feb 1st</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
          </div>
          <div className="stat-title">Nouveaux Utilisateurs</div>
          <div className="stat-value text-secondary">1,200</div>
          <div className="stat-desc">↗︎ 400 (22%)</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
          </div>
          <div className="stat-title">Tâches en cours</div>
          <div className="stat-value text-accent">85%</div>
          <div className="stat-desc">Objectif : 90%</div>
        </div>
      </div>

      {/* "Quick Actions" , Infos Tempête */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-warning text-warning-content shadow-xl">
          <div className="card-body">
            <h2 className="card-title font-black uppercase">Alerte Gezani ⛈️</h2>
            <p>Le mode "Solo-Dev" est activé. Restez à l'abri et continuez à coder proprement !</p>
          </div>
        </div>
        
        <div className="card bg-neutral text-neutral-content shadow-xl">
          <div className="card-body">
            <h2 className="card-title italic">Prochaines étapes</h2>
            <ul className="list-disc list-inside opacity-80 text-sm">
              <li>Valider le design avec l'équipe</li>
              <li>Migrer vers les cookies httpOnly</li>
              <li>Implémenter la gestion des rôles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;