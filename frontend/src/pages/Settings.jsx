import { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  LogOut,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  Laptop,
  Calendar,
  BadgeCheck,
  Loader2,
  Phone,
  Mail,
  LifeBuoy,
  Send,
  MessageSquare,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthStates';
import userService from '../services/userService';

const Settings = () => {
  const { user, setUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('pharmacy');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingPharmacy, setSavingPharmacy] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [pharmacyForm, setPharmacyForm] = useState({
    organizationName: '',
    contactPerson: '',
    contactPhone: '',
    address: '',
    code: '',
  });

  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [ticketForm, setTicketForm] = useState({
    category: 'Billing & POS Issues',
    priority: 'Normal',
    subject: '',
    description: '',
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('mediblix_support_tickets');
      if (saved) return JSON.parse(saved);
    } catch {
      return [];
    }
    return [
      {
        id: 'TKT-1082',
        subject: 'Welcome to Mediblix Support Desk',
        category: 'General Support',
        priority: 'Normal',
        status: 'Resolved',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await userService.getProfile();
        if (!isMounted) return;

        setPharmacyForm({
          organizationName: data.organization?.name || '',
          contactPerson: data.organization?.contactPerson || data.name || '',
          contactPhone: data.organization?.contactPhone || '',
          address: data.organization?.address || '',
          code: data.organization?.code || 'MED-01',
        });

        setAccountForm({
          name: data.name || '',
          email: data.email || '',
        });
      } catch {
        if (!isMounted) return;
        if (user) {
          setPharmacyForm({
            organizationName: user.organization?.name || '',
            contactPerson: user.organization?.contactPerson || user.name || '',
            contactPhone: user.organization?.contactPhone || '',
            address: user.organization?.address || '',
            code: user.organization?.code || 'MED-01',
          });
          setAccountForm({
            name: user.name || '',
            email: user.email || '',
          });
        }
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const showNotification = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const handleSavePharmacy = async (e) => {
    e.preventDefault();
    try {
      setSavingPharmacy(true);
      const updated = await userService.updateProfile({
        organizationName: pharmacyForm.organizationName,
        contactPerson: pharmacyForm.contactPerson,
        contactPhone: pharmacyForm.contactPhone,
        address: pharmacyForm.address,
      });

      const updatedUserInfo = {
        ...user,
        organization: updated.organization,
      };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      if (setUser) setUser(updatedUserInfo);

      showNotification('Pharmacy details updated successfully');
    } catch (err) {
      showNotification(
        err.response?.data?.message || err.message || 'Failed to update pharmacy details',
        'error'
      );
    } finally {
      setSavingPharmacy(false);
    }
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    try {
      setSavingAccount(true);
      const updated = await userService.updateProfile({
        name: accountForm.name,
        email: accountForm.email,
      });

      const updatedUserInfo = {
        ...user,
        name: updated.name,
        email: updated.email,
      };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      if (setUser) setUser(updatedUserInfo);

      showNotification('Account profile updated successfully');
    } catch (err) {
      showNotification(
        err.response?.data?.message || err.message || 'Failed to update account',
        'error'
      );
    } finally {
      setSavingAccount(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showNotification('Please fill in both current and new password', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showNotification('New password must be at least 6 characters', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('New password and confirmation do not match', 'error');
      return;
    }

    try {
      setSavingPassword(true);
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      showNotification('Password changed successfully');
    } catch (err) {
      showNotification(
        err.response?.data?.message || err.message || 'Failed to change password',
        'error'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      showNotification('Please fill in both subject and description', 'error');
      return;
    }

    setSubmittingTicket(true);
    setTimeout(() => {
      const newTicket = {
        id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: ticketForm.subject.trim(),
        category: ticketForm.category,
        priority: ticketForm.priority,
        status: 'Open',
        createdAt: new Date().toISOString(),
        description: ticketForm.description.trim(),
      };
      const updated = [newTicket, ...tickets];
      setTickets(updated);
      try {
        localStorage.setItem('mediblix_support_tickets', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      setTicketForm({
        category: 'Billing & POS Issues',
        priority: 'Normal',
        subject: '',
        description: '',
      });
      setSubmittingTicket(false);
      showNotification(`Ticket #${newTicket.id} created successfully! Our team will contact you shortly.`);
    }, 400);
  };

  const menuItems = [
    { id: 'pharmacy', label: 'Pharmacy Details', icon: Building2 },
    { id: 'account', label: 'Account & Security', icon: ShieldCheck },
    { id: 'subscription', label: 'Plan & Subscription', icon: CreditCard },
    { id: 'support', label: 'Contact Support', icon: LifeBuoy },
  ];

  const orgInfo = user?.organization;
  const expiryDate = orgInfo?.subscriptionExpiresAt
    ? new Date(orgInfo.subscriptionExpiresAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Active';

  return (
    <div className="min-h-full w-full bg-[var(--bg-main)] p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Settings</h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Manage your pharmacy store profile, credentials, and subscription
            </p>
          </div>
          {feedback && (
            <div
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium animate-fadeIn ${
                feedback.type === 'error'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}
            >
              {feedback.type === 'error' ? (
                <AlertCircle size={16} className="flex-shrink-0" />
              ) : (
                <CheckCircle2 size={16} className="flex-shrink-0" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] overflow-hidden shadow-xs sticky top-6">
              <div className="p-4 border-b border-[var(--border-soft)] bg-gray-50/50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Store Configuration
                </p>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5 truncate">
                  {pharmacyForm.organizationName || 'Mediblix Store'}
                </p>
              </div>

              <div className="p-2 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all cursor-pointer text-sm font-medium ${
                        isActive
                          ? 'bg-[var(--accent)] text-white shadow-xs'
                          : 'text-[var(--text-primary)] hover:bg-gray-100/70'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronRight
                        size={15}
                        className={`transition-transform ${isActive ? 'translate-x-0.5 opacity-90' : 'opacity-40'}`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-[var(--border-soft)]">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-sm font-medium transition-all cursor-pointer"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {loadingProfile ? (
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] p-12 text-center text-gray-500">
                <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[var(--accent)]" />
                <p className="text-sm">Loading configuration...</p>
              </div>
            ) : (
              <>
                {activeSection === 'pharmacy' && (
                  <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] p-6 md:p-8 space-y-6 shadow-xs">
                    <div>
                      <h2 className="text-xl font-bold text-[var(--text-primary)]">
                        Pharmacy Store Details
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        These details appear on your printed bills, customer receipts, and invoice headers
                      </p>
                    </div>

                    <form onSubmit={handleSavePharmacy} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Pharmacy / Store Name
                          </label>
                          <input
                            type="text"
                            value={pharmacyForm.organizationName}
                            onChange={(e) =>
                              setPharmacyForm({ ...pharmacyForm, organizationName: e.target.value })
                            }
                            required
                            placeholder="e.g. LifeCare Chemist & Druggist"
                            className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Store Code (System Identifier)
                          </label>
                          <input
                            type="text"
                            value={pharmacyForm.code}
                            disabled
                            className="w-full px-4 py-2.5 bg-gray-100 border border-[var(--border-soft)] rounded-xl text-sm font-mono text-gray-500 cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Contact Person
                          </label>
                          <input
                            type="text"
                            value={pharmacyForm.contactPerson}
                            onChange={(e) =>
                              setPharmacyForm({ ...pharmacyForm, contactPerson: e.target.value })
                            }
                            placeholder="Store Owner / Manager Name"
                            className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Pharmacy Phone Number
                          </label>
                          <input
                            type="tel"
                            value={pharmacyForm.contactPhone}
                            onChange={(e) =>
                              setPharmacyForm({ ...pharmacyForm, contactPhone: e.target.value })
                            }
                            placeholder="e.g. +91 98765 43210"
                            className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Physical Store Address
                          </label>
                          <textarea
                            rows={3}
                            value={pharmacyForm.address}
                            onChange={(e) =>
                              setPharmacyForm({ ...pharmacyForm, address: e.target.value })
                            }
                            placeholder="Shop / Unit number, Street, Market area, City, State, Pincode"
                            className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-3 border-t border-[var(--border-soft)]">
                        <button
                          type="submit"
                          disabled={savingPharmacy}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {savingPharmacy ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Save size={15} />
                          )}
                          <span>{savingPharmacy ? 'Saving...' : 'Save Pharmacy Details'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'account' && (
                  <div className="space-y-6">
                    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] p-6 md:p-8 space-y-6 shadow-xs">
                      <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">
                          Account Profile
                        </h2>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          Personal login information and credentials for your user account
                        </p>
                      </div>

                      <form onSubmit={handleSaveAccount} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Your Name
                            </label>
                            <input
                              type="text"
                              value={accountForm.name}
                              onChange={(e) =>
                                setAccountForm({ ...accountForm, name: e.target.value })
                              }
                              required
                              className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Login Email Address
                            </label>
                            <input
                              type="email"
                              value={accountForm.email}
                              onChange={(e) =>
                                setAccountForm({ ...accountForm, email: e.target.value })
                              }
                              required
                              className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Account Role
                            </label>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-800 border border-green-200 rounded-lg text-xs font-semibold">
                              <BadgeCheck size={14} />
                              <span className="capitalize">{user?.role || 'Staff Member'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-3 border-t border-[var(--border-soft)]">
                          <button
                            type="submit"
                            disabled={savingAccount}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {savingAccount ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Save size={15} />
                            )}
                            <span>{savingAccount ? 'Saving...' : 'Update Profile'}</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] p-6 md:p-8 space-y-6 shadow-xs">
                      <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">
                          Change Password
                        </h2>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          Update your master password to keep your store account secure
                        </p>
                      </div>

                      <form onSubmit={handleChangePassword} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Current Password
                            </label>
                            <input
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  currentPassword: e.target.value,
                                })
                              }
                              placeholder="••••••••"
                              className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  newPassword: e.target.value,
                                })
                              }
                              placeholder="Min 6 characters"
                              className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  confirmPassword: e.target.value,
                                })
                              }
                              placeholder="Repeat new password"
                              className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-3 border-t border-[var(--border-soft)]">
                          <button
                            type="submit"
                            disabled={savingPassword}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition-all cursor-pointer disabled:opacity-50"
                          >
                            {savingPassword ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <KeyRound size={15} />
                            )}
                            <span>{savingPassword ? 'Updating...' : 'Change Password'}</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] p-6 md:p-8 space-y-4 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                          <Laptop size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--text-primary)] text-sm">
                            Single-Device Session Protection
                          </h3>
                          <p className="text-xs text-[var(--text-secondary)]">
                            Mediblix strictly restricts simultaneous logins to prevent stock and billing tampering
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Security Mode</span>
                          <span className="font-semibold text-green-700">Enforced & Active</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Current Device</span>
                          <span className="font-mono text-gray-800">
                            {user?.activeDeviceInfo?.deviceName || 'Desktop Web Terminal'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Session Status</span>
                          <span className="font-medium text-gray-800">Authorized & Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'subscription' && (
                  <div className="space-y-6">
                    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] p-6 md:p-8 space-y-6 shadow-xs">
                      <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">
                          Plan & Subscription
                        </h2>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          Current license status and renewal details for your pharmacy
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 bg-green-50/60 border border-green-200 rounded-2xl">
                          <p className="text-xs font-semibold text-green-800">Current License</p>
                          <p className="text-2xl font-bold text-green-950 mt-1 capitalize">
                            {orgInfo?.plan || 'Enterprise'} Plan
                          </p>
                          <p className="text-xs text-green-700 mt-2">Full Pharmacy POS & Inventory</p>
                        </div>

                        <div className="p-5 bg-blue-50/60 border border-blue-200 rounded-2xl">
                          <p className="text-xs font-semibold text-blue-800">Account Status</p>
                          <p className="text-2xl font-bold text-blue-950 mt-1">
                            {orgInfo?.status || 'Active'}
                          </p>
                          <p className="text-xs text-blue-700 mt-2">All Services Operational</p>
                        </div>

                        <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-2xl">
                          <p className="text-xs font-semibold text-amber-800">Valid Until</p>
                          <p className="text-2xl font-bold text-amber-950 mt-1">{expiryDate}</p>
                          <p className="text-xs text-amber-700 mt-2">Annual Maintenance Covered</p>
                        </div>
                      </div>

                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                          <Calendar size={16} className="text-green-700" />
                          <span>Subscription Features & Terms</span>
                        </div>
                        <ul className="space-y-1.5 text-gray-600 list-disc list-inside">
                          <li>Unlimited medicine catalog and batch tracking</li>
                          <li>AI bill parsing and invoice OCR imports</li>
                          <li>Thermal receipt generation and PDF downloads</li>
                          <li>Single-device fraud and concurrent-login protection</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'support' && (
                  <div className="space-y-6">
                    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] p-6 md:p-8 space-y-6 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-bold text-[var(--text-primary)]">
                            Help & Contact Support
                          </h2>
                          <p className="text-xs text-[var(--text-secondary)] mt-1">
                            Get immediate assistance for your pharmacy setup, billing counter, and hardware
                          </p>
                        </div>
                        <span className="self-start sm:self-auto px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                          24/7 Helpline Active
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50/50 border border-green-200 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center shadow-xs">
                              <Phone size={20} />
                            </div>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-green-200 text-green-900 rounded-md">
                              Direct Call / WhatsApp
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-green-800">Direct Helpline Number</p>
                            <p className="text-xl font-mono font-bold text-green-950 mt-0.5 tracking-wide">
                              +91 9167132037
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                              Instant technical assistance for counter operations & billing issues
                            </p>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <a
                              href="tel:+919167132037"
                              className="flex-1 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold text-center transition-all shadow-xs flex items-center justify-center gap-1.5"
                            >
                              <Phone size={14} /> Call Now
                            </a>
                            <a
                              href="https://wa.me/919167132037?text=Hello%20Mediblix%20Support,%20I%20need%20help%20with%20my%20pharmacy%20account"
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center transition-all shadow-xs flex items-center justify-center gap-1.5"
                            >
                              <MessageSquare size={14} /> WhatsApp
                            </a>
                          </div>
                        </div>

                        <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                              <Mail size={20} />
                            </div>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-200 text-blue-900 rounded-md">
                              Priority Email
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-blue-800">Official Support Email</p>
                            <p className="text-xl font-mono font-bold text-blue-950 mt-0.5 tracking-wide">
                              support@codevern.com
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              Send audit sheets, invoices, error screenshots, or custom feature requests
                            </p>
                          </div>
                          <div className="pt-1">
                            <a
                              href="mailto:support@codevern.com?subject=Mediblix%20Support%20Request%20-%20Pharmacy%20Help"
                              className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold text-center transition-all shadow-xs flex items-center justify-center gap-1.5"
                            >
                              <Send size={14} /> Send Official Email
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] p-6 md:p-8 space-y-6 shadow-xs">
                      <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">
                          Open a Support Ticket
                        </h2>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          Our engineers track each ticket with dedicated SLA until your query is completely resolved
                        </p>
                      </div>

                      <form onSubmit={handleSubmitTicket} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Issue Category
                            </label>
                            <select
                              value={ticketForm.category}
                              onChange={(e) =>
                                setTicketForm({ ...ticketForm, category: e.target.value })
                              }
                              className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                            >
                              <option>Billing & POS Issues</option>
                              <option>Inventory & OCR Uploads</option>
                              <option>Thermal Printer & Barcode Scanner</option>
                              <option>GST Reports & Tax Audit</option>
                              <option>Account, Terminal & Multi-Device Access</option>
                              <option>General Support / Consultation</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Priority Level
                            </label>
                            <select
                              value={ticketForm.priority}
                              onChange={(e) =>
                                setTicketForm({ ...ticketForm, priority: e.target.value })
                              }
                              className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                            >
                              <option>Normal - Routine Support</option>
                              <option>High - Urgent Attention</option>
                              <option>Critical - Store Counter Blocked</option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Subject / Summary
                            </label>
                            <input
                              type="text"
                              required
                              value={ticketForm.subject}
                              onChange={(e) =>
                                setTicketForm({ ...ticketForm, subject: e.target.value })
                              }
                              placeholder="e.g. Need assistance connecting thermal receipt printer on counter 1"
                              className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Detailed Description
                            </label>
                            <textarea
                              rows={4}
                              required
                              value={ticketForm.description}
                              onChange={(e) =>
                                setTicketForm({ ...ticketForm, description: e.target.value })
                              }
                              placeholder="Please describe the issue or questions in detail..."
                              className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] resize-none"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-[var(--border-soft)]">
                          <button
                            type="submit"
                            disabled={submittingTicket}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {submittingTicket ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Send size={15} />
                            )}
                            <span>{submittingTicket ? 'Submitting...' : 'Submit Support Ticket'}</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] p-6 md:p-8 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-[var(--text-primary)]">
                            Your Support Tickets ({tickets.length})
                          </h3>
                          <p className="text-xs text-[var(--text-secondary)]">
                            Track the status and resolutions of your previous requests
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {tickets.map((t) => (
                          <div
                            key={t.id}
                            className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-gray-900">{t.id}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-800">
                                  {t.category}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    t.status === 'Resolved'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {t.status}
                                </span>
                              </div>
                              <p className="font-bold text-gray-900 text-sm mt-1">{t.subject}</p>
                              {t.description && (
                                <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">
                                  {t.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0 text-gray-400 text-[11px] flex items-center gap-1 sm:self-center">
                              <Clock size={12} />
                              <span>{new Date(t.createdAt).toLocaleDateString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
