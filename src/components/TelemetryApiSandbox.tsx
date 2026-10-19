import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Code2, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  Server, 
  Cpu, 
  Database, 
  Radio, 
  AlertCircle,
  FileCode,
  Layers,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { Cow, TelemetryLogEntry } from '../types/cattle';
import { parseTelemetryPayload } from '../utils/livestockLogic';

interface TelemetryApiSandboxProps {
  cows: Cow[];
  telemetryLogs: TelemetryLogEntry[];
  onIngestTelemetry: (entry: TelemetryLogEntry) => void;
}

export const TelemetryApiSandbox: React.FC<TelemetryApiSandboxProps> = ({
  cows,
  telemetryLogs,
  onIngestTelemetry,
}) => {
  // Form State for API Simulator
  const [tagNumber, setTagNumber] = useState<string>('442');
  const [dailyMilk, setDailyMilk] = useState<string>('30.9');
  const [healthStatus, setHealthStatus] = useState<string>('طبيعي');
  const [heatStatus, setHeatStatus] = useState<boolean>(false);
  const [heatPercentage, setHeatPercentage] = useState<number>(15);

  // API Execution State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Active Code Documentation Tab
  const [activeCodeTab, setActiveCodeTab] = useState<'docker' | 'schema' | 'express' | 'python'>('docker');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePresetSelect = (preset: 'cow442' | 'cow727' | 'cowNew') => {
    if (preset === 'cow442') {
      setTagNumber('442');
      setDailyMilk('30.9');
      setHealthStatus('طبيعي');
      setHeatStatus(false);
      setHeatPercentage(12);
    } else if (preset === 'cow727') {
      setTagNumber('727');
      setDailyMilk('26.4');
      setHealthStatus('تحت العلاج - عرج خفيف');
      setHeatStatus(true);
      setHeatPercentage(89);
    } else {
      setTagNumber('991');
      setDailyMilk('28.5');
      setHealthStatus('طبيعي');
      setHeatStatus(false);
      setHeatPercentage(20);
    }
  };

  const handleSubmitApi = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setIsSubmitting(true);

    const rawPayload = {
      tag_number: tagNumber,
      daily_milk: parseFloat(dailyMilk),
      health_status: healthStatus,
      heat_status: heatStatus ? heatPercentage : false,
      recorded_at: new Date().toISOString(),
    };

    const parsed = parseTelemetryPayload(rawPayload);
    if (!parsed.valid || !parsed.data) {
      setApiError(parsed.error || 'خطأ في معالجة البيانات');
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      const newEntry: TelemetryLogEntry = {
        id: `log-${Date.now().toString().slice(-4)}`,
        tag_number: parsed.data!.tag_number,
        daily_milk: parsed.data!.daily_milk,
        health_status: parsed.data!.health_status,
        heat_status: parsed.data!.heat_status,
        recorded_at: parsed.data!.recorded_at!,
        edge_device: 'Jetson-Orin-Barn-01',
        inference_ms: +(3.8 + Math.random() * 1.4).toFixed(1),
        redis_published: true,
      };

      onIngestTelemetry(newEntry);

      setApiResponse({
        success: true,
        status: 201,
        message: `تم استقبال وتسجيل تليمترية البقرة #${parsed.data!.tag_number} في PostgreSQL ونشر التنبيه عبر Redis Broker`,
        data: {
          id: newEntry.id,
          tag_number: newEntry.tag_number,
          daily_milk: newEntry.daily_milk,
          health_status: newEntry.health_status,
          heat_status: newEntry.heat_status,
          recorded_at: newEntry.recorded_at,
          postgis_geometry: 'ST_Point(28.4, 34.2)',
          redis_broker: {
            channel: 'livestock.telemetry.events',
            published: true,
          },
        },
      });

      setIsSubmitting(false);
    }, 450);
  };

  const DOCKER_COMPOSE_CODE = `version: '3.8'

services:
  database:
    image: postgis/postgis:15-3.3
    container_name: sol_gis_db
    environment:
      POSTGRES_DB: bovi_sens_db
      POSTGRES_USER: admin_sol
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis_broker:
    image: redis:alpine
    container_name: sol_redis
    ports:
      - "6379:6379"

  backend_api:
    build: .
    container_name: bovi_sens_api
    restart: always
    environment:
      - PORT=3000
      - DATABASE_URL=postgresql://admin_sol:secure_password@database:5432/bovi_sens_db
      - REDIS_URL=redis://redis_broker:6379
    ports:
      - "3000:3000"
    depends_on:
      - database
      - redis_broker

volumes:
  pgdata:`;

  const SCHEMA_SQL_CODE = `-- تفعيل امتداد PostGIS للبيانات المكانية
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. جدول بيانات الأبقار والقطيع
CREATE TABLE IF NOT EXISTS cows (
    id SERIAL PRIMARY KEY,
    tag_number VARCHAR(50) UNIQUE NOT NULL,
    rfid_chip VARCHAR(100),
    breed VARCHAR(100) DEFAULT 'هولشتاين فريزيان',
    birth_date DATE,
    expected_calving DATE,
    location GEOMETRY(Point, 4326), -- إحداثيات موقع البقرة في الحظيرة
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. جدول تسجيل القراءات الحيوية المتسلسلة زمنياً (Telemetry Logs)
CREATE TABLE IF NOT EXISTS telemetry_logs (
    id BIGSERIAL PRIMARY KEY,
    tag_number VARCHAR(50) NOT NULL,
    daily_milk NUMERIC(5, 2) NOT NULL,
    health_status VARCHAR(100) DEFAULT 'طبيعي',
    heat_status BOOLEAN DEFAULT FALSE,
    locomotion_score SMALLINT DEFAULT 1,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edge_device VARCHAR(100)
);

CREATE INDEX idx_telemetry_tag_time ON telemetry_logs (tag_number, recorded_at DESC);`;

  const EXPRESS_CONTROLLER_CODE = `const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// استقبال وتحديث بيانات البقرة اللحظية من نظام الذكاء الاصطناعي
app.post('/api/v1/telemetry', async (req, res) => {
  const { tag_number, daily_milk, health_status, heat_status } = req.body;
  
  try {
    const query = \`
      INSERT INTO telemetry_logs (tag_number, daily_milk, health_status, heat_status, recorded_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    \`;
    const values = [tag_number, daily_milk, health_status, heat_status];
    const result = await pool.query(query, values);
    const telemetryData = result.rows[0];

    // إرسال تنبيه فوري عبر Redis إذا وُجدت حالة طارئة (شبق نشط أو عرج)
    if (heat_status || health_status.includes('عرج')) {
      await redis.publish('livestock.alerts', JSON.stringify({
        event: 'HEALTH_ALERT',
        tag_number,
        health_status,
        heat_status,
        timestamp: new Date().toISOString()
      }));
    }
    
    res.status(201).json({ success: true, data: telemetryData });
  } catch (err) {
    console.error('Database Error:', err.message);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

app.listen(3000, () => {
  console.log('BoviSens Backend running on port 3000');
});`;

  const PYTHON_INFERENCE_CODE = `import cv2
import requests
import time

# رابط البث الحي لكاميرا الحظيرة وعنوان نقطة النهاية البرمجية
RTSP_URL = "rtsp://admin:password@camera_ip:554/stream"
API_ENDPOINT = "http://localhost:3000/api/v1/telemetry"

def process_stream():
    cap = cv2.VideoCapture(RTSP_URL)
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("فشل في استقبال البث، إعادة المحاولة...")
            time.sleep(2)
            continue
        
        # تمرير الإطار إلى نموذج YOLOv8 لتتبع الأبقار وقراءة الأرقام Tag IDs
        # مثال لبيانات تم استخراجها تحليلياً من الإطار:
        detected_data = {
            "tag_number": "442",
            "daily_milk": 30.9,
            "health_status": "طبيعي",
            "heat_status": False
        }
        
        # إرسال البيانات المستخرجة إلى الخادم الخلفي (Backend)
        try:
            response = requests.post(API_ENDPOINT, json=detected_data, timeout=3)
            if response.status_code == 201:
                print(f"تم تحديث بيانات البقرة {detected_data['tag_number']} بنجاح.")
        except Exception as e:
            print(f"خطأ في الاتصال بالخادم: {e}")
            
        # معالجة إطار كل عدة ثوانٍ لتقليل الحمل على المعالج
        time.sleep(5)

if __name__ == "__main__":
    process_stream()`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Server className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>محاكي الواجهة البرمجية وهندسة النظام (Telemetry API & System Architecture)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                POST /api/v1/telemetry
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              اختبار نقطة النهاية اللحظية لتدفق التليمترية من أجهزة Edge ونماذج الرؤية الحاسوبية إلى PostgreSQL و Redis
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Live Interactive API Tester */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>محاكي إرسال التليمترية من أجهزة الحافة (Edge Ingestion)</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              HTTP/1.1 JSON
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium block">أمثلة جاهزة للتحميل السريع:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => handlePresetSelect('cow442')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold transition flex items-center gap-1.5"
              >
                <span>البقرة 442 (30.9L - طبيعي)</span>
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('cow727')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 font-semibold transition flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>البقرة 727 (شبق 89% - عرج)</span>
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('cowNew')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 font-semibold transition"
              >
                بقرة جديدة #991
              </button>
            </div>
          </div>

          {/* API Form */}
          <form onSubmit={handleSubmitApi} className="space-y-4 text-xs">
            {apiError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">رقم الأذن التعريفي (tag_number):</label>
                <input
                  type="text"
                  value={tagNumber}
                  onChange={(e) => setTagNumber(e.target.value)}
                  placeholder="مثال: 442"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">كمية الحليب اليومية (daily_milk):</label>
                <input
                  type="number"
                  step="0.1"
                  value={dailyMilk}
                  onChange={(e) => setDailyMilk(e.target.value)}
                  placeholder="مثال: 30.9"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">الحالة الصحية (health_status):</label>
              <select
                value={healthStatus}
                onChange={(e) => setHealthStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="طبيعي">طبيعي (سليمة تماماً)</option>
                <option value="تحت العلاج - عرج خفيف">تحت العلاج - عرج خفيف (درجة 2)</option>
                <option value="عرج متوسط - حافر خلفي أيسر">عرج متوسط - حافر خلفي (درجة 3)</option>
                <option value="تحت الملاحظة - ولادة وشيكة">تحت الملاحظة - ولادة وشيكة</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>مؤشر رصد الشبق (heat_status):</span>
                </span>
                <input
                  type="checkbox"
                  checked={heatStatus}
                  onChange={(e) => setHeatStatus(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 border-slate-600 focus:ring-rose-500"
                />
              </label>

              {heatStatus && (
                <div className="pt-2 border-t border-slate-700/60">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">نسبة الشبق المحسوبة عبر الكاميرا:</span>
                    <strong className="text-rose-400 font-mono">{heatPercentage}%</strong>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={heatPercentage}
                    onChange={(e) => setHeatPercentage(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>جارٍ المعالجة في الخادم...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال التليمترية (Execute POST Request)</span>
                </>
              )}
            </button>
          </form>

          {/* Response Payload Viewer */}
          {apiResponse && (
            <div className="space-y-2 pt-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>استجابة الخادم: 201 Created</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Response Time: 12ms</span>
              </div>
              <pre dir="ltr" className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed max-h-48 text-left">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* RIGHT: Architecture Code & Specification Explorer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span>ملفات البنية التقنية (System Architecture)</span>
              </h3>
            </div>

            {/* Code Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-800 pb-2 text-xs">
              <button
                onClick={() => setActiveCodeTab('docker')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeCodeTab === 'docker'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                docker-compose.yml
              </button>

              <button
                onClick={() => setActiveCodeTab('schema')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeCodeTab === 'schema'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                schema_postgis.sql
              </button>

              <button
                onClick={() => setActiveCodeTab('express')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeCodeTab === 'express'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                server.js (Express)
              </button>

              <button
                onClick={() => setActiveCodeTab('python')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeCodeTab === 'python'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                inference_rtsp.py
              </button>
            </div>

            {/* Code Box */}
            <div className="relative">
              <div className="absolute top-3 left-3 z-10">
                <button
                  onClick={() => {
                    const code = 
                      activeCodeTab === 'docker' ? DOCKER_COMPOSE_CODE :
                      activeCodeTab === 'schema' ? SCHEMA_SQL_CODE :
                      activeCodeTab === 'express' ? EXPRESS_CONTROLLER_CODE :
                      PYTHON_INFERENCE_CODE;
                    handleCopyCode(activeCodeTab, code);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center gap-1.5 transition"
                >
                  {copiedKey === activeCodeTab ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الكود</span>
                    </>
                  )}
                </button>
              </div>

              <pre dir="ltr" className="p-4 pt-10 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed max-h-[380px] text-left">
                {activeCodeTab === 'docker' && DOCKER_COMPOSE_CODE}
                {activeCodeTab === 'schema' && SCHEMA_SQL_CODE}
                {activeCodeTab === 'express' && EXPRESS_CONTROLLER_CODE}
                {activeCodeTab === 'python' && PYTHON_INFERENCE_CODE}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Live Ingestion Log Feed Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>سجل تدفق التليمترية اللحظي (Live Ingested Telemetry Logs)</span>
          </h3>
          <span className="text-xs text-slate-400">
            إجمالي السجلات: <strong className="text-white">{telemetryLogs.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">المعرف</th>
                <th className="py-2.5 px-3">رقم الأذن</th>
                <th className="py-2.5 px-3">كمية الحليب</th>
                <th className="py-2.5 px-3">الحالة الصحية</th>
                <th className="py-2.5 px-3">مؤشر الشبق</th>
                <th className="py-2.5 px-3">جهاز الحافة (Edge)</th>
                <th className="py-2.5 px-3">زمن المعالجة</th>
                <th className="py-2.5 px-3">Redis Broker</th>
                <th className="py-2.5 px-3">الوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {telemetryLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{log.id}</td>
                  <td className="py-2 px-3 font-bold text-emerald-400">#{log.tag_number}</td>
                  <td className="py-2 px-3 font-bold">{log.daily_milk} لتر</td>
                  <td className="py-2 px-3">{log.health_status}</td>
                  <td className="py-2 px-3">
                    {typeof log.heat_status === 'number' 
                      ? `${log.heat_status}% 🔥` 
                      : log.heat_status ? 'نعم 🔥' : 'لا'}
                  </td>
                  <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{log.edge_device}</td>
                  <td className="py-2 px-3 font-mono text-emerald-300">{log.inference_ms}ms</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
                      منشور ✓
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                    {new Date(log.recorded_at).toLocaleTimeString('ar-EG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
