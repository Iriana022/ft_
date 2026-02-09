import React, { useState } from 'react';
import api from '../services/api.js'; // Ton instance axios
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
    try {
      await api.post('/auth/register', formData);
      // Une fois inscrit, on redirige vers le login
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <form onSubmit={handleSubmit} className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold">Inscription</h2>
          
          {error && <div className="alert alert-error text-sm py-2">{error}</div>}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Nom d'utilisateur (Login)</span>
            </label>
            <input 
              name="login"
              type="text" 
              placeholder="ex: Zokibe" 
              className="input input-bordered" 
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input 
              name="email"
              type="email" 
              placeholder="email@example.com" 
              className="input input-bordered" 
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Mot de passe</span>
            </label>
            <input 
              name="password"
              type="password" 
              placeholder="******" 
              className="input input-bordered" 
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary text-white">S'inscrire</button>
          </div>
          
          <p className="text-center text-sm mt-2">
            Déjà un compte ? <span className="link link-primary" onClick={() => navigate('/login')}>Se connecter</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;