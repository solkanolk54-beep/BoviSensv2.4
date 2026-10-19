export interface TelemetryPayload {
  tag_number: string;
  daily_milk: number;
  health_status: string;
  heat_status: boolean | number;
  recorded_at?: string;
  locomotion_score?: number;
}

export interface InseminationWindowResult {
  isHeatActive: boolean;
  heatPercentage: number;
  optimalHoursRemaining: number;
  statusText: string;
  urgency: 'peak' | 'approaching' | 'expired' | 'low';
}

/**
 * Calculates optimal insemination timing window based on heat percentage and hours elapsed.
 * Cattle ovulation typically occurs 24-32 hours after standing heat onset;
 * optimal AI (Artificial Insemination) window is 12-18 hours after onset.
 */
export function calculateInseminationWindow(
  heatInput: boolean | number,
  hoursSinceOnset: number = 4
): InseminationWindowResult {
  const heatPercentage = typeof heatInput === 'boolean' 
    ? (heatInput ? 85 : 15) 
    : Math.min(100, Math.max(0, heatInput));

  if (heatPercentage < 65) {
    return {
      isHeatActive: false,
      heatPercentage,
      optimalHoursRemaining: 0,
      statusText: 'لا توجد علامات شبق (خارج دورة الشبق النشطة)',
      urgency: 'low',
    };
  }

  // Golden AI window is typically within 18 hours of first detected peak
  const maxWindowHours = 18;
  const remaining = Math.max(0, maxWindowHours - hoursSinceOnset);

  if (remaining === 0) {
    return {
      isHeatActive: true,
      heatPercentage,
      optimalHoursRemaining: 0,
      statusText: 'انتهت النافذة الذهبية للتلقيح - يرجى فحص الطبيب البيطري',
      urgency: 'expired',
    };
  }

  if (remaining <= 6) {
    return {
      isHeatActive: true,
      heatPercentage,
      optimalHoursRemaining: remaining,
      statusText: `النافذة الذهبية للتلقيح في ذروتها (متبقي ${remaining} ساعات)`,
      urgency: 'peak',
    };
  }

  return {
    isHeatActive: true,
    heatPercentage,
    optimalHoursRemaining: remaining,
    statusText: `بدء نشاط الشبق (متبقي ${remaining} ساعات حتى نهاية التلقيح)`,
    urgency: 'approaching',
  };
}

export interface LamenessEvaluationResult {
  score: number; // 1 to 5 (Sprecher Scale)
  category: 'سليمة (طبيعي)' | 'عرج خفيف (درجة 2)' | 'عرج متوسط (درجة 3)' | 'عرج حاد (درجة 4-5)';
  recommendation: string;
  requiresIntervention: boolean;
}

/**
 * Locomotion scoring system (1 = normal, 2 = mild lameness / slight arching back,
 * 3 = moderate lameness / arched back standing and walking, 4-5 = severe / non-weight bearing)
 */
export function evaluateLamenessScore(score: number): LamenessEvaluationResult {
  const boundedScore = Math.min(5, Math.max(1, Math.round(score)));

  switch (boundedScore) {
    case 1:
      return {
        score: 1,
        category: 'سليمة (طبيعي)',
        recommendation: 'مشية متزنة وظهر مستوٍ - لا يتطلب أي إجراء.',
        requiresIntervention: false,
      };
    case 2:
      return {
        score: 2,
        category: 'عرج خفيف (درجة 2)',
        recommendation: 'تقوس طفيف بالظهر أثناء المشي - فحص وقائي للحافر وتدليك موضعي.',
        requiresIntervention: true,
      };
    case 3:
      return {
        score: 3,
        category: 'عرج متوسط (درجة 3)',
        recommendation: 'تقوس الظهر أثناء الوقوف والمشي مع خطوات قصيرة - جدولة تقليم الحوافر وعلاج بيطري.',
        requiresIntervention: true,
      };
    case 4:
    case 5:
    default:
      return {
        score: boundedScore,
        category: 'عرج حاد (درجة 4-5)',
        recommendation: 'فقدان جزئي أو كلي للقدرة على تحميل الوزن - عزل فوري وتدخل عاجل للطبيب البيطري.',
        requiresIntervention: true,
      };
  }
}

export interface CalvingUrgencyResult {
  daysRemaining: number;
  urgency: 'imminent' | 'approaching' | 'normal';
  statusText: string;
}

/**
 * Predicts calving urgency based on expected date and days difference
 */
export function predictCalvingUrgency(targetDateStr: string, currentDate: Date = new Date('2026-10-19T14:56:00Z')): CalvingUrgencyResult {
  const targetDate = new Date(targetDateStr);
  const diffTime = targetDate.getTime() - currentDate.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (days <= 2) {
    return {
      daysRemaining: Math.max(0, days),
      urgency: 'imminent',
      statusText: days <= 0 ? 'ولادة متوقعة اليوم!' : `ولادة وشيكة جداً (خلال ${days} يوم)`,
    };
  }

  if (days <= 7) {
    return {
      daysRemaining: days,
      urgency: 'approaching',
      statusText: `ولادة قريبة هذا الأسبوع (متبقي ${days} أيام)`,
    };
  }

  return {
    daysRemaining: days,
    urgency: 'normal',
    statusText: `متبقي ${days} يوماً على الموعد المقدر`,
  };
}

/**
 * Validates and sanitizes raw telemetry input received from Edge/Python script
 */
export function parseTelemetryPayload(raw: any): { valid: boolean; data?: TelemetryPayload; error?: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'حمولة البيانات غير صالحة (Payload must be an object)' };
  }

  const tag_number = String(raw.tag_number || '').trim();
  if (!tag_number) {
    return { valid: false, error: 'رقم الأذن التعريفي (tag_number) مطلوب' };
  }

  const daily_milk = Number(raw.daily_milk);
  if (isNaN(daily_milk) || daily_milk < 0 || daily_milk > 100) {
    return { valid: false, error: 'كمية الحليب اليومية يجب أن تكون رقماً منطقياً بين 0 و 100 لتر' };
  }

  const health_status = String(raw.health_status || 'طبيعي').trim();
  
  let heat_status: boolean | number = false;
  if (typeof raw.heat_status === 'boolean') {
    heat_status = raw.heat_status;
  } else if (typeof raw.heat_status === 'number') {
    heat_status = Math.min(100, Math.max(0, raw.heat_status));
  } else if (raw.heat_status === 'true' || raw.heat_status === '1') {
    heat_status = true;
  }

  return {
    valid: true,
    data: {
      tag_number,
      daily_milk: Math.round(daily_milk * 10) / 10,
      health_status,
      heat_status,
      recorded_at: raw.recorded_at || new Date().toISOString(),
      locomotion_score: raw.locomotion_score ? Number(raw.locomotion_score) : undefined,
    },
  };
}
