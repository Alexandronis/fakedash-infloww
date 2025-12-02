import { Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './components/layout/sidebar';
import Header from './components/layout/header';
import HomePage from './pages/home';
import CreatorPage from './pages/creator';
import './App.css'

function App() {
  return (
    <div className="dashboard-wrap">
      <Header />
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/creator" element={<CreatorPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App;
