// Import des librairies, plugins et composants
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Draggable } from "@fullcalendar/interaction";
import 'tippy.js/dist/tippy.css';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ConfirmationModal from "./ConfirmationModal";
import CalendarView from "./CalendarView";
import DashboardCards from "./DashboardCards";
import SidebarCourses from "./SidebarCourses";
import GroupList from "./GroupList";
import '../styles/Home.css';

function Home() {
  // États pour les programmes, étapes, cours et groupes
  const [stage, setStage] = useState("");
  const [stages, setStages] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedGroupes, setSelectedGroupes] = useState([]);
  const selectedStage = stages.find(etape => etape.id === parseInt(stage)); // Récupère l'étape sélectionnée
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [program, setProgram] = useState("");
  const [programs, setPrograms] = useState([]);
  // États pour le calendrier
  const [events, setEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState({});  //Sauvegarde des événements par étape
  const [showCourseModal, setShowCourseModal] = useState(false);
  // États pour le drag, modales, cours sélectionnés
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
   // Navigation & redirection
  const location = useLocation();
  const navigate = useNavigate();
    // Modale de confirmation personnalisée 
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
  title: "",
  message: "",
  icon: null,
  confirmText: "Confirmer",
  cancelText: "Annuler",
  onConfirm: () => {},
  onCancel: () => {}
});
// Affiche une modale de confirmation personnalisée (utilisée pour confirmer des actions sensibles)
const showConfirmationModal = ({ title, message, icon, confirmText, cancelText, onConfirm, onCancel }) => {
  setModalProps({
    title,
    message,
    icon,
    confirmText,
    cancelText,
    onConfirm: () => {
      onConfirm();
      setShowModal(false);
    },
    onCancel: () => {
      onCancel();
      setShowModal(false);
    }
  });
  setShowModal(true);
};

   const generateColor = (courseName) => {
    const vibrantColors = [
      "#FFC107", 
      "#42A5F5", 
      "#EF5350", 
      "#66BB6A", 
      "#AB47BC", 
      "#FF7043", 
      "#5C6BC0", 
      "#26A69A", 
      "#EC407A", 
      "#8D6E63", 
    ];
    // Génère une couleur pour un cours en fonction de la longueur de son nom
    return vibrantColors[courseName.length % vibrantColors.length];
  };
// Statistiques pour le tableau de bord
  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    totalPlannedHours: 0,
    unplannedCourses: 0,
    uniqueProfessors: 0
  });
// Exporter les événements planifiés du calendrier vers un fichier Excel
  const exportToExcel = () => {
    //Récupération du nom du programme et de l'étape actuels
    const selectedProgram = programs.find(p => p.id === +program);
    const selectedStage = stages.find(e => e.id === +stage);
    const nomProgramme = selectedProgram?.name || "Programme";
    const nomEtape = selectedStage ? `Étape ${selectedStage.number}` : "Étape";
    const session = selectedStage?.session || "";
    //Nom du fichier de sortie
    const nomFichier = `horaire_${nomProgramme.replace(/\s+/g, "_")}_${nomEtape.replace(/\s+/g, "_")}.xlsx`;
  // Structure des données à exporter à partir des événements planifiés
    const exportData = events.map(({ start, end, title }) => {
      const [Cours = "Cours", Groupe = "Groupe", Professeur = "Professeur"] = title.split(" - ");
      const jour = start.toLocaleDateString('fr-FR', { weekday: 'long' });
      const heureDebut = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const heureFin = end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "N/A";
  
      return {
        Programme: nomProgramme,
        Étape: nomEtape,
        Session: session,
        Cours,
        Groupe,
        Professeur,
        Jour: jour.charAt(0).toUpperCase() + jour.slice(1),
        "Heure de début": heureDebut,
        "Heure de fin": heureFin
      };
    });
  //  Création du fichier Excel
    const worksheet = XLSX.utils.json_to_sheet(exportData);  //Feuille de calcul
    const workbook = XLSX.utils.book_new();                   // Nouveau classeur
    XLSX.utils.book_append_sheet(workbook, worksheet, "Horaire"); // Ajout de la feuille "Horaire"
  //  Génération et téléchargement du fichier .xlsx
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, nomFichier);
  };
  
  //  Charge la liste des programmes une seule fois au chargement initial
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/programs/")
      .then((res) => setPrograms(res.data))
      .catch((err) => console.error("Erreur récupération des programmes :", err));
  }, []);
  
//  Charge la liste des étapes une seule fois au chargement initial
  useEffect(() => {
    // Récupérer les étapes disponibles
    axios.get("http://127.0.0.1:8000/stages/")
      .then(response => setStages(response.data))
      .catch(error => console.error("Erreur lors de la récupération des étapes :", error));
  }, []);
 
  //  Met à jour l’étape sélectionnée depuis la liste déroulante
  const handleStageChange = (e) => {
    setStage(e.target.value);
  };

  useEffect(() => {
    toast.dismiss();  // supprime tous les toasts à chaque changement d'URL
  }, [location]);

  
  //  Initialise le drag & drop des éléments externes 
  useEffect(() => {
    let containerEl = document.getElementById("external-events");

  //  Vérifie que Draggable n’est pas déjà activé pour éviter les doublons
    if (containerEl && !containerEl.hasAttribute("draggable-init")) {
      containerEl.setAttribute("draggable-init", "true"); // Ajout d'un attribut pour éviter la réactivation
      
    //  Active le drag depuis les éléments .fc-event dans la sidebar
      const draggable = new Draggable(containerEl, {
        itemSelector: ".fc-event",  // éléments cliquables/dragables
        eventData: (eventEl) => {
          //  Récupère les données de l'attribut data-event (format JSON)
          let data = JSON.parse(eventEl.getAttribute("data-event") || "{}");
          console.log("🔵 Draggable - Données envoyées :", data);
          return {
            title: data.title,
            id: data.id,
            color: data.color || "#007bff",
            duration: "03:00",  // Durée par défaut du cours si non précisé
          };
        }
      });
  
      console.log(" Draggable activé !");
  
      return () => {
        console.log(" Draggable supprimé !");
        draggable.destroy(); // Supprime Draggable au démontage
        containerEl.removeAttribute("draggable-init"); // Réinitialisation pour éviter une nouvelle activation
      };
    }
  }, []);

//  Gère le drop d’un cours depuis la sidebar dans le calendrier FullCalendar
  const handleEventReceive = async (info) => {
    console.log(" FullCalendar a REÇU un événement :", info);

    //  Extraction des données de l’élément drag & drop
    let eventData;
    try {
        eventData = JSON.parse(info.draggedEl.getAttribute("data-event"));
    } catch (error) {
        console.error(" Erreur de parsing JSON :", error);
        return;
    }

    //  Calcul des heures de début et de fin 
    let startTime = info.event.start ? info.event.start.toISOString() : null;
    let endTime = info.event.end ? info.event.end.toISOString() : new Date(info.event.start.getTime() + (3 * 60 * 60 * 1000)).toISOString();

    if (!startTime) {
        console.error(" Erreur: Impossible de récupérer une date valide !");
        return;
    }

    const eventDay = new Date(startTime).toLocaleDateString('fr-FR', { weekday: 'long' });

    const eventId = parseInt(eventData.id, 10);
    if (isNaN(eventId)) {
        console.error(" Erreur: ID d'événement invalide :", eventData.id);
        return;
    }

    //  Vérifier les conflits avant d'ajouter l'événement
    try {
        const conflictCheck = await axios.post("http://127.0.0.1:8000/schedules/check_conflict/", {
          professor_id: eventData.professor_id,
          group_id: eventData.group_id,
          start_time: startTime,
          end_time: endTime,
          day: eventDay
        });

        //  Si le professeur est occupé → afficher une modale de confirmation
        if (conflictCheck.data.professor_conflict) {
          showConfirmationModal({
            title: "Conflit d’horaire détecté",
            icon: "⚠️",
            message: `Le professeur ${eventData.professor_name || eventData.professor || "sélectionné"} est déjà occupé à ce moment. Souhaitez-vous consulter son calendrier ?`,
            confirmText: "Voir le calendrier",
            cancelText: "Annuler",
            onConfirm: () => navigate(`/professor-schedule?profId=${eventData.professor_id}`),
            onCancel: () => info.revert()
          });
          return;
        }

          //  Si le groupe est occupé
        if (conflictCheck.data.group_conflict) {
          toast.error("Conflit : Ce groupe a déjà un autre cours à ce moment.")
          info.revert();
          return;
        }
        
    } catch (error) {
        console.error(" Erreur lors de la vérification des conflits :", error);
        return;
    }

//Demander confirmation avant de déplacer
if (isNaN(eventId)) {
  console.error("Erreur: ID d'événement invalide :", eventData.id);
  return;
}

// Comparaison avec les anciens horaires si le cours est déjà planifié
const oldEvent = events.find(e => e.id === eventId);

if (oldEvent) {
  const oldDay = oldEvent.start.toLocaleDateString('fr-FR', { weekday: 'long' });
  const oldStart = oldEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const oldEnd = oldEvent.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

//  Conversion des nouvelles valeurs (startTime / endTime) provenant de l'événement drag & drop
  const newDay = new Date(startTime).toLocaleDateString('fr-FR', { weekday: 'long' }); //  Nouveau jour proposé
  const newStart = new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); //Nouvelle heure de début
  const newEnd = new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });// Nouvelle heure de fin 

  // Affiche une confirmation si le créneau change
  if (oldDay !== newDay || oldStart !== newStart || oldEnd !== newEnd) {
    showConfirmationModal({
      title: "Ce cours est déjà planifié",
      message: `Il est actuellement prévu le ${oldDay}. Voulez-vous vraiment le déplacer ?`,
      confirmText: "Oui, déplacer",
      cancelText: "Non",
      onConfirm: () => updateEvent(eventId, startTime, endTime, eventDay, eventData, info),
      onCancel: () => info.revert()
    });
    return;
  } 
}
    //  Aucun conflit → on met à jour l'horaire
    const url = `http://127.0.0.1:8000/schedules/${eventId}/add/`;

    try {
        const response = await axios.put(url.trim(), {
            start_time: startTime,
            end_time: endTime,
            day: eventDay
        }, {
            headers: { "Content-Type": "application/json" }
        });
        await reloadCoursesAndEvents(); // recharge tout (cours + calendrier)


        // Synchronise aussi la liste des cours 
        setCourses((prev) =>
          prev.map(c =>
            c.id === eventId
              ? { ...c, start_time: startTime, end_time: endTime, day: eventDay }
              : c
          )
        );
        console.log(" Cours mis à jour avec succès :", response.data);

        // Crée l’objet événement formaté pour le calendrier
        const newEvent = {
            id: eventId,
            title: eventData.title,
            start: new Date(startTime),
            end: new Date(endTime),
            backgroundColor: eventData.color || "#007bff",
            extendedProps: {
              professor_id: eventData.professor_id,
              group_id: eventData.group_id,
            },
        };

        // Met à jour l’état local en ajoutant le nouvel événement pour l’étape actuelle
        setSavedEvents((prev) => ({
            ...prev,
            [stage]: [...(prev[stage] || []), newEvent], // ajoute `newEvent` à la liste de l'étape courante
        }));

         // Met à jour le calendrier
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === eventId
              ? { ...event, start: new Date(startTime), end: new Date(endTime) }
              : event
          )
        );
    } catch (error) {
        console.error(" Erreur lors de la mise à jour :", error);
        info.revert(); //  Annuler l'ajout en cas d'erreur
    }
};

//  Met à jour un événement planifié dans le backend 
const updateEvent = async (eventId, startTime, endTime, eventDay, eventData, info) => {
  try {
    //  Requête PUT vers l’API pour enregistrer les nouvelles données d’horaire
    const response = await axios.put(`http://127.0.0.1:8000/schedules/${eventId}/add/`, {
      start_time: startTime,
      end_time: endTime,
      day: eventDay
    });

     //  Recharge les cours et événements depuis l’API pour tout synchroniser
    await reloadCoursesAndEvents();
 //  Met à jour la liste des cours localement 
    setCourses((prev) =>
      prev.map(c =>
        c.id === eventId
          ? { ...c, start_time: startTime, end_time: endTime, day: eventDay }
          : c
      )
    );
//  Crée l’objet événement à enregistrer dans `savedEvents`
    const newEvent = {
      id: eventId,
      title: eventData.title,
      start: new Date(startTime),
      end: new Date(endTime),
      backgroundColor: eventData.color || "#007bff",
      extendedProps: {
        professor_id: eventData.professor_id,
        group_id: eventData.group_id,
      },
    };
//  Sauvegarde de l’événement dans la mémoire locale par étape
    setSavedEvents((prev) => ({
      ...prev,
      [stage]: [...(prev[stage] || []), newEvent],
    }));

  //  Met à jour l’événement dans le calendrier
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? { ...event, start: new Date(startTime), end: new Date(endTime) }
          : event
      )
    );

    toast.success("Cours déplacé avec succès !");
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    info.revert();  //  Revenir à l'état précédent dans FullCalendar
    toast.error("Erreur lors de la mise à jour.");
  }
};

// Charge les cours planifiés depuis l’API dès qu’un programme et une étape sont sélectionnés
useEffect(() => {
  console.log(" Chargement des cours pour :", { stage, program });

  // Vérification que les filtres nécessaires sont bien sélectionnés
  if (!stage || !program) {
    console.warn(" Étape ou programme non défini.");
    return;
  }

  //  Requête à l'API pour récupérer les cours correspondant au stage et programme
  axios.get(`http://127.0.0.1:8000/schedules/?stage_id=${stage}&program_id=${program}`)
    .then((response) => {
      const data = response.data;
      console.log(" Données filtrées reçues :", data);

      setCourses(data); // Enregistre la liste brute des cours dans la sidebar

      //  Filtrer uniquement les événements planifiés (ayant des dates)
      // → Les cours qui n’ont pas été déposés (drag & drop) ont des champs start_time / end_time / day à null
      const validEvents = data
        .filter(e => e.start_time && e.end_time && e.day)
        .map(e => ({
          id: e.id,
          title: `${e.course} - ${e.group} - ${e.professor}`, // Format d’affichage
          start: new Date(e.start_time.replace("Z", "")),
          end: new Date(e.end_time.replace("Z", "")),
          backgroundColor: generateColor(e.course),
          extendedProps: {
            professor_id: e.professor_id,
            group_id: e.group_id,
          },
        }));
 
      setEvents(validEvents); //  Mise à jour du calendrier 

      // Mise à jour de la sauvegarde locale des événements pour cette étape
      setSavedEvents(prev => ({
        ...prev,
        [stage]: validEvents
      }));

      // Calculs pour le tableau de bord
      const totalCourses = data.length;
      const unplannedCourses = data.filter(c => !c.start_time || !c.end_time || !c.day).length;
      const uniqueProfessors = new Set(data.map(c => c.professor)).size;
      const totalPlannedHours = validEvents.reduce((total, e) => {
        const duration = (new Date(e.end) - new Date(e.start)) / (1000 * 60 * 60);
        return total + duration;
      }, 0);

      // Mise à jour de l’état du tableau de bord
      setDashboardStats({
        totalCourses,
        unplannedCourses,
        uniqueProfessors,
        totalPlannedHours: totalPlannedHours.toFixed(1)
      });
    })
    .catch((error) => {
      console.error(" Erreur chargement des cours :", error);
    });
}, [stage, program]);

// 👥 Charge la liste des groupes pour l'étape et le programme sélectionnés
// ➤ Utilisé pour afficher les groupes dans la section GroupList
useEffect(() => {
  if (stage && program) {
    axios.get(`http://127.0.0.1:8000/stages/${stage}/groups/?program_id=${program}`)
      .then((response) => {
        setSelectedGroupes(response.data);
        console.log(" Groupes filtrés :", response.data);
      })
      .catch(error => console.error(" Erreur récupération groupes :", error));
  } else {
    setSelectedGroupes([]); 
  }
}, [stage, program]);

// Recharge les cours, événements du calendrier et les stats
const reloadCoursesAndEvents = async () => {
  try {
    if (stage && program) {
      const res = await axios.get(`http://127.0.0.1:8000/schedules/?stage_id=${stage}&program_id=${program}`);
      const data = res.data;

      //  Met à jour la liste des cours (sidebar)
      setCourses(data);

      //  Filtrer uniquement les événements planifiés (ayant des dates)
      const validEvents = data
        .filter(e => e.start_time && e.end_time && e.day)
        .map(e => ({
          id: e.id,
          title: `${e.course} - ${e.group} - ${e.professor} `,
          start: new Date(e.start_time.replace("Z", "")),
          end: new Date(e.end_time.replace("Z", "")),
          backgroundColor: generateColor(e.course),
          extendedProps: {
            professor_id: e.professor_id || (e.professor?.id ?? null),
            group_id: e.group_id || (e.group?.id ?? null),
          },
        }));

      // Met à jour les événements dans le calendrier
      setEvents(validEvents);

      //  Met à jour les événements sauvegardés
      setSavedEvents(prev => ({
        ...prev,
        [stage]: validEvents
      }));

      // Calcul des stats
      const totalCourses = data.length;
      const unplannedCourses = data.filter(c => !c.start_time || !c.end_time || !c.day).length;
      const uniqueProfessors = new Set(data.map(c => c.professor)).size;
      const totalPlannedHours = validEvents.reduce((total, e) => {
        const duration = (new Date(e.end) - new Date(e.start)) / (1000 * 60 * 60);
        return total + duration;
      }, 0);

      setDashboardStats({
        totalCourses,
        unplannedCourses,
        uniqueProfessors,
        totalPlannedHours: totalPlannedHours.toFixed(1)
      });

      console.log(" Rechargement des cours et événements terminé !");
    }
  } catch (err) {
    console.error(" Erreur lors du rechargement des cours/événements :", err);
  }
};

  return (
    <div className="app-container">
       {/*  Sidebar – Liste des cours à gauche + filtres */}
      <SidebarCourses
        courses={courses}
        programs={programs}
        stages={stages}
        program={program}
        stage={stage}
        handleStageChange={handleStageChange}
        setProgram={setProgram}
        generateColor={generateColor}
        navigate={navigate}
        setSelectedCourse={setSelectedCourse}
        setShowCourseModal={setShowCourseModal}
      />

      {/* Conteneur Principal - Calendrier */}
      <div className="main-content">
          {/* Cartes statistiques  */}
      <DashboardCards dashboardStats={dashboardStats} />

        <div className="calendar-container">
        {/*  Zone d'affichage du calendrier */}
        <CalendarView
          events={events}
          stage={stage}
          isDragging={isDragging}
          handleEventReceive={handleEventReceive}
          exportToExcel={exportToExcel}
          setIsDragging={setIsDragging}
          setCourseToDelete={setCourseToDelete}
          setShowDeleteModal={setShowDeleteModal}
          updateEvent={updateEvent}
          reloadCoursesAndEvents={reloadCoursesAndEvents}
          showConfirmationModal={showConfirmationModal}
        />
        </div>
        {/* Affichage des groupes liés à l’étape sélectionnée */}
        <GroupList selectedStage={selectedStage} selectedGroupes={selectedGroupes} />
      </div>

{/*  Modale d'information sur un cours (depuis la sidebar) */}
      {showCourseModal && selectedCourse && (
  <div className="course-modal-overlay">
    <div className="course-modal">
      <h3>{selectedCourse.course}</h3>
      <p><strong>Professeur :</strong> {selectedCourse.professor}</p>
      <p><strong>Groupe :</strong> {selectedCourse.group}</p>

      <div className="modal-buttons">
        {/*  Supprime le cours de la liste */}
        <button
          onClick={async () => {
            try {
              await axios.delete(`http://127.0.0.1:8000/schedules/${selectedCourse.id}/delete/`);
              await reloadCoursesAndEvents(); // Mise à jour locale après suppression
              setShowCourseModal(false);
              toast.success("Cours supprimé !");
            } catch (e) {
              toast.error("Erreur lors de la suppression.");
            }
          }}
        >
          Supprimer
        </button>
        <button onClick={() => setShowCourseModal(false)}> Annuler</button>
      </div>
    </div>
  </div>
)}

{/*  Modale de suppression depuis le calendrier */}
{showDeleteModal && courseToDelete && (
  <div className="course-modal-overlay">
    <div className="course-modal">
      <h3>Supprimer ce cours ?</h3>
      <p><strong>{courseToDelete.title}</strong></p>

      <div className="modal-buttons">
      {/*  Supprime uniquement l'horaire (mais garde le cours dans la liste) */}
        <button
          onClick={async () => {
            try {
              await axios.put(`http://127.0.0.1:8000/schedules/${courseToDelete.id}/add/`, {
                start_time: null,
                end_time: null,
                day: null
              });

              await reloadCoursesAndEvents();
              courseToDelete.remove(); // Supprime l'élément du calendrier visuellement
              localStorage.setItem("refresh_prof_schedule", "true");
              toast.success("Cours supprimé avec succès !");
              setShowDeleteModal(false);
            } catch (err) {
              toast.error("Erreur lors de la suppression.");
            }
          }}
        >
          Supprimer
        </button>

        <button onClick={() => setShowDeleteModal(false)}>Annuler</button>
      </div>
    </div>
  </div>
)}


{showModal && (
  <ConfirmationModal
    visible={showModal}
    title={modalProps.title}
    icon={modalProps.icon}
    message={modalProps.message}
    confirmText={modalProps.confirmText}
    cancelText={modalProps.cancelText}
    onConfirm={modalProps.onConfirm}
    onCancel={modalProps.onCancel}
  />
)}

    </div>
    
  );
}

export default Home;