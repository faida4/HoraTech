import React from 'react';
import '../styles/ConfirmationModal.css';

//  Composant de modale de confirmation réutilisable
// Il affiche un message avec deux options : Confirmer ou Annuler
const ConfirmationModal = ({ visible, title, message, icon, confirmText, cancelText, onConfirm, onCancel }) => {
  if (!visible) return null; //  Ne rien afficher si la modale n’est pas visible

  return (
    <div className="confirmation-modal-container">
      {icon && <div style={{ fontSize: '26px', marginBottom: '8px' }}>{icon}</div>}
      <h3 className="confirmation-modal-title">{title}</h3>
      <p className="confirmation-modal-message">{message}</p>
      <div className="confirmation-modal-buttons">
        <button className="btn-confirm" onClick={onConfirm}>{confirmText}</button>
        <button className="btn-cancel" onClick={onCancel}>{cancelText}</button>
      </div>
    </div>
  );
};

export default ConfirmationModal;
