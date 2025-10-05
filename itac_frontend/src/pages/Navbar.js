import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import '../styles/Navbar.css'; // Fichier CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCalendarAlt, faUsers, faHome, faLayerGroup,faDiagramProject } from '@fortawesome/free-solid-svg-icons';
import defaultAvatar from "../images/default-avatar.png";

 

function Navbar() {

  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(null); // État pour stocker la photo de profil (chargée depuis le backend)
  const [showDropdown, setShowDropdown] = useState(false); // // Gère l'affichage du menu déroulant (profil)

  //  Déconnexion utilisateur via l'API
  const handleLogout = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/accounts/logout/", {}, { withCredentials: true });
      navigate("/"); // Redirige vers la page de connexion
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  const dropdownRef = useRef(null);

  //  Ferme le menu deroulant si on clique ailleurs
useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

    //  Récupère les informations de profil depuis le backend
    useEffect(() => {
      axios.get("http://127.0.0.1:8000/accounts/profile/", { withCredentials: true })
        .then(response => {
          setProfilePicture(response.data.profile_picture);
        })
        .catch(err => {
          console.error("Erreur de profil", err);
        });
    }, []);
      


  return (
  <>
  {/* BARRE LATÉRALE BLEUE */}
  <div className="sidebar1">
  <button title="Accueil" onClick={() => navigate("/home")}>
  <FontAwesomeIcon icon={faHome} className="icon" />
  <span className="label">Accueil</span>
  </button>
  <button title="Cours" onClick={() => navigate("/courses")}>
  <FontAwesomeIcon icon={faBook} className="icon" />
  <span className="label">Cours</span>
  </button>
  <button title="Professeurs" onClick={() => navigate("/professors")}>
  <FontAwesomeIcon icon={faUsers} className="icon" />
  <span className="label">Professeurs</span>
  </button>
  <button title="Calendrier profs" onClick={() => navigate("/professor-schedule/")}>
  <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
  <span className="label">Calendrier</span>
  </button>
<button title="Programmes" onClick={() => navigate("/programs")}>
  <FontAwesomeIcon icon={faDiagramProject} className="icon" />
  <span className="label">Programmes</span>
</button>
<button title="Étapes & Groupes" onClick={() => navigate("/etapesGroups")}>
  <FontAwesomeIcon icon={faLayerGroup} className="icon" />
  <span className="label">Étapes & Groupes</span>
</button>

  </div>

  {/* BARRE SUPÉRIEURE */}
  <div className="topbar">
  <div className="left">
  <img src={require("../images/LaCite-logo.png")} alt="Logo La Cité" className="logo-lacite" />
</div>

    <div className="right">
    <div className="profile-menu-container" ref={dropdownRef}>
  <div className="profile-trigger" onClick={() => setShowDropdown(!showDropdown)}>
    <img
      src={profilePicture || defaultAvatar}
      alt="Avatar"
      className="menu-avatar"
    />
    <span className="menu-arrow">{showDropdown ? "▲" : "▼"}</span>
  </div>

  {/*  Menu déroulant si activé */}
  {showDropdown && (
    <div className="menu-dropdown">
      <button onClick={() => { navigate("/profile"); setShowDropdown(false); }}>
      Profil
      </button>

      <div className="menu-separator"></div>
      <button onClick={() => { handleLogout(); setShowDropdown(false); }}>
      Déconnexion
      </button>
    </div>
  )}
</div>


    
    </div>
  </div>
  </>
  );
}

export default Navbar;
