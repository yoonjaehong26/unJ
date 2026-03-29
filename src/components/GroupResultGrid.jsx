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
  flex-wrap: wrap;
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
  background: ${(props) => props.$color || "transparent"};
  ${(props) => props.$border && `
    border: 2px solid ${props.$border};
  `}
`;

const LegendGradientBar = styled.div`
  width: 48px;
  height: 14px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--bg-secondary) 0%, rgba(76,175,80,1) 100%);
`;

const LegendBorderBox = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: rgba(76, 175, 80, 0.7);
  box-shadow: inset 0 0 0 2px #FFFFFF;
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
    const onlineOnly = props.$onlineOnly || 0;
    const anyFlexible = maybe + onlineOnly;
    const total = available + anyFlexible;
    if (total === 0) return "var(--bg-secondary)";

    if (available > 0 && anyFlexible > 0) {
      const greenIntensity = Math.min(available / props.$total, 1);
      const flexColor = maybe > 0 ? "245, 166, 35" : "83, 195, 243";
      const flexIntensity = Math.min(anyFlexible / props.$total, 1);
      return `linear-gradient(90deg,
        rgba(76, 175, 80, ${0.3 + greenIntensity * 0.7}) 0%,
        rgba(76, 175, 80, ${0.3 + greenIntensity * 0.7}) 50%,
        rgba(${flexColor}, ${0.3 + flexIntensity * 0.7}) 50%,
        rgba(${flexColor}, ${0.3 + flexIntensity * 0.7}) 100%)`;
    }

    if (onlineOnly > 0 && maybe === 0) {
      const intensity = Math.min(onlineOnly / props.$total, 1);
      return `rgba(83, 195, 243, ${0.3 + intensity * 0.7})`;
    }

    if (maybe > 0) {
      const intensity = Math.min(maybe / props.$total, 1);
      return `rgba(245, 166, 35, ${0.3 + intensity * 0.7})`;
    }

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

  ${(props) => {
    if (!props.$borderSides || !props.$borderColor) return '';
    const color = props.$borderColor;

    let shadow = `inset 5px 0 0 ${color}, inset -5px 0 0 ${color}`;
    let radius = '';

    if (props.$borderTop && props.$borderBottom) {
      shadow = `inset 5px 0 0 ${color}, inset -5px 0 0 ${color}, inset 0 5px 0 ${color}, inset 0 -5px 0 ${color}`;
      radius = 'border-radius: 4px;';
    } else if (props.$borderTop) {
      shadow = `inset 5px 0 0 ${color}, inset -5px 0 0 ${color}, inset 0 5px 0 ${color}`;
      radius = 'border-top-left-radius: 4px; border-top-right-radius: 4px;';
    } else if (props.$borderBottom) {
      shadow = `inset 5px 0 0 ${color}, inset -5px 0 0 ${color}, inset 0 -5px 0 ${color}`;
      radius = 'border-bottom-left-radius: 4px; border-bottom-right-radius: 4px;';
    }

    return `box-shadow: ${shadow}; ${radius}`;
  }}

  ${(props) => props.$dimmed && `
    opacity: 0.12;
  `}

  ${(props) => props.$highlighted && `
    outline: 2px solid ${props.$highlightColor || 'rgba(255, 255, 255, 0.95)'};
    outline-offset: -2px;
    z-index: 2;
  `}

  &:hover {
    opacity: ${(props) => props.$dimmed ? 0.12 : 0.8};
  }
`;

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
  selectedParticipants = [],
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

  // flexible = online + offline + maybe(backward compat)
  const getCounts = (dateIdx, hour, minute) => {
    let available = 0;
    let maybe = 0;   // 조정가능 (yellow)
    let onlineOnly = 0; // 온라인만가능 (gray)
    participants.forEach((p) => {
      const slot = p.availability?.find((a) => a.dateIdx === dateIdx && a.hour === hour && a.minute === minute);
      if (slot) {
        if (slot.status === "available") available++;
        else if (slot.status === "online") onlineOnly++;
        else maybe++; // offline, maybe (backward compat) → 조정가능
      }
    });
    return { available, maybe, onlineOnly, total: available + maybe + onlineOnly };
  };

  const getParticipantInfo = (dateIdx, hour, minute) => {
    const availableNames = [];
    const maybeNames = [];
    const onlineOnlyNames = [];
    participants.forEach((p) => {
      const slot = p.availability?.find((a) => a.dateIdx === dateIdx && a.hour === hour && a.minute === minute);
      if (slot) {
        if (slot.status === "available") availableNames.push(p.name);
        else if (slot.status === "online") onlineOnlyNames.push(p.name);
        else maybeNames.push(p.name); // offline, maybe → 조정가능
      }
    });
    return { availableNames, maybeNames, onlineOnlyNames };
  };

  // 전원 가능 (available only) 여부
  const isAllAvailable = (dateIdx, hour, minute) => {
    if (totalParticipants < 2) return false;
    return participants.every(p =>
      p.availability?.some(a =>
        a.dateIdx === dateIdx && a.hour === hour && a.minute === minute && a.status === "available"
      )
    );
  };

  // 선택된 참가자 모두가 이 슬롯을 가지고 있는지 (교집합)
  const isSlotSelected = (dateIdx, hour, minute) => {
    return selectedParticipants.every(p =>
      p.availability?.some(a => a.dateIdx === dateIdx && a.hour === hour && a.minute === minute)
    );
  };

  const slotToIndex = (hour, minute) => (hour - startTime) * 2 + (minute === 30 ? 1 : 0);
  const indexToSlot = (idx) => {
    const hour = startTime + Math.floor(idx / 2);
    const minute = (idx % 2) * 30;
    return { hour, minute };
  };
  const totalSlots = (endTime - startTime) * 2;

  const isHighlightedGreen = (dateIdx, hour, minute) => {
    if (minSlots === 0) return false;
    if (requiredPeople === 0) return false;

    const currentIdx = slotToIndex(hour, minute);

    for (let startIdx = Math.max(0, currentIdx - minSlots + 1); startIdx <= currentIdx; startIdx++) {
      let enoughAvailable = true;
      for (let i = startIdx; i < startIdx + minSlots; i++) {
        if (i >= totalSlots) { enoughAvailable = false; break; }
        const { hour: h, minute: m } = indexToSlot(i);
        if (getCounts(dateIdx, h, m).available < requiredPeople) { enoughAvailable = false; break; }
      }
      if (enoughAvailable) return true;
    }
    return false;
  };

  const isHighlightedYellow = (dateIdx, hour, minute) => {
    if (minSlots === 0) return false;
    if (requiredPeople === 0) return false;

    const currentIdx = slotToIndex(hour, minute);

    for (let startIdx = Math.max(0, currentIdx - minSlots + 1); startIdx <= currentIdx; startIdx++) {
      let enoughTotal = true;
      for (let i = startIdx; i < startIdx + minSlots; i++) {
        if (i >= totalSlots) { enoughTotal = false; break; }
        const { hour: h, minute: m } = indexToSlot(i);
        const c = getCounts(dateIdx, h, m);
        // 온라인만가능(onlineOnly)은 조정가능 카운트에 포함하지 않음
        if (c.available + c.maybe < requiredPeople) { enoughTotal = false; break; }
      }
      if (enoughTotal) return true;
    }
    return false;
  };

  // 온라인만가능 포함 전체 합산 연속 체크 (파란 테두리용)
  const isHighlightedBlue = (dateIdx, hour, minute) => {
    if (minSlots === 0) return false;
    if (requiredPeople === 0) return false;

    const currentIdx = slotToIndex(hour, minute);

    for (let startIdx = Math.max(0, currentIdx - minSlots + 1); startIdx <= currentIdx; startIdx++) {
      let enough = true;
      for (let i = startIdx; i < startIdx + minSlots; i++) {
        if (i >= totalSlots) { enough = false; break; }
        const { hour: h, minute: m } = indexToSlot(i);
        if (getCounts(dateIdx, h, m).total < requiredPeople) { enough = false; break; }
      }
      if (enough) return true;
    }
    return false;
  };

  const getBorderInfo = (dateIdx, hour, minute) => {
    const isGreen = isHighlightedGreen(dateIdx, hour, minute);
    const isYellow = isHighlightedYellow(dateIdx, hour, minute);
    const isBlue = !isYellow && isHighlightedBlue(dateIdx, hour, minute);
    const allAvail = isAllAvailable(dateIdx, hour, minute);

    if (!isGreen && !isYellow && !isBlue && !allAvail) {
      return { borderTop: false, borderBottom: false, borderSides: false, borderColor: null };
    }

    let borderColor;
    let checkFn;

    if (isGreen) {
      borderColor = '#00E676';
      checkFn = (d, h, m) => isHighlightedGreen(d, h, m);
    } else if (isYellow) {
      borderColor = '#FFD600';
      checkFn = (d, h, m) => isHighlightedYellow(d, h, m);
    } else if (isBlue) {
      borderColor = '#53C3F3';
      checkFn = (d, h, m) => !isHighlightedYellow(d, h, m) && isHighlightedBlue(d, h, m);
    } else {
      // 전원 가능 default border
      borderColor = '#FFFFFF';
      checkFn = (d, h, m) => isAllAvailable(d, h, m);
    }

    const currentIdx = slotToIndex(hour, minute);

    let prevHighlighted = false;
    if (currentIdx > 0) {
      const { hour: prevH, minute: prevM } = indexToSlot(currentIdx - 1);
      prevHighlighted = checkFn(dateIdx, prevH, prevM);
    }

    let nextHighlighted = false;
    if (currentIdx < totalSlots - 1) {
      const { hour: nextH, minute: nextM } = indexToSlot(currentIdx + 1);
      nextHighlighted = checkFn(dateIdx, nextH, nextM);
    }

    return {
      borderTop: !prevHighlighted,
      borderBottom: !nextHighlighted,
      borderSides: true,
      borderColor,
    };
  };

  const handleMouseEnter = (e, dateIdx, hour, minute) => {
    const { availableNames, maybeNames, onlineOnlyNames } = getParticipantInfo(dateIdx, hour, minute);
    if (availableNames.length > 0 || maybeNames.length > 0 || onlineOnlyNames.length > 0) {
      setTooltip({
        x: e.clientX + 10,
        y: e.clientY + 10,
        availableNames,
        maybeNames,
        onlineOnlyNames,
        time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
      });
    }
  };

  const handleMouseLeave = () => setTooltip(null);

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
                <DropdownItem $active={minSlots === 0} onClick={() => { setMinSlots(0); setSlotsDropdownOpen(false); }}>
                  전체
                </DropdownItem>
                {Array.from({ length: (endTime - startTime) * 2 }, (_, i) => i + 1).map((slots) => {
                  const h = Math.floor(slots / 2);
                  const m = (slots % 2) * 30;
                  const label = h > 0 ? (m > 0 ? `${h}시간 ${m}분+` : `${h}시간+`) : `${m}분+`;
                  return (
                    <DropdownItem key={slots} $active={minSlots === slots} onClick={() => { setMinSlots(slots); setSlotsDropdownOpen(false); }}>
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
                  <DropdownItem $active={minPeople === null} onClick={() => { setMinPeople(null); setPeopleDropdownOpen(false); }}>
                    전체 ({totalParticipants}명)
                  </DropdownItem>
                  {Array.from({ length: totalParticipants }, (_, i) => totalParticipants - i).map((count) => (
                    <DropdownItem key={count} $active={minPeople === count} onClick={() => { setMinPeople(count); setPeopleDropdownOpen(false); }}>
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
          <LegendGradientBar />
          <span>0 · · · {totalParticipants}명</span>
        </LegendItem>
        <LegendItem>
          <LegendColor $color="rgba(245, 166, 35, 0.7)" />
          <span>조정가능</span>
        </LegendItem>
        <LegendItem>
          <LegendColor $color="rgba(83, 195, 243, 0.7)" />
          <span>온라인만가능</span>
        </LegendItem>
        {totalParticipants >= 2 && (
          <LegendItem>
            <LegendBorderBox />
            <span>전원 가능</span>
          </LegendItem>
        )}
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
              const hasSel = selectedParticipants.length > 0;
              const sel00 = hasSel && isSlotSelected(dateIdx, hour, 0);
              const sel30 = hasSel && isSlotSelected(dateIdx, hour, 30);
              // 단독 선택이면 그 참가자 색, 교집합이면 흰색
              const highlightColor = selectedParticipants.length === 1
                ? selectedParticipants[0].color
                : 'rgba(255, 255, 255, 0.95)';
              return (
                <HourGroup key={`${dateIdx}-${hour}`}>
                  <HalfHourCell
                    $available={counts00.available}
                    $maybe={counts00.maybe}
                    $onlineOnly={counts00.onlineOnly}
                    $total={totalParticipants}
                    $borderTop={border00.borderTop}
                    $borderBottom={border00.borderBottom}
                    $borderSides={border00.borderSides}
                    $borderColor={border00.borderColor}
                    $dimmed={hasSel && !sel00}
                    $highlighted={sel00}
                    $highlightColor={highlightColor}
                    onMouseEnter={(e) => handleMouseEnter(e, dateIdx, hour, 0)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {counts00.available > 0 && (counts00.maybe + counts00.onlineOnly) > 0 ? (
                      <SplitContent>
                        <SplitNumber>{counts00.available}</SplitNumber>
                        <SplitNumber>{counts00.maybe + counts00.onlineOnly}</SplitNumber>
                      </SplitContent>
                    ) : counts00.total > 0 ? counts00.total : ""}
                  </HalfHourCell>
                  <HalfHourCell
                    $available={counts30.available}
                    $maybe={counts30.maybe}
                    $onlineOnly={counts30.onlineOnly}
                    $total={totalParticipants}
                    $borderTop={border30.borderTop}
                    $borderBottom={border30.borderBottom}
                    $borderSides={border30.borderSides}
                    $borderColor={border30.borderColor}
                    $dimmed={hasSel && !sel30}
                    $highlighted={sel30}
                    $highlightColor={highlightColor}
                    onMouseEnter={(e) => handleMouseEnter(e, dateIdx, hour, 30)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {counts30.available > 0 && (counts30.maybe + counts30.onlineOnly) > 0 ? (
                      <SplitContent>
                        <SplitNumber>{counts30.available}</SplitNumber>
                        <SplitNumber>{counts30.maybe + counts30.onlineOnly}</SplitNumber>
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
              가능 ({tooltip.availableNames.length}): {tooltip.availableNames.join(", ")}
            </div>
          )}
          {tooltip.maybeNames.length > 0 && (
            <div style={{ marginTop: 4, color: "#F5A623" }}>
              조정가능 ({tooltip.maybeNames.length}): {tooltip.maybeNames.join(", ")}
            </div>
          )}
          {tooltip.onlineOnlyNames.length > 0 && (
            <div style={{ marginTop: 4, color: "#53C3F3" }}>
              온라인만가능 ({tooltip.onlineOnlyNames.length}): {tooltip.onlineOnlyNames.join(", ")}
            </div>
          )}
        </Tooltip>
      )}
    </Container>
  );
}
