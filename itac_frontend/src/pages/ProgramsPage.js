// src/pages/ProgramsPage.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Program.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast'; // Notifications utilisateur

function ProgramsPage() {
  const [programs, setPrograms] = useState([]);     // Liste des programmes récupérés du backend
  const [newProgram, setNewProgram] = useState({ name: '', code: '' }); // Programme en cours de création/édition
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPrograms();  // Appelé au montage du composant
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/programs/');
      setPrograms(res.data); // Met à jour la liste des programmes
    } catch (err) {
      console.error("Erreur chargement des programmes :", err);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (editId) { //  Mise à jour si `editId` est défini
        await axios.put(`http://127.0.0.1:8000/programs/${editId}/edit/`, newProgram);
        toast.success("Programme modifié avec succès !");
      } else { //  Création d’un nouveau programme
        await axios.post('http://127.0.0.1:8000/programs/create/', newProgram);
        toast.success("Programme ajouté avec succès !");
      }
      //  Réinitialise le formulaire
      setNewProgram({ name: '', code: '' });
      setEditId(null);
      setIsModalOpen(false);
      fetchPrograms();    // Recharge la liste
    } catch (err) {
      console.error("Erreur lors de l'enregistrement :", err);
    }
  };

  // Suppression d’un programme
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/programs/${id}/delete/`);
      toast.success("Programme supprimé !");
      fetchPrograms();  // Recharge les programmes après suppression
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      toast.error("Erreur lors de la suppression.");
    }
  };

  const startEdit = (program) => {
    setNewProgram({ name: program.name, code: program.code });
    setEditId(program.id);
    setIsModalOpen(true);   // Ouvre la modale avec les données du programme
  };

  return (
    <div className="programs-page">
      <h2><FontAwesomeIcon icon={faEdit} style={{ marginRight: '8px' }} />Liste des programmes</h2>

      <div className="add-button-wrapper">
          {/*  Bouton pour ouvrir la modale en mode création */}
        <button onClick={() => {
            setEditId(null);
            setNewProgram({ name: '', code: '' });
            setIsModalOpen(true);
        }}>
            <FontAwesomeIcon icon={faPlus} /> Ajouter
        </button>
        </div>

         {/*  Tableau des programmes */}
      <ul className="programs-table">
        <li className="table-header">
          <span><strong>Code programme</strong></span>
          <span><strong>Nom du programme</strong></span>
          <span><strong>Actions</strong></span>
        </li>
        {programs.map((program) => (
          <li key={program.id} className="table-row">
            <span>{program.code}</span>
            <span>{program.name}</span>
            <span className="action-buttons">
              <button onClick={() => startEdit(program)} title="Modifier">
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button onClick={() => handleDelete(program.id)} title="Supprimer">
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </span>
          </li>
        ))}
      </ul>
        {/*Formulaire dans la modale (Ajout/Édition) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editId ? "Modifier un programme" : "Ajouter un programme"}</h3>
            <input
              type="text"
              placeholder="Nom du programme"
              value={newProgram.name}
              onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Code"
              value={newProgram.code}
              onChange={(e) => setNewProgram({ ...newProgram, code: e.target.value })}
            />
            <div className="modal-actions">
              <button onClick={handleCreateOrUpdate}>
                <FontAwesomeIcon icon={editId ? faEdit : faPlus} />
                {editId ? "Modifier" : "Ajouter"}
              </button>
              <button onClick={() => setIsModalOpen(false)}>
                <FontAwesomeIcon icon={faTimes} /> Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgramsPage;
