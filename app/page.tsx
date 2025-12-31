"use client"; // <--- WAJIB ADA DI BARIS 1 KARENA PAKAI STATE

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; // Menggunakan Image optimizer bawaan Next.js
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
  Cat,
  Dog,
  Rat,
  Bird 
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

// PENTING: Pastikan kamu sudah menaruh file 'logo.jpg' di dalam folder 'public'
// Kita tidak perlu import logoSaya from './logo.jpg' lagi.

const fullHistoryData = [
  { id: 1, time: '10:42 AM', date: '2025-12-08', animal: 'Cat', snapshot: 'IMG-001' },
  { id: 2, time: '09:15 AM', date: '2025-12-08', animal: 'Chicken', snapshot: 'IMG-002' },
  { id: 3, time: '08:30 AM', date: '2025-12-08', animal: 'Cat', snapshot: 'IMG-003' },
  { id: 4, time: '06:10 AM', date: '2025-12-08', animal: 'Dog', snapshot: 'IMG-004' },
  { id: 5, time: '11:20 PM', date: '2025-12-07', animal: 'Mouse', snapshot: 'IMG-005' },
  { id: 6, time: '08:10 PM', date: '2025-12-07', animal: 'Cat', snapshot: 'IMG-006' },
  { id: 7, time: '05:45 PM', date: '2025-12-07', animal: 'Chicken', snapshot: 'IMG-007' },
  { id: 8, time: '01:15 PM', date: '2025-12-06', animal: 'Mouse', snapshot: 'IMG-008' },
  { id: 9, time: '09:00 AM', date: '2025-12-06', animal: 'Dog', snapshot: 'IMG-009' },
  { id: 10, time: '07:30 AM', date: '2025-12-05', animal: 'Cat', snapshot: 'IMG-010' },
  { id: 11, time: '03:45 AM', date: '2025-12-05', animal: 'Mouse', snapshot: 'IMG-011' },
  { id: 12, time: '10:10 PM', date: '2025-12-04', animal: 'Chicken', snapshot: 'IMG-012' },
  { id: 13, time: '04:20 PM', date: '2025-12-04', animal: 'Dog', snapshot: 'IMG-013' },
  { id: 14, time: '11:05 AM', date: '2025-12-03', animal: 'Cat', snapshot: 'IMG-014' },
  { id: 15, time: '06:30 AM', date: '2025-12-02', animal: 'Mouse', snapshot: 'IMG-015' },
];

// --- MOCK DATA ---
const detectionData = (() => {
  const stats = [];
  const today = new Date('2025-12-08'); 
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i); 
    const dateString = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const count = fullHistoryData.filter(item => item.date === dateString).length;
    stats.push({ name: dayName, count: count });
  }
  return stats;
})();

// --- KOMPONEN KECIL ---
// Kita tambahkan 'any' sementara agar TypeScript tidak rewel, nanti bisa diperbaiki
const Card = ({ children, className }: any) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ type }: { type: string }) => {
  const colors: any = {
    Cat: 'bg-orange-100 text-orange-700 border-orange-200',
    Dog: 'bg-blue-100 text-blue-700 border-blue-200',
    Mouse: 'bg-gray-100 text-gray-700 border-gray-200',
    Chicken: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[type] || 'bg-gray-100'}`}>
      {type}
    </span>
  );
};

// --- HALAMAN UTAMA (DASHBOARD) ---
const DashboardPage = () => {
  const enableWebcam = false; 
  const todayDate = '2025-12-08';
  const todaysData = fullHistoryData.filter(item => item.date === todayDate);
  const totalCount = todaysData.length; 
  const lastItem = todaysData.length > 0 ? todaysData[0] : null; 

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
    return () => {
      if (webcamRef.current && webcamRef.current.srcObject) {
        const tracks = (webcamRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
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
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-500" /> Live Monitoring
          </h2>
          
          <div 
            ref={videoContainerRef} 
            className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-lg group flex items-center justify-center"
          >
            {enableWebcam ? (
              <video 
                ref={webcamRef}
                autoPlay 
                muted 
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="text-center z-0">
                 <Activity className="w-12 h-12 mx-auto mb-2 opacity-50 text-gray-500 dark:text-gray-200" />
                 <p className="text-gray-500 dark:text-gray-200">Connecting to Camera...</p>
              </div>
            )}

            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse font-bold z-10">
              ● LIVE
            </div>
            
            <div className="absolute top-4 right-4 text-white/70 text-xs font-mono z-10 bg-black/20 p-1 rounded">
              {enableWebcam ? "CAM" : "CAM"} | Resolution | Frame Rate
            </div>

            <button 
              onClick={toggleFullScreen}
              className="absolute bottom-4 right-4 p-2 bg-black/40 hover:bg-emerald-600 text-white rounded-lg transition-all z-20 backdrop-blur-sm group-hover:opacity-100"
              title="Full Screen"
            >
              <Maximize2 size={20} />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
           <h2 className="text-xl font-bold text-gray-800 dark:text-white">Summary Today</h2>
           <Card className="flex items-center gap-4 border-l-4 border-l-emerald-500">
              <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Detections</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</h3>
              </div>
           </Card>
           
           <Card className="flex items-center gap-4 border-l-4 border-l-blue-500">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <History size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Detection</p>
                {lastItem ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{lastItem.animal}</h3>
                    <p className="text-xs text-gray-400">{lastItem.time}</p>
                  </>
                ) : (
                  <p className="text-sm font-bold text-gray-400">No Data Yet</p>
                )}
              </div>
           </Card>

           <Card>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">System Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SBC Core Temp</span>
                  <span className="text-green-600 font-medium">42°C</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">CPU Usage</span>
                  <span className="text-green-600 font-medium">75%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Memory Usage</span>
                  <span className="text-green-600 font-medium">25%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Disk Usage</span>
                  <span className="text-green-600 font-medium">80%</span>
                </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

// --- HALAMAN HISTORY ---
const HistoryPage = () => {
  const [selectedAnimal, setSelectedAnimal] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');

    const filteredData = fullHistoryData.filter((item) => {
    const matchAnimal = selectedAnimal === 'All' || item.animal === selectedAnimal;
    let matchDate = true;
    if (selectedDate === 'Today') {
      matchDate = item.date === '2025-12-08'; 
    }
    return matchAnimal && matchDate;
  });

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

      <Card className="h-64 w-full">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">Weekly Activity</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={detectionData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
            <Tooltip cursor={{fill: 'transparent'}} />
            <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

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
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">{item.time}</div>
                      <div className="text-xs text-gray-400">{item.date}</div>
                    </td>
                    <td className="p-4"><Badge type={item.animal} /></td>
                    <td className="p-4">
                      <div className="h-10 w-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 mx-auto">
                        {item.snapshot}
                      </div>
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

// --- HALAMAN SYSTEM INFO ---
const SystemInfoPage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">System Information</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <h3 className="font-bold text-lg mb-4 dark:text-white">Device Info</h3>
        <ul className="space-y-3 text-sm">
          <li className="flex justify-between border-b pb-2 dark:text-white"><span>Model:</span> <span className="font-mono">Jetson Nano</span></li>
          <li className="flex justify-between border-b pb-2 dark:text-white"><span>OS Version:</span> <span className="font-mono">Ubuntu 18.04 LTS</span></li>
          <li className="flex justify-between border-b pb-2 dark:text-white"><span>Uptime:</span> <span className="font-mono">4 Days, 2 Hours</span></li>
          <li className="flex justify-between dark:text-white"><span>IP Address:</span> <span className="font-mono">192.168.1.105</span></li>
        </ul>
      </Card>
      <Card>
         <h3 className="font-bold text-lg mb-4 dark:text-white">Detection Settings</h3>
         <div className="flex flex-wrap gap-2">
            <Badge type="Cat" />
            <Badge type="Dog" />
            <Badge type="Mouse" />
            <Badge type="Chicken" />
         </div>
         <p className="mt-4 text-sm text-gray-500">Zone Area: 5x5 Meters</p>
         <p className="text-sm text-gray-500">Detection Confidence: &gt; 75%</p>
      </Card>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---
export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              {/* Gambar Profil Kecil (Menggunakan Image Next.js) */}
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 relative">
                  {/* Pastikan file logo.jpg ada di folder public */}
                  <Image src="/logo.jpg" alt="User" fill className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Admin</p>
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

          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <DashboardPage />}
            {activeTab === 'history' && <HistoryPage />}
            {activeTab === 'system' && <SystemInfoPage />}
          </div>
        </main>

      </div>
    </div>
  );
}