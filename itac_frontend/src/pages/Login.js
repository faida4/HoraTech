import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import '../styles/Login.css';
import logo from '../images/logo-lacite.jpg';

function Login() {
   //  États pour gérer les champs du formulaire et l'interface
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fonction déclenchée lors de la soumission du formulaire de connexion
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true); // Active l’état de chargement

    if (!username || !password) { // Vérifie que les deux champs sont remplis
      setError("Veuillez remplir tous les champs.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post( // Envoie des identifiants au backend Django 
        "http://127.0.0.1:8000/accounts/login/", 
        { username, password }, 
        {
          withCredentials: true, //  Permet la gestion de session côté backend
          headers: { 'Content-Type': 'application/json' }
        }
      );

      console.log('Connexion réussie:', response.data);

      //  Redirection vers la page principale
      navigate("/home");

    } catch (error) {
      if (error.response) {
        setError(error.response.data.detail || "Identifiants incorrects.");
      } else {
        setError("Impossible de se connecter au serveur.");
      }
    } finally {
      setLoading(false); // Réactive le bouton après traitement
    }
  };

  return (
    <div className="login-container">
      <div className="left-section">
       
      </div>
      <div className="right-section">
        <img src={logo} alt="Logo La Cité" className="logo"/>
        <div className="login-header">Connexion</div>
        
         {/* Message d’erreur si identifiants invalides ou serveur inaccessible */}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Nom d'utilisateur:</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Mot de passe:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
           {/*  Bouton de soumission : désactivé si chargement ou champs vides */}
          <button type="submit" disabled={loading || !username || !password}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

      
      </div>
    </div>
  );
}

export default Login;
