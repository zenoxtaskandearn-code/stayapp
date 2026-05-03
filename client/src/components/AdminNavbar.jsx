import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiGrid, FiCalendar, FiSettings, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuthStore } from '../store/useStore';

const adminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: FiHome },
  { path: '/admin/properties', label: 'Properties', icon: FiGrid },
  { path: '/admin/bookings', label: 'Bookings', icon: FiCalendar },
  { path: '/admin/categories', label: 'Categories', icon: FiGrid },
  { path: '/admin/settings', label: 'Settings', icon: FiSettings },
];

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link to="/admin" className="flex items-center gap-2">
            <img src="/icon.svg" alt="The Blueground" className="h-8" />
            <span className="text-lg font-bold">Admin</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`
                }
              >
                <item.icon size={14} />
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <FiUser size={14} />
              <span>{user?.name || 'Admin'}</span>
            </div>
            <Link to="/" className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors">
              View Site
            </Link>
            <button onClick={handleLogout} className="px-3 py-2 rounded-lg border border-gray-600 text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
              <FiLogOut size={14} />
              Logout
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block py-3 px-4 rounded-lg text-sm font-medium ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-300'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col gap-2">
              <Link to="/" onClick={() => setIsOpen(false)} className="py-3 px-4 rounded-lg bg-gray-800 text-center">
                View Site
              </Link>
              <button onClick={() => { logout(); setIsOpen(false); }} className="py-3 px-4 rounded-lg border border-gray-600 text-center">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;