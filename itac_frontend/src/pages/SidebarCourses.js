import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faBook } from "@fortawesome/free-solid-svg-icons";

/**
 *  Composant SidebarCourses
 * 
 * Ce composant représente la **barre latérale** affichant les cours disponibles à planifier.
 * Il permet :
 * - de **filtrer les cours** par programme et étape,
 * - d’**ajouter un nouveau cours**,
 * - d’**afficher tous les cours** sous forme de liste (drag & drop vers le calendrier),
 * - d’**ouvrir une modale** avec les détails d’un cours au clic,
 * - et de **transmettre les données** au calendrier lors du déplacement (drag).
 */
function SidebarCourses({
  courses,                  
  programs,
  stages,
  program,
  stage,
  handleStageChange,
  setProgram,
  generateColor,
  navigate,
  setSelectedCourse,
  setShowCourseModal
}) {
  return (
         <div id="external-events" className="sidebar">
         <h2 className="sidebar-title">
           <FontAwesomeIcon icon={faBook} className="title-icon" /> Cours
         </h2>
   
         {/*  Sélecteur de programme */}
         <select value={program} onChange={(e) => setProgram(e.target.value)} className="stage-selector">
           <option value="">Tous les programmes</option>
           {programs.map((p) => (
             <option key={p.id} value={p.id}>{p.name}</option>
           ))}
         </select>
           
           {/* Sélecteur d'étape */}
           <select value={stage} onChange={handleStageChange} className="stage-selector">
             <option value="">Sélectionner une étape</option>
             {stages.map((etape) => (
               <option key={etape.id} value={etape.id}>Étape {etape.number} - {etape.session}</option>
             ))}
           </select>
   
   
   
           <button type="button" onClick={() => navigate('/courseForm')} className="add-course-btn">
           <FontAwesomeIcon icon={faPlus} className="green-plus-icon" />  Ajouter un cours
           </button>
   
   {/*  Liste des cours affichés (drag & drop activé) */}
           <ul className="course-list">
     {[...courses]
       .sort((a, b) => {
         const aPlanned = a.start_time && a.end_time && a.day;
         const bPlanned = b.start_time && b.end_time && b.day;
         return aPlanned - bPlanned;  // false (0) - true (1) = les non planifiés d'abord
       })
       .map((cours) => {
         const isPlanned = cours.start_time && cours.end_time && cours.day;
         return (
           <li
             key={cours.id}
             className="fc-event"
             draggable="true"
             style={{
               backgroundColor: generateColor(cours.course),
               //opacity: isPlanned ? 0.6 : 1, // légère transparence si déjà planifié
               cursor: isPlanned ? 'default' : 'grab',
               marginBottom: '5px',
             }}
              //  Données transmises au calendrier lors du drag
             data-event={JSON.stringify({
               id: cours.id,
               title: `${cours.course} - ${cours.professor}`,
               professor_id: cours.professor_id,
               professor_name: cours.professor,
               group_id: cours.group_id,
               stage_id: cours.stage,
               color: generateColor(cours.course),
             })}
             //  Clique pour ouvrir la modale de détails du cours
             onClick={() => {
               setSelectedCourse(cours);
               setShowCourseModal(true);
             }}

             //  Gère le drag manuel 
             onDragStart={(e) => {
             
               const eventData = {
                 id: cours.id,
                 title: `${cours.course} - ${cours.professor}`,
                 professor_name: cours.professor,
                 professor_id: cours.professor_id,
                 group_id: cours.group_id,
                 stage_id: cours.stage,
                 color: generateColor(cours.course),
               };
   
               e.dataTransfer.setData("application/json", JSON.stringify(eventData));
             }}
           >
             {cours.course} - {cours.professor} ({cours.group})
             {isPlanned && (
               <div style={{ fontSize: '10px', color: '#ddd' }} >Planifié</div>
             )}
           </li>
         );
       })}
   
   </ul>
   
         </div>
  );
}

export default SidebarCourses;
