import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Groupes.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import MiniConfirmModal from './MiniConfirmModal';
import { toast } from 'react-hot-toast';


function Groupes() {
  //  Définition de tous les états nécessaires à l’affichage, la recherche, la sélection, 
  // le formulaire, la modale et la suppression.
  const [groups, setGroups] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [stages, setStages] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [modal, setModal] = useState({ open: false, mode: "add", group: null });
  const [form, setForm] = useState({ name: "", programId: "", stageId: "" });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
 

  //charger toutes les données dès que la page est montée.
  useEffect(() => {
    fetchPrograms();
    fetchStages();
    fetchGroups();
  }, []);

// Requêtes de récupération (programmes, étapes, groupes)

  const fetchPrograms = async () => {
    const res = await axios.get("http://127.0.0.1:8000/programs/");
    setPrograms(res.data);
  };

  const fetchStages = async () => {
    const res = await axios.get("http://127.0.0.1:8000/stages/");
    setStages(res.data);
  };

  const fetchGroups = async () => {
    const res = await axios.get("http://127.0.0.1:8000/groups/");
    setGroups(res.data);
  };

  // filtrer selon le programme, l’étape et le texte recherché.
  const handleFilter = (group) => {
    return (
      (!selectedProgram || group.program_id === parseInt(selectedProgram)) &&
      (!selectedStage || group.stage_id === parseInt(selectedStage)) &&
      (group.name.toLowerCase().includes(search.toLowerCase()) ||
       group.program_name.toLowerCase().includes(search.toLowerCase()))
    );
  };

  //Ouvrir la modale d'ajout ou de modification
  const openModal = (mode, group = null) => {
    setModal({ open: true, mode, group });
    if (group) {
      setForm({ name: group.name, programId: group.program_id, stageId: group.stage_id });
    } else {
      setForm({ name: "", programId: "", stageId: "" });
    }
  };

  // Envoie les données saisies vers l’API pour créer ou modifier un groupe selon le mode actif de la modale.
  const handleSubmit = async () => {
    if (!form.name || !form.programId || !form.stageId) return alert("Tous les champs sont requis");
    try {
      if (modal.mode === "add") {
        //  Crée un nouveau groupe
        await axios.post(`http://127.0.0.1:8000/stages/${form.stageId}/groups/add/`, {
          name: form.name,
          program_id: form.programId
        });
        toast.success("Groupe ajouté !");
      } else if (modal.mode === "edit") {
        // Met à jour un groupe existant
        await axios.put(`http://127.0.0.1:8000/groups/${modal.group.id}/update/`, {
          name: form.name,
          program_id: form.programId
        });
        toast.success("Groupe modifié !");
      }
      fetchGroups();
      setModal({ open: false, mode: "add", group: null });
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Erreur lors de l'enregistrement");
    }
  };


  //Ouvre la mini-modale de confirmation pour supprimer un groupe, et le supprime via l’API si l’utilisateur confirme.
  const handleDeleteClick = (id) => {
    setSelectedGroupId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/groups/${selectedGroupId}/delete/`);
      fetchGroups();
      toast.success("Groupe supprimé !");
    } catch (err) {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="groupes-page">
      <h2>Gestion des groupes</h2>

      <div className="filters">
        <input type="text" placeholder=" Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)}>
          <option value="">-- Programme --</option>
          {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)}>
          <option value="">-- Étape --</option>
          {stages.map((s) => <option key={s.id} value={s.id}>Étape {s.number} ({s.session})</option>)}
        </select>
        <button onClick={() => openModal("add")}> <FontAwesomeIcon icon={faPlus} /> Ajouter un groupe</button>
      </div>

      <table className="group-table">
        <thead>
          <tr>
            <th>Groupe</th>
            <th>Programme</th>
            <th>Étape</th>
            <th>Session</th>
            <th>Année</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.filter(handleFilter).map((group) => (
            <tr key={group.id}>
              <td>{group.name}</td>
              <td>{group.program_name}</td>
              <td>{group.stage_number}</td>
              <td>{group.stage_session}</td>
              <td>{group.stage_year}</td>
              <td>
              <div className="action-buttons">
                <button onClick={() => openModal("edit", group)}>
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button onClick={() => handleDeleteClick(group.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/**🔹 Formulaire affiché dans une modale pour ajouter ou modifier un groupe. */}
      {modal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modal.mode === "add" ? "Ajouter un groupe" : "Modifier le groupe"}</h3>
            <input type="text" placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })}>
              <option value="">Choisir un programme</option>
              {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={form.stageId} onChange={(e) => setForm({ ...form, stageId: e.target.value })}>
              <option value="">Choisir une étape</option>
              {stages.map((s) => <option key={s.id} value={s.id}>Étape {s.number} ({s.session})</option>)}
            </select>
            <div className="modal-actions">
              <button onClick={handleSubmit}><FontAwesomeIcon icon={faPlus} /> {modal.mode === "add" ? "Ajouter" : "Modifier"}</button>
              <button onClick={() => setModal({ open: false, mode: "add", group: null })}><FontAwesomeIcon icon={faTimes} /> Annuler</button>
            </div>
          </div>
        </div>
      )}
{/**Composant de confirmation flottant, utilisé pour valider une suppression */}
<MiniConfirmModal
        visible={showConfirmModal}
        message="Voulez-vous vraiment supprimer ce groupe ?"
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}

export default Groupes;
