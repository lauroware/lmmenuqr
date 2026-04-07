import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home               from './pages/Home';
import Login              from './pages/Login';
import Signup             from './pages/Signup';
import AdminDashboard     from './pages/AdminDashboard';
import PublicMenu         from './pages/PublicMenu';
import PublicMenuDelivery from './pages/PublicMenuDelivery';
import NotFound           from './pages/NotFound';
import Menu               from './pages/Menu';
import Profile            from './pages/Profile';
import Appearance         from './pages/Appearance';
import ForgotPassword     from './pages/ForgotPassword';
import ResetPassword      from './pages/ResetPassword';
import SuperAdmin         from './pages/superAdmin';
import AccountBlocked     from './pages/AccountBlocked';
import PrivateRoute       from './components/PrivateRoute';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/signup"  element={<Signup />} />

        {/* Público */}
        <Route path="/menu/:uniqueId"          element={<PublicMenu />} />
        <Route path="/menu/:uniqueId/delivery" element={<PublicMenuDelivery />} />

        {/* Cuenta bloqueada (para redirigir desde el dashboard) */}
        <Route path="/cuenta-bloqueada" element={<AccountBlocked isOwner={true} />} />

        <Route path="/forgot-password"       element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Rutas protegidas */}
        <Route path="/admin/dashboard"  element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/menu"       element={<PrivateRoute><Menu /></PrivateRoute>} />
        <Route path="/admin/profile"    element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/admin/appearance" element={<Appearance />} />
        <Route path="/admin/super"      element={<SuperAdmin />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
