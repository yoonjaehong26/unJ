/**
 * 그룹 결과 그리드 (색상 농도로 인원 표시, 30분 단위)
 */
"use client";

import React, { useState } from "react";
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

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FilterLabel = styled.span`
  font-size: 11px;
  color: var(--text-muted);
  margin-right: 4px;
`;

const FilterButton = styled.button`
  padding: 6px 10px;
  border: 1px solid ${(props) => (props.$active ? "var(--accent)" : "var(--border-subtle)")};
  border-radius: 4px;
  background: ${(props) => (props.$active ? "var(--accent)" : "var(--bg-secondary)")};
  color: ${(props) => (props.$active ? "white" : "var(--text-secondary)")};
  font-size: 11px;
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
  }

  &:hover {
    border-color: var(--accent);
  }
`;

const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  min-width: 100px;
  justify-content: space-between;
  
  &:hover {
    border-color: var(--accent);
  }
  
  &::after {
    content: '▼';
    font-size: 8px;
    color: var(--text-muted);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 120px;
  max-height: 200px;
  overflow-y: auto;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  padding: 4px;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: ${(props) => (props.$active ? "var(--accent)" : "transparent")};
  color: ${(props) => (props.$active ? "white" : "var(--text-primary)")};
  font-size: 12px;
  cursor: pointer;
  text-align: left;
  
  &:hover {
    background: ${(props) => (props.$active ? "var(--accent)" : "var(--bg-secondary)")};
  }
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 11px;
  color: var(--text-muted);
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LegendColor = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: ${(props) => props.$color};
  ${(props) => props.$border && `
    border: 2px solid ${props.$border};
    background: var(--bg-secondary);
  `}
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 50px repeat(7, minmax(40px, 1fr));
  gap: 2px;
  user-select: none;
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
  gap: 0;
`;

const HalfHourCell = styled.div`
  height: 24px;
  background: ${(props) => {
    const available = props.$available || 0;
    const maybe = props.$maybe || 0;
    const total = available + maybe;
    if (total === 0) return "var(--bg-secondary)";
    
    // 둘 다 있으면 좌우 분할 그라데이션
    if (available > 0 && maybe > 0) {
      const greenIntensity = Math.min(available / props.$total, 1);
      const yellowIntensity = Math.min(maybe / props.$total, 1);
      return `linear-gradient(90deg, 
        rgba(76, 175, 80, ${0.3 + greenIntensity * 0.7}) 0%, 
        rgba(76, 175, 80, ${0.3 + greenIntensity * 0.7}) 50%, 
        rgba(245, 166, 35, ${0.3 + yellowIntensity * 0.7}) 50%, 
        rgba(245, 166, 35, ${0.3 + yellowIntensity * 0.7}) 100%)`;
    }
    
    // maybe만 있으면 노란색
    if (maybe > 0) {
      const intensity = Math.min(maybe / props.$total, 1);
      return `rgba(245, 166, 35, ${0.3 + intensity * 0.7})`;
    }
    
    // available만 있으면 초록색
    const intensity = Math.min(available / props.$total, 1);
    return `rgba(76, 175, 80, ${0.2 + intensity * 0.8})`;
  }};
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
  color: white;
  box-sizing: border-box;
  margin-bottom: 1px;
  
  /* 연속 가능 시간: inset box-shadow로 글로우 효과 */
  ${(props) => {
    if (!props.$borderSides || !props.$borderColor) return '';
    const color = props.$borderColor;
    
    let shadow = `inset 4px 0 0 ${color}, inset -4px 0 0 ${color}`;
    let radius = '';
    
    if (props.$borderTop && props.$borderBottom) {
      shadow = `inset 4px 0 0 ${color}, inset -4px 0 0 ${color}, inset 0 4px 0 ${color}, inset 0 -4px 0 ${color}`;
      radius = 'border-radius: 6px;';
    } else if (props.$borderTop) {
      shadow = `inset 4px 0 0 ${color}, inset -4px 0 0 ${color}, inset 0 4px 0 ${color}`;
      radius = 'border-top-left-radius: 6px; border-top-right-radius: 6px;';
    } else if (props.$borderBottom) {
      shadow = `inset 4px 0 0 ${color}, inset -4px 0 0 ${color}, inset 0 -4px 0 ${color}`;
      radius = 'border-bottom-left-radius: 6px; border-bottom-right-radius: 6px;';
    }
    
    return `box-shadow: ${shadow}; ${radius}`;
  }}

  /* 선택된 참가자가 없는 슬롯은 어둡게 */
  ${(props) => props.$dimmed && `
    opacity: 0.15;
  `}

  /* 선택된 참가자가 있는 슬롯 강조 */
  ${(props) => props.$highlighted && `
    outline: 2px solid ${props.$highlighted === 'available' ? 'var(--accent)' : '#F5A623'};
    outline-offset: -2px;
    z-index: 1;
  `}

  &:hover {
    opacity: ${(props) => props.$dimmed ? 0.15 : 0.8};
  }
`;

// 좌우 분할 표시용
const SplitContent = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 2px;
`;

const SplitNumber = styled.span`
  flex: 1;
  text-align: center;
  font-size: 8px;
  font-weight: 600;
  color: white;
`;

const Tooltip = styled.div`
  position: fixed;
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 10px;
  font-size: 12px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  max-width: 200px;
`;

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

export default function GroupResultGrid({
  dates,
  startTime,
  endTime,
  participants,
  selectedParticipant,
}) {
  const [tooltip, setTooltip] = useState(null);
  const [minSlots, setMinSlots] = useState(0);
  const [minPeople, setMinPeople] = useState(null);
  const [slotsDropdownOpen, setSlotsDropdownOpen] = useState(false);
  const [peopleDropdownOpen, setPeopleDropdownOpen] = useState(false);

  const hours = [];
  for (let h = startTime; h < endTime; h++) {
    hours.push(h);
  }

  const totalParticipants = participants.length;
  const requiredPeople = minPeople === null ? totalParticipants : minPeople;

  // 각 슬롯별 인원 계산 (30분 단위) - available과 maybe 분리
  const getCounts = (dateIdx, hour, minute) => {
    let available = 0;
    let maybe = 0;
    participants.forEach((p) => {
      const slot = p.availability?.find((a) => a.dateIdx === dateIdx && a.hour === hour && a.minute === minute);
      if (slot) {
        if (slot.status === "maybe") {
          maybe++;
        } else {
          available++;
        }
      }
    });
    return { available, maybe, total: available + maybe };
  };

  // 해당 슬롯에 가능한 사람들 (상태별)
  const getParticipantInfo = (dateIdx, hour, minute) => {
    const availableNames = [];
    const maybeNames = [];
    participants.forEach((p) => {
      const slot = p.availability?.find((a) => a.dateIdx === dateIdx && a.hour === hour && a.minute === minute);
      if (slot) {
        if (slot.status === "maybe") {
          maybeNames.push(p.name);
        } else {
          availableNames.push(p.name);
        }
      }
    });
    return { availableNames, maybeNames };
  };

  // 선택된 참가자의 해당 슬롯 상태
  const getSelectedStatus = (dateIdx, hour, minute) => {
    if (!selectedParticipant) return null;
    const slot = selectedParticipant.availability?.find(
      (a) => a.dateIdx === dateIdx && a.hour === hour && a.minute === minute
    );
    return slot ? slot.status : null;
  };

  // 슬롯을 인덱스로 변환 (계산 편의)
  const slotToIndex = (hour, minute) => (hour - startTime) * 2 + (minute === 30 ? 1 : 0);
  const indexToSlot = (idx) => {
    const hour = startTime + Math.floor(idx / 2);
    const minute = (idx % 2) * 30;
    return { hour, minute };
  };
  const totalSlots = (endTime - startTime) * 2;

  // 연속 가능 슬롯 체크 (초록색: available만, 노란색: available+maybe)
  const isHighlightedGreen = (dateIdx, hour, minute) => {
    if (minSlots === 0) return false;
    if (requiredPeople === 0) return false;
    
    const currentIdx = slotToIndex(hour, minute);
    
    // 이 슬롯이 "가능"만으로 연속 블록의 일부인지 확인
    for (let startIdx = Math.max(0, currentIdx - minSlots + 1); startIdx <= currentIdx; startIdx++) {
      let enoughAvailable = true;
      for (let i = startIdx; i < startIdx + minSlots; i++) {
        if (i >= totalSlots) {
          enoughAvailable = false;
          break;
        }
        const { hour: h, minute: m } = indexToSlot(i);
        const counts = getCounts(dateIdx, h, m);
        // 필요 인원 이상이 "가능"이어야 함
        if (counts.available < requiredPeople) {
          enoughAvailable = false;
          break;
        }
      }
      if (enoughAvailable) return true;
    }
    return false;
  };

  const isHighlightedYellow = (dateIdx, hour, minute) => {
    if (minSlots === 0) return false;
    if (requiredPeople === 0) return false;
    
    const currentIdx = slotToIndex(hour, minute);
    
    // "가능" or "조정가능" 포함 연속 블록 확인
    for (let startIdx = Math.max(0, currentIdx - minSlots + 1); startIdx <= currentIdx; startIdx++) {
      let enoughTotal = true;
      for (let i = startIdx; i < startIdx + minSlots; i++) {
        if (i >= totalSlots) {
          enoughTotal = false;
          break;
        }
        const { hour: h, minute: m } = indexToSlot(i);
        const counts = getCounts(dateIdx, h, m);
        // 필요 인원 이상이 "가능" 또는 "조정가능"으로 표시
        if (counts.total < requiredPeople) {
          enoughTotal = false;
          break;
        }
      }
      if (enoughTotal) return true;
    }
    return false;
  };

  // 테두리 위치 및 색상 결정
  const getBorderInfo = (dateIdx, hour, minute) => {
    const isGreen = isHighlightedGreen(dateIdx, hour, minute);
    const isYellow = isHighlightedYellow(dateIdx, hour, minute);
    
    if (!isGreen && !isYellow) {
      return { borderTop: false, borderBottom: false, borderSides: false, borderColor: null };
    }
    
    const currentIdx = slotToIndex(hour, minute);
    
    // 현재 하이라이트 타입 결정 (초록이 우선)
    const currentType = isGreen ? 'green' : 'yellow';
    const checkHighlight = isGreen ? isHighlightedGreen : isHighlightedYellow;
    
    // 이전 슬롯 확인
    let prevHighlighted = false;
    if (currentIdx > 0) {
      const { hour: prevH, minute: prevM } = indexToSlot(currentIdx - 1);
      prevHighlighted = checkHighlight(dateIdx, prevH, prevM);
    }
    
    // 다음 슬롯 확인
    let nextHighlighted = false;
    if (currentIdx < totalSlots - 1) {
      const { hour: nextH, minute: nextM } = indexToSlot(currentIdx + 1);
      nextHighlighted = checkHighlight(dateIdx, nextH, nextM);
    }
    
    return {
      borderTop: !prevHighlighted,
      borderBottom: !nextHighlighted,
      borderSides: true,
      borderColor: currentType === 'green' ? '#1B5E20' : '#B8860B',
    };
  };

  const handleMouseEnter = (e, dateIdx, hour, minute) => {
    const { availableNames, maybeNames } = getParticipantInfo(dateIdx, hour, minute);
    if (availableNames.length > 0 || maybeNames.length > 0) {
      setTooltip({
        x: e.clientX + 10,
        y: e.clientY + 10,
        availableNames,
        maybeNames,
        time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const formatHour = (h) => `${h.toString().padStart(2, "0")}:00`;
  const formatDate = (date) => new Date(date).getDate() + "일";

  return (
    <Container>
      <Header>
        <GridTitle>그룹 결과 ({totalParticipants}명)</GridTitle>
        <FilterContainer>
          <FilterLabel>연속:</FilterLabel>
          <DropdownWrapper>
            <DropdownTrigger onClick={() => { setSlotsDropdownOpen(!slotsDropdownOpen); setPeopleDropdownOpen(false); }}>
              {minSlots === 0 ? '전체' : (() => {
                const h = Math.floor(minSlots / 2);
                const m = (minSlots % 2) * 30;
                return h > 0 ? (m > 0 ? `${h}시간 ${m}분+` : `${h}시간+`) : `${m}분+`;
              })()}
            </DropdownTrigger>
            {slotsDropdownOpen && (
              <DropdownMenu>
                <DropdownItem
                  $active={minSlots === 0}
                  onClick={() => { setMinSlots(0); setSlotsDropdownOpen(false); }}
                >
                  전체
                </DropdownItem>
                {Array.from({ length: (endTime - startTime) * 2 }, (_, i) => i + 1).map((slots) => {
                  const h = Math.floor(slots / 2);
                  const m = (slots % 2) * 30;
                  const label = h > 0 ? (m > 0 ? `${h}시간 ${m}분+` : `${h}시간+`) : `${m}분+`;
                  return (
                    <DropdownItem
                      key={slots}
                      $active={minSlots === slots}
                      onClick={() => { setMinSlots(slots); setSlotsDropdownOpen(false); }}
                    >
                      {label}
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            )}
          </DropdownWrapper>
        </FilterContainer>
        
        {totalParticipants > 1 && (
          <FilterContainer>
            <FilterLabel>인원:</FilterLabel>
            <DropdownWrapper>
              <DropdownTrigger onClick={() => { setPeopleDropdownOpen(!peopleDropdownOpen); setSlotsDropdownOpen(false); }}>
                {minPeople === null ? `전체 (${totalParticipants}명)` : `${minPeople}명 이상`}
              </DropdownTrigger>
              {peopleDropdownOpen && (
                <DropdownMenu>
                  <DropdownItem
                    $active={minPeople === null}
                    onClick={() => { setMinPeople(null); setPeopleDropdownOpen(false); }}
                  >
                    전체 ({totalParticipants}명)
                  </DropdownItem>
                  {Array.from({ length: totalParticipants }, (_, i) => totalParticipants - i).map((count) => (
                    <DropdownItem
                      key={count}
                      $active={minPeople === count}
                      onClick={() => { setMinPeople(count); setPeopleDropdownOpen(false); }}
                    >
                      {count}명 이상
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              )}
            </DropdownWrapper>
          </FilterContainer>
        )}
      </Header>

      <Legend>
        <LegendItem>
          <LegendColor $color="var(--bg-secondary)" />
          <span>0명</span>
        </LegendItem>
        <LegendItem>
          <LegendColor $color="rgba(76, 175, 80, 0.4)" />
          <span>일부</span>
        </LegendItem>
        <LegendItem>
          <LegendColor $color="rgba(76, 175, 80, 1)" />
          <span>전원</span>
        </LegendItem>
        <LegendItem>
          <LegendColor $color="rgba(245, 166, 35, 0.7)" />
          <span>조정가능</span>
        </LegendItem>
      </Legend>

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
            {dates.slice(0, 7).map((_, dateIdx) => {
              const counts00 = getCounts(dateIdx, hour, 0);
              const counts30 = getCounts(dateIdx, hour, 30);
              const border00 = getBorderInfo(dateIdx, hour, 0);
              const border30 = getBorderInfo(dateIdx, hour, 30);
              const sel00 = getSelectedStatus(dateIdx, hour, 0);
              const sel30 = getSelectedStatus(dateIdx, hour, 30);
              return (
                <HourGroup key={`${dateIdx}-${hour}`}>
                  {/* 정시 (XX:00) */}
                  <HalfHourCell
                    $available={counts00.available}
                    $maybe={counts00.maybe}
                    $total={totalParticipants}
                    $borderTop={border00.borderTop}
                    $borderBottom={border00.borderBottom}
                    $borderSides={border00.borderSides}
                    $borderColor={border00.borderColor}
                    $isHalf={false}
                    $dimmed={selectedParticipant && !sel00}
                    $highlighted={sel00}
                    onMouseEnter={(e) => handleMouseEnter(e, dateIdx, hour, 0)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {counts00.available > 0 && counts00.maybe > 0 ? (
                      <SplitContent>
                        <SplitNumber>{counts00.available}</SplitNumber>
                        <SplitNumber>{counts00.maybe}</SplitNumber>
                      </SplitContent>
                    ) : counts00.total > 0 ? counts00.total : ""}
                  </HalfHourCell>
                  {/* 30분 (XX:30) */}
                  <HalfHourCell
                    $available={counts30.available}
                    $maybe={counts30.maybe}
                    $total={totalParticipants}
                    $borderTop={border30.borderTop}
                    $borderBottom={border30.borderBottom}
                    $borderSides={border30.borderSides}
                    $borderColor={border30.borderColor}
                    $isHalf={true}
                    $dimmed={selectedParticipant && !sel30}
                    $highlighted={sel30}
                    onMouseEnter={(e) => handleMouseEnter(e, dateIdx, hour, 30)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {counts30.available > 0 && counts30.maybe > 0 ? (
                      <SplitContent>
                        <SplitNumber>{counts30.available}</SplitNumber>
                        <SplitNumber>{counts30.maybe}</SplitNumber>
                      </SplitContent>
                    ) : counts30.total > 0 ? counts30.total : ""}
                  </HalfHourCell>
                </HourGroup>
              );
            })}
          </React.Fragment>
        ))}
      </Grid>

      {tooltip && (
        <Tooltip style={{ left: tooltip.x, top: tooltip.y }}>
          <strong>{tooltip.time}</strong>
          {tooltip.availableNames.length > 0 && (
            <div style={{ marginTop: 4, color: "var(--accent)" }}>
              🟢 가능 ({tooltip.availableNames.length}): {tooltip.availableNames.join(", ")}
            </div>
          )}
          {tooltip.maybeNames.length > 0 && (
            <div style={{ marginTop: 4, color: "#F5A623" }}>
              🟡 조정가능 ({tooltip.maybeNames.length}): {tooltip.maybeNames.join(", ")}
            </div>
          )}
        </Tooltip>
      )}
    </Container>
  );
}
