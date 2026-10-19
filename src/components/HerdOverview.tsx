import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Flame, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  Droplet, 
  Filter, 
  Grid, 
  List, 
  ChevronRight, 
  Heart,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Cow } from '../types/cattle';

interface HerdOverviewProps {
  cows: Cow[];
  onSelectCow: (cow: Cow) => void;
  onOpenInseminationForCow: (cow: Cow) => void;
}

export const HerdOverview: React.FC<HerdOverviewProps> = ({
  cows,
  onSelectCow,
  onOpenInseminationForCow,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'heat' | 'lameness' | 'calving' | 'top_milk'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Compute summary stats
  const totalCows = cows.length;
  const avgMilk = cows.length > 0 
    ? (cows.reduce((acc, c) => acc + c.daily_milk, 0) / cows.length).toFixed(1) 
    : '0';
  const heatCows = cows.filter(c => c.heat_percentage >= 65);
  const lameCows = cows.filter(c => c.locomotion_score >= 2);
  const imminentCalvings = cows.filter(c => c.health_status.includes('ولادة') || c.calving_date === '2026-10-20');

  // Filtered cow list
  const filteredCows = cows.filter(cow => {
    // Search query match
    const matchesSearch = 
      cow.tag_number.includes(searchQuery) || 
      cow.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cow.rfid.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter type match
    if (filterType === 'heat') return cow.heat_percentage >= 65;
    if (filterType === 'lameness') return cow.locomotion_score >= 2;
    if (filterType === 'calving') return cow.health_status.includes('ولادة') || cow.calving_date.startsWith('2026-10');
    if (filterType === 'top_milk') return cow.daily_milk >= 30;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Herd */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">إجمالي القطيع المفحوص</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white">{totalCows} <span className="text-xs font-normal text-slate-400">بقرة نشطة</span></div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>تتبع بالذكاء الاصطناعي 100%</span>
          </div>
        </div>

        {/* Daily Milk Avg */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">متوسط الحليب اليومي</span>
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Droplet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white">{avgMilk} <span className="text-xs font-normal text-slate-400">لتر / بقرة</span></div>
          <div className="text-[11px] text-sky-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>البقرة 442 تسجل 30.9L</span>
          </div>
        </div>

        {/* Heat Alerts */}
        <div 
          onClick={() => setFilterType('heat')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm cursor-pointer hover:border-rose-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium group-hover:text-rose-400 transition">حالات الشبق النشطة</span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 group-hover:scale-110 transition">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white">{heatCows.length} <span className="text-xs font-normal text-rose-400">بحاجة لتلقيح</span></div>
          <div className="text-[11px] text-rose-300 mt-1">
            البقرة 727 (89%)، 108 (94%)
          </div>
        </div>

        {/* Lameness Cases */}
        <div 
          onClick={() => setFilterType('lameness')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm cursor-pointer hover:border-amber-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium group-hover:text-amber-400 transition">رصد العرج والتدخل</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white">{lameCows.length} <span className="text-xs font-normal text-amber-400">تحت المتابعة</span></div>
          <div className="text-[11px] text-amber-300 mt-1">
            البقرة 727 (عرج خفيف د2)
          </div>
        </div>

        {/* Calving Watch */}
        <div 
          onClick={() => setFilterType('calving')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm cursor-pointer hover:border-purple-500/50 transition group col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium group-hover:text-purple-400 transition">توقعات الولادة</span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white">{imminentCalvings.length} <span className="text-xs font-normal text-purple-400">ولادة وشيكة</span></div>
          <div className="text-[11px] text-purple-300 mt-1">
            البقرة 550 (الموعد: 20 أكتوبر)
          </div>
        </div>
      </div>

      {/* Search, Filter Bar and View Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث برقم الأذن (Tag ID مثل 442، 727) أو السلالة أو الشريحة..."
              className="w-full pl-4 pr-10 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* View Mode Toggle (Grid vs Table) */}
          <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="عرض الشبكة"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="عرض الجدول التفصيلي"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5" />
            <span>التصنيف:</span>
          </span>

          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition ${
              filterType === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            الكل ({cows.length})
          </button>

          <button
            onClick={() => setFilterType('heat')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              filterType === 'heat'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>شبق نشط للتلقيح ({heatCows.length})</span>
          </button>

          <button
            onClick={() => setFilterType('lameness')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              filterType === 'lameness'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>عرج وملاحظة بيطرية ({lameCows.length})</span>
          </button>

          <button
            onClick={() => setFilterType('calving')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              filterType === 'calving'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>ولادات وشيكة ({imminentCalvings.length})</span>
          </button>

          <button
            onClick={() => setFilterType('top_milk')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              filterType === 'top_milk'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Droplet className="w-3.5 h-3.5 text-sky-400" />
            <span>إنتاج حليب فائق &gt;30L ({cows.filter(c => c.daily_milk >= 30).length})</span>
          </button>
        </div>
      </div>

      {/* Cattle List Render */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCows.map((cow) => {
            const isHeat = cow.heat_percentage >= 70;
            const isLame = cow.locomotion_score >= 2;
            const isCalving = cow.health_status.includes('ولادة');

            return (
              <div
                key={cow.id}
                onClick={() => onSelectCow(cow)}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 transition shadow-sm hover:shadow-lg hover:shadow-emerald-950/30 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header with Tag ID and Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-sm group-hover:scale-105 transition">
                        #{cow.tag_number}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm group-hover:text-emerald-400 transition flex items-center gap-1">
                          <span>بقر #{cow.tag_number}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                          {cow.breed.split(' ')[0]}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                      {cow.location.zoneName.slice(0, 10)}..
                    </span>
                  </div>

                  {/* Metrics Badges */}
                  <div className="space-y-2 py-2 border-t border-b border-slate-800/80 my-3 text-xs">
                    {/* Milk Production */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Droplet className="w-3.5 h-3.5 text-sky-400" />
                        <span>إنتاج الحليب:</span>
                      </span>
                      <span className="font-bold text-white">
                        <strong className="text-emerald-400 text-sm">{cow.daily_milk}</strong> لتر/يوم
                      </span>
                    </div>

                    {/* Heat Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-rose-400" />
                        <span>مؤشر الشبق:</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isHeat ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'}`}
                            style={{ width: `${cow.heat_percentage}%` }}
                          ></div>
                        </div>
                        <span className={`font-bold ${isHeat ? 'text-rose-400' : 'text-slate-300'}`}>
                          {cow.heat_percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Health & Lameness Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-amber-400" />
                        <span>الحالة الصحية:</span>
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isLame 
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                          : isCalving 
                          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {cow.health_status}
                      </span>
                    </div>
                  </div>

                  {/* Notes snippet */}
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {cow.veterinary_notes}
                  </p>
                </div>

                {/* Card Action Footers */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-500 font-mono">
                    آخر حلب: {cow.last_milking.split(' ')[0]} {cow.last_milking.split(' ')[1]}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCow(cow);
                    }}
                    className="text-xs text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-0.5 group-hover:translate-x-0.5 transition"
                  >
                    <span>التفاصيل</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">رقم الأذن (Tag ID)</th>
                  <th className="py-3.5 px-4 font-bold">السلالة</th>
                  <th className="py-3.5 px-4 font-bold">كمية الحليب اليومية</th>
                  <th className="py-3.5 px-4 font-bold">مؤشر الشبق والتلقيح</th>
                  <th className="py-3.5 px-4 font-bold">الحالة الصحية وتقييم المشية</th>
                  <th className="py-3.5 px-4 font-bold">الموقع بالححظيرة</th>
                  <th className="py-3.5 px-4 font-bold">الموعد المتوقع للولادة</th>
                  <th className="py-3.5 px-4 font-bold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredCows.map((cow) => {
                  const isHeat = cow.heat_percentage >= 70;
                  const isLame = cow.locomotion_score >= 2;

                  return (
                    <tr 
                      key={cow.id} 
                      onClick={() => onSelectCow(cow)}
                      className="hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-bold">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          #{cow.tag_number}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{cow.breed}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        {cow.daily_milk} لتر
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isHeat ? 'text-rose-400' : 'text-slate-300'}`}>
                            {cow.heat_percentage}%
                          </span>
                          {isHeat && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-semibold animate-pulse">
                              نافذة ذهبية
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          isLame 
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {cow.health_status} (درجة {cow.locomotion_score})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{cow.location.zoneName}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{cow.calving_date}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCow(cow);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition font-medium text-xs"
                        >
                          عرض الملف
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
