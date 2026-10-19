import React, { useState } from 'react';
import { 
  X, 
  Droplet, 
  Flame, 
  AlertTriangle, 
  Calendar, 
  Activity, 
  Heart, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Thermometer, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Stethoscope
} from 'lucide-react';
import { Cow } from '../types/cattle';
import { calculateInseminationWindow, evaluateLamenessScore, predictCalvingUrgency } from '../utils/livestockLogic';

interface CowDetailModalProps {
  cow: Cow | null;
  onClose: () => void;
  onUpdateCowStatus: (updatedCow: Cow) => void;
}

export const CowDetailModal: React.FC<CowDetailModalProps> = ({
  cow,
  onClose,
  onUpdateCowStatus,
}) => {
  if (!cow) return null;

  const [activeTab, setActiveTab] = useState<'vitals' | 'reproduction' | 'locomotion' | 'spatial'>('vitals');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Run pure domain logic functions
  const heatInfo = calculateInseminationWindow(cow.heat_percentage, cow.heat_onset_hours);
  const lamenessInfo = evaluateLamenessScore(cow.locomotion_score);
  const calvingInfo = predictCalvingUrgency(cow.calving_date);

  // SVG dimensions for 7-day milk chart
  const maxMilk = Math.max(...cow.milk_history.map(m => m.amount), 35);
  const minMilk = Math.min(...cow.milk_history.map(m => m.amount), 15);

  const handleInseminateNow = () => {
    const updated = {
      ...cow,
      heat_percentage: 15,
      heat_onset_hours: 0,
      veterinary_notes: `${cow.veterinary_notes} | تم إجراء التلقيح الاصطناعي بنجاح بتاريخ ${new Date().toLocaleDateString('ar-EG')}.`,
    };
    onUpdateCowStatus(updated);
    setSuccessToast('تم تسجيل التلقيح الاصطناعي بنجاح وتحديث حالة دورة الشبق.');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleApplyHoofTreatment = () => {
    const updated = {
      ...cow,
      locomotion_score: 1,
      health_status: 'طبيعي - بعد علاج الحافر',
      veterinary_notes: `${cow.veterinary_notes} | تم تقليم الحافر وتطبيق الضمادة العلاجية وتحسن المشية إلى طبيعي.`,
    };
    onUpdateCowStatus(updated);
    setSuccessToast('تم تسجيل العلاج البيطري وتقليم الحافر بنجاح.');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-emerald-500/20">
              #{cow.tag_number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">البقرة #{cow.tag_number}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                  {cow.breed}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                <span>الشريحة الإلكترونية RFID: <strong className="font-mono text-slate-300">{cow.rfid}</strong></span>
                <span>•</span>
                <span>الموقع: <strong className="text-emerald-400">{cow.location.zoneName}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Action Notification */}
        {successToast && (
          <div className="bg-emerald-600/90 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between transition animate-in slide-in-from-top">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successToast}</span>
            </span>
          </div>
        )}

        {/* Modal Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 text-xs font-medium overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('vitals')}
            className={`py-3 px-4 border-b-2 font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'vitals'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplet className="w-4 h-4 text-sky-400" />
            <span>إنتاج الحليب والمؤشرات الحيوية</span>
          </button>

          <button
            onClick={() => setActiveTab('reproduction')}
            className={`py-3 px-4 border-b-2 font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reproduction'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-400" />
            <span>دورة الشبق والنافذة الذهبية للتلقيح</span>
            {cow.heat_percentage >= 70 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('locomotion')}
            className={`py-3 px-4 border-b-2 font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'locomotion'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>تحليل المشية والعرج (Gait)</span>
          </button>

          <button
            onClick={() => setActiveTab('spatial')}
            className={`py-3 px-4 border-b-2 font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'spatial'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>الولادة والسجل البيطري</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* TAB 1: MILK & VITALS */}
          {activeTab === 'vitals' && (
            <div className="space-y-6">
              {/* Quick Stat Blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">الإنتاج اليومي الحالي</span>
                  <div className="text-2xl font-black text-emerald-400">{cow.daily_milk} <span className="text-xs font-normal text-slate-400">لتر</span></div>
                  <span className="text-[10px] text-emerald-400 font-medium">سجل ممتاز</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">وقت الاجترار اليومي</span>
                  <div className="text-2xl font-black text-white">{cow.rumination_minutes} <span className="text-xs font-normal text-slate-400">دقيقة</span></div>
                  <span className="text-[10px] text-slate-400">المعدل الطبيعي: 450-500</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">درجة حرارة الجسم</span>
                  <div className="text-2xl font-black text-sky-400">{cow.body_temp}°C</div>
                  <span className="text-[10px] text-sky-300">طبيعية (38.3 - 39.1)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">تغير النشاط الحركي</span>
                  <div className={`text-2xl font-black ${cow.activity_index > 30 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {cow.activity_index > 0 ? `+${cow.activity_index}%` : `${cow.activity_index}%`}
                  </div>
                  <span className="text-[10px] text-slate-400">مقارنة بخط الأساس</span>
                </div>
              </div>

              {/* 7-Day Milk Production Curve Chart */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>منحنى إنتاج الحليب لآخر 7 أيام (Daily Milk Production Curve)</span>
                  </h4>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    آخر فحص: {cow.last_milking}
                  </span>
                </div>

                {/* SVG Visual Chart */}
                <div className="h-44 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 140" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="0" y1="70" x2="500" y2="70" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />

                    {/* Polyline of milk values */}
                    {(() => {
                      const points = cow.milk_history.map((m, idx) => {
                        const x = (idx / (cow.milk_history.length - 1)) * 480 + 10;
                        const y = 120 - ((m.amount - minMilk + 2) / (maxMilk - minMilk + 4)) * 95;
                        return `${x},${y}`;
                      }).join(' ');

                      return (
                        <>
                          {/* Gradient Area below line */}
                          <defs>
                            <linearGradient id="milkGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <polygon points={`10,120 ${points} 490,120`} fill="url(#milkGradient)" />
                          <polyline fill="none" stroke="#10b981" strokeWidth="3" points={points} strokeLinecap="round" />
                        </>
                      );
                    })()}

                    {/* Data Points and Labels */}
                    {cow.milk_history.map((m, idx) => {
                      const x = (idx / (cow.milk_history.length - 1)) * 480 + 10;
                      const y = 120 - ((m.amount - minMilk + 2) / (maxMilk - minMilk + 4)) * 95;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy={y} r="4.5" fill="#10b981" stroke="#0f172a" strokeWidth="2" />
                          <text x={x} y={y - 8} textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold">
                            {m.amount}L
                          </text>
                          <text x={x} y="136" textAnchor="middle" fill="#94a3b8" fontSize="9">
                            {m.day}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REPRODUCTION & HEAT DETECTION */}
          {activeTab === 'reproduction' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Flame className="w-5 h-5 text-rose-500" />
                      <span>مؤشر رصد الشبق بالرؤية الحاسوبية (Heat Detection Index)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      اكتشاف سلوك الركوب، القفز، والنشاط الحركي عبر كاميرات المراقبة وتحليل YOLOv8 اللحظي
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-3xl font-black text-rose-400">{cow.heat_percentage}%</span>
                    <span className="text-xs text-slate-400 block">احتمالية الشبق</span>
                  </div>
                </div>

                {/* Heat status progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cow.heat_percentage >= 70
                        ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 animate-pulse'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${cow.heat_percentage}%` }}
                  ></div>
                </div>

                {/* Insemination Window Calculation Box */}
                <div className={`p-4 rounded-xl border ${
                  heatInfo.urgency === 'peak'
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                    : heatInfo.urgency === 'approaching'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-white">{heatInfo.statusText}</h4>
                      <p className="text-xs opacity-90 leading-relaxed">
                        تحدث الإباضة لدى الأبقار بعد 24-32 ساعة من بدء علامات الشبق، والنافذة الذهبية للتلقيح الاصطناعي (AI) هي بين 12 إلى 18 ساعة لضمان أعلى نسبة إخصاب.
                      </p>
                      {heatInfo.optimalHoursRemaining > 0 && (
                        <div className="pt-2">
                          <button
                            onClick={handleInseminateNow}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md shadow-rose-600/30 flex items-center gap-2"
                          >
                            <Heart className="w-4 h-4" />
                            <span>تأكيد تسجيل التلقيح الاصطناعي الآن</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOCOMOTION & LAMENESS */}
          {activeTab === 'locomotion' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Activity className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        تقييم المشية واكتشاف العرج المبكر (Locomotion Scoring)
                      </h3>
                      <p className="text-xs text-slate-400">
                        مقياس سبريشر (Sprecher 1-5 Scale) عبر تتبع تقوس العمود الفقري وتماثل حركة الحوافر
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-xl font-black text-sm border ${
                    cow.locomotion_score === 1
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  }`}>
                    درجة {cow.locomotion_score} من 5
                  </span>
                </div>

                {/* Score breakdown visual cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${cow.locomotion_score === 1 ? 'bg-emerald-950/40 border-emerald-500' : 'bg-slate-850 border-slate-800 opacity-60'}`}>
                    <span className="font-bold text-white block mb-1">الدرجة 1: طبيعية وسليمة</span>
                    <p className="text-slate-400 text-[11px]">ظهر مستوٍ أثناء الوقوف والمشي، أطوال الخطوات متساوية تماماً.</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${cow.locomotion_score === 2 ? 'bg-amber-950/40 border-amber-500' : 'bg-slate-850 border-slate-800 opacity-60'}`}>
                    <span className="font-bold text-amber-300 block mb-1">الدرجة 2: عرج خفيف</span>
                    <p className="text-slate-400 text-[11px]">ظهر مستوٍ أثناء الوقوف وتقوس طفيف أثناء المشي، عدم تناظر بسيط في الخطوة.</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${cow.locomotion_score >= 3 ? 'bg-rose-950/40 border-rose-500' : 'bg-slate-850 border-slate-800 opacity-60'}`}>
                    <span className="font-bold text-rose-300 block mb-1">الدرجة 3+: عرج متوسط إلى حاد</span>
                    <p className="text-slate-400 text-[11px]">ظهر مقوس أثناء الوقوف والمشي، تردد في تحميل الوزن على حافر معين.</p>
                  </div>
                </div>

                {/* Veterinary Recommendation & Action */}
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Stethoscope className="w-4 h-4 text-emerald-400" />
                    <span>توصية التدخل العلاجي البيطري:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lamenessInfo.recommendation}
                  </p>
                  {cow.locomotion_score >= 2 && (
                    <div className="pt-2">
                      <button
                        onClick={handleApplyHoofTreatment}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تسجيل اكتمال علاج الحافر وإعادة التقييم إلى طبيعي</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CALVING & VET NOTES */}
          {activeTab === 'spatial' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span>توقع وتتبع موعد الولادة (Calving Predictions)</span>
                  </h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    calvingInfo.urgency === 'imminent'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {calvingInfo.statusText}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">الموعد المسجل للولادة:</span>
                    <strong className="text-sm font-mono text-white">{cow.calving_date}</strong>
                  </div>
                  <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">تاريخ الميلاد / العمر:</span>
                    <strong className="text-sm font-mono text-white">{cow.birth_date} (3 سنوات)</strong>
                  </div>
                </div>

                {/* Veterinary Notes Log */}
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-white block">ملاحظات الطبيب البيطري وسجل الحالة:</span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                    {cow.veterinary_notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            كود المعرف المكاني PostGIS: <code className="text-emerald-400">ST_Point({cow.location.x}, {cow.location.y})</code>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
