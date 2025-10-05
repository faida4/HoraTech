import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/EtapeSession.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

function EtapeSession() {
  const [stages, setStages] = useState([]); //  Liste des étapes à afficher
  const [form, setForm] = useState({ number: "", session: "Hiver" }); //  Données du formulaire (ajout/modification)
  const [editId, setEditId] = useState(null); //  ID de l'étape 
  const [showForm, setShowForm] = useState(false);

  // Récupère les étapes dès le premier chargement
  useEffect(() => {
    fetchStages();
  }, []);

   //  Appel API pour récupérer les étapes existantes
  const fetchStages = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/stages/");
      setStages(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des étapes :", error);
    }
  };

  //  Soumission du formulaire (ajout ou modification)
  const handleSubmit = async () => {
    if (!form.number) return alert("Veuillez entrer un numéro d'étape");
    try {
      if (editId) {
         // Met à jour une étape existante
        await axios.put(`http://127.0.0.1:8000/stages/${editId}/update/`, form);
      } else {
         //  Crée une nouvelle étape
        await axios.post("http://127.0.0.1:8000/stages/add/", form);
      }
      //  Rafraîchit la liste et réinitialise le formulaire
      fetchStages();
      setForm({ number: "", session: "Hiver" });
      setEditId(null);
      setShowForm(false);
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
    }
  };

 //  Supprime une étape
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/stages/${id}/delete/`);
      fetchStages();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  //  Prépare l'édition d'une étape
  const handleEdit = (stage) => {
    setForm({ number: stage.number, session: stage.session });
    setEditId(stage.id);
    setShowForm(true);
  };

   //  Annule l'action en cours (formulaire)
  const cancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ number: "", session: "Hiver" });
  };

  return (
    <div className="etape-session-container">
      <h2>Étapes</h2>
      
      <button className="add-stage-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Annuler" : "Ajouter une étape"}
      </button>

      {/*  Formulaire d’ajout ou de modification */}
      {showForm && (
        <div className="inline-form">
          <select
            value={form.session}
            onChange={(e) => setForm({ ...form, session: e.target.value })}
          >
            <option value="Hiver">Hiver</option>
            <option value="Automne">Automne</option>
          </select>
          <input
            type="number"
            placeholder="Numéro de l'étape"
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
          />
          <div className="inline-form-buttons">
            <button onClick={handleSubmit}>
              <FontAwesomeIcon icon={faPlus} /> {editId ? "Enregistrer" : "Ajouter"}
            </button>
            <button onClick={cancelForm}>
              <FontAwesomeIcon icon={faTimes} /> Annuler
            </button>
          </div>
        </div>
      )}

      {/*  Liste des étapes existantes */}
      {stages.length > 0 ? (
        <div className="stage-list">
          {stages.map((stage) => (
            <div key={stage.id} className="stage-card">
              <h3>
                <span className={`session-badge ${stage.session.toLowerCase()}`}>
                   {/* Emoji selon la session */}
                  {stage.session === "Hiver" ? "❄️" : "🍂"} {stage.session}
                </span>{" "}
                / Étape {stage.number}
              </h3>
              <div className="stage-actions">
                <button onClick={() => handleEdit(stage)}>
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button onClick={() => handleDelete(stage.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Aucune étape trouvée.</p>
      )}
    </div>
  );
}

export default EtapeSession;
