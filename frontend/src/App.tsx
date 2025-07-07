import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import MentorDashboard from './pages/MentorDashboard';
import MenteeDashboard from './pages/MenteeDashboard';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MentorDiscoveryPage from './pages/MentorDiscoveryPage';
import MentorProfilePage from './pages/MentorProfilePage';
import MentorRequestsPage from './pages/MentorRequestsPage';
import MenteeListPage from './pages/MenteeListPage';
import BookSessionPage from './pages/BookSessionPage';
import AdminMenteesPage from './pages/AdminMenteesPage';
import AdminMentorsPage from './pages/AdminMentorsPage';

const App: React.FC = () => {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/mentor" element={<MentorDashboard />} />
        <Route path="/mentee" element={<MenteeListPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/mentors" element={<MentorDiscoveryPage />} />
        <Route path="/mentors/:id" element={<MentorProfilePage />} />
        <Route path="/mentor/requests" element={<MentorRequestsPage />} />
        <Route path="/book-session" element={<BookSessionPage />} />
        <Route path="/admin/mentees" element={<AdminMenteesPage />} />
        <Route path="/admin/mentors" element={<AdminMentorsPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
