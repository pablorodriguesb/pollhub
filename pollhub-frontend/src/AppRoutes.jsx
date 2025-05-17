import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import AllPolls from './pages/AllPolls';
import UserVotes from './pages/UserVotes';
import PollResults from './pages/PollResults';
import PollVotes from './pages/PollVotes';

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Route>

        <Route path="/my-votes" element={<UserVotes />} />

        <Route path="/polls/:id/results" element={<PollResults />} />
        <Route path="/votes/poll/:pollId" element={<PollVotes />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/users/:username" element={<UserProfile />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/polls" element={<AllPolls />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;
