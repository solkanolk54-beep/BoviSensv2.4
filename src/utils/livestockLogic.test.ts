import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateInseminationWindow,
  evaluateLamenessScore,
  predictCalvingUrgency,
  parseTelemetryPayload,
} from './livestockLogic.ts';

test('calculateInseminationWindow identifies non-heat cattle', () => {
  const result = calculateInseminationWindow(20, 2);
  assert.equal(result.isHeatActive, false);
  assert.equal(result.urgency, 'low');
  assert.equal(result.optimalHoursRemaining, 0);
});

test('calculateInseminationWindow handles peak heat detection and hours calculation', () => {
  const result = calculateInseminationWindow(89, 4);
  assert.equal(result.isHeatActive, true);
  assert.equal(result.heatPercentage, 89);
  assert.equal(result.optimalHoursRemaining, 14);
  assert.equal(result.urgency, 'approaching');

  const peakResult = calculateInseminationWindow(92, 14);
  assert.equal(peakResult.optimalHoursRemaining, 4);
  assert.equal(peakResult.urgency, 'peak');

  const expiredResult = calculateInseminationWindow(95, 20);
  assert.equal(expiredResult.optimalHoursRemaining, 0);
  assert.equal(expiredResult.urgency, 'expired');
});

test('evaluateLamenessScore classifies Sprecher locomotion scale accurately', () => {
  const healthy = evaluateLamenessScore(1);
  assert.equal(healthy.category, 'سليمة (طبيعي)');
  assert.equal(healthy.requiresIntervention, false);

  const mild = evaluateLamenessScore(2);
  assert.equal(mild.category, 'عرج خفيف (درجة 2)');
  assert.equal(mild.requiresIntervention, true);

  const severe = evaluateLamenessScore(4);
  assert.equal(severe.category, 'عرج حاد (درجة 4-5)');
  assert.equal(severe.requiresIntervention, true);
});

test('predictCalvingUrgency flags imminent and approaching deliveries', () => {
  const mockCurrent = new Date('2026-10-19T12:00:00Z');
  
  const imminent = predictCalvingUrgency('2026-10-20T12:00:00Z', mockCurrent);
  assert.equal(imminent.urgency, 'imminent');
  assert.ok(imminent.daysRemaining <= 1);

  const approaching = predictCalvingUrgency('2026-10-24T12:00:00Z', mockCurrent);
  assert.equal(approaching.urgency, 'approaching');
  assert.equal(approaching.daysRemaining, 5);

  const normal = predictCalvingUrgency('2026-11-20T12:00:00Z', mockCurrent);
  assert.equal(normal.urgency, 'normal');
  assert.ok(normal.daysRemaining > 20);
});

test('parseTelemetryPayload validates correct and incorrect payloads', () => {
  const validPayload = {
    tag_number: '442',
    daily_milk: 30.9,
    health_status: 'طبيعي',
    heat_status: false,
  };

  const parsed = parseTelemetryPayload(validPayload);
  assert.equal(parsed.valid, true);
  assert.equal(parsed.data?.tag_number, '442');
  assert.equal(parsed.data?.daily_milk, 30.9);
  assert.equal(parsed.data?.health_status, 'طبيعي');
  assert.equal(parsed.data?.heat_status, false);

  const invalidTag = parseTelemetryPayload({ daily_milk: 25 });
  assert.equal(invalidTag.valid, false);

  const invalidMilk = parseTelemetryPayload({ tag_number: '108', daily_milk: -5 });
  assert.equal(invalidMilk.valid, false);
});
