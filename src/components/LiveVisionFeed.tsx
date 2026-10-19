import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  Play, 
  Pause, 
  Eye, 
  Activity, 
  Zap, 
  Flame, 
  AlertTriangle, 
  Maximize2, 
  CameraOff,
  Crosshair,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import { Cow, CameraStream } from '../types/cattle';

interface LiveVisionFeedProps {
  cows: Cow[];
  cameraStreams: CameraStream[];
  onSelectCow: (cow: Cow) => void;
}

export const LiveVisionFeed: React.FC<LiveVisionFeedProps> = ({
  cows,
  cameraStreams,
  onSelectCow,
}) => {
  const [selectedCamId, setSelectedCamId] = useState<string>('cam_01');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showGaitSkeleton, setShowGaitSkeleton] = useState<boolean>(true);
  const [showTagOcr, setShowTagOcr] = useState<boolean>(true);
  const [showTelemetryHud, setShowTelemetryHud] = useState<boolean>(true);
  const [streamTime, setStreamTime] = useState<string>('00:00:00');
  const [snapshotTaken, setSnapshotTaken] = useState<boolean>(false);

  const currentCam = cameraStreams.find(c => c.id === selectedCamId) || cameraStreams[0];
  const activeCows = cows.filter(c => currentCam.detected_cows.includes(c.tag_number));

  // Live timer for RTSP timestamp
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setStreamTime(now.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTakeSnapshot = () => {
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Camera Stream Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Video className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex flex-wrap items-center gap-2">
                  <span>البث الحي للرؤية الحاسوبية</span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Computer Vision &amp; Inference
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    بث مباشر
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  معالجة إطارات الفيديو محلياً عبر أجهزة الحافة (Edge AI / NVIDIA Jetson) باستخدام خوارزميات YOLOv8 و ByteTrack
                </p>
              </div>
            </div>
          </div>

          {/* Camera Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cameraStreams.map((cam) => {
              const isSelected = cam.id === selectedCamId;
              return (
                <button
                  key={cam.id}
                  onClick={() => setSelectedCamId(cam.id)}
                  className={`text-right p-2.5 rounded-xl border text-xs transition relative ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{cam.id.toUpperCase()}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="truncate font-medium">{cam.name.split(':')[1] || cam.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {cam.detected_cows.length} أبقار مرصودة
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Video Viewport & AI Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* The Live Video Player (3 cols on desktop) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video shadow-2xl group select-none">
            {/* Background Barn Simulation Graphic */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
              {/* Perspective grid representing barn ground and lanes */}
              <svg className="w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="barn-floor" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.8" />
                  </pattern>
                  <linearGradient id="lighting-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.08" />
                    <stop offset="60%" stopColor="#0f172a" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#barn-floor)" />
                <rect width="100%" height="100%" fill="url(#lighting-grad)" />
                
                {/* Visual architectural barn lines: rafters and gates */}
                <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#1e293b" strokeWidth="1.5" />
                <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#1e293b" strokeWidth="1.5" />
                <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#059669" strokeWidth="1" opacity="0.3" />
              </svg>

              {/* Watermark / Camera RTSP Info */}
              <div className="absolute top-4 right-4 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="font-mono font-bold text-rose-400">REC [RTSP]</span>
                </div>
                <span className="text-slate-600">|</span>
                <span className="font-mono text-emerald-400">{streamTime}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">{currentCam.name}</span>
              </div>

              {/* Edge Inference HUD Overlay */}
              {showTelemetryHud && (
                <div dir="ltr" className="absolute top-4 left-4 hidden sm:block bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs space-y-1 font-mono text-slate-300 max-w-xs shadow-lg text-left">
                  <div className="flex items-center justify-between gap-4 text-emerald-400 font-bold border-b border-slate-800/80 pb-1">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>{currentCam.edge_node}</span>
                    </span>
                    <span>{currentCam.fps} FPS</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Latency:</span>
                    <span className="text-emerald-300">4.2 ms (TensorRT FP16)</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Tracker:</span>
                    <span className="text-sky-300">ByteTrack v2 + OCR</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Resolution:</span>
                    <span className="text-slate-300">{currentCam.resolution}</span>
                  </div>
                </div>
              )}

              {/* Snapshot feedback badge */}
              {snapshotTaken && (
                <div className="absolute inset-0 bg-white/20 backdrop-blur-xs flex items-center justify-center transition-all animate-out fade-out duration-1000">
                  <div className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-2xl">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>تم حفظ الإطار وتحليل الرؤية الحاسوبية بنجاح</span>
                  </div>
                </div>
              )}
            </div>

            {/* Cattle Graphical Representations & YOLO Bounding Boxes */}
            <div className="absolute inset-0 pointer-events-auto">
              {activeCows.map((cow, index) => {
                const box = cow.bounding_box;
                const isHeat = cow.heat_percentage >= 70;
                const isLame = cow.locomotion_score >= 2;
                const isCalving = cow.health_status.includes('ولادة');

                // Dynamic border color based on health/reproductive status
                let borderColor = 'border-emerald-500';
                let tagBg = 'bg-emerald-600';
                if (isCalving) {
                  borderColor = 'border-purple-500';
                  tagBg = 'bg-purple-600';
                } else if (isHeat) {
                  borderColor = 'border-rose-500';
                  tagBg = 'bg-rose-600';
                } else if (isLame) {
                  borderColor = 'border-amber-500';
                  tagBg = 'bg-amber-600';
                }

                return (
                  <div
                    key={cow.id}
                    onClick={() => onSelectCow(cow)}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                    className={`absolute cursor-pointer transition-all duration-300 group/box ${
                      showBoundingBoxes
                        ? `border-2 ${borderColor} rounded-xl shadow-lg`
                        : ''
                    } hover:scale-102 hover:z-20`}
                  >
                    {/* Cow Visual Silhouette / Graphical Render */}
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
                      {/* Stylized Cow Illustration within box */}
                      <div className="w-20 h-16 sm:w-28 sm:h-22 opacity-90 drop-shadow-md relative">
                        <svg viewBox="0 0 100 80" className="w-full h-full">
                          {/* Cow Body */}
                          <ellipse cx="50" cy="45" rx="36" ry="22" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                          {/* Spotted Holstein Marks */}
                          <path d="M 35 32 Q 45 38 40 48 Q 30 46 35 32 Z" fill="#ffffff" opacity="0.9" />
                          <path d="M 58 35 Q 68 40 62 52 Q 52 48 58 35 Z" fill="#ffffff" opacity="0.9" />
                          {/* Cow Head with Ear Tag */}
                          <circle cx="20" cy="30" r="14" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                          {/* Yellow Ear Tag */}
                          <polygon points="12,20 18,22 15,28 9,26" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                          <text x="11" y="26" fontSize="5" fontWeight="bold" fill="#000">#{cow.tag_number}</text>
                          {/* Eyes & Muzzle */}
                          <ellipse cx="14" cy="36" rx="6" ry="4" fill="#fda4af" opacity="0.8" />
                          {/* Legs */}
                          <line x1="28" y1="58" x2="26" y2="76" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                          <line x1="38" y1="58" x2="38" y2="76" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                          <line x1="62" y1="58" x2="62" y2="76" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                          <line x1="72" y1="58" x2="74" y2="76" stroke={isLame ? '#f59e0b' : '#334155'} strokeWidth="4" strokeLinecap="round" />
                        </svg>

                        {/* Gait Skeleton Overlay (Pose Estimation) */}
                        {showGaitSkeleton && (
                          <div className="absolute inset-0 pointer-events-none">
                            <svg viewBox="0 0 100 80" className="w-full h-full opacity-85">
                              {/* Spine line */}
                              <path 
                                d={isLame ? "M 22 28 Q 50 20 75 35" : "M 22 28 L 50 32 L 75 35"} 
                                fill="none" 
                                stroke={isLame ? "#f59e0b" : "#10b981"} 
                                strokeWidth="2" 
                                strokeDasharray={isLame ? "2 2" : "none"} 
                              />
                              {/* Joint dots */}
                              <circle cx="22" cy="28" r="2.5" fill="#38bdf8" />
                              <circle cx="50" cy={isLame ? 24 : 32} r="2.5" fill="#38bdf8" />
                              <circle cx="75" cy="35" r="2.5" fill="#38bdf8" />
                              {/* Leg joints */}
                              <circle cx="26" cy="74" r="2" fill="#10b981" />
                              <circle cx="74" cy="74" r="2.5" fill={isLame ? "#ef4444" : "#10b981"} />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Tag ID & Confidence Label */}
                      {showTagOcr && (
                        <div className="absolute -top-7 right-0 flex items-center gap-1.5 z-10">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold text-white shadow-md flex items-center gap-1 ${tagBg}`}>
                            <Crosshair className="w-3 h-3" />
                            <span>بقر #{cow.tag_number}</span>
                          </span>
                          <span className="bg-slate-900/90 text-slate-300 text-[10px] px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                            {box.confidence}%
                          </span>
                        </div>
                      )}

                      {/* Live Vital Metrics Overlay Pills */}
                      <div className="absolute -bottom-8 inset-x-0 flex flex-wrap justify-center gap-1 text-[10px] pointer-events-none">
                        {/* Milk Production */}
                        <span className="bg-slate-900/95 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700/80 font-bold flex items-center gap-0.5 shadow-sm">
                          🥛 {cow.daily_milk}L
                        </span>

                        {/* Heat Badge */}
                        {cow.heat_percentage >= 65 && (
                          <span className="bg-rose-950/95 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/40 font-bold flex items-center gap-0.5 shadow-sm animate-pulse">
                            <Flame className="w-2.5 h-2.5 text-rose-400" />
                            <span>شبق {cow.heat_percentage}%</span>
                          </span>
                        )}

                        {/* Lameness Badge */}
                        {cow.locomotion_score >= 2 && (
                          <span className="bg-amber-950/95 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 font-bold flex items-center gap-0.5 shadow-sm">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                            <span>عرج خفيف (د{cow.locomotion_score})</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Stream Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-3 pt-6 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
                  aria-label={isPlaying ? 'إيقاف مؤقت للبث' : 'تشغيل البث'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
                </button>

                <div className="text-slate-400 hidden sm:block">
                  الأبقار النشطة في هذا الإطار: <strong className="text-white">{activeCows.length}</strong>
                </div>
              </div>

              {/* Quick Snapshot & Inspect Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTakeSnapshot}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <Camera className="w-3.5 h-3.5 text-sky-400" />
                  <span>التقاط إطار (Capture)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick instructions hint */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span>اضغط على أي بقرة في الإطار لفتح ملفها البيطري وسجل الحلب والشبق بالتفصيل.</span>
            </span>
            <span className="font-mono text-slate-500">RTSP: {currentCam.rtsp_url}</span>
          </div>
        </div>

        {/* AI & Stream Control Sidebar (1 col on desktop) */}
        <div className="space-y-4">
          {/* Layer toggles panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>طبقات الذكاء الاصطناعي (AI Layers)</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 cursor-pointer border border-slate-700/60 transition">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-emerald-400" />
                  <span>أطر التتبع (YOLO Bounding Boxes)</span>
                </div>
                <input
                  type="checkbox"
                  checked={showBoundingBoxes}
                  onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                  className="rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 cursor-pointer border border-slate-700/60 transition">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>تحليل المشية والهيكل (Gait Pose)</span>
                </div>
                <input
                  type="checkbox"
                  checked={showGaitSkeleton}
                  onChange={(e) => setShowGaitSkeleton(e.target.checked)}
                  className="rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 cursor-pointer border border-slate-700/60 transition">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>قراءة أرقام الأذن (Tag OCR)</span>
                </div>
                <input
                  type="checkbox"
                  checked={showTagOcr}
                  onChange={(e) => setShowTagOcr(e.target.checked)}
                  className="rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 cursor-pointer border border-slate-700/60 transition">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-400" />
                  <span>بيانات وحدة الحافة (Hardware HUD)</span>
                </div>
                <input
                  type="checkbox"
                  checked={showTelemetryHud}
                  onChange={(e) => setShowTelemetryHud(e.target.checked)}
                  className="rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Detected Cattle List in this Camera */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>الأبقار المرصودة بالإطار ({activeCows.length})</span>
              </h3>
            </div>

            <div className="space-y-2">
              {activeCows.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  لا توجد أبقار في مجال رؤية هذه الكاميرا حالياً
                </div>
              ) : (
                activeCows.map((cow) => {
                  const isHeat = cow.heat_percentage >= 70;
                  const isLame = cow.locomotion_score >= 2;

                  return (
                    <div
                      key={cow.id}
                      onClick={() => onSelectCow(cow)}
                      className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-emerald-500/50 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                          #{cow.tag_number}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>البقرة {cow.tag_number}</span>
                            {isHeat && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold">
                                شبق {cow.heat_percentage}%
                              </span>
                            )}
                            {isLame && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold">
                                عرج
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            إنتاج الحليب: <strong className="text-emerald-400">{cow.daily_milk} لتر</strong>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition transform group-hover:translate-x-1" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
