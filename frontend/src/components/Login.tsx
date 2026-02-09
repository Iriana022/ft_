import React, {useState} from 'react';

import { Link } from 'react-router-dom'
import api from '../services/api'; // Ton fichier avec l'intercepteur



export default function Login() {
	const checkToken = async () => {
	  try {
		const res = await api.get('/auth/me');
		console.log("Le serveur me reconnaît :", res.data);
	  } catch (err) {
		console.error("Token invalide ou absent", err.response?.status);
	  }
	};

	
	const [formData, setFormData] = useState({ email: '', password: '' });

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
		// 1. Appel au backend NestJS
		const response = await api.post('/auth/login', formData);

		// 2. Extraction du token
		const { access_token } = response.data;

		// 3. Stockage du token (ton intercepteur le récupérera tout seul après)
		localStorage.setItem('access_token', access_token);

		console.log('Connexion réussie ! Token stocké.');
		
		// 4. Redirection (vers le dashboard par exemple)
		window.location.href = '/dashboard'; 
		
		} catch (error) {
		console.error("Erreur lors de la connexion :", error.response?.data?.message || error.message);
		alert("Identifiants incorrects");
		}
	};

	return (
		<div className="flex justify-center items-center h-screen">
			<form onSubmit={handleSubmit}>
			<fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
				<legend className="fieldset-legend">Login</legend>

				<label className="label">Email</label>
				<input type="email" className="input" placeholder="Email"
				onChange={(e) => setFormData({...formData, email: e.target.value})} 
        		placeholder="Email"
				/>

				<label className="label">Password</label>
				<input type="password" className="input" placeholder="Password" 
				onChange={(e) => setFormData({...formData, password: e.target.value})} 
        		placeholder="Mot de passe"
				/>

				<button className="btn btn-neutral mt-4" type="submit">Login</button>
				<p className="mt-2">
					Don’t have an account yet? <Link to="/signup" className="text-blue-500">Create one</Link>&nbsp;
					in seconds and start tracking your tickets easily.
				</p>
			</fieldset>
			</form>

			
		</div>
	);
}
