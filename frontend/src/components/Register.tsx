import React, { useState } from 'react';
import api from '../services/api.js'; 
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    login: ''
  });
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // On réinitialise l'erreur à chaque tentative

    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err: any) {
      // Error from backend
      const backendMessage = err.response?.data?.message;
      
      if (Array.isArray(backendMessage)) {
        setError(backendMessage[0]); // First error
      } else {
        setError(backendMessage || "Erreur lors de l'inscription");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <form onSubmit={handleSubmit} className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold">Inscription</h2>
          
          {/* dynamical error alert */}
          {error && (
            <div className="alert alert-error text-sm py-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Nom d'utilisateur (Login)</span>
            </label>
            <input 
              name="login"
              type="text" 
              placeholder="ex: Zokibe" 
              className="input input-bordered focus:input-primary" 
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Email</span>
            </label>
            <input 
              name="email"
              type="email" 
              placeholder="email@example.com" 
              className="input input-bordered focus:input-primary" 
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Mot de passe</span>
            </label>
            <input 
              name="password"
              type="password" 
              placeholder="******" 
              className="input input-bordered focus:input-primary" 
              onChange={handleChange}
              required 
            />
            <label className="label">
              <span className="label-text-alt opacity-50">8 carac. min (Majuscule + Chiffre)</span>
            </label>
          </div>

          <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary text-white">S'inscrire</button>
          </div>
          
          <p className="text-center text-sm mt-4">
            Déjà un compte ? <span className="link link-primary font-bold" onClick={() => navigate('/login')}>Se connecter</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;