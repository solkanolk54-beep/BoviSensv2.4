import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Flame, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Check, 
  Filter,
  Volume2,
  VolumeX
} from 'lucide-react';
import { SystemAlert } from '../types/cattle';

interface AlertsCenterProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SystemAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onAcknowledgeAll: () => void;
}

export const AlertsCenter: React.FC<AlertsCenterProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledgeAlert,
  onAcknowledgeAll,
}) => {
  if (!isOpen) return null;

  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>مركز التنبيهات الصحية والتناسلية اللحظية</span>
                {unacknowledgedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                    {unacknowledgedCount} غير مقروء
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                إشعارات فورية عبر وسيط Redis Broker لرصد حالات الشبق، العرج، ومواعيد الولادة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              title={soundEnabled ? 'كتم التنبيه الصوتي' : 'تفعيل التنبيه الصوتي'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar and Acknowledge All */}
        <div className="p-3 px-5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterSeverity === 'all' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل ({alerts.length})
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterSeverity === 'critical' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              حرجة ({alerts.filter(a => a.severity === 'critical').length})
            </button>
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterSeverity === 'warning' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              تحذيرات ({alerts.filter(a => a.severity === 'warning').length})
            </button>
          </div>

          {unacknowledgedCount > 0 && (
            <button
              onClick={onAcknowledgeAll}
              className="text-emerald-400 hover:text-emerald-300 font-bold whitespace-nowrap"
            >
              تحديد الكل كمقروء
            </button>
          )}
        </div>

        {/* Alerts List */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              لا توجد تنبيهات نشطة ضمن هذا التصنيف
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isHeat = alert.type === 'heat';
              const isLame = alert.type === 'lameness';
              const isCalving = alert.type === 'calving';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition relative flex items-start gap-3.5 ${
                    alert.acknowledged
                      ? 'bg-slate-900/60 border-slate-800 opacity-75'
                      : alert.severity === 'critical'
                      ? 'bg-rose-500/10 border-rose-500/40 shadow-sm'
                      : 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {isHeat && (
                      <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <Flame className="w-4 h-4" />
                      </span>
                    )}
                    {isLame && (
                      <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                    )}
                    {isCalving && (
                      <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{alert.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-emerald-400 border border-slate-700">
                          بقر #{alert.cow_tag}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{alert.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="pt-1 text-[11px] text-emerald-400 font-medium">
                      💡 {alert.recommendation}
                    </div>
                  </div>

                  {!alert.acknowledged && (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="shrink-0 p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition"
                      title="تحديد كمقروء"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
