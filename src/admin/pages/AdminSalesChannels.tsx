import { useState, useEffect } from 'react';
import { 
  Globe, Smartphone, Store, Plus, Settings, 
  TrendingUp, DollarSign, ShoppingCart, Eye, EyeOff,
  CheckCircle, XCircle, ExternalLink, RefreshCw
} from 'lucide-react';
import { FacebookIcon } from '../../components/BrandIcons';

// Facebook icon wrapper to match Lucide signature
const Facebook = ({ className }: { className?: string }) => <FacebookIcon className={className} size={24} />;
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface Channel {
  id: string;
  name: string;
  type: 'website' | 'mobile' | 'pos' | 'facebook' | 'instagram' | 'other';
  status: 'live' | 'offline' | 'maintenance';
  url?: string;
  icon: any;
  iconColor: string;
  sales: number;
  orders: number;
  conversion: number;
  lastSync?: any;
  apiKey?: string;
  isConnected: boolean;
  description?: string;
}

const DEFAULT_CHANNELS: Channel[] = [
  {
    id: 'website',
    name: 'Website',
    type: 'website',
    status: 'live',
    url: 'https://ahmadcostimetics.com',
    icon: Globe,
    iconColor: 'text-blue-600 bg-blue-50',
    sales: 149154.30,
    orders: 1245,
    conversion: 3.5,
    isConnected: true,
    description: 'Main online storefront',
  },
  {
    id: 'mobile',
    name: 'Mobile App',
    type: 'mobile',
    status: 'live',
    url: 'https://app.ahmadcostimetics.com',
    icon: Smartphone,
    iconColor: 'text-purple-600 bg-purple-50',
    sales: 62147.63,
    orders: 567,
    conversion: 4.2,
    isConnected: true,
    description: 'iOS and Android app',
  },
  {
    id: 'pos',
    name: 'POS System',
    type: 'pos',
    status: 'offline',
    icon: Store,
    iconColor: 'text-green-600 bg-green-50',
    sales: 24859.05,
    orders: 234,
    conversion: 8.7,
    isConnected: false,
    description: 'In-store point of sale',
  },
  {
    id: 'facebook',
    name: 'Facebook Shop',
    type: 'facebook',
    status: 'live',
    url: 'https://facebook.com/ahmadcostimetics/shop',
    icon: Facebook,
    iconColor: 'text-blue-700 bg-blue-50',
    sales: 12429.52,
    orders: 89,
    conversion: 2.1,
    isConnected: true,
    description: 'Facebook integrated shop',
  },
];

const CHANNELS_DOC = 'sales_channels';

export default function AdminSalesChannels() {
  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', CHANNELS_DOC));
      if (docSnap.exists() && docSnap.data().channels) {
        // Merge stored data with default icons
        const stored = docSnap.data().channels;
        const merged = DEFAULT_CHANNELS.map(def => {
          const found = stored.find((s: any) => s.id === def.id);
          return found ? { ...def, ...found, icon: def.icon } : def;
        });
        setChannels(merged);
      }
    } catch (error) {
      console.log('Using default channels');
    }
  };

  const saveChannels = async (updated: Channel[]) => {
    try {
      // Don't save icon function
      const toSave = updated.map(({ icon, ...rest }) => rest);
      await setDoc(doc(db, 'settings', CHANNELS_DOC), {
        channels: toSave,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving channels:', error);
    }
  };

  const toggleChannelStatus = async (channelId: string) => {
    const updated = channels.map(c => {
      if (c.id === channelId) {
        const newStatus = c.status === 'live' ? 'offline' : 'live';
        return { ...c, status: newStatus as any, isConnected: newStatus === 'live' };
      }
      return c;
    });
    setChannels(updated);
    await saveChannels(updated);
    alert(`Channel status updated!`);
  };

  const handleSync = async (channelId: string) => {
    setSyncing(channelId);
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    const updated = channels.map(c => 
      c.id === channelId ? { ...c, lastSync: new Date().toISOString() } : c
    );
    setChannels(updated);
    await saveChannels(updated);
    setSyncing(null);
    alert('✓ Channel synced successfully!');
  };

  const handleConnect = async (channel: Channel) => {
    setSelectedChannel(channel);
    setShowSettings(true);
  };

  const handleSaveSettings = async () => {
    if (!selectedChannel) return;
    const updated = channels.map(c => c.id === selectedChannel.id ? selectedChannel : c);
    setChannels(updated);
    await saveChannels(updated);
    setShowSettings(false);
    alert('✓ Channel settings saved!');
  };

  const totalSales = channels.reduce((sum, c) => sum + c.sales, 0);
  const totalOrders = channels.reduce((sum, c) => sum + c.orders, 0);
  const liveChannels = channels.filter(c => c.status === 'live').length;
  const avgConversion = channels.length > 0 
    ? (channels.reduce((s, c) => s + c.conversion, 0) / channels.length).toFixed(1)
    : '0';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Sales Channels</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Manage all your sales channels in one place ({channels.length} channels)
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
          <Plus className="w-4 h-4" /> Add Channel
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Channels"
          value={channels.length.toString()}
          icon={Globe}
          color="bg-blue-50 text-blue-600"
          subtext={`${liveChannels} live`}
        />
        <StatCard
          label="Total Sales"
          value={`$${totalSales.toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-50 text-green-600"
          subtext="All channels"
        />
        <StatCard
          label="Total Orders"
          value={totalOrders.toLocaleString()}
          icon={ShoppingCart}
          color="bg-purple-50 text-purple-600"
          subtext="Combined"
        />
        <StatCard
          label="Avg Conversion"
          value={`${avgConversion}%`}
          icon={TrendingUp}
          color="bg-amber-50 text-amber-600"
          subtext="Overall rate"
        />
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map(channel => {
          const Icon = channel.icon;
          const isSyncing = syncing === channel.id;
          const channelShare = totalSales > 0 ? (channel.sales / totalSales * 100).toFixed(1) : '0';
          
          return (
            <div key={channel.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="p-4 md:p-5 border-b">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${channel.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base md:text-lg">{channel.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          channel.status === 'live' 
                            ? 'bg-green-100 text-green-700' 
                            : channel.status === 'maintenance'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {channel.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{channel.description}</p>
                    </div>
                  </div>
                  
                  {/* Status indicator dot */}
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full ${
                      channel.status === 'live' 
                        ? 'bg-green-500' 
                        : channel.status === 'maintenance'
                        ? 'bg-amber-500'
                        : 'bg-gray-400'
                    }`}>
                      {channel.status === 'live' && (
                        <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* URL */}
                {channel.url && (
                  <a 
                    href={channel.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {channel.url}
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="p-4 md:p-5 bg-gray-50 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 mb-1">Sales</p>
                  <p className="text-sm md:text-base font-bold">${(channel.sales / 1000).toFixed(1)}K</p>
                  <p className="text-[10px] text-purple-600">{channelShare}%</p>
                </div>
                <div className="text-center border-x border-gray-200">
                  <p className="text-[10px] text-gray-500 mb-1">Orders</p>
                  <p className="text-sm md:text-base font-bold">{channel.orders}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 mb-1">Conversion</p>
                  <p className="text-sm md:text-base font-bold">{channel.conversion}%</p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 md:p-4 flex flex-wrap gap-2">
                <button
                  onClick={() => toggleChannelStatus(channel.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    channel.status === 'live'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {channel.status === 'live' ? (
                    <>
                      <EyeOff className="w-3 h-3" /> Take Offline
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" /> Go Live
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleSync(channel.id)}
                  disabled={isSyncing || channel.status === 'offline'}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>

                <button
                  onClick={() => handleConnect(channel)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg text-xs font-medium transition-colors"
                >
                  <Settings className="w-3 h-3" /> Configure
                </button>
              </div>

              {/* Connection Status */}
              <div className="px-4 pb-3 flex items-center gap-2">
                {channel.isConnected ? (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Connected & syncing
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Not connected
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-blue-900 mb-1 text-sm">About Sales Channels</h3>
            <p className="text-xs text-blue-700">
              Sell your products through multiple channels and manage them all from this dashboard. 
              Products you upload will automatically sync to all active channels.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && selectedChannel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold">Configure {selectedChannel.name}</h2>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-100 rounded">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Channel Name</label>
                <input
                  type="text"
                  value={selectedChannel.name}
                  onChange={(e) => setSelectedChannel({ ...selectedChannel, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <input
                  type="url"
                  value={selectedChannel.url || ''}
                  onChange={(e) => setSelectedChannel({ ...selectedChannel, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">API Key</label>
                <input
                  type="password"
                  value={selectedChannel.apiKey || ''}
                  onChange={(e) => setSelectedChannel({ ...selectedChannel, apiKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={selectedChannel.status}
                  onChange={(e) => setSelectedChannel({ ...selectedChannel, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="live">Live</option>
                  <option value="offline">Offline</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 border rounded-lg text-sm">
                Cancel
              </button>
              <button onClick={handleSaveSettings} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, subtext }: any) {
  return (
    <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-base md:text-lg font-bold">{value}</p>
          <p className="text-[10px] md:text-xs text-gray-500">{label}</p>
          {subtext && <p className="text-[10px] text-gray-400">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}
