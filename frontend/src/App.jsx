import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import PublicMenu from './pages/PublicMenu';
import NotFound from './pages/NotFound';
import Menu from './pages/Menu';
import Profile from './pages/Profile';
import './index.css';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/menu/:uniqueId" element={<PublicMenu />} />

        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
        <Route path="/admin/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
