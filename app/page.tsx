"use client"; 

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient'; // Pastikan path ini benar
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  Menu, 
  Moon, 
  Sun, 
  Video, 
  AlertTriangle, 
  Activity,
  Shield,
  Maximize2,
  RefreshCw,
  Camera,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// --- TIPE DATA SUPABASE ---
type Detection = {
  id: number;
  created_at: string;
  animal: string;
  confidence: number;
  imageurl: string;
};

// --- HELPER FUNCTIONS (Format Waktu) ---
const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  });
};

const getDayName = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en-US', { weekday: 'short' });
};

// --- KOMPONEN KECIL ---
const Card = ({ children, className }: any) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ type }: { type: string }) => {
  // Fallback color kalau hewan tidak dikenal
  const colors: any = {
    Cat: 'bg-orange-100 text-orange-700 border-orange-200',
    Dog: 'bg-blue-100 text-blue-700 border-blue-200',
    Mouse: 'bg-gray-100 text-gray-700 border-gray-200',
    Chicken: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[type] || 'bg-gray-100 text-gray-600'}`}>
      {type}
    </span>
  );
};

// --- HALAMAN DASHBOARD (Update: Ada Kotak Input Ngrok) ---
const DashboardPage = ({ data, loading }: { data: Detection[], loading: boolean }) => {
  // State untuk menyimpan URL Stream dari Ngrok
  const [streamUrl, setStreamUrl] = useState(""); 
  const [isStreaming, setIsStreaming] = useState(false);

  // Statistik Data
  const totalCount = data.length;
  const lastItem = data.length > 0 ? data[0] : null;
  const todayStr = new Date().toDateString();
  const todaysCount = data.filter(d => new Date(d.created_at).toDateString() === todayStr).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- KOLOM KIRI: LIVE MONITORING --- */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-500" /> Live Monitoring
          </h2>
          
          {/* Layar Video */}
          <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-lg group flex flex-col items-center justify-center">
            
            {/* Logic Tampilan Video */}
            {isStreaming && streamUrl ? (
              <img 
                src={streamUrl} 
                alt="Live Stream" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="text-center z-10 px-4">
                 <Activity className="w-12 h-12 mx-auto mb-2 opacity-50 text-gray-500 dark:text-gray-200" />
                 <p className="text-gray-500 dark:text-gray-200 mb-4">Stream Offline / Link Required</p>
              </div>
            )}

            {/* Indikator LIVE */}
            {isStreaming && (
              <div className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse font-bold z-10 shadow-sm">
                ● LIVE VIA NGROK
              </div>
            )}
          </div>

          {/* --- [INI KOTAK INPUT YANG KAMU CARI] --- */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Stream Source (Ngrok URL)
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Paste link Ngrok di sini... (https://....ngrok-free.dev)"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                className="flex-1 p-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button 
                onClick={() => setIsStreaming(!isStreaming)}
                className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors ${
                  isStreaming ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {isStreaming ? 'Stop' : 'Start'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              *Jangan lupa tambahkan <code>/video_feed</code> di akhir link.
            </p>
          </div>
        </div>

        {/* --- KOLOM KANAN: STATISTIK --- */}
        <div className="space-y-4">
           <h2 className="text-xl font-bold text-gray-800 dark:text-white">Quick Stats</h2>
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4 border-l-4 border-l-emerald-500">
              <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Detections</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : totalCount}
                </h3>
              </div>
           </div>
           
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4 border-l-4 border-l-blue-500">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <History size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Detection</p>
                {lastItem ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{lastItem.animal}</h3>
                    <p className="text-xs text-gray-400">{new Date(lastItem.created_at).toLocaleTimeString()}</p>
                  </>
                ) : (
                  <p className="text-sm font-bold text-gray-400">{loading ? "Loading..." : "No Data Yet"}</p>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- HALAMAN HISTORY (Versi Lengkap: Filter Tanggal + Modal) ---
const HistoryPage = ({ data, loading }: { data: Detection[], loading: boolean }) => {
  // State untuk Filter
  const [selectedAnimal, setSelectedAnimal] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All'); // <--- State Baru buat Tanggal

  // State untuk Modal Gambar Fullscreen
  const [selectedImageForModal, setSelectedImageForModal] = useState<string | null>(null);

  // --- LOGIKA FILTERING DATA ---
  const filteredData = data.filter((item) => {
    // 1. Cek Hewan
    const matchAnimal = selectedAnimal === 'All' || item.animal === selectedAnimal;
    
    // 2. Cek Tanggal
    let matchDate = true;
    if (selectedDate === 'Today') {
      const todayStr = new Date().toDateString(); // Contoh: "Wed Dec 31 2025"
      const itemDateStr = new Date(item.created_at).toDateString();
      matchDate = todayStr === itemDateStr;
    }
    // Kalau 'All', berarti matchDate selalu true (tampilkan semua)

    return matchAnimal && matchDate;
  });

  // Olah Data untuk Grafik
  const chartData = (() => {
    const stats = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateString = d.toLocaleDateString('en-US');
      const count = data.filter(item => 
        new Date(item.created_at).toLocaleDateString('en-US') === dateString
      ).length;
      stats.push({ 
        name: d.toLocaleDateString('en-US', { weekday: 'short' }), 
        count: count 
      });
    }
    return stats;
  })();

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* --- MODAL OVERLAY --- */}
      {selectedImageForModal && (
        <div 
          className="fixed inset-0 bg-black/90 z-9999 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedImageForModal(null)}
        >
          <button 
            onClick={() => setSelectedImageForModal(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 hover:bg-white/10 p-2 rounded-full transition z-50"
          >
             <X size={32} strokeWidth={2} />
          </button>
          <div className="relative w-full max-w-5xl h-[80vh] bg-transparent rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
             <Image
               src={selectedImageForModal}
               alt="Full View"
               fill
               className="object-contain"
               unoptimized
             />
          </div>
        </div>
      )}

      {/* --- FILTER & HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Historical Data</h2>
        
        <div className="flex gap-2">
          {/* Dropdown 1: Hewan */}
          <select 
            value={selectedAnimal}
            onChange={(e) => setSelectedAnimal(e.target.value)}
            className="p-2 rounded-lg border border-gray-300 text-sm bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="All">All Animals</option>
            <option value="Cat">Cat</option>
            <option value="Dog">Dog</option>
            <option value="Mouse">Mouse</option>
            <option value="Chicken">Chicken</option>
          </select>

          {/* Dropdown 2: Tanggal (INI YANG BARU DITAMBAHKAN) */}
          <select 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 rounded-lg border border-gray-300 text-sm bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="All">Last 7 Days</option>
            <option value="Today">Today</option>
          </select>
        </div>
      </div>

      {/* GRAFIK */}
      <Card className="h-64 w-full">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">Activity (Last 7 Days)</h3>
        {loading ? (
            <div className="h-full flex items-center justify-center text-gray-400">Loading Chart...</div>
        ) : (
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
            </ResponsiveContainer>
        )}
      </Card>

      {/* TABEL */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="p-4 font-semibold text-center">Time</th>
                <th className="p-4 font-semibold text-center">Animal</th>
                <th className="p-4 font-semibold text-center">Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                 <tr><td colSpan={3} className="p-8 text-center">Loading data...</td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">{formatTime(item.created_at)}</div>
                      <div className="text-xs text-gray-400">{formatDate(item.created_at)}</div>
                    </td>
                    <td className="p-4"><Badge type={item.animal} /></td>
                    <td className="p-4">
                      {/* Thumbnail dengan Cek URL Kosong */}
                      {item.imageurl && item.imageurl.length > 5 ? (
                        <button 
                          onClick={() => setSelectedImageForModal(item.imageurl)}
                          className="relative w-24 h-16 mx-auto rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 cursor-pointer group shadow-sm hover:shadow-md transition-all"
                        >
                          <Image 
                            src={item.imageurl} 
                            alt="Snapshot Thumbnail"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Maximize2 className="text-white drop-shadow-lg" size={20} />
                          </div>
                        </button>
                      ) : (
                        <div className="w-24 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-400 italic">
                          No Image
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400 italic">
                    No data found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- HALAMAN SYSTEM INFO (Tetap Static) ---
const SystemInfoPage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">System Information</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <h3 className="font-bold text-lg mb-4 dark:text-white">Device Info</h3>
        <ul className="space-y-3 text-sm">
          <li className="flex justify-between border-b pb-2 dark:text-white"><span>Model:</span> <span className="font-mono">Jetson Nano 4GB</span></li>
          <li className="flex justify-between border-b pb-2 dark:text-white"><span>OS:</span> <span className="font-mono">Ubuntu 18.04 (JetPack 4.6)</span></li>
          <li className="flex justify-between border-b pb-2 dark:text-white"><span>Connectivity:</span> <span className="font-mono text-emerald-500">Online (MQTT)</span></li>
        </ul>
      </Card>
      <Card>
         <h3 className="font-bold text-lg mb-4 dark:text-white">Configuration</h3>
         <p className="mt-4 text-sm text-gray-500">Database: Supabase (PostgreSQL)</p>
         <p className="text-sm text-gray-500">Storage: Supabase Buckets</p>
      </Card>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---
export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // STATE UNTUK DATA
  const [data, setData] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);

  // FUNGSI FETCH DATA DARI SUPABASE
  const fetchData = async () => {
    setLoading(true);
    const { data: detections, error } = await supabase
      .from("detections")
      .select("*")
      .order("created_at", { ascending: false }); // Urutkan dari yang terbaru

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setData(detections || []);
    }
    setLoading(false);
  };

  // Ambil data saat pertama kali buka web
  useEffect(() => {
    fetchData();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'History Data', icon: History },
    { id: 'system', label: 'System Info', icon: Settings },
  ];

  return (
    <div className={`${darkMode ? 'dark' : ''} flex h-screen bg-linear-to-br from-[#f1f2ed] to-emerald-100 dark:from-gray-900 dark:to-emerald-950 transition-colors duration-200`}>
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 font-bold text-xl text-emerald-600">
              <Shield/>
              <span>AniGuard</span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${activeTab === item.id 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Bottom Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 relative bg-gray-200">
                 {/* Placeholder Avatar */}
                 <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">A</div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Admin</p>
                <p className="text-xs text-green-500">● Online</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-8">
          <button 
            className="lg:hidden p-2 text-gray-600 dark:text-gray-200"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white capitalize">
            {activeTab.replace('-', ' ')}
          </h1>

          <div className="flex gap-2">
             {/* Tombol Refresh Data */}
             <button 
                onClick={fetchData}
                title="Refresh Data"
                className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
             >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
             </button>

             {/* Dark Mode Toggle */}
             <button 
               onClick={toggleDarkMode}
               className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 transition-colors"
             >
               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
             {/* Kirim DATA asli ke component anak */}
            {activeTab === 'dashboard' && <DashboardPage data={data} loading={loading} />}
            {activeTab === 'history' && <HistoryPage data={data} loading={loading} />}
            {activeTab === 'system' && <SystemInfoPage />}
          </div>
        </main>

      </div>
    </div>
  );
}