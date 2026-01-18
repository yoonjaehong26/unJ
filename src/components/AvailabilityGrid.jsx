/**
 * 가용시간 그리드 (일주일 단위, 30분 단위)
 * - 가능: 초록색
 * - 조정가능: 노란색
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
  
  /* 모바일 터치 영역 확대 */
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
  touch-action: none; /* 터치 드래그 시 스크롤 방지 */
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
  
  /* 모바일에서 터치 영역 확대 */
  @media (max-width: 768px) {
    height: 21px;
  }
  
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
  
  &:active {
    opacity: 0.6;
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
  const [dragMode, setDragMode] = useState(null);
  const [dragColumn, setDragColumn] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [selectionMode, setSelectionMode] = useState("available");
  const gridRef = useRef(null);

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

  const getSlotStatus = useCallback((dateIdx, hour, minute) => {
    const slot = availability.find(
      (a) => a.dateIdx === dateIdx && a.hour === hour && a.minute === minute
    );
    return slot?.status || (slot ? "available" : null);
  }, [availability]);

  const updateRange = useCallback((dateIdx, startSlot, endSlot, shouldSelect) => {
    const startIdx = slotToIndex(startSlot.hour, startSlot.minute);
    const endIdx = slotToIndex(endSlot.hour, endSlot.minute);
    
    const minIdx = Math.min(startIdx, endIdx);
    const maxIdx = Math.max(startIdx, endIdx);
    
    let newAvailability = [...availability];
    
    for (let i = minIdx; i <= maxIdx; i++) {
      const { hour, minute } = indexToSlot(i);
      newAvailability = newAvailability.filter(
        (a) => !(a.dateIdx === dateIdx && a.hour === hour && a.minute === minute)
      );
      if (shouldSelect) {
        newAvailability.push({ dateIdx, hour, minute, status: selectionMode });
      }
    }
    
    onChange(newAvailability);
  }, [availability, onChange, selectionMode, startTime]);

  // 드래그 시작 (마우스/터치 공통)
  const startDrag = (dateIdx, hour, minute) => {
    if (readOnly) return;
    
    setIsDragging(true);
    setDragColumn(dateIdx);
    setDragStart({ hour, minute });
    
    const currentStatus = getSlotStatus(dateIdx, hour, minute);
    const shouldDeselect = currentStatus === selectionMode;
    setDragMode(shouldDeselect ? "deselect" : "select");
    
    let newAvailability = availability.filter(
      (a) => !(a.dateIdx === dateIdx && a.hour === hour && a.minute === minute)
    );
    if (!shouldDeselect) {
      newAvailability.push({ dateIdx, hour, minute, status: selectionMode });
    }
    onChange(newAvailability);
  };

  // 드래그 중 (마우스/터치 공통)
  const continueDrag = (dateIdx, hour, minute) => {
    if (!isDragging || readOnly) return;
    if (dateIdx !== dragColumn) return;
    if (!dragStart) return;
    
    const shouldSelect = dragMode === "select";
    updateRange(dateIdx, dragStart, { hour, minute }, shouldSelect);
  };

  // 드래그 종료
  const endDrag = () => {
    setIsDragging(false);
    setDragMode(null);
    setDragColumn(null);
    setDragStart(null);
  };

  // 마우스 이벤트
  const handleMouseDown = (dateIdx, hour, minute) => startDrag(dateIdx, hour, minute);
  const handleMouseEnter = (dateIdx, hour, minute) => continueDrag(dateIdx, hour, minute);
  const handleMouseUp = () => endDrag();

  // 터치 이벤트 핸들러
  const handleTouchStart = (e, dateIdx, hour, minute) => {
    e.preventDefault();
    startDrag(dateIdx, hour, minute);
  };

  const handleTouchEnd = () => endDrag();

  // 터치 무브는 useEffect로 non-passive 리스너 등록
  React.useEffect(() => {
    const container = gridRef.current;
    if (!container) return;

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      
      if (element && element.dataset.slot) {
        const [dateIdx, hour, minute] = element.dataset.slot.split("-").map(Number);
        continueDrag(dateIdx, hour, minute);
      }
    };

    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    
    return () => {
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isDragging, dragColumn, dragStart, dragMode, continueDrag]);

  const formatHour = (h) => `${h.toString().padStart(2, "0")}:00`;
  const formatDate = (date) => new Date(date).getDate() + "일";

  return (
    <Container 
      ref={gridRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchEnd={handleTouchEnd}
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
        <HeaderCell />
        {dates.slice(0, 7).map((date, i) => (
          <DayHeader key={i}>{DAYS[i]}</DayHeader>
        ))}

        <HeaderCell />
        {dates.slice(0, 7).map((date, i) => (
          <DateHeader key={i}>{formatDate(date)}</DateHeader>
        ))}

        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <TimeLabel>{formatHour(hour)}</TimeLabel>
            {dates.slice(0, 7).map((_, dateIdx) => (
              <HourGroup key={`${dateIdx}-${hour}`}>
                <HalfHourCell
                  $status={getSlotStatus(dateIdx, hour, 0)}
                  $isHalf={false}
                  data-slot={`${dateIdx}-${hour}-0`}
                  onMouseDown={() => handleMouseDown(dateIdx, hour, 0)}
                  onMouseEnter={() => handleMouseEnter(dateIdx, hour, 0)}
                  onTouchStart={(e) => handleTouchStart(e, dateIdx, hour, 0)}
                />
                <HalfHourCell
                  $status={getSlotStatus(dateIdx, hour, 30)}
                  $isHalf={true}
                  data-slot={`${dateIdx}-${hour}-30`}
                  onMouseDown={() => handleMouseDown(dateIdx, hour, 30)}
                  onMouseEnter={() => handleMouseEnter(dateIdx, hour, 30)}
                  onTouchStart={(e) => handleTouchStart(e, dateIdx, hour, 30)}
                />
              </HourGroup>
            ))}
          </React.Fragment>
        ))}
      </Grid>
    </Container>
  );
}
