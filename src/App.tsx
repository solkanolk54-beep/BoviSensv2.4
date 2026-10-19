/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveVisionFeed } from './components/LiveVisionFeed';
import { HerdOverview } from './components/HerdOverview';
import { GisBarnMap } from './components/GisBarnMap';
import { ReproductionHealthRadar } from './components/ReproductionHealthRadar';
import { TelemetryApiSandbox } from './components/TelemetryApiSandbox';
import { CowDetailModal } from './components/CowDetailModal';
import { AlertsCenter } from './components/AlertsCenter';

import { Cow, BarnZone, SystemAlert, TelemetryLogEntry, CameraStream } from './types/cattle';
import { 
  INITIAL_COWS, 
  INITIAL_BARN_ZONES, 
  INITIAL_ALERTS, 
  INITIAL_TELEMETRY_LOGS, 
  CAMERA_STREAMS 
} from './data/mockCattleData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vision' | 'herd' | 'map' | 'reproduction' | 'telemetry'>('vision');
  const [cows, setCows] = useState<Cow[]>(INITIAL_COWS);
  const [zones] = useState<BarnZone[]>(INITIAL_BARN_ZONES);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLogEntry[]>(INITIAL_TELEMETRY_LOGS);
  const [cameraStreams] = useState<CameraStream[]>(CAMERA_STREAMS);
  
  // Modals & Panels state
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);

  // Check URL parameters (e.g. ?autostart=1 or ?tab=herd)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['vision', 'herd', 'map', 'reproduction', 'telemetry'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, []);

  // Update a cow's state from actions (insemination, hoof treatment, etc.)
  const handleUpdateCowStatus = (updatedCow: Cow) => {
    setCows(prev => prev.map(c => c.id === updatedCow.id ? updatedCow : c));
    if (selectedCow && selectedCow.id === updatedCow.id) {
      setSelectedCow(updatedCow);
    }
  };

  // Ingest incoming telemetry packet (from API Simulator or Edge device)
  const handleIngestTelemetry = (entry: TelemetryLogEntry) => {
    // 1. Prepend to logs
    setTelemetryLogs(prev => [entry, ...prev]);

    // 2. Update matching cow or create new
    setCows(prev => {
      const existing = prev.find(c => c.tag_number === entry.tag_number);
      if (existing) {
        const heatPct = typeof entry.heat_status === 'number' 
          ? entry.heat_status 
          : entry.heat_status ? 88 : existing.heat_percentage;

        return prev.map(c => {
          if (c.tag_number === entry.tag_number) {
            return {
              ...c,
              daily_milk: entry.daily_milk,
              health_status: entry.health_status,
              heat_percentage: heatPct,
              last_milking: `الآن (قراءة تليمترية لحظية: ${entry.daily_milk}L)`,
              milk_history: [
                ...c.milk_history.slice(1),
                { day: 'اليوم', amount: entry.daily_milk },
              ],
            };
          }
          return c;
        });
      } else {
        // Create new cow dynamically
        const newCow: Cow = {
          id: `cow-${entry.tag_number}`,
          tag_number: entry.tag_number,
          rfid: `SA-2026-${entry.tag_number}`,
          breed: 'هولشتاين فريزيان (Holstein)',
          birth_date: '2023-01-10',
          calving_date: '2027-01-15',
          daily_milk: entry.daily_milk,
          milk_history: [
            { day: 'السبت', amount: 26.0 },
            { day: 'الأحد', amount: 27.0 },
            { day: 'الاثنين', amount: 26.5 },
            { day: 'الثلاثاء', amount: 28.0 },
            { day: 'الأربعاء', amount: 27.5 },
            { day: 'الخميس', amount: 28.0 },
            { day: 'اليوم', amount: entry.daily_milk },
          ],
          health_status: entry.health_status,
          locomotion_score: entry.health_status.includes('عرج') ? 2 : 1,
          heat_percentage: typeof entry.heat_status === 'number' ? entry.heat_status : entry.heat_status ? 85 : 15,
          heat_onset_hours: 2,
          activity_index: entry.heat_status ? 40 : 5,
          rumination_minutes: 460,
          body_temp: 38.6,
          location: {
            x: 48,
            y: 45,
            zoneId: 'cubicles_resting',
            zoneName: 'منطقة الراحة والمضاجع',
          },
          camera_id: 'cam_03',
          bounding_box: { x: 45, y: 35, width: 28, height: 40, confidence: 96.0 },
          last_milking: 'تم الاستقبال للتو',
          veterinary_notes: 'تم تسجيل البقرة تلقائياً عبر نقطة النهاية /api/v1/telemetry وتحديث السجل.',
        };
        return [...prev, newCow];
      }
    });

    // 3. Trigger alert if critical condition
    const isHeat = (typeof entry.heat_status === 'number' && entry.heat_status >= 70) || entry.heat_status === true;
    const isLame = entry.health_status.includes('عرج');

    if (isHeat || isLame) {
      const newAlert: SystemAlert = {
        id: `alt-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        cow_tag: entry.tag_number,
        type: isHeat ? 'heat' : 'lameness',
        severity: isHeat ? 'critical' : 'warning',
        title: isHeat ? `تنبيه شبق فوري - البقرة #${entry.tag_number}` : `تنبيه عرج - البقرة #${entry.tag_number}`,
        message: `تم استقبال تحديث تليمترية جديد: ${entry.health_status} وكمية حليب ${entry.daily_milk} لتر.`,
        recommendation: isHeat ? 'جدولة التلقيح الاصطناعي خلال 12-18 ساعة.' : 'فحص الحافر في عيادة الحوافر.',
        acknowledged: false,
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  // Quick simulate button on header
  const handleQuickSimulate = () => {
    setActiveTab('telemetry');
  };

  // Alert acknowledgement
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  const handleAcknowledgeAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alerts={alerts}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onQuickSimulate={handleQuickSimulate}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'vision' && (
          <LiveVisionFeed
            cows={cows}
            cameraStreams={cameraStreams}
            onSelectCow={(cow) => setSelectedCow(cow)}
          />
        )}

        {activeTab === 'herd' && (
          <HerdOverview
            cows={cows}
            onSelectCow={(cow) => setSelectedCow(cow)}
            onOpenInseminationForCow={(cow) => {
              setSelectedCow(cow);
            }}
          />
        )}

        {activeTab === 'map' && (
          <GisBarnMap
            cows={cows}
            zones={zones}
            onSelectCow={(cow) => setSelectedCow(cow)}
          />
        )}

        {activeTab === 'reproduction' && (
          <ReproductionHealthRadar
            cows={cows}
            onSelectCow={(cow) => setSelectedCow(cow)}
            onUpdateCowStatus={handleUpdateCowStatus}
          />
        )}

        {activeTab === 'telemetry' && (
          <TelemetryApiSandbox
            cows={cows}
            telemetryLogs={telemetryLogs}
            onIngestTelemetry={handleIngestTelemetry}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          <div>
            <span>BoviSens Livestock Intelligent Monitoring System • نظام المراقبة الذكية للأبقار والماشية</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>YOLOv8 ByteTrack</span>
            <span>•</span>
            <span>PostgreSQL 15 PostGIS</span>
            <span>•</span>
            <span>Redis Message Broker</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CowDetailModal
        cow={selectedCow}
        onClose={() => setSelectedCow(null)}
        onUpdateCowStatus={handleUpdateCowStatus}
      />

      <AlertsCenter
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onAcknowledgeAll={handleAcknowledgeAll}
      />
    </div>
  );
}
