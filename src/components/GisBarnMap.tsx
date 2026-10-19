import React, { useState } from 'react';
import { 
  MapPin, 
  Layers, 
  Database, 
  Info, 
  Flame, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Cow, BarnZone } from '../types/cattle';

interface GisBarnMapProps {
  cows: Cow[];
  zones: BarnZone[];
  onSelectCow: (cow: Cow) => void;
}

export const GisBarnMap: React.FC<GisBarnMapProps> = ({
  cows,
  zones,
  onSelectCow,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedCowPin, setSelectedCowPin] = useState<Cow | null>(null);
  const [showDensityHeatmap, setShowDensityHeatmap] = useState<boolean>(false);
  const [showSqlViewer, setShowSqlViewer] = useState<boolean>(false);

  const selectedZone = zones.find(z => z.id === selectedZoneId);
  const cowsInSelectedZone = selectedZone 
    ? cows.filter(c => c.location.zoneId === selectedZone.id) 
    : [];

  return (
    <div className="space-y-6">
      {/* Top Description and PostGIS GIS Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>الخريطة المكانية التفاعلية للحظيرة (PostGIS GIS Spatial Map)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold font-mono">
                  PostgreSQL / PostGIS 15
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                رصد مواقع الأبقار اللحظية كإحداثيات مكانية هندسية (Geometry Point) وتوزيع الكثافة عبر مناطق الحظيرة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDensityHeatmap(!showDensityHeatmap)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                showDensityHeatmap 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>خريطة الكثافة الحرارية</span>
            </button>

            <button
              onClick={() => setShowSqlViewer(!showSqlViewer)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                showSqlViewer 
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>استعلامات PostGIS SQL</span>
            </button>
          </div>
        </div>

        {/* PostGIS Query Code Snippet if toggled */}
        {showSqlViewer && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-sky-300 animate-in fade-in duration-200">
            <div className="text-slate-400 text-[11px] mb-1">// استعلام تتبع الموقع الجغرافي وحساب كثافة الأبقار داخل الحظائر:</div>
            <code>
              {`SELECT c.tag_number, c.daily_milk, ST_X(c.location) AS pos_x, ST_Y(c.location) AS pos_y, z.zone_name
FROM cows c
JOIN barn_zones z ON ST_Within(c.location, z.geom_polygon)
WHERE c.heat_status = true OR c.locomotion_score > 1;`}
            </code>
          </div>
        )}
      </div>

      {/* Main Map Viewport & Zone Information Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive Barn Canvas Map (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 aspect-[16/10] shadow-2xl p-4 select-none">
            {/* Barn Blueprint Architectural Grid */}
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid-pattern" width="5" height="5" patternUnits="userSpaceOnUse">
                  <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#1e293b" strokeWidth="0.3" />
                </pattern>
                
                {/* Heatmap overlay glow */}
                <radialGradient id="heat-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Grid Background */}
              <rect width="100" height="100" fill="url(#grid-pattern)" />

              {/* Outer Barn Boundary Walls */}
              <rect x="2" y="2" width="96" height="96" rx="3" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="1 1" />

              {/* Render Architectural Zones */}
              {zones.map((zone) => {
                const isSelected = selectedZoneId === zone.id;
                const zoneCows = cows.filter(c => c.location.zoneId === zone.id);
                
                let fillColor = 'rgba(16, 185, 129, 0.08)';
                let strokeColor = '#10b981';
                if (zone.id === 'cubicles_resting') {
                  fillColor = 'rgba(56, 189, 248, 0.08)';
                  strokeColor = '#38bdf8';
                } else if (zone.id === 'feed_lane') {
                  fillColor = 'rgba(245, 158, 11, 0.08)';
                  strokeColor = '#f59e0b';
                } else if (zone.id === 'maternity_pen') {
                  fillColor = 'rgba(168, 85, 247, 0.08)';
                  strokeColor = '#a855f7';
                } else if (zone.id === 'vet_clinic') {
                  fillColor = 'rgba(244, 63, 94, 0.08)';
                  strokeColor = '#f43f5e';
                }

                return (
                  <g key={zone.id} onClick={() => setSelectedZoneId(zone.id)} className="cursor-pointer transition-all">
                    <rect
                      x={zone.x}
                      y={zone.y}
                      width={zone.width}
                      height={zone.height}
                      rx="2"
                      fill={fillColor}
                      stroke={isSelected ? '#ffffff' : strokeColor}
                      strokeWidth={isSelected ? '1' : '0.6'}
                      strokeDasharray={isSelected ? 'none' : '2 1'}
                    />
                    {/* Zone Label inside SVG */}
                    <text
                      x={zone.x + zone.width / 2}
                      y={zone.y + 4.5}
                      textAnchor="middle"
                      fill={strokeColor}
                      fontSize="2.4"
                      fontWeight="bold"
                    >
                      {zone.name} ({zoneCows.length})
                    </text>
                  </g>
                );
              })}

              {/* Density Heatmap Simulation Layer if active */}
              {showDensityHeatmap && (
                <>
                  <circle cx="28" cy="30" r="15" fill="url(#heat-glow)" />
                  <circle cx="68" cy="28" r="18" fill="url(#heat-glow)" />
                  <circle cx="60" cy="70" r="22" fill="url(#heat-glow)" />
                </>
              )}
            </svg>

            {/* Cattle Spatial Point Markers (Pins) */}
            {cows.map((cow) => {
              const isSelected = selectedCowPin?.id === cow.id;
              const isHeat = cow.heat_percentage >= 70;
              const isLame = cow.locomotion_score >= 2;
              const isCalving = cow.health_status.includes('ولادة');

              let pinColor = 'bg-emerald-500';
              let ringColor = 'ring-emerald-400';
              if (isCalving) {
                pinColor = 'bg-purple-500';
                ringColor = 'ring-purple-400';
              } else if (isHeat) {
                pinColor = 'bg-rose-500';
                ringColor = 'ring-rose-400';
              } else if (isLame) {
                pinColor = 'bg-amber-500';
                ringColor = 'ring-amber-400';
              }

              return (
                <div
                  key={cow.id}
                  style={{ left: `${cow.location.x}%`, top: `${cow.location.y}%` }}
                  onClick={() => {
                    setSelectedCowPin(cow);
                    setSelectedZoneId(cow.location.zoneId);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-300 hover:scale-125 z-20 group/pin"
                >
                  {/* Glowing pulsing halo */}
                  <span className={`absolute -inset-1 rounded-full ${pinColor} opacity-40 animate-ping`}></span>

                  {/* Marker Pin Icon */}
                  <div className={`relative px-1.5 py-0.5 rounded-md text-[10px] font-black text-white shadow-lg flex items-center gap-0.5 border border-white/20 ring-2 ${ringColor} ${pinColor}`}>
                    <span>#{cow.tag_number}</span>
                  </div>

                  {/* Hover Tag Tooltip */}
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover/pin:flex flex-col items-center pointer-events-none z-30">
                    <div className="bg-slate-900 border border-slate-700 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap shadow-xl">
                      <strong>بقر #{cow.tag_number}</strong> | {cow.daily_milk}L | {cow.health_status}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Map Legend */}
            <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-white">
                <span>دليل الحالات:</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>طبيعية</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>شبق (تلقيح)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>عرج / فحص</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span>ولادة وشيكة</span>
              </span>
            </div>
          </div>
        </div>

        {/* Selected Zone or Selected Cow Details Panel (1 col) */}
        <div className="space-y-4">
          {/* Active Pin Focus Card */}
          {selectedCowPin ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm animate-in fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400">البقرة المحددة مكانياً:</span>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span>البقرة #{selectedCowPin.tag_number}</span>
                    <span className="text-xs text-emerald-400">({selectedCowPin.breed})</span>
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCowPin(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  إلغاء التحديد
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between p-2 rounded-lg bg-slate-800/60">
                  <span className="text-slate-400">إحداثيات PostGIS:</span>
                  <code className="text-emerald-400 font-mono">
                    Point({selectedCowPin.location.x}, {selectedCowPin.location.y})
                  </code>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-800/60">
                  <span className="text-slate-400">المنطقة الحالية:</span>
                  <span className="font-semibold text-white">{selectedCowPin.location.zoneName}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-800/60">
                  <span className="text-slate-400">كمية الحليب اليومية:</span>
                  <span className="font-bold text-emerald-400">{selectedCowPin.daily_milk} لتر</span>
                </div>
              </div>

              <button
                onClick={() => onSelectCow(selectedCowPin)}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>فتح الملف الشامل للبقرة {selectedCowPin.tag_number}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Zone Occupancy Stats Card */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>إشغال مناطق الحظيرة (Zone Occupancy)</span>
              </h3>

              <div className="space-y-2.5">
                {zones.map((zone) => {
                  const zoneCows = cows.filter(c => c.location.zoneId === zone.id);
                  const occupancyPct = Math.round((zoneCows.length / zone.capacity) * 100);
                  const isSelected = selectedZoneId === zone.id;

                  return (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        isSelected
                          ? 'bg-sky-500/15 border-sky-500 text-white shadow-sm'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold">{zone.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {zoneCows.length} / {zone.capacity} بقرة
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden mb-1">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, occupancyPct)}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>نسبة الإشغال: {occupancyPct}%</span>
                        {zoneCows.length > 0 && (
                          <span className="text-emerald-400 font-semibold">
                            الأبقار: {zoneCows.map(c => `#${c.tag_number}`).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
