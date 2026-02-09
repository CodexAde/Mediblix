import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, CreditCard, HelpCircle, LogOut, ChevronRight, Moon, Sun, Check, Mail, Smartphone } from 'lucide-react';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    orders: true,
    marketing: false,
    updates: true,
  });

  const menuItems = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Profile Settings</h2>
              <p className="text-[var(--text-secondary)]">Manage your personal information</p>
            </div>
            
            {/* Avatar Section */}
            <div className="flex items-center gap-6 p-6 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)]">
              <img 
                src="https://randomuser.me/api/portraits/men/46.jpg" 
                alt="Profile"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-[var(--border-soft)]"
              />
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Profile Photo</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-3">PNG, JPG or GIF, max 2MB</p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-all">
                    Upload New
                  </button>
                  <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">First Name</label>
                <input type="text" defaultValue="Adarsh" className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Last Name</label>
                <input type="text" defaultValue="Pandey" className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Email Address</label>
                <input type="email" defaultValue="adarshpandey@gmail.com" className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Phone Number</label>
                <input type="tel" defaultValue="+1 234-567-8900" className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent)]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Company Name</label>
                <input type="text" defaultValue="Codeven Inc." className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent)]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Business Address</label>
                <textarea rows={3} defaultValue="123 Business Street, Suite 100, New York, NY 10001" className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent)] resize-none" />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button className="px-6 py-2.5 border border-[var(--border-soft)] rounded-xl text-[var(--text-primary)] hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button className="px-6 py-2.5 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-all">
                Save Changes
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Notification Preferences</h2>
              <p className="text-[var(--text-secondary)]">Choose how you want to be notified</p>
            </div>

            <div className="space-y-4">
              {[
                { key: 'email', icon: Mail, title: 'Email Notifications', desc: 'Receive notifications via email' },
                { key: 'push', icon: Smartphone, title: 'Push Notifications', desc: 'Receive push notifications on your device' },
                { key: 'orders', icon: CreditCard, title: 'Order Updates', desc: 'Get notified about order status changes' },
                { key: 'marketing', icon: Bell, title: 'Marketing Emails', desc: 'Receive promotional emails and offers' },
                { key: 'updates', icon: Globe, title: 'Product Updates', desc: 'Get notified about new features and updates' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-soft)]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
                        <Icon size={20} className="text-[var(--accent)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{item.title}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                      className={`w-12 h-6 rounded-full transition-all ${notifications[item.key] ? 'bg-[var(--accent)]' : 'bg-gray-300'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${notifications[item.key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Appearance</h2>
              <p className="text-[var(--text-secondary)]">Customize how the app looks</p>
            </div>

            <div className="p-6 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)]">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Theme</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDarkMode(false)}
                  className={`p-4 rounded-xl border-2 transition-all ${!darkMode ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border-soft)]'}`}
                >
                  <Sun size={24} className={`mx-auto mb-2 ${!darkMode ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`} />
                  <p className={`font-medium ${!darkMode ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>Light Mode</p>
                </button>
                <button
                  onClick={() => setDarkMode(true)}
                  className={`p-4 rounded-xl border-2 transition-all ${darkMode ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border-soft)]'}`}
                >
                  <Moon size={24} className={`mx-auto mb-2 ${darkMode ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`} />
                  <p className={`font-medium ${darkMode ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>Dark Mode</p>
                </button>
              </div>
            </div>

            <div className="p-6 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)]">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Accent Color</h3>
              <div className="flex gap-4">
                {['#166534', '#2563eb', '#9333ea', '#dc2626', '#ea580c'].map((color) => (
                  <button
                    key={color}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                  >
                    {color === '#166534' && <Check size={20} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Security Settings</h2>
              <p className="text-[var(--text-secondary)]">Manage your account security</p>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">Password</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Last changed 30 days ago</p>
                  </div>
                  <button className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-all">
                    Change Password
                  </button>
                </div>
              </div>

              <div className="p-6 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">Two-Factor Authentication</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Add an extra layer of security</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Enabled</span>
                </div>
              </div>

              <div className="p-6 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)]">
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  {[
                    { device: 'MacBook Pro', location: 'New York, USA', current: true },
                    { device: 'iPhone 15 Pro', location: 'New York, USA', current: false },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{session.device}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{session.location}</p>
                      </div>
                      {session.current ? (
                        <span className="text-xs text-green-600 font-medium">Current Device</span>
                      ) : (
                        <button className="text-xs text-red-600 font-medium">Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-[var(--text-secondary)]">
            <p>Select a section from the menu</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-full w-full bg-[var(--bg-main)] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Settings</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your account and preferences</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Menu */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] overflow-hidden">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                      activeSection === item.id
                        ? 'bg-[var(--accent)] text-white'
                        : 'text-[var(--text-primary)] hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                    <ChevronRight size={16} className="ml-auto opacity-50" />
                  </button>
                );
              })}
              <div className="border-t border-[var(--border-soft)]">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all">
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
