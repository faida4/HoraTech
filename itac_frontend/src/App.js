import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Courses from './pages/Courses';
import AddCourse from './pages/AddCourse';
import EditCourse from './pages/EditCourse';
import Professors from './pages/Professeurs';
import AddProfessor from './pages/AddProfessor';
import Profile from './pages/Profile';
import Navbar from './pages/Navbar';
import EtapeSession from './pages/EtapeSession';
import AddCourseForm from './pages/AddCourseForm';
import ProfessorCalendar from './pages/ProfessorCalendar';
import ProgramsPage from './pages/ProgramsPage';
import Groupes from './pages/Groupes';
import EtapesGroupes from './pages/EtapesGroupes';
import { Toaster } from 'react-hot-toast'; // Importer le Toaster

function App() {

  return (
    <Router>
      <Layout />
      <Toaster
    position="top-center"
    toastOptions={{
    duration: 4000,
    style: {
      //background: '#333',
      background: '#2c3e50',  
      color: '#fff',
      fontWeight: 'bold',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    }
  }}
/>
 {/*  Toaster global */}
    </Router>
  );

}

//  Composant qui gère l'affichage conditionnel de la Navbar
function Layout() {
  const location = useLocation(); // Récupère l'URL actuelle
  const hideNavbar = location.pathname === "/"; // Vérifie si on est sur la page de connexion
  

  return (
    <>
      { !hideNavbar && <Navbar />} {/* N'affiche pas la Navbar si on est sur la page "/" */}
      
      <Routes>
        {/* routes les autres composants */}
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />  
        <Route path="/courses" element={<Courses />} />
        <Route path="/add-course" element={<AddCourse />} />
        <Route path="/edit-course/:id" element={<EditCourse />} />
        <Route path="/professors" element={<Professors />} />
        <Route path="/add-professor" element={<AddProfessor />} />
        <Route path="/edit-professor/:id" element={<AddProfessor />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/EtapeSession" element={<EtapeSession/>} />
        <Route path="/courseForm" element={<AddCourseForm />} />
        <Route path="/professor-schedule/" element={<ProfessorCalendar />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/groups" element={<Groupes />} />
        <Route path="/etapesGroups" element={<EtapesGroupes />} />


    </Routes>
    </>
  );
}

export default App;
