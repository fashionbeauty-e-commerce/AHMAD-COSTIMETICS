import { useState, useEffect } from 'react';
import { 
  UserPlus, Shield, Trash2, X, Save, Crown, 
  CheckCircle, XCircle, Mail, Calendar, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../App';
import { 
  subscribeToAdmins, 
  addAdmin, 
  removeAdmin, 
  toggleAdminStatus,
  AVAILABLE_PERMISSIONS,
  type AdminUser
} from '../../services/adminAuth';

export default function AdminUsers() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'admin' as 'admin' | 'manager',
    permissions: [] as string[],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToAdmins((adminsList) => {
      setAdmins(adminsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (!user?.isSuperAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Super Admin Access Required</h2>
          <p className="text-gray-600">
            Only super administrators can manage admin users.
          </p>
        </div>
      </div>
    );
  }

  const showMessage = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setSuccess('');
    } else {
      setSuccess(msg);
      setError('');
    }
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 4000);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const result = await addAdmin(
        formData.email,
        formData.name,
        formData.role,
        formData.permissions,
        user!.email
      );

      if (result.success) {
        showMessage(result.message);
        setShowAddModal(false);
        setFormData({ email: '', name: '', role: 'admin', permissions: [] });
      } else {
        showMessage(result.message, true);
      }
    } catch (err: any) {
      showMessage(err.message || 'Failed to add admin', true);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm(`Remove admin access for ${email}? This action cannot be undone.`)) return;

    try {
      const result = await removeAdmin(email, user!.email);
      if (result.success) {
        showMessage(result.message);
      } else {
        showMessage(result.message, true);
      }
    } catch (err: any) {
      showMessage(err.message || 'Failed to remove admin', true);
    }
  };

  const handleToggleStatus = async (email: string, currentStatus: boolean) => {
    try {
      const result = await toggleAdminStatus(email, !currentStatus, user!.email);
      if (result.success) {
        showMessage(result.message);
      } else {
        showMessage(result.message, true);
      }
    } catch (err: any) {
      showMessage(err.message || 'Failed to update status', true);
    }
  };

  const togglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const selectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: AVAILABLE_PERMISSIONS.map(p => p.id)
    }));
  };

  const clearPermissions = () => {
    setFormData(prev => ({ ...prev, permissions: [] }));
  };

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
          <p className="text-sm text-gray-500">
            Manage administrators and their permissions ({admins.length} total)
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          Add New Admin
        </button>
      </div>

      {/* Notifications */}
      {(error || success) && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
          error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {error ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span className="font-medium">{error || success}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{admins.filter(a => a.role === 'super_admin').length}</p>
              <p className="text-xs text-gray-500">Super Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{admins.filter(a => a.role === 'admin').length}</p>
              <p className="text-xs text-gray-500">Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{admins.filter(a => a.isActive).length}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Admin</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Permissions</th>
              <th className="px-6 py-4">Added</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Loading admins...
                </td>
              </tr>
            ) : (
              admins.map(admin => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        admin.role === 'super_admin' 
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                          : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      }`}>
                        {admin.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{admin.name}</p>
                          {admin.role === 'super_admin' && (
                            <Crown className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Mail className="w-3 h-3" />
                          {admin.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      admin.role === 'super_admin' 
                        ? 'bg-amber-100 text-amber-700' 
                        : admin.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {admin.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-600">
                      {admin.permissions.includes('*') 
                        ? 'All Permissions' 
                        : `${admin.permissions.length} permissions`}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {admin.role === 'super_admin' ? 'System Default' : formatDate(admin.addedAt)}
                    </div>
                    {admin.addedBy && admin.addedBy !== 'system' && (
                      <p className="text-[10px] text-gray-400">by {admin.addedBy}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      admin.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {admin.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {admin.role !== 'super_admin' && (
                        <>
                          <button 
                            onClick={() => handleToggleStatus(admin.email, admin.isActive)}
                            className={`p-2 rounded-lg ${
                              admin.isActive ? 'hover:bg-amber-50' : 'hover:bg-green-50'
                            }`}
                            title={admin.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {admin.isActive ? (
                              <XCircle className="w-4 h-4 text-amber-600" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                          <button 
                            onClick={() => handleRemoveAdmin(admin.email)}
                            className="p-2 hover:bg-red-50 rounded-lg" 
                            title="Remove Admin"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </>
                      )}
                      {admin.role === 'super_admin' && (
                        <span className="text-xs text-gray-400 italic">Protected</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">About Admin Access</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Super admins are hardcoded in the system and cannot be removed</li>
              <li>• Only super admins can add or remove other admins</li>
              <li>• Added admins can be activated/deactivated at any time</li>
              <li>• When you add an admin, they can sign in with Google or email</li>
              <li>• The admin URL is hidden from public navigation for security</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold">Add New Admin</h2>
                <p className="text-sm text-gray-500 mt-1">Grant admin access to a new user</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value.toLowerCase()})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="newadmin@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This email will gain admin access. They must sign in with this exact email.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium">Permissions ({formData.permissions.length} selected)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      className="text-xs text-purple-600 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-xs text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={clearPermissions}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto space-y-4">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category}>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {category}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {perms.map(perm => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              className="rounded text-purple-600"
                            />
                            <span className="text-sm">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || !formData.email || !formData.name}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {processing ? 'Adding...' : 'Add Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
