import React from 'react';
import { 
  Camera, 
  Activity, 
  MapPin, 
  HeartHandshake, 
  Cpu, 
  Bell, 
  Sparkles,
  Server,
  Radio,
  PlusCircle
} from 'lucide-react';
import { SystemAlert } from '../types/cattle';

interface HeaderProps {
  activeTab: 'vision' | 'herd' | 'map' | 'reproduction' | 'telemetry';
  setActiveTab: (tab: 'vision' | 'herd' | 'map' | 'reproduction' | 'telemetry') => void;
  alerts: SystemAlert[];
  onOpenAlerts: () => void;
  onQuickSimulate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  alerts,
  onOpenAlerts,
  onQuickSimulate,
}) => {
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with branding and system health indicators */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl">
              🐄
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>BoviSens</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                    الرؤية الحاسوبية v2.4
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                منظومة المراقبة الذكية للأبقار والماشية بالذكاء الاصطناعي وتحليل الكاميرات اللحظي
              </p>
            </div>
          </div>

          {/* System Hardware & Service Status Badges */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>NVIDIA Jetson: متصل (4.2ms)</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              <Radio className="w-3.5 h-3.5 text-sky-400" />
              <span>دفق RTSP: 4/4 نشط</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span>PostGIS & Redis: متزامن</span>
            </div>

            {/* Quick Simulate Trigger */}
            <button
              onClick={onQuickSimulate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition shadow-sm hover:shadow-emerald-500/25 active:scale-95"
              title="إرسال دفعة تليمترية جديدة للاختبار"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>محاكاة تليمترية Edge</span>
            </button>

            {/* Alerts Center Button */}
            <button
              onClick={onOpenAlerts}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              aria-label="مركز التنبيهات الصحية والإنتاجية"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>التنبيهات</span>
              {unacknowledgedAlerts.length > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold leading-none text-white bg-rose-600 rounded-full animate-pulse">
                  {unacknowledgedAlerts.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-2 space-x-reverse overflow-x-auto py-2 no-scrollbar" aria-label="أقسام المنظومة">
          <button
            onClick={() => setActiveTab('vision')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition ${
              activeTab === 'vision'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>البث الحي والرؤية الحاسوبية</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          <button
            onClick={() => setActiveTab('herd')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition ${
              activeTab === 'herd'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4 text-teal-400" />
            <span>لوحة التحكم وسجل القطيع</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition ${
              activeTab === 'map'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-4 h-4 text-sky-400" />
            <span>الخريطة المكانية للحظيرة (PostGIS)</span>
          </button>

          <button
            onClick={() => setActiveTab('reproduction')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition ${
              activeTab === 'reproduction'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-rose-400" />
            <span>إدارة التناسل والعرج والصحة</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
              شبق 89%
            </span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition ${
              activeTab === 'telemetry'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>محاكي API وهندسة النظام (Architecture)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
