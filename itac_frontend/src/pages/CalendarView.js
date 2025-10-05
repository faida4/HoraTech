//  Importation des dépendances nécessaires
import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";  // Vue "Mois"
import timeGridPlugin from "@fullcalendar/timegrid";    // Vue "Semaine" et "Jour"
import interactionPlugin from "@fullcalendar/interaction";  // Drag & Drop, clic, sélection
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import axios from "axios";
import { toast } from "react-hot-toast";        // Notifications
import { useNavigate } from "react-router-dom"; // Navigation entre pages

//  Composant principal d’affichage du calendrier
function CalendarView({
    events,                 //  Liste des événements à afficher
    isDragging,             //  Indique si un événement est en cours de déplacement
    handleEventReceive,     //  Fonction déclenchée lors d’un drop
    exportToExcel,           //  Fonction d’exportation vers Excel
    setIsDragging,           //  Met à jour l'état du drag
    setCourseToDelete,       //  Définit le cours sélectionné pour suppression
    setShowDeleteModal,       //  Affiche la modale de confirmation de suppression
    updateEvent,              //  Met à jour un événement dans le backend
    reloadCoursesAndEvents,   //  Recharge les données après modification
    stage,                     //  Étape courante sélectionnée
    showConfirmationModal      //  Affiche une modale de confirmation (conflit)
  }) {
    const navigate = useNavigate();
  
  return (
    
 <div className="calendar-container">
          <FullCalendar
            locale="fr"     //  Langue en français
            key={stage + events.length}     //  Force le rechargement si stage ou events changent
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            editable={true}
            selectable={true}
            droppable={true}  // Permet le drop
            eventReceive={handleEventReceive} // Gère le drop
            events={events}
            eventMaxStack={1}
            dropAccept=".fc-event"
            //eventDragStart={(info) => console.log("🟣 Début du Drag :", info)}
            eventAdd={(info) => console.log("🟢 Événement ajouté :", info)}
            //eventChange={(info) => console.log("🟡 Événement modifié :", info)}
            eventRemove={(info) => console.log("🟠 Événement supprimé :", info)}
           // eventClick={(info) => console.log("🟠 Un événement a été CLIQUÉ :", info)}
            eventSourceFailure={(error) => console.error(" Erreur de chargement des événements :", error)}
            eventDragStart={(info) => {
              console.log("🟣 Début du Drag :", info);
              setIsDragging(true);
            }}
            
            eventDragStop={() => {
              console.log("🛑 Fin du Drag");
              setIsDragging(false);
            }}
            

            //  Configuration de la barre supérieure
            headerToolbar={{
              left: "prev,next",
              center: "",
              right: "timeGridWeek,timeGridDay,exportExcel"
            }}
            views={{
              timeGridWeek: { buttonText: "Semaine" },
              timeGridDay: { buttonText: "Jour" }
            }}

            //  Ajout d'un bouton personnalisé pour exporter
            customButtons={{
              exportExcel: {
                text: "Export ",
                click: exportToExcel
              }
            }}
            
            
            
            slotMinTime="08:00:00"
            slotMaxTime="23:00:00"
            slotDuration="00:30:00"
            firstDay={1}  // 0 = Dimanche, 1 = Lundi, etc.
            dayHeaderFormat={{ weekday: "long" }} // Affiche "Lundi" au lieu de "lun."
            allDaySlot={false}
            dayHeaderContent={(args) => args.text.split(" ")[0]}

    
            eventClick={async (info) => {
              setCourseToDelete(info.event); // stocke l’événement à supprimer
              setShowDeleteModal(true);      // ouvre la modale
            }}
            
            
    
             //  Modification d’un événement (ex: déplacement ou redimensionnement)
            eventChange={async (info) => {
              const event = info.event;
            
              const start = event.start?.toISOString();
              const end = event.end?.toISOString();
              const day = event.start?.toLocaleDateString('fr-FR', { weekday: 'long' });
            
              const eventId = event.id;
              const { professor_id, group_id } = event.extendedProps || {};
            
              //  Si des infos nécessaires sont manquantes
              if (!professor_id || !group_id) {
                toast.error(" Informations incomplètes (professeur ou groupe manquant).");
                info.revert();  //  Annule le changement
                return;
              }
            
              try {
                //  Vérifie les conflits
                const conflictCheck = await axios.post("http://127.0.0.1:8000/schedules/check_conflict/", {
                  professor_id,
                  group_id,
                  start_time: start,
                  end_time: end,
                  day,
                  event_id: eventId
                });
            
                //  Si un conflit de professeur est détecté
                if (conflictCheck.data.professor_conflict) {
                    showConfirmationModal({
                      title: "Conflit d’horaire détecté",
                      icon: "⚠️",
                      message: `Le professeur est déjà occupé à ce moment. Souhaitez-vous consulter son calendrier ?`,
                      confirmText: "Voir le calendrier",
                      cancelText: "Annuler",
                      onConfirm: () => navigate(`/professor-schedule?profId=${professor_id}`),
                      onCancel: () => info.revert()
                    });
                    return;
                  }
                  
                //  Si un conflit de groupe est détecté
                if (conflictCheck.data.group_conflict) {
                  toast.error(" Ce groupe a déjà un autre cours à ce moment.");
                  info.revert();
                  return;
                }
            
                //  Aucun conflit → Mettre à jour
                await axios.put(`http://127.0.0.1:8000/schedules/${eventId}/add/`, {
                  start_time: start,
                  end_time: end,
                  day
                });
                
                await reloadCoursesAndEvents(); //  Recharge les données

                toast.success("Horaire mis à jour avec succès !")
                console.log(" Nouvel horaire :", { start, end, day });
                localStorage.setItem("refresh_prof_schedule", "true");

            
              } catch (error) {
                console.error(" Erreur lors de la mise à jour :", error);
                toast.error("Une erreur est survenue.")
                info.revert();  // En cas d'erreur, annuler le changement
              }
            }}
            
            
            
        
          
            //  Personnalisation de l'affichage des événements
            eventContent={(arg) => {
              const start = arg.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const end = arg.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const day = arg.event.start.toLocaleDateString('fr-FR', { weekday: 'long' });
            
              //  Contenu affiché à l'intérieur de l'événement
              const content = (
                <div
                  style={{
                    backgroundColor: arg.event.backgroundColor,
                    color: 'white',
                    padding: '5px',
                    borderRadius: '5px',
                    minHeight: '50px',
                    maxWidth: '100%',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '12px',
                    overflow: 'hidden',
                    lineHeight: '1.2'
                  }}
                >
                  <b>{arg.event.title}</b>
                  <span>{arg.timeText}</span>
                </div>
              );
            
              if (isDragging) {
                return content;  // Pas de tooltip si on est en train de drag
              }
            
               //  Tooltip détaillé avec Tippy
              return (
                <Tippy
                  content={
                    <div style={{ fontSize: '13px' }}>
                      <strong>{arg.event.title}</strong><br />
                      Jour : {day}<br />
                      Heure : {start} - {end}
                    </div>
                  }
                  theme="light-border"
                  placement="top"
                >
                  {content}
                </Tippy>
              );
            }}
            

          />
        </div>
  );
}

export default CalendarView;
