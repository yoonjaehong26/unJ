/**
 * 가용시간 그리드 (일주일 단위, 30분 단위)
 * - mode="event": 이벤트별 날짜 기반 (dateIdx 필드 사용)
 * - mode="personal": 요일 기반 (dayOfWeek 필드 사용, 날짜 헤더 없음)
 * - 가능: 초록색, 조정가능: 노란색
 * - 모바일 터치 지원
 */
"use client";

import React, { useState, useRef, useCallback } from "react";
import styled from "styled-components";

const Container = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    padding: 12px;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 50px repeat(7, minmax(40px, 1fr));
  gap: 2px;
  user-select: none;
  touch-action: none;
  min-width: 330px;

  @media (max-width: 768px) {
    grid-template-columns: 40px repeat(7, minmax(36px, 1fr));
    gap: 1px;
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

const DayHeader = styled(HeaderCell)`
  font-weight: 500;
  color: var(--text-primary);
`;

const DateHeader = styled(HeaderCell)`
  font-size: 11px;

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
    if (props.$status === "maybe") return "#F5A623";
    return "var(--bg-secondary)";
  }};
  cursor: pointer;
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

export default function AvailabilityGrid({
  dates = [],
  startTime = 0,
  endTime = 24,
  availability = [],
  onChange,
  readOnly = false,
  mode = "event", // "event" | "personal"
  gridTitle,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null);
  const [dragColumn, setDragColumn] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [selectionMode, setSelectionMode] = useState("available");
  const gridRef = useRef(null);

  const colKeys = Array.from({ length: 7 }, (_, i) => i); // 0-6

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
    if (readOnly) return;
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

  const handleTouchStart = (e, colKey, hour, minute) => {
    e.preventDefault();
    startDrag(colKey, hour, minute);
  };

  const handleTouchEnd = () => endDrag();

  React.useEffect(() => {
    const container = gridRef.current;
    if (!container) return;

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const touch = e.touches[0];
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
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchEnd={handleTouchEnd}
    >
      <Header>
        <GridTitle>{title}</GridTitle>
        {!readOnly && (
          <ModeToggle>
            <ModeButton
              $active={selectionMode === "available"}
              $color="var(--accent)"
              onClick={() => setSelectionMode("available")}
            >
              🟢 가능
            </ModeButton>
            <ModeButton
              $active={selectionMode === "maybe"}
              $color="#F5A623"
              onClick={() => setSelectionMode("maybe")}
            >
              🟡 조정가능
            </ModeButton>
          </ModeToggle>
        )}
      </Header>

      <Grid>
        <HeaderCell />
        {colKeys.map((colKey) => (
          <DayHeader key={colKey}>{DAYS[colKey]}</DayHeader>
        ))}

        {mode === "event" && (
          <>
            <HeaderCell />
            {colKeys.map((colKey) => (
              <DateHeader key={colKey}>
                {dates[colKey] ? formatDate(dates[colKey]) : ""}
              </DateHeader>
            ))}
          </>
        )}

        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <TimeLabel>{formatHour(hour)}</TimeLabel>
            {colKeys.map((colKey) => (
              <HourGroup key={`${colKey}-${hour}`}>
                <HalfHourCell
                  $status={getSlotStatus(colKey, hour, 0)}
                  $isHalf={false}
                  data-slot={`${colKey}-${hour}-0`}
                  onMouseDown={() => handleMouseDown(colKey, hour, 0)}
                  onMouseEnter={() => handleMouseEnter(colKey, hour, 0)}
                  onTouchStart={(e) => handleTouchStart(e, colKey, hour, 0)}
                />
                <HalfHourCell
                  $status={getSlotStatus(colKey, hour, 30)}
                  $isHalf={true}
                  data-slot={`${colKey}-${hour}-30`}
                  onMouseDown={() => handleMouseDown(colKey, hour, 30)}
                  onMouseEnter={() => handleMouseEnter(colKey, hour, 30)}
                  onTouchStart={(e) => handleTouchStart(e, colKey, hour, 30)}
                />
              </HourGroup>
            ))}
          </React.Fragment>
        ))}
      </Grid>
    </Container>
  );
}
