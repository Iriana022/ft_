import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="p-10 flex flex-col gap-4 items-center justify-center min-h-screen bg-base-200">
      <h1 className="text-3xl font-bold text-primary">Test DaisyUI</h1>
      <button className="btn btn-primary">Bouton Primaire</button>
      <button className="btn btn-secondary">Bouton Secondaire</button>
      <button className="btn btn-accent">Bouton Accent</button>
      
      <div className="alert alert-success shadow-lg">
        <div>
          <span>Succès ! Si tu vois ça en vert, Tailwind fonctionne.</span>
        </div>
      </div>
    </div>
    </>
  )
}

export default App
