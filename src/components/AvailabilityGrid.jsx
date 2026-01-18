/**
 * 가용시간 그리드 (일주일 단위, 30분 단위)
 * - 가능: 초록색
 * - 조정가능: 노란색
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
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  background: ${(props) => (props.$active ? props.$color : "transparent")};
  color: ${(props) => (props.$active ? "white" : "var(--text-secondary)")};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${(props) => (props.$active ? props.$color : "var(--bg-tertiary)")};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 50px repeat(7, 1fr);
  gap: 2px;
  user-select: none;
`;

const HeaderCell = styled.div`
  padding: 8px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
`;

const DayHeader = styled(HeaderCell)`
  font-weight: 500;
  color: var(--text-primary);
`;

const DateHeader = styled(HeaderCell)`
  font-size: 11px;
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
  
  /* 정시는 위쪽 모서리 둥글게 */
  ${(props) => !props.$isHalf && `
    border-radius: 4px 4px 0 0;
  `}
  
  /* 30분은 아래쪽 모서리 둥글게 */
  ${(props) => props.$isHalf && `
    border-radius: 0 0 4px 4px;
  `}

  &:hover {
    opacity: 0.7;
  }
`;

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

export default function AvailabilityGrid({
  dates,
  startTime,
  endTime,
  availability = [],
  onChange,
  readOnly = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null); // "select" or "deselect"
  const [dragColumn, setDragColumn] = useState(null);
  const [dragStart, setDragStart] = useState(null); // { hour, minute }
  const [selectionMode, setSelectionMode] = useState("available"); // "available" or "maybe"
  const gridRef = useRef(null);

  const hours = [];
  for (let h = startTime; h < endTime; h++) {
    hours.push(h);
  }

  // 슬롯을 인덱스로 변환
  const slotToIndex = (hour, minute) => (hour - startTime) * 2 + (minute === 30 ? 1 : 0);
  const indexToSlot = (idx) => {
    const hour = startTime + Math.floor(idx / 2);
    const minute = (idx % 2) * 30;
    return { hour, minute };
  };

  // 슬롯 상태 확인: "available", "maybe", null
  const getSlotStatus = useCallback((dateIdx, hour, minute) => {
    const slot = availability.find(
      (a) => a.dateIdx === dateIdx && a.hour === hour && a.minute === minute
    );
    return slot?.status || (slot ? "available" : null);
  }, [availability]);

  // 시작점부터 끝점까지 범위 선택/해제
  const updateRange = useCallback((dateIdx, startSlot, endSlot, shouldSelect) => {
    const startIdx = slotToIndex(startSlot.hour, startSlot.minute);
    const endIdx = slotToIndex(endSlot.hour, endSlot.minute);
    
    const minIdx = Math.min(startIdx, endIdx);
    const maxIdx = Math.max(startIdx, endIdx);
    
    let newAvailability = [...availability];
    
    for (let i = minIdx; i <= maxIdx; i++) {
      const { hour, minute } = indexToSlot(i);
      
      // 기존 슬롯 제거
      newAvailability = newAvailability.filter(
        (a) => !(a.dateIdx === dateIdx && a.hour === hour && a.minute === minute)
      );
      
      // 선택 모드면 추가
      if (shouldSelect) {
        newAvailability.push({
          dateIdx,
          hour,
          minute,
          status: selectionMode,
        });
      }
    }
    
    onChange(newAvailability);
  }, [availability, onChange, selectionMode, startTime]);

  const handleMouseDown = (dateIdx, hour, minute) => {
    if (readOnly) return;
    
    setIsDragging(true);
    setDragColumn(dateIdx);
    setDragStart({ hour, minute });
    
    const currentStatus = getSlotStatus(dateIdx, hour, minute);
    const shouldDeselect = currentStatus === selectionMode;
    setDragMode(shouldDeselect ? "deselect" : "select");
    
    // 시작점 즉시 토글
    let newAvailability = availability.filter(
      (a) => !(a.dateIdx === dateIdx && a.hour === hour && a.minute === minute)
    );
    if (!shouldDeselect) {
      newAvailability.push({ dateIdx, hour, minute, status: selectionMode });
    }
    onChange(newAvailability);
  };

  const handleMouseEnter = (dateIdx, hour, minute) => {
    if (!isDragging || readOnly) return;
    if (dateIdx !== dragColumn) return;
    if (!dragStart) return;
    
    const shouldSelect = dragMode === "select";
    updateRange(dateIdx, dragStart, { hour, minute }, shouldSelect);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
    setDragColumn(null);
    setDragStart(null);
  };

  const formatHour = (h) => `${h.toString().padStart(2, "0")}:00`;
  const formatDate = (date) => new Date(date).getDate() + "일";

  return (
    <Container 
      ref={gridRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Header>
        <GridTitle>{readOnly ? "그룹 결과" : "내 가용시간"}</GridTitle>
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
        {/* Header - Days */}
        <HeaderCell />
        {dates.slice(0, 7).map((date, i) => (
          <DayHeader key={i}>{DAYS[i]}</DayHeader>
        ))}

        {/* Header - Dates */}
        <HeaderCell />
        {dates.slice(0, 7).map((date, i) => (
          <DateHeader key={i}>{formatDate(date)}</DateHeader>
        ))}

        {/* Time slots - 30분 단위 */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <TimeLabel>{formatHour(hour)}</TimeLabel>
            {dates.slice(0, 7).map((_, dateIdx) => (
              <HourGroup key={`${dateIdx}-${hour}`}>
                <HalfHourCell
                  $status={getSlotStatus(dateIdx, hour, 0)}
                  $isHalf={false}
                  onMouseDown={() => handleMouseDown(dateIdx, hour, 0)}
                  onMouseEnter={() => handleMouseEnter(dateIdx, hour, 0)}
                />
                <HalfHourCell
                  $status={getSlotStatus(dateIdx, hour, 30)}
                  $isHalf={true}
                  onMouseDown={() => handleMouseDown(dateIdx, hour, 30)}
                  onMouseEnter={() => handleMouseEnter(dateIdx, hour, 30)}
                />
              </HourGroup>
            ))}
          </React.Fragment>
        ))}
      </Grid>
    </Container>
  );
}
