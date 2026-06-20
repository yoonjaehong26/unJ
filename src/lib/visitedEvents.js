const VISITED_KEY = "unj-visited-events";
const SCHEDULE_PREFIX = "unj-event-schedule-";
const MAX_VISITED = 3;

export function getVisitedEvents() {
  try {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(VISITED_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function addVisitedEvent({ eventId, eventName, adminToken }) {
  try {
    const events = getVisitedEvents().filter((e) => e.eventId !== eventId);
    events.unshift({
      eventId,
      eventName,
      adminToken: adminToken || null,
      joinedAt: new Date().toISOString(),
    });
    localStorage.setItem(VISITED_KEY, JSON.stringify(events.slice(0, MAX_VISITED)));
  } catch {}
}

export function saveEventSchedule(eventId, { eventName, availability, startTime, endTime, dates }) {
  try {
    localStorage.setItem(
      SCHEDULE_PREFIX + eventId,
      JSON.stringify({ eventId, eventName, availability, startTime, endTime, dates, savedAt: new Date().toISOString() })
    );
  } catch {}
}

export function loadEventSchedule(eventId) {
  try {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(SCHEDULE_PREFIX + eventId);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// 현재 이벤트를 제외한 저장된 방 일정 목록 반환
export function getVisitedEventSchedules(currentEventId) {
  return getVisitedEvents()
    .filter((e) => e.eventId !== currentEventId)
    .map((e) => ({ ...e, schedule: loadEventSchedule(e.eventId) }))
    .filter((e) => e.schedule !== null && e.schedule.availability?.length > 0);
}
