import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
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
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users/:username" element={<UserProfile />} />
        <Route path="/polls" element={<AllPolls />} />
      </Route>
      <Route path="/my-votes" element={<UserVotes />} />
      <Route path="/polls/:id/results" element={<PollResults />} />
      <Route path="/votes/poll/:pollId" element={<PollVotes />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
