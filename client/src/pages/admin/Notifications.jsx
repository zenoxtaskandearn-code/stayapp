import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCheck, FiCheckCircle, FiCalendar, FiTrash2 } from 'react-icons/fi';
import { useNotificationStore } from '/src/store/notificationStore';
import Loader from '../../components/Loader';
import moment from 'moment';

const AdminNotifications = () => {
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotificationStore();

  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  const formatTime = (date) => {
    return moment(date).fromNow();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'booking':
        return <FiCalendar className="text-blue-600" size={16} />;
      case 'payment':
        return <FiCheckCircle className="text-green-600" size={16} />;
      default:
        return <FiBell className="text-gray-600" size={16} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="section-padding">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="heading-section mb-2">Notifications</h1>
              <p className="text-gray-500">Stay updated with all system activities</p>
            </div>
            <div className="flex items-center gap-2">
              {notifications.some(n => !n.is_read) && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <FiCheck size={16} />
                  Mark All as Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <FiTrash2 size={16} />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: notifications.filter(n => !n.is_read).length },
              { key: 'read', label: 'Read', count: notifications.filter(n => n.is_read).length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBell className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' :
                 filter === 'read' ? 'No read notifications' :
                 'No notifications yet'}
              </h3>
              <p className="text-gray-500">
                {filter === 'unread' ? 'All caught up!' :
                 filter === 'read' ? 'Read notifications will appear here' :
                 'Notifications will appear here when there are new activities'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow ${
                    !notification.is_read ? 'ring-2 ring-blue-200' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${getTypeColor(notification.type)}`}>
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                New
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getTypeColor(notification.type)}`}>
                              {notification.type}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {formatTime(notification.created_at)}
                          </span>
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                <FiCheck size={14} />
                                Mark as Read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <FiTrash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminNotifications;
