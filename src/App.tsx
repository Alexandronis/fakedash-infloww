import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { CreatorStatsProvider } from "./context/CreatorStatsContext.tsx";

import Sidebar from './components/layout/sidebar';
import Header from './components/layout/header';
import HomePage from './pages/home';
import CreatorPage from './pages/creator';
import './App.css'

function App() {
  const [menuClosed, setMenuClosed] = useState(false);

  const toggleMenu = () => {
    setMenuClosed(prev => !prev);
  };

  return (
    <CreatorStatsProvider>
      <div className={`dashboard-wrap${menuClosed ? " menu-close" : ""}`}>
        <Header onMenuToggle={toggleMenu} />
        <Sidebar/>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard"/>}/>
          <Route path="/dashboard" element={<HomePage/>}/>
          <Route path="/creator" element={<CreatorPage/>}/>
        </Routes>
      </div>
    </CreatorStatsProvider>
  )
}

export default App;
