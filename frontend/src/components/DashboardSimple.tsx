export function DashboardSimple() {
  return (
    <div className="flex-1 p-8">
      <h1 className="text-2xl font-bold">Dashboard Simple</h1>
      <p>Si vous voyez cette page une seule fois dans la console, le problème vient des composants Dashboard complexes.</p>
      <p>Si cette page charge en boucle aussi, le problème vient des routes ou du DashboardLayout.</p>
    </div>
  );
}
