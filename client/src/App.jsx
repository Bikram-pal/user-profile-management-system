import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import AdminUsers from './pages/AdminUsers';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute admin><AdminUsers /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}
