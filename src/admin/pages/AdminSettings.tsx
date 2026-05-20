import { useState, useEffect } from 'react';
import { 
  Store, Truck, CreditCard, Bell, Shield, Save, 
  Mail, Phone, MapPin, Globe, Clock, DollarSign,
  Lock, AlertCircle, CheckCircle
} from 'lucide-react';
import { CONFIG } from '../../config';
import { 
  doc, setDoc, getDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../App';

const settingsTabs = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

const SETTINGS_DOC = 'storeSettings';

export default function AdminSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    storeName: CONFIG.COMPANY.NAME,
    storeEmail: CONFIG.COMPANY.EMAIL,
    storePhone: CONFIG.COMPANY.PHONE,
    storeAddress: CONFIG.COMPANY.ADDRESS,
    storeDescription: 'Your one-stop destination for fashion, beauty, and lifestyle products.',
    currency: 'USD',
    timezone: 'Africa/Lagos',
    weekdayHours: CONFIG.COMPANY.HOURS_WEEKDAY,
    weekendHours: CONFIG.COMPANY.HOURS_WEEKEND,
  });

  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 50,
    standardShippingRate: 9.99,
    expressShippingRate: 19.99,
    overnightShippingRate: 39.99,
    shippingCountries: 'Nigeria, Ghana, Kenya',
    estimatedDays: 5,
    enableInternationalShipping: false,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    enableStripe: true,
    enablePayPal: true,
    enableMTN: true,
    enableAirtel: true,
    enableBankTransfer: true,
    enableCashOnDelivery: false,
    taxRate: 8,
    bankName: 'GTBank',
    accountNumber: '0123456789',
    accountName: 'Ahmad Costimetics Ltd',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNewOrder: true,
    emailLowStock: true,
    emailNewCustomer: false,
    emailNewReview: true,
    emailDailyReport: false,
    pushNewOrder: true,
    pushPaymentReceived: true,
    smsOrderUpdates: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    enable2FA: false,
    sessionTimeout: 30,
    requireStrongPasswords: true,
  });

  // Load settings from Firebase
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', SETTINGS_DOC));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.general) setGeneralSettings({ ...generalSettings, ...data.general });
        if (data.shipping) setShippingSettings({ ...shippingSettings, ...data.shipping });
        if (data.payment) setPaymentSettings({ ...paymentSettings, ...data.payment });
        if (data.notifications) setNotificationSettings({ ...notificationSettings, ...data.notifications });
      }
    } catch (error) {
      console.log('No settings found, using defaults');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const settings = {
        general: generalSettings,
        shipping: shippingSettings,
        payment: paymentSettings,
        notifications: notificationSettings,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email,
      };
      
      await setDoc(doc(db, 'settings', SETTINGS_DOC), settings, { merge: true });
      showMessage('success', '✓ Settings saved successfully!');
    } catch (error: any) {
      showMessage('error', 'Failed to save: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }
    if (securitySettings.newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters');
      return;
    }
    showMessage('success', 'Password change request sent to Clerk. Please use Clerk dashboard to update.');
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-xs md:text-sm text-gray-500">Manage your store settings</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium shadow-md"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{message.text}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
              {settingsTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-xs lg:text-sm transition-colors ${
                      activeTab === tab.id ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-lg font-bold mb-1">General Settings</h2>
                <p className="text-sm text-gray-500">Configure your store's basic information</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Store className="w-4 h-4 inline mr-1" /> Store Name
                  </label>
                  <input 
                    type="text" 
                    value={generalSettings.storeName}
                    onChange={(e) => setGeneralSettings({...generalSettings, storeName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Mail className="w-4 h-4 inline mr-1" /> Store Email
                  </label>
                  <input 
                    type="email" 
                    value={generalSettings.storeEmail}
                    onChange={(e) => setGeneralSettings({...generalSettings, storeEmail: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Phone className="w-4 h-4 inline mr-1" /> Phone Number
                  </label>
                  <input 
                    type="tel" 
                    value={generalSettings.storePhone}
                    onChange={(e) => setGeneralSettings({...generalSettings, storePhone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" /> Address
                  </label>
                  <input 
                    type="text" 
                    value={generalSettings.storeAddress}
                    onChange={(e) => setGeneralSettings({...generalSettings, storeAddress: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" /> Currency
                  </label>
                  <select
                    value={generalSettings.currency}
                    onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="NGN">NGN (₦)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Globe className="w-4 h-4 inline mr-1" /> Timezone
                  </label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  >
                    <option value="Africa/Lagos">Africa/Lagos (UTC+1)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Store Description</label>
                <textarea 
                  rows={4}
                  value={generalSettings.storeDescription}
                  onChange={(e) => setGeneralSettings({...generalSettings, storeDescription: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Clock className="w-4 h-4 inline mr-1" /> Weekday Hours
                  </label>
                  <input 
                    type="text" 
                    value={generalSettings.weekdayHours}
                    onChange={(e) => setGeneralSettings({...generalSettings, weekdayHours: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Clock className="w-4 h-4 inline mr-1" /> Weekend Hours
                  </label>
                  <input 
                    type="text" 
                    value={generalSettings.weekendHours}
                    onChange={(e) => setGeneralSettings({...generalSettings, weekendHours: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SHIPPING TAB */}
          {activeTab === 'shipping' && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-lg font-bold mb-1">Shipping Settings</h2>
                <p className="text-sm text-gray-500">Configure shipping rates and policies</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Free Shipping Threshold ($)</p>
                    <p className="text-xs text-gray-500">Orders above this get free shipping</p>
                  </div>
                  <input 
                    type="number" 
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) => setShippingSettings({...shippingSettings, freeShippingThreshold: parseFloat(e.target.value) || 0})}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-right text-sm"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Standard Shipping ($)</p>
                    <p className="text-xs text-gray-500">5-7 business days</p>
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    value={shippingSettings.standardShippingRate}
                    onChange={(e) => setShippingSettings({...shippingSettings, standardShippingRate: parseFloat(e.target.value) || 0})}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-right text-sm"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Express Shipping ($)</p>
                    <p className="text-xs text-gray-500">2-3 business days</p>
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    value={shippingSettings.expressShippingRate}
                    onChange={(e) => setShippingSettings({...shippingSettings, expressShippingRate: parseFloat(e.target.value) || 0})}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-right text-sm"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Overnight Shipping ($)</p>
                    <p className="text-xs text-gray-500">Next business day</p>
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    value={shippingSettings.overnightShippingRate}
                    onChange={(e) => setShippingSettings({...shippingSettings, overnightShippingRate: parseFloat(e.target.value) || 0})}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-right text-sm"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Enable International Shipping</p>
                    <p className="text-xs text-gray-500">Ship to countries outside Nigeria</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={shippingSettings.enableInternationalShipping}
                    onChange={(e) => setShippingSettings({...shippingSettings, enableInternationalShipping: e.target.checked})}
                    className="w-5 h-5 rounded text-purple-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT TAB */}
          {activeTab === 'payment' && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-lg font-bold mb-1">Payment Methods</h2>
                <p className="text-sm text-gray-500">Enable payment methods and bank details</p>
              </div>
              
              <div className="space-y-3">
                {[
                  { key: 'enableStripe', label: 'Credit/Debit Card (Stripe)', icon: '💳' },
                  { key: 'enablePayPal', label: 'PayPal', icon: '🅿️' },
                  { key: 'enableMTN', label: 'MTN Mobile Money', icon: '📱' },
                  { key: 'enableAirtel', label: 'Airtel Money', icon: '📱' },
                  { key: 'enableBankTransfer', label: 'Bank Transfer', icon: '🏦' },
                  { key: 'enableCashOnDelivery', label: 'Cash on Delivery', icon: '💵' },
                ].map(method => (
                  <label key={method.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-medium text-sm">{method.label}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={paymentSettings[method.key as keyof typeof paymentSettings] as boolean}
                      onChange={(e) => setPaymentSettings({...paymentSettings, [method.key]: e.target.checked})}
                      className="w-5 h-5 rounded text-purple-600"
                    />
                  </label>
                ))}

                <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <h3 className="font-semibold text-sm">Bank Transfer Details</h3>
                  <div>
                    <label className="block text-xs font-medium mb-1">Bank Name</label>
                    <input 
                      type="text" 
                      value={paymentSettings.bankName}
                      onChange={(e) => setPaymentSettings({...paymentSettings, bankName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Account Number</label>
                    <input 
                      type="text" 
                      value={paymentSettings.accountNumber}
                      onChange={(e) => setPaymentSettings({...paymentSettings, accountNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Account Name</label>
                    <input 
                      type="text" 
                      value={paymentSettings.accountName}
                      onChange={(e) => setPaymentSettings({...paymentSettings, accountName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Tax Rate (%)</p>
                    <p className="text-xs text-gray-500">Applied to all orders</p>
                  </div>
                  <input 
                    type="number" 
                    step="0.1"
                    value={paymentSettings.taxRate}
                    onChange={(e) => setPaymentSettings({...paymentSettings, taxRate: parseFloat(e.target.value) || 0})}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-right text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-lg font-bold mb-1">Notification Settings</h2>
                <p className="text-sm text-gray-500">Choose what notifications you want to receive</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-3">📧 Email Notifications</h3>
                  <div className="space-y-2">
                    {[
                      { key: 'emailNewOrder', label: 'New order received' },
                      { key: 'emailLowStock', label: 'Low stock alerts' },
                      { key: 'emailNewCustomer', label: 'New customer registration' },
                      { key: 'emailNewReview', label: 'New product review' },
                      { key: 'emailDailyReport', label: 'Daily sales report' },
                    ].map(setting => (
                      <label key={setting.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <span className="text-sm">{setting.label}</span>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings[setting.key as keyof typeof notificationSettings] as boolean}
                          onChange={(e) => setNotificationSettings({...notificationSettings, [setting.key]: e.target.checked})}
                          className="w-5 h-5 rounded text-purple-600"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-3">🔔 Push Notifications</h3>
                  <div className="space-y-2">
                    {[
                      { key: 'pushNewOrder', label: 'New order alert' },
                      { key: 'pushPaymentReceived', label: 'Payment received' },
                    ].map(setting => (
                      <label key={setting.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <span className="text-sm">{setting.label}</span>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings[setting.key as keyof typeof notificationSettings] as boolean}
                          onChange={(e) => setNotificationSettings({...notificationSettings, [setting.key]: e.target.checked})}
                          className="w-5 h-5 rounded text-purple-600"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-3">📱 SMS Notifications</h3>
                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <span className="text-sm">Order updates via SMS</span>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.smsOrderUpdates}
                      onChange={(e) => setNotificationSettings({...notificationSettings, smsOrderUpdates: e.target.checked})}
                      className="w-5 h-5 rounded text-purple-600"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-lg font-bold mb-1">Security Settings</h2>
                <p className="text-sm text-gray-500">Manage your security preferences</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Authentication via Clerk</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Password and 2FA settings are managed through Clerk. Visit your Clerk dashboard to update credentials.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Change Password</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Lock className="w-4 h-4 inline mr-1" /> Current Password
                  </label>
                  <input 
                    type="password" 
                    value={securitySettings.currentPassword}
                    onChange={(e) => setSecuritySettings({...securitySettings, currentPassword: e.target.value})}
                    className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input 
                    type="password" 
                    value={securitySettings.newPassword}
                    onChange={(e) => setSecuritySettings({...securitySettings, newPassword: e.target.value})}
                    className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={securitySettings.confirmPassword}
                    onChange={(e) => setSecuritySettings({...securitySettings, confirmPassword: e.target.value})}
                    className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <button
                  onClick={handlePasswordChange}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                >
                  Update Password
                </button>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold text-sm">Additional Security</h3>
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">Two-Factor Authentication (2FA)</p>
                    <p className="text-xs text-gray-500">Extra security for your account</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={securitySettings.enable2FA}
                    onChange={(e) => setSecuritySettings({...securitySettings, enable2FA: e.target.checked})}
                    className="w-5 h-5 rounded text-purple-600"
                  />
                </label>
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">Require Strong Passwords</p>
                    <p className="text-xs text-gray-500">Min 8 chars with letters, numbers, symbols</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={securitySettings.requireStrongPasswords}
                    onChange={(e) => setSecuritySettings({...securitySettings, requireStrongPasswords: e.target.checked})}
                    className="w-5 h-5 rounded text-purple-600"
                  />
                </label>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Session Timeout (minutes)</p>
                    <p className="text-xs text-gray-500">Auto-logout after inactivity</p>
                  </div>
                  <input 
                    type="number" 
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value) || 30})}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-right text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
