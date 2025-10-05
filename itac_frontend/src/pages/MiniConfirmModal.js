import React from 'react';
import '../styles/mini-modal.css';

// modale flottante de confirmation
// Props attendues :
// - visible (bool) : affiche ou non la modale
// - message (string) : texte de confirmation à afficher
// - onConfirm (function) : action à exécuter si l'utilisateur confirme
// - onCancel (function) : action à exécuter si l'utilisateur annule

const MiniConfirmModal = ({ visible, message, onConfirm, onCancel }) => {
  // Si `visible` est false, ne rend rien (modale cachée)
  if (!visible) return null;

  return (
    <div className="mini-modal-overlay">
      <div className="mini-modal-content">
        <p className="mini-modal-message">{message}</p>
        <div className="mini-modal-buttons">
          <button className="btn btn-confirm" onClick={onConfirm}>Oui</button>
          <button className="btn btn-cancel" onClick={onCancel}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default MiniConfirmModal;
