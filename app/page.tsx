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
  Camera
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
  image_url: string;
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

// --- HALAMAN DASHBOARD (Menerima Data Asli) ---
const DashboardPage = ({ data, loading }: { data: Detection[], loading: boolean }) => {
  const enableWebcam = false; 
  
  // Hitung Statistik dari Data Asli
  const totalCount = data.length;
  const lastItem = data.length > 0 ? data[0] : null; // Data paling atas = paling baru
  
  // Hitung Data Hari Ini
  const todayStr = new Date().toDateString();
  const todaysCount = data.filter(d => new Date(d.created_at).toDateString() === todayStr).length;

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!enableWebcam) return; 
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Gagal akses kamera:", err);
      }
    };
    startWebcam();
  }, [enableWebcam]); 

  const toggleFullScreen = () => {
    if (!document.fullscreenElement && videoContainerRef.current) {
      videoContainerRef.current.requestFullscreen().catch(err => alert(err.message));
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Video & Live Monitor */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-500" /> Live Monitoring
          </h2>
          
          <div 
            ref={videoContainerRef} 
            className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-lg group flex items-center justify-center"
          >
            {enableWebcam ? (
              <video ref={webcamRef} autoPlay muted className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="text-center z-0">
                 <Activity className="w-12 h-12 mx-auto mb-2 opacity-50 text-gray-500 dark:text-gray-200" />
                 <p className="text-gray-500 dark:text-gray-200">System Standby...</p>
              </div>
            )}

            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse font-bold z-10">
              ● LIVE
            </div>
            <button onClick={toggleFullScreen} className="absolute bottom-4 right-4 p-2 bg-black/40 hover:bg-emerald-600 text-white rounded-lg transition-all z-20 backdrop-blur-sm">
              <Maximize2 size={20} />
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Statistik */}
        <div className="space-y-4">
           <h2 className="text-xl font-bold text-gray-800 dark:text-white">Quick Stats</h2>
           
           {/* Kartu Total Deteksi */}
           <Card className="flex items-center gap-4 border-l-4 border-l-emerald-500">
              <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Detections</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : totalCount}
                </h3>
              </div>
           </Card>
           
           {/* Kartu Terakhir Dilihat */}
           <Card className="flex items-center gap-4 border-l-4 border-l-blue-500">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <History size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Detection</p>
                {lastItem ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{lastItem.animal}</h3>
                    <p className="text-xs text-gray-400">{formatTime(lastItem.created_at)} • {formatDate(lastItem.created_at)}</p>
                  </>
                ) : (
                  <p className="text-sm font-bold text-gray-400">{loading ? "Loading..." : "No Data Yet"}</p>
                )}
              </div>
           </Card>

           <Card>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Today's Activity</h4>
              <div className="text-center py-4">
                <span className="text-4xl font-bold text-gray-800 dark:text-white">{todaysCount}</span>
                <p className="text-sm text-gray-500">Animals Detected Today</p>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

// --- HALAMAN HISTORY (Menerima Data Asli) ---
const HistoryPage = ({ data, loading }: { data: Detection[], loading: boolean }) => {
  const [selectedAnimal, setSelectedAnimal] = useState('All');
  
  // 1. Filter Data untuk Tabel
  const filteredData = data.filter((item) => {
    return selectedAnimal === 'All' || item.animal === selectedAnimal;
  });

  // 2. Olah Data untuk Grafik (Weekly Stats)
  // Logic: Loop 7 hari terakhir, hitung jumlah kemunculan per tanggal
  const chartData = (() => {
    const stats = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateString = d.toLocaleDateString('en-US'); // Format MM/DD/YYYY untuk compare
      
      // Hitung berapa data yang tanggalnya sama
      const count = data.filter(item => 
        new Date(item.created_at).toLocaleDateString('en-US') === dateString
      ).length;

      stats.push({ 
        name: d.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue...
        count: count 
      });
    }
    return stats;
  })();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Historical Data</h2>
        
        <div className="flex gap-2">
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
                <th className="p-4 font-semibold text-center">Confidence</th>
                <th className="p-4 font-semibold text-center">Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                 <tr><td colSpan={4} className="p-8 text-center">Loading data...</td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">{formatTime(item.created_at)}</div>
                      <div className="text-xs text-gray-400">{formatDate(item.created_at)}</div>
                    </td>
                    <td className="p-4"><Badge type={item.animal} /></td>
                    <td className="p-4 text-xs font-mono">{(item.confidence * 100).toFixed(0)}%</td>
                    <td className="p-4">
                      {/* Tombol Lihat Gambar */}
                      <a 
                        href={item.image_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs transition"
                      >
                         <Camera size={12}/> View
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                    No data found.
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