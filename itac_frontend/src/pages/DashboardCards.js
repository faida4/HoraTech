import React from "react";

//  Composant d'affichage des cartes statistiques du tableau de bord
function DashboardCards({ dashboardStats }) {
  return (
    <div className="dashboard-cards">
      
       {/*  Carte : Nombre total de cours */}
      <div className="card-box blue">
        <h4>Total de cours</h4>
        <p>{dashboardStats.totalCourses}</p>
      </div>
      
      {/*  Carte : Nombre de professeurs uniques */}
      <div className="card-box green">
        <h4>Professeurs uniques</h4>
        <p>{dashboardStats.uniqueProfessors}</p>
      </div>
      
      {/*  Carte : Total d'heures planifiées */}
      <div className="card-box purple">
        <h4>Heures planifiées</h4>
        <p>{dashboardStats.totalPlannedHours} h</p>
      </div>
      
      {/*  Carte : Nombre de cours non encore planifiés */}
      <div className="card-box red">
        <h4>Cours non planifiés</h4>
        <p>{dashboardStats.unplannedCourses}</p>
      </div>
    </div>
  );
}

export default DashboardCards;
