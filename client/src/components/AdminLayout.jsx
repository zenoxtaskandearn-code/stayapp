import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { FiHome, FiGrid, FiCalendar, FiSettings, FiUser, FiLogOut, FiChevronLeft, FiChevronRight, FiPlus, FiCreditCard, FiBell } from 'react-icons/fi';
import { useAuthStore } from '../store/useStore';
import { useSettingsStore } from '../store/settingsStore';
import { getSettings } from '../services/settingsService';
// import NotificationDropdown from './NotificationDropdown';

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { isAuthenticated, isAdmin, logout, user } = useAuthStore();
  const { setCurrency } = useSettingsStore();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await getSettings();
        if (res.data?.currency) {
          setCurrency(res.data.currency);
        }
      } catch (e) {
        console.log('Using default currency');
      }
    };
    loadSettings();
  }, [setCurrency]);

  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: FiHome },
    { path: '/admin/bookings', label: 'Bookings', icon: FiCalendar },
    { path: '/admin/notifications', label: 'Notifications', icon: FiBell },
    { path: '/admin/properties', label: 'Properties', icon: FiGrid },
    { path: '/admin/categories', label: 'Categories', icon: FiPlus },
    { path: '/admin/payment-methods', label: 'Payment Methods', icon: FiCreditCard },
    { path: '/admin/settings', label: 'Settings', icon: FiSettings },
  ];

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-50 ${
        isOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            {isOpen && <span className="font-bold">Admin</span>}
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-gray-800 rounded">
            {isOpen ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="py-4 px-2 space-y-1">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <item.icon size={18} />
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className={`flex items-center gap-3 mb-3 ${!isOpen && 'justify-center'}`}>
            <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center">
              <FiUser size={16} />
            </div>
            {isOpen && (
              <div className="text-sm">
                <div className="font-medium">{user?.name || 'Admin'}</div>
                <div className="text-gray-500 text-xs">admin@premiumstays.com</div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Link to="/" className={`flex-1 flex items-center justify-center py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm ${!isOpen && 'px-2'}`}>
              {isOpen ? 'View Site' : <FiHome size={16} />}
            </Link>
            <button onClick={logout} className={`flex-1 flex items-center justify-center py-2 border border-gray-600 rounded-lg hover:bg-gray-800 text-sm ${!isOpen && 'px-2'}`}>
              {isOpen ? 'Logout' : <FiLogOut size={16} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* <NotificationDropdown /> */}
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;