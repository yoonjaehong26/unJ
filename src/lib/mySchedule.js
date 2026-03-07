/**
 * 내 일정 localStorage CRUD + 요일-날짜 변환 유틸
 * 데이터 구조: { availability: [{dayOfWeek: 0~6, hour, minute, status}], updatedAt }
 * dayOfWeek: 0=월, 1=화, ..., 6=일 (한국식)
 */

const KEY = "unj-my-schedule";

export function loadMySchedule() {
  try {
    if (typeof window === "undefined") return { availability: [] };
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : { availability: [] };
  } catch {
    return { availability: [] };
  }
}

export function saveMySchedule(availability) {
  localStorage.setItem(
    KEY,
    JSON.stringify({ availability, updatedAt: new Date().toISOString() })
  );
}

// 날짜 문자열 → 한국식 요일 (0=월, 6=일)
function getDayOfWeek(dateString) {
  return (new Date(dateString).getDay() + 6) % 7;
}

/**
 * 내 일정(요일 기반)을 이벤트 가용시간(날짜 인덱스 기반)으로 변환 후 병합
 * @param {Array} myAvail - 내 일정 availability [{dayOfWeek, hour, minute, status}]
 * @param {Array} eventDates - 이벤트 날짜 배열
 * @param {number} eventStartTime - 이벤트 시작 시간
 * @param {number} eventEndTime - 이벤트 종료 시간
 * @param {Array} currentAvail - 현재 이벤트 가용시간
 * @param {"merge"|"replace"} mergeMode - 병합 방식
 */
export function importToEvent(myAvail, eventDates, eventStartTime, eventEndTime, currentAvail, mergeMode) {
  // 요일 → dateIdx 매핑
  const dayToDateIdx = {};
  eventDates.forEach((date, dateIdx) => {
    if (dateIdx >= 7) return;
    const dow = getDayOfWeek(date);
    dayToDateIdx[dow] = dateIdx;
  });

  const importedSlots = [];
  myAvail.forEach(({ dayOfWeek, hour, minute, status }) => {
    const dateIdx = dayToDateIdx[dayOfWeek];
    if (dateIdx === undefined) return;
    if (hour < eventStartTime || hour >= eventEndTime) return;
    importedSlots.push({ dateIdx, hour, minute, status });
  });

  if (mergeMode === "replace") return importedSlots;

  // merge: 기존 슬롯 유지 + 가져온 슬롯 추가 (겹치면 가져온 것이 우선)
  const filtered = currentAvail.filter(
    (s) => !importedSlots.some(
      (n) => n.dateIdx === s.dateIdx && n.hour === s.hour && n.minute === s.minute
    )
  );
  return [...filtered, ...importedSlots];
}

/**
 * 현재 이벤트 가용시간을 내 일정(요일 기반)으로 변환
 */
export function exportFromEvent(currentAvail, eventDates) {
  const exported = [];
  currentAvail.forEach(({ dateIdx, hour, minute, status }) => {
    if (dateIdx >= eventDates.length) return;
    const dayOfWeek = getDayOfWeek(eventDates[dateIdx]);
    exported.push({ dayOfWeek, hour, minute, status });
  });
  return exported;
}

/** 내 일정에 슬롯이 몇 개 있는지 반환 */
export function countMyScheduleSlots() {
  const { availability } = loadMySchedule();
  return availability.length;
}
