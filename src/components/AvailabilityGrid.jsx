/**
 * 가용시간 그리드 (일주일 단위, 30분 단위)
 * - mode="event": 이벤트별 날짜 기반 (dateIdx 필드 사용)
 * - mode="personal": 요일 기반 (dayOfWeek 필드 사용, 날짜 헤더 없음)
 * - 가능: 초록색, 미정(참여 희망): 노란색
 * - 모바일 터치 지원
 */
"use client";

import React, { useState, useRef, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";

const Container = styled.div`
  background: var(--bg-card);
  border: 1px solid ${(props) => {
    if (props.$locked) return "#9e9e9e";
    if (props.$justUnlocked) return "var(--accent)";
    return "var(--border-subtle)";
  }};
  transition: border-color 0.3s ease;
  border-radius: 12px;
  padding: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    padding: 12px;
    overflow-y: auto;
    max-height: 65vh;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.22) transparent;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.22);
      border-radius: 10px;
      min-height: 44px;
    }
    &::-webkit-scrollbar-thumb:active {
      background: rgba(255, 255, 255, 0.4);
    }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
`;

const GridTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const lockShakeAnim = keyframes`
  0%   { transform: translateX(0); }
  20%  { transform: translateX(-4px); }
  40%  { transform: translateX(4px); }
  60%  { transform: translateX(-3px); }
  80%  { transform: translateX(3px); }
  100% { transform: translateX(0); }
`;

const LockIcon = styled.span`
  font-size: 15px;
  display: inline-block;
  ${(props) => props.$shake && css`animation: ${lockShakeAnim} 0.4s ease;`}
`;

const LockNotice = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #e74c3c;
`;

const ModeToggle = styled.div`
  display: flex;
  gap: 4px;
  background: var(--bg-secondary);
  border-radius: 6px;
  padding: 3px;
`;


const ModeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: ${(props) => (props.$active ? props.$color : "transparent")};
  color: ${(props) => (props.$active ? "white" : "var(--text-secondary)")};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 13px;
  }

  &:hover {
    background: ${(props) => (props.$active ? props.$color : "var(--bg-tertiary)")};
  }
`;

const StickyToolbar = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--bg-card);
`;

const ModeToggleRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 50px repeat(${(props) => props.$cols}, minmax(40px, 1fr));
  gap: 2px;
  user-select: none;
  min-width: ${(props) => 50 + props.$cols * 40}px;

  @media (max-width: 768px) {
    grid-template-columns: 40px repeat(${(props) => props.$cols}, minmax(36px, 1fr));
    gap: 1px;
  }
`;

const HeaderGrid = styled(Grid)`
  margin-bottom: 2px;

  @media (max-width: 768px) {
    margin-bottom: 1px;
  }
`;

const HeaderCell = styled.div`
  padding: 8px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);

  @media (max-width: 768px) {
    padding: 6px 2px;
    font-size: 11px;
  }
`;

const WEEKEND_COLOR = { sat: "#3B82F6", sun: "#E53935" };
const WEEKEND_TINT = { sat: "rgba(59, 130, 246, 0.10)", sun: "rgba(229, 57, 53, 0.10)" };

const weekendTint = (props) =>
  props.$weekend &&
  css`
    background: ${WEEKEND_TINT[props.$weekend]};
  `;

const DayHeader = styled(HeaderCell)`
  font-weight: 500;
  color: ${(props) => (props.$weekend ? WEEKEND_COLOR[props.$weekend] : "var(--text-primary)")};
  ${weekendTint}
`;

const DateHeader = styled(HeaderCell)`
  font-size: 11px;
  ${weekendTint}

  @media (max-width: 768px) {
    font-size: 10px;
  }
`;

const TimeLabel = styled.div`
  padding: 4px;
  font-size: 11px;
  color: var(--text-muted);
  text-align: right;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  height: 48px;
  touch-action: pan-y;
  border-radius: 4px;
  transition: background 0.1s;

  &:active {
    background: var(--bg-tertiary);
  }

  @media (max-width: 768px) {
    font-size: 10px;
    padding: 2px;
    height: 44px;
  }
`;

const HourGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const HalfHourCell = styled.div`
  height: 23px;
  background: ${(props) => {
    if (props.$status === "available") return "var(--accent)";
    if (props.$status === "online") return "#53C3F3";
    if (props.$status === "offline" || props.$status === "maybe") return "#F5A623";
    return props.$weekend ? WEEKEND_TINT[props.$weekend] : "var(--bg-secondary)";
  }};
  cursor: pointer;
  touch-action: none;
  transition: background 0.1s;

  @media (max-width: 768px) {
    height: 21px;
  }

  ${(props) => !props.$isHalf && `
    border-radius: 4px 4px 0 0;
  `}

  ${(props) => props.$isHalf && `
    border-radius: 0 0 4px 4px;
  `}

  &:hover {
    opacity: 0.7;
  }

  &:active {
    opacity: 0.6;
  }
`;

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const DAY_OF_WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function getDayLabel(dateStr) {
  return DAY_OF_WEEK_LABELS[new Date(dateStr).getDay()];
}

// colKey → "sat" | "sun" | null (personal 모드는 DAYS 배열 순서, event 모드는 실제 날짜 기준)
function getWeekendType(colKey, dates, mode) {
  const dow = mode === "personal" ? (colKey + 1) % 7 : dates[colKey] ? new Date(dates[colKey]).getDay() : null;
  if (dow === 6) return "sat";
  if (dow === 0) return "sun";
  return null;
}

export default function AvailabilityGrid({
  dates = [],
  startTime = 0,
  endTime = 24,
  availability = [],
  onChange,
  readOnly = false,
  onReadOnlyClick,
  locked = false,
  mode = "event", // "event" | "personal"
  weekly = false, // 요일만 모드: 날짜(일자) 헤더 숨김
  gridTitle,
  hideHeader = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null);
  const [dragColumn, setDragColumn] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [selectionMode, setSelectionMode] = useState("available");
  const [lockShake, setLockShake] = useState(false);
  const [showLockNotice, setShowLockNotice] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const wasLockedRef = useRef(locked);
  const gridRef = useRef(null);

  const triggerLockNotice = () => {
    setLockShake(true);
    setShowLockNotice(true);
    setTimeout(() => setLockShake(false), 400);
    setTimeout(() => setShowLockNotice(false), 1600);
  };

  // 잠금 해제 순간을 감지해 잠깐 초록색 테두리로 표시
  React.useEffect(() => {
    const wasLocked = wasLockedRef.current;
    wasLockedRef.current = locked;
    if (wasLocked && !locked) {
      setJustUnlocked(true);
      const timer = setTimeout(() => setJustUnlocked(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [locked]);

  // 탭 vs 드래그 구분용 refs
  const touchStartPosRef = useRef(null);
  const touchHasDraggedRef = useRef(false);
  const touchStartSlotRef = useRef(null);
  const startDragRef = useRef(null);

  const numCols = mode === "personal" ? 7 : Math.min(dates.length, 7);
  const colKeys = Array.from({ length: numCols }, (_, i) => i);

  const hours = [];
  for (let h = startTime; h < endTime; h++) {
    hours.push(h);
  }

  const slotToIndex = (hour, minute) => (hour - startTime) * 2 + (minute === 30 ? 1 : 0);
  const indexToSlot = (idx) => {
    const hour = startTime + Math.floor(idx / 2);
    const minute = (idx % 2) * 30;
    return { hour, minute };
  };

  const getSlotStatus = useCallback((colKey, hour, minute) => {
    const field = mode === "personal" ? "dayOfWeek" : "dateIdx";
    const slot = availability.find(
      (a) => a[field] === colKey && a.hour === hour && a.minute === minute
    );
    return slot?.status || null;
  }, [availability, mode]);

  const updateRange = useCallback((colKey, startSlot, endSlot, shouldSelect) => {
    const field = mode === "personal" ? "dayOfWeek" : "dateIdx";
    const startIdx = slotToIndex(startSlot.hour, startSlot.minute);
    const endIdx = slotToIndex(endSlot.hour, endSlot.minute);

    const minIdx = Math.min(startIdx, endIdx);
    const maxIdx = Math.max(startIdx, endIdx);

    let newAvailability = [...availability];

    for (let i = minIdx; i <= maxIdx; i++) {
      const { hour, minute } = indexToSlot(i);
      newAvailability = newAvailability.filter(
        (a) => !(a[field] === colKey && a.hour === hour && a.minute === minute)
      );
      if (shouldSelect) {
        newAvailability.push({ [field]: colKey, hour, minute, status: selectionMode });
      }
    }

    onChange(newAvailability);
  }, [availability, onChange, selectionMode, startTime, mode]);

  const startDrag = (colKey, hour, minute) => {
    if (readOnly) {
      if (locked) {
        triggerLockNotice();
      } else {
        onReadOnlyClick?.();
      }
      return;
    }
    const field = mode === "personal" ? "dayOfWeek" : "dateIdx";

    setIsDragging(true);
    setDragColumn(colKey);
    setDragStart({ hour, minute });

    const currentStatus = getSlotStatus(colKey, hour, minute);
    const shouldDeselect = currentStatus === selectionMode;
    setDragMode(shouldDeselect ? "deselect" : "select");

    let newAvailability = availability.filter(
      (a) => !(a[field] === colKey && a.hour === hour && a.minute === minute)
    );
    if (!shouldDeselect) {
      newAvailability.push({ [field]: colKey, hour, minute, status: selectionMode });
    }
    onChange(newAvailability);
  };

  const continueDrag = (colKey, hour, minute) => {
    if (!isDragging || readOnly) return;
    if (colKey !== dragColumn) return;
    if (!dragStart) return;

    const shouldSelect = dragMode === "select";
    updateRange(colKey, dragStart, { hour, minute }, shouldSelect);
  };

  const endDrag = () => {
    setIsDragging(false);
    setDragMode(null);
    setDragColumn(null);
    setDragStart(null);
  };

  const handleMouseDown = (colKey, hour, minute) => startDrag(colKey, hour, minute);
  const handleMouseEnter = (colKey, hour, minute) => continueDrag(colKey, hour, minute);
  const handleMouseUp = () => endDrag();

  // startDrag를 ref로 항상 최신 버전 유지 (useEffect 클로저 문제 방지)
  startDragRef.current = startDrag;

  const handleTouchStart = (e, colKey, hour, minute) => {
    touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    touchHasDraggedRef.current = false;
    touchStartSlotRef.current = { colKey, hour, minute };
    // 탭인지 드래그인지 모르므로 여기서 바로 startDrag 하지 않음
  };

  const handleTouchEnd = () => {
    // 드래그가 없었으면 단일 탭 → 해당 셀 토글
    if (!touchHasDraggedRef.current && touchStartSlotRef.current) {
      const { colKey, hour, minute } = touchStartSlotRef.current;
      startDragRef.current(colKey, hour, minute);
    }
    endDrag();
    touchStartPosRef.current = null;
    touchHasDraggedRef.current = false;
    touchStartSlotRef.current = null;
  };

  React.useEffect(() => {
    const container = gridRef.current;
    if (!container) return;

    const handleTouchMove = (e) => {
      if (!touchStartSlotRef.current) return;

      e.preventDefault();

      const touch = e.touches[0];

      // 아직 드래그 시작 전 → 이동량 체크해서 드래그 시작 여부 결정
      if (!touchHasDraggedRef.current && touchStartPosRef.current) {
        const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
        const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
        if (dx > 5 || dy > 5) {
          touchHasDraggedRef.current = true;
          const { colKey, hour, minute } = touchStartSlotRef.current;
          startDragRef.current(colKey, hour, minute); // 드래그 시작 (첫 셀 토글)
        }
        return;
      }

      // 드래그 중 → 셀 연속 선택
      if (!touchHasDraggedRef.current) return;

      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element && element.dataset.slot) {
        const [colKey, hour, minute] = element.dataset.slot.split("-").map(Number);
        continueDrag(colKey, hour, minute);
      }
    };

    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isDragging, dragColumn, dragStart, dragMode, continueDrag]);

  const formatHour = (h) => `${h.toString().padStart(2, "0")}:00`;
  const formatDate = (date) => new Date(date).getDate() + "일";

  const defaultTitle = readOnly
    ? mode === "personal" ? "내 일정 미리보기" : "그룹 결과"
    : mode === "personal" ? "내 일정 (요일별)" : "내 가용시간";
  const title = gridTitle ?? defaultTitle;

  return (
    <Container
      ref={gridRef}
      $locked={locked}
      $justUnlocked={justUnlocked}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchEnd={handleTouchEnd}
    >
      {!hideHeader && <Header>
        <TitleRow>
          <GridTitle>{title}</GridTitle>
          {locked && <LockIcon $shake={lockShake}>🔒</LockIcon>}
          {locked && showLockNotice && (
            <LockNotice>더 이상 수정할 수 없습니다</LockNotice>
          )}
        </TitleRow>
      </Header>}

      <StickyToolbar>
        {!hideHeader && !readOnly && (
          <ModeToggleRow>
            <ModeToggle>
              <ModeButton
                $active={selectionMode === "available"}
                $color="var(--accent)"
                onClick={() => setSelectionMode("available")}
              >
                가능
              </ModeButton>
              <ModeButton
                $active={selectionMode === "online"}
                $color="#53C3F3"
                onClick={() => setSelectionMode("online")}
              >
                온라인만가능
              </ModeButton>
              <ModeButton
                $active={selectionMode === "maybe"}
                $color="#F5A623"
                onClick={() => setSelectionMode("maybe")}
              >
                미정
              </ModeButton>
            </ModeToggle>
          </ModeToggleRow>
        )}

        <HeaderGrid $cols={numCols}>
          <HeaderCell />
          {colKeys.map((colKey) => (
            <DayHeader key={colKey} $weekend={getWeekendType(colKey, dates, mode)}>
              {mode === "event" && dates[colKey] ? getDayLabel(dates[colKey]) : DAYS[colKey]}
            </DayHeader>
          ))}

          {mode === "event" && !weekly && (
            <>
              <HeaderCell />
              {colKeys.map((colKey) => (
                <DateHeader key={colKey} $weekend={getWeekendType(colKey, dates, mode)}>
                  {dates[colKey] ? formatDate(dates[colKey]) : ""}
                </DateHeader>
              ))}
            </>
          )}
        </HeaderGrid>
      </StickyToolbar>

      <Grid $cols={numCols}>
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <TimeLabel>{formatHour(hour)}</TimeLabel>
            {colKeys.map((colKey) => {
              const weekend = getWeekendType(colKey, dates, mode);
              return (
                <HourGroup key={`${colKey}-${hour}`}>
                  <HalfHourCell
                    $status={getSlotStatus(colKey, hour, 0)}
                    $weekend={weekend}
                    $isHalf={false}
                    data-slot={`${colKey}-${hour}-0`}
                    onMouseDown={() => handleMouseDown(colKey, hour, 0)}
                    onMouseEnter={() => handleMouseEnter(colKey, hour, 0)}
                    onTouchStart={(e) => handleTouchStart(e, colKey, hour, 0)}
                  />
                  <HalfHourCell
                    $status={getSlotStatus(colKey, hour, 30)}
                    $weekend={weekend}
                    $isHalf={true}
                    data-slot={`${colKey}-${hour}-30`}
                    onMouseDown={() => handleMouseDown(colKey, hour, 30)}
                    onMouseEnter={() => handleMouseEnter(colKey, hour, 30)}
                    onTouchStart={(e) => handleTouchStart(e, colKey, hour, 30)}
                  />
                </HourGroup>
              );
            })}
          </React.Fragment>
        ))}
      </Grid>
    </Container>
  );
}
