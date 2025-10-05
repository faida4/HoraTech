// GroupList.js
import React from "react";

//  Composant qui affiche la liste des groupes associés à une étape sélectionnée
function GroupList({ selectedStage, selectedGroupes }) {
  return (
    <div className="group-info">
        <h3>  
        Groupes pour {selectedStage ? `Étape ${selectedStage.number} (${selectedStage.session})` : "étape non sélectionnée" } 
        
        </h3>
        <ul>
        {/* Liste des groupes liés à l'étape */}    
        {selectedGroupes.length > 0 ? (
            selectedGroupes.map((groupe) => (
            <li key={groupe.id}>{groupe.name}</li>
            ))
        ) : (
            <li>Aucun groupe trouvé pour cette combinaison.</li>
        )}
        </ul>
  </div>
  );
}

export default GroupList;
