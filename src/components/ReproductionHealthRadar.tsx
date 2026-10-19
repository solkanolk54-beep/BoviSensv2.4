import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Flame, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  ChevronRight,
  Activity,
  Droplet,
  Info
} from 'lucide-react';
import { Cow } from '../types/cattle';
import { calculateInseminationWindow, evaluateLamenessScore, predictCalvingUrgency } from '../utils/livestockLogic';

interface ReproductionHealthRadarProps {
  cows: Cow[];
  onSelectCow: (cow: Cow) => void;
  onUpdateCowStatus: (updatedCow: Cow) => void;
}

export const ReproductionHealthRadar: React.FC<ReproductionHealthRadarProps> = ({
  cows,
  onSelectCow,
  onUpdateCowStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'heat' | 'lameness' | 'calving'>('heat');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter cattle by domains
  const heatCows = cows.filter(c => c.heat_percentage >= 65);
  const lameCows = cows.filter(c => c.locomotion_score >= 2);
  const calvingCows = cows.filter(c => c.health_status.includes('ولادة') || c.calving_date.startsWith('2026-10'));

  const triggerTechnicianNotification = (cow: Cow) => {
    setActionNotice(`تم إرسال إشعار عاجل لفني التلقيح الاصطناعي بخصوص البقرة #${cow.tag_number} (النافذة الذهبية للتلقيح).`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleCureLameness = (cow: Cow) => {
    const updated: Cow = {
      ...cow,
      locomotion_score: 1,
      health_status: 'طبيعي',
      veterinary_notes: `${cow.veterinary_notes} | تم إنهاء بروتوكول علاج الحافر وعادت المشية إلى طبيعية.`,
    };
    onUpdateCowStatus(updated);
    setActionNotice(`تم تحديث حالة البقرة #${cow.tag_number} إلى طبيعي بعد اكتمال العلاج البيطري.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <HeartHandshake className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>رادار الإدارة الإنجابية والرعاية الصحية (Reproduction & Health Radar)</span>
              </h2>
              <p className="text-xs text-slate-400">
                خوارزميات التنبؤ بمواعيد الولادة، كشف الشبق وحساب النافذة الذهبية للتلقيح، والتشخيص المبكر للعرج
              </p>
            </div>
          </div>

          {/* Sub-tab Switchers */}
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setActiveSubTab('heat')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'heat'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>رصد الشبق والتلقيح ({heatCows.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('lameness')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'lameness'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>كشف العرج والمشية ({lameCows.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('calving')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'calving'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>تنبؤات الولادة ({calvingCows.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionNotice && (
        <div className="bg-emerald-600/90 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* SECTION 1: HEAT DETECTION & GOLDEN INSEMINATION WINDOW */}
      {activeSubTab === 'heat' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heatCows.map((cow) => {
              const heatInfo = calculateInseminationWindow(cow.heat_percentage, cow.heat_onset_hours);

              return (
                <div
                  key={cow.id}
                  className="bg-slate-900 border border-rose-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black text-lg">
                          #{cow.tag_number}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base">البقرة #{cow.tag_number}</h3>
                          <span className="text-xs text-slate-400">{cow.breed} • {cow.location.zoneName}</span>
                        </div>
                      </div>

                      <div className="text-left">
                        <span className="text-2xl font-black text-rose-400">{cow.heat_percentage}%</span>
                        <span className="text-[10px] text-rose-300 block font-semibold">مؤشر الشبق YOLO</span>
                      </div>
                    </div>

                    {/* Golden Window Box */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span className="flex items-center gap-1.5 text-rose-400">
                          <Clock className="w-4 h-4" />
                          <span>النافذة الزمنية المثلى للتلقيح (AI Window):</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[11px] font-mono">
                          متبقي {heatInfo.optimalHoursRemaining} ساعات
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {heatInfo.statusText}
                      </p>
                    </div>

                    {/* Vitals summary */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-800/60">
                        <span className="text-[10px] text-slate-400 block">ارتفاع النشاط</span>
                        <strong className="text-rose-400 font-bold">+{cow.activity_index}%</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/60">
                        <span className="text-[10px] text-slate-400 block">وقت الاجترار</span>
                        <strong className="text-white font-bold">{cow.rumination_minutes} دقيقة</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/60">
                        <span className="text-[10px] text-slate-400 block">الحليب اليومي</span>
                        <strong className="text-emerald-400 font-bold">{cow.daily_milk} لتر</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                    <button
                      onClick={() => onSelectCow(cow)}
                      className="text-xs text-slate-400 hover:text-white transition"
                    >
                      عرض الملف الكامل
                    </button>

                    <button
                      onClick={() => triggerTechnicianNotification(cow)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md shadow-rose-600/30 flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إشعار فني التلقيح</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: EARLY LAMENESS & GAIT MONITORING */}
      {activeSubTab === 'lameness' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lameCows.map((cow) => {
              const lameness = evaluateLamenessScore(cow.locomotion_score);

              return (
                <div
                  key={cow.id}
                  className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-lg">
                          #{cow.tag_number}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base">البقرة #{cow.tag_number}</h3>
                          <span className="text-xs text-slate-400">{cow.breed} • {cow.location.zoneName}</span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40">
                        {lameness.category}
                      </span>
                    </div>

                    {/* Gait Analysis Details */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-white block">
                        التحليل الحركي للكاميرا (Gait & Spine Tracking):
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {lameness.recommendation}
                      </p>
                    </div>

                    {/* Vitals impact */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-800/60">
                        <span className="text-[10px] text-slate-400 block">تقييم المشية</span>
                        <strong className="text-amber-400 font-bold">درجة {cow.locomotion_score}/5</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/60">
                        <span className="text-[10px] text-slate-400 block">تراجع النشاط</span>
                        <strong className="text-amber-400 font-bold">{cow.activity_index}%</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/60">
                        <span className="text-[10px] text-slate-400 block">إنتاج الحليب</span>
                        <strong className="text-white font-bold">{cow.daily_milk} لتر</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                    <button
                      onClick={() => onSelectCow(cow)}
                      className="text-xs text-slate-400 hover:text-white transition"
                    >
                      عرض تقرير الفحص
                    </button>

                    <button
                      onClick={() => handleCureLameness(cow)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/30 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تأكيد علاج الحافر</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: CALVING PREDICTIONS */}
      {activeSubTab === 'calving' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calvingCows.map((cow) => {
              const calving = predictCalvingUrgency(cow.calving_date);

              return (
                <div
                  key={cow.id}
                  className="bg-slate-900 border border-purple-500/40 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black text-lg">
                          #{cow.tag_number}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base">البقرة #{cow.tag_number}</h3>
                          <span className="text-xs text-slate-400">{cow.breed} • {cow.location.zoneName}</span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/40">
                        {calving.statusText}
                      </span>
                    </div>

                    {/* Calving Information */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">تاريخ الولادة المتوقع:</span>
                        <strong className="text-white font-mono">{cow.calving_date}</strong>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {cow.veterinary_notes}
                      </p>
                    </div>

                    {/* Maternity Readiness Checklist */}
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>نقل البقرة لحظيرة الولادات الخاصة والمعقمة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>كاميرا الذكاء الاصطناعي مخصصة لرصد بداية المخاض</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => onSelectCow(cow)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                    >
                      <span>عرض تفاصيل البقرة</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
