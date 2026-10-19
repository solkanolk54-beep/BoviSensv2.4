export interface Cow {
  id: string;
  tag_number: string;
  rfid: string;
  breed: string;
  birth_date: string;
  calving_date: string;
  daily_milk: number;
  milk_history: { day: string; amount: number }[];
  health_status: string;
  locomotion_score: number; // 1 to 5
  heat_percentage: number; // 0 to 100%
  heat_onset_hours: number;
  activity_index: number; // percentage relative to baseline (+% or -%)
  rumination_minutes: number; // daily rumination minutes (healthy ~450-500)
  body_temp: number; // Celsius (normal 38.3 - 39.1)
  location: {
    x: number; // 0-100% relative coordinates in barn
    y: number;
    zoneId: string;
    zoneName: string;
  };
  camera_id: string;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  };
  gait_points?: { x: number; y: number; label: string }[];
  last_milking: string;
  veterinary_notes: string;
}

export interface BarnZone {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number;
  description: string;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  cow_tag: string;
  type: 'heat' | 'lameness' | 'calving' | 'milk_drop' | 'system';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  recommendation: string;
  acknowledged: boolean;
}

export interface TelemetryLogEntry {
  id: string;
  tag_number: string;
  daily_milk: number;
  health_status: string;
  heat_status: boolean | number;
  recorded_at: string;
  edge_device: string;
  inference_ms: number;
  redis_published: boolean;
}

export interface CameraStream {
  id: string;
  name: string;
  rtsp_url: string;
  fps: number;
  resolution: string;
  edge_node: string;
  detected_cows: string[];
}
