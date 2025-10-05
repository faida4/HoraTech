// Importation de React, des composants internes (EtapeSession, Groupes) et des styles CSS .
import React from 'react';
import EtapeSession from './EtapeSession';
import Groupes from './Groupes';
import '../styles/EtapesGroupes.css';

/**etapes-groupes-container : conteneur principal qui regroupe les deux colonnes.
etapes-column : colonne de gauche contenant la gestion des étapes (EtapeSession).
groupes-column : colonne de droite contenant la gestion des groupes (Groupes). */
function EtapesGroupes() {
  return (
    <div className="etapes-groupes-container">
      <div className="etapes-column">
        <EtapeSession />
      </div>
      <div className="groupes-column">
        <Groupes />
      </div>
    </div>
  );
}

export default EtapesGroupes;
