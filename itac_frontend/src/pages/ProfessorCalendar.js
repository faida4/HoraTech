import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import defaultAvatar from '../images/default-avatar.png';
import '../styles/ProfessorCalendar.css';
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie } from '@fortawesome/free-solid-svg-icons';  // ou faUserTie
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function ProfessorCalendar() {
  const [professors, setProfessors] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalHours, setTotalHours] = useState(0);
  const selectedProfData = professors.find(p => p.id === selectedProfessor);
  const location = useLocation();
 
const [program, setProgram] = useState("");
const [stage, setStage] = useState("");
const [programs, setPrograms] = useState([]);
const [stages, setStages] = useState([]);
const [groupsInfo, setGroupsInfo] = useState([]); 


// Effet pour charger la liste des programmes, étapes et groupes disponibles 
useEffect(() => {
  axios.get("http://127.0.0.1:8000/programs/").then((res) => setPrograms(res.data));
  axios.get("http://127.0.0.1:8000/stages/").then((res) => setStages(res.data));
  axios.get("http://127.0.0.1:8000/groups/").then((res) => setGroupsInfo(res.data)); 
}, []);





//  Bouton export : génère un fichier Excel 
const exportToExcel = () => {
  // Supprimer les doublons dus aux répétitions (14 semaines)
  const uniqueEvents = [];
  const seen = new Set();

  events.forEach(({ start, end, title }) => {
    const jour = start.toLocaleDateString('fr-FR', { weekday: 'long' });
    const heureDebut = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const heureFin = end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "N/A";
    const key = `${title}-${jour}-${heureDebut}-${heureFin}`;

    if (!seen.has(key)) {
      seen.add(key);
      uniqueEvents.push({ start, end, title });
    }
  });

  // Récupération des informations
  const titrePremierEvent = uniqueEvents[0]?.title || "";
  const [courseName, groupName] = titrePremierEvent.split(" - ");

  const groupMatch = groupsInfo.find(g => g.name === groupName?.trim());

  const nomProgramme = groupMatch?.program_name || "Programme";
  const nomEtape = groupMatch?.stage_number ? `Étape ${groupMatch.stage_number}` : "Étape";
  const session = groupMatch?.stage_session || "";
  const profNom = selectedProfData ? `${selectedProfData.first_name} ${selectedProfData.last_name}` : "Professeur";

  const nomFichier = `horaire_${nomProgramme.replace(/\s+/g, "_")}_${nomEtape.replace(/\s+/g, "_")}.xlsx`;

  //  Structure du tableau à exporter
    const exportData = uniqueEvents.map(({ start, end, title }) => {
    const [Cours = "Cours", Groupe = "Groupe"] = title.split(" - ");

    const jour = start.toLocaleDateString('fr-FR', { weekday: 'long' });
    const heureDebut = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const heureFin = end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "N/A";

    return {
      Programme: nomProgramme,
      Étape: nomEtape,
      Session: session,
      Professeur: profNom,
      Cours,
      Groupe,
      Jour: jour.charAt(0).toUpperCase() + jour.slice(1),
      "Heure de début": heureDebut,
      "Heure de fin": heureFin
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Horaire");

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(data, nomFichier);
};

 //  Nettoyage du bouton export    
useEffect(() => {
  const exportBtn = document.querySelector(".fc-exportExcel-button");
  if (exportBtn) {
    exportBtn.removeAttribute("title");
  }
}, []);
    


  // Charger tous les professeurs
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/accounts/professors/')
      .then(res => {
        setProfessors(res.data);
  
        const urlParams = new URLSearchParams(location.search);
        const profIdFromURL = urlParams.get('profId');
        if (profIdFromURL) {
          setSelectedProfessor(parseInt(profIdFromURL));
        }
      })
      .catch(err => console.error("Erreur chargement professeurs :", err));
  }, [location.search]);
  
  

  // Charger l’horaire du professeur sélectionné
  useEffect(() => {
    if (selectedProfessor) {
      axios.get(`http://127.0.0.1:8000/professors/${selectedProfessor}/schedule/`)
        .then(res => {
          console.log(" Données brutes du backend :", res.data);
  
          const filtered = res.data.filter(evt =>
            evt.start_time &&
            evt.end_time &&
            evt.day !== null &&
            evt.day !== undefined
          );
  
          const formatted = filtered.map(evt => {
            const start = new Date(evt.start_time);
            const end = new Date(evt.end_time);
            const hours = (end - start) / (1000 * 60 * 60); // Durée en heures
            return {
              id: evt.id,
              title: `${evt.course} - ${evt.group}`,
              start: start,
              end: end,
              backgroundColor: generateColor(evt.course),
              duration: hours,
            };
          });
  
          const sum = formatted.reduce((acc, curr) => acc + curr.duration, 0);
          setTotalHours(sum.toFixed(1));
  
          const repeated = formatted.flatMap(evt => generateWeeklyRepeats(evt, 14));
          setEvents(repeated);
        })
        .catch(err => console.error("Erreur horaire :", err));
    }
  }, [selectedProfessor]);
  

//  Générer les 14 semaines de répétitions d'un cours
  const generateWeeklyRepeats = (event, weeks = 14) => {
    const repeatedEvents = [];
  
    for (let i = 0; i < weeks; i++) {
      const start = new Date(event.start);
      const end = new Date(event.end);
  
      start.setDate(start.getDate() + i * 7);
      end.setDate(end.getDate() + i * 7);
  
      repeatedEvents.push({
        ...event,
        id: `${event.id}_repeat_${i}`,
        start,
        end,
      });
    }
  
    return repeatedEvents;
  };
  

  // Générer une couleur selon la longueur du cours
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
  
    return vibrantColors[courseName.length % vibrantColors.length];
  };
  

  return (
    <div className="professor-calendar-page">
      {/* Sidebar à gauche */}
      <aside className="calender-sidebar">
      <h2>
        <FontAwesomeIcon icon={faUserTie} style={{ marginRight: "8px" }} />
        Professeurs
      </h2>

        <input
          type="text"
          placeholder=" Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <ul>
          {professors
            .filter(prof =>
              `${prof.first_name} ${prof.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(prof => (
              <li
                key={prof.id}
                className={selectedProfessor === prof.id ? 'active' : ''}
                onClick={() => setSelectedProfessor(prof.id)}
              >
                <img src={prof.profile_picture || defaultAvatar} alt="avatar" />
                <div>
                  <strong>{prof.first_name} {prof.last_name}</strong><br />
                  <small>{prof.department}</small>
                </div>
              </li>
            ))}
        </ul>
      </aside>

      {/* Vue calendrier */}
      <main className="calendar-view">
        {selectedProfessor ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {selectedProfData && (
            <div className="calendar-header">
                <AnimatePresence mode="wait">
                {selectedProfData && (
                    <motion.div
                    key={`header-${selectedProfessor}`}
                    className="calendar-header"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    >

                <img
                src={selectedProfData.profile_picture || defaultAvatar}
                alt="avatar"
                className="calendar-avatar"
                />
                <div className="calendar-info">
                <h2> Horaire de {selectedProfData.first_name} {selectedProfData.last_name}</h2>
                <p className="calendar-department">{selectedProfData.department}</p>
                <p className="calendar-hours"> Total : {totalHours} heures / semaine</p>
                </div>
                </motion.div>
                )}
                </AnimatePresence>
            </div>
            )}
            <div className="calendar-card">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              locale="fr"
              slotMinTime="08:00:00"
              slotMaxTime="23:00:00"
              allDaySlot={false}
              events={events}
              firstDay={1}
              dayHeaderContent={(args) => args.text.split(" ")[0]}
              height="auto"
              headerToolbar={{
                left:'prev,next',
                start: '',
                center: 'title',
                end: 'dayGridMonth,timeGridWeek,timeGridDay,exportExcel',
              }}
              views={{
                dayGridMonth: { buttonText: "Mois" },
                timeGridWeek: { buttonText: "Semaine" },
                timeGridDay: { buttonText: "Jour" }
              }}

              customButtons={{
                exportExcel: {
                  text: "",
                  click: exportToExcel
                }
              }}

              dayHeaderFormat={{ weekday: 'long' }}
              eventContent={(arg) => {
                return {
                  html: `
                    <div style="
                      background-color: ${arg.event.backgroundColor};
                      color: white;
                      padding: 5px;
                      border-radius: 5px;
                      text-align: center;
                      font-size: 12px;
                    ">
                      <b>${arg.event.title}</b><br/>
                      <span>${arg.timeText}</span>
                    </div>
                  `
                };
              }}
            />
            </div>
          </motion.div>
        ) : (
          <div className="no-selection">
            <p>Sélectionne un professeur pour voir son horaire.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProfessorCalendar;
