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
`;

const LegendGradientBar = styled.div`
  width: 48px;
  height: 14px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--bg-secondary) 0%, rgba(76,175,80,1) 100%);
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

const HIGHLIGHT_VARS = {
  green: 'var(--highlight-green)',
  blue: 'var(--highlight-blue)',
  yellow: 'var(--highlight-yellow)',
};

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
        rgba(76, 175, 80, ${0.5 + greenIntensity * 0.5}) 0%,
        rgba(76, 175, 80, ${0.5 + greenIntensity * 0.5}) 50%,
        rgba(${flexColor}, ${0.5 + flexIntensity * 0.5}) 50%,
        rgba(${flexColor}, ${0.5 + flexIntensity * 0.5}) 100%)`;
    }

    if (onlineOnly > 0 && maybe === 0) {
      const intensity = Math.min(onlineOnly / props.$total, 1);
      return `rgba(83, 195, 243, ${0.5 + intensity * 0.5})`;
    }

    if (maybe > 0) {
      const intensity = Math.min(maybe / props.$total, 1);
      return `rgba(245, 166, 35, ${0.5 + intensity * 0.5})`;
    }

    const intensity = Math.min(available / props.$total, 1);
    return `rgba(76, 175, 80, ${0.5 + intensity * 0.5})`;
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
    let shadow = `inset 3px 0 0 ${color}, inset -3px 0 0 ${color}`;
    let radius = '';
    if (props.$borderTop && props.$borderBottom) {
      shadow = `inset 3px 0 0 ${color}, inset -3px 0 0 ${color}, inset 0 3px 0 ${color}, inset 0 -3px 0 ${color}`;
      radius = 'border-radius: 4px;';
    } else if (props.$borderTop) {
      shadow = `inset 3px 0 0 ${color}, inset -3px 0 0 ${color}, inset 0 3px 0 ${color}`;
      radius = 'border-top-left-radius: 4px; border-top-right-radius: 4px;';
    } else if (props.$borderBottom) {
      shadow = `inset 3px 0 0 ${color}, inset -3px 0 0 ${color}, inset 0 -3px 0 ${color}`;
      radius = 'border-bottom-left-radius: 4px; border-bottom-right-radius: 4px;';
    }
    return `box-shadow: ${shadow}; ${radius}`;
  }}

  ${(props) => props.$dimmed && `
    opacity: 0.12;
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

const DAY_OF_WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function getDayLabel(dateStr) {
  const date = new Date(dateStr);
  return DAY_OF_WEEK_LABELS[date.getDay()];
}

export default function GroupResultGrid({
  dates,
  startTime,
  endTime,
  participants,
  selectedParticipants = [],
}) {
  const [tooltip, setTooltip] = useState(null);
  const [minPeople, setMinPeople] = useState(null);
  const [peopleDropdownOpen, setPeopleDropdownOpen] = useState(false);

  const hours = [];
  for (let h = startTime; h < endTime; h++) {
    hours.push(h);
  }

  const totalParticipants = participants.length;
  const requiredPeople = minPeople === null ? totalParticipants : minPeople;

  const getCounts = (dateIdx, hour, minute) => {
    let available = 0;
    let maybe = 0;
    let onlineOnly = 0;
    participants.forEach((p) => {
      const slot = p.availability?.find((a) => a.dateIdx === dateIdx && a.hour === hour && a.minute === minute);
      if (slot) {
        if (slot.status === "available") available++;
        else if (slot.status === "online") onlineOnly++;
        else maybe++;
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
        else maybeNames.push(p.name);
      }
    });
    return { availableNames, maybeNames, onlineOnlyNames };
  };

  // 기준 인원 달성 여부 및 색상 반환: green(가능만) | blue(온라인 포함) | yellow(조정 포함) | null
  const getHighlightColor = (dateIdx, hour, minute) => {
    if (totalParticipants < 2 || requiredPeople === 0) return null;
    const { available, maybe, onlineOnly } = getCounts(dateIdx, hour, minute);
    if (available >= requiredPeople) return 'green';
    if (available + onlineOnly >= requiredPeople) return 'blue';
    if (available + onlineOnly + maybe >= requiredPeople) return 'yellow';
    return null;
  };

  const slotToIndex = (hour, minute) => (hour - startTime) * 2 + (minute === 30 ? 1 : 0);
  const indexToSlot = (idx) => {
    const hour = startTime + Math.floor(idx / 2);
    const minute = (idx % 2) * 30;
    return { hour, minute };
  };
  const totalSlots = (endTime - startTime) * 2;

  const getBorderInfo = (dateIdx, hour, minute) => {
    const highlightKey = getHighlightColor(dateIdx, hour, minute);
    if (!highlightKey) return { borderTop: false, borderBottom: false, borderSides: false, borderColor: null };

    const color = HIGHLIGHT_VARS[highlightKey];
    const currentIdx = slotToIndex(hour, minute);

    let prevHighlighted = false;
    if (currentIdx > 0) {
      const { hour: prevH, minute: prevM } = indexToSlot(currentIdx - 1);
      prevHighlighted = !!getHighlightColor(dateIdx, prevH, prevM);
    }
    let nextHighlighted = false;
    if (currentIdx < totalSlots - 1) {
      const { hour: nextH, minute: nextM } = indexToSlot(currentIdx + 1);
      nextHighlighted = !!getHighlightColor(dateIdx, nextH, nextM);
    }

    return { borderTop: !prevHighlighted, borderBottom: !nextHighlighted, borderSides: true, borderColor: HIGHLIGHT_VARS[highlightKey] };
  };

  const isSlotSelected = (dateIdx, hour, minute) => {
    return selectedParticipants.every((p) =>
      p.availability?.some((a) => a.dateIdx === dateIdx && a.hour === hour && a.minute === minute)
    );
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

  const numCols = Math.min(dates.length, 7);
  const allAvailLabel = minPeople === null || minPeople === totalParticipants
    ? "전원 가능"
    : `${requiredPeople}명 이상 가능`;

  return (
    <Container>
      <Header>
        <GridTitle>그룹 결과 ({totalParticipants}명)</GridTitle>

        {totalParticipants > 1 && (
          <FilterContainer>
            <FilterLabel>인원:</FilterLabel>
            <DropdownWrapper>
              <DropdownTrigger onClick={() => setPeopleDropdownOpen(!peopleDropdownOpen)}>
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
          <span>미정</span>
        </LegendItem>
        <LegendItem>
          <LegendColor $color="rgba(83, 195, 243, 0.7)" />
          <span>온라인만가능</span>
        </LegendItem>
        {totalParticipants >= 2 && (
          <LegendItem>
            <div style={{ display: 'flex', gap: 2, marginRight: 2 }}>
              <LegendColor $color={HIGHLIGHT_VARS.green} />
              <LegendColor $color={HIGHLIGHT_VARS.blue} />
              <LegendColor $color={HIGHLIGHT_VARS.yellow} />
            </div>
            <span>{allAvailLabel}</span>
          </LegendItem>
        )}
      </Legend>

      <Grid $cols={numCols}>
        <HeaderCell />
        {dates.slice(0, 7).map((date, i) => (
          <DayHeader key={i}>{getDayLabel(date)}</DayHeader>
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
              const selColors = selectedParticipants.map((p) => p.color).filter(Boolean);
              const makeStripe = (colors) => {
                if (!colors.length) return 'none';
                const n = colors.length;
                const stops = colors.map((c, i) => `${c} ${(i/n)*100}% ${((i+1)/n)*100}%`).join(', ');
                return `linear-gradient(to bottom, ${stops})`;
              };
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
                    onMouseEnter={(e) => handleMouseEnter(e, dateIdx, hour, 0)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {counts00.available > 0 && (counts00.maybe + counts00.onlineOnly) > 0 ? (
                      <SplitContent>
                        <SplitNumber>{counts00.available}</SplitNumber>
                        <SplitNumber>{counts00.maybe + counts00.onlineOnly}</SplitNumber>
                      </SplitContent>
                    ) : counts00.total > 0 ? counts00.total : ""}
                    {sel00 && selColors.length > 0 && (
                      <div style={{ position:'absolute', top:0, left:0, bottom:0, width:4, background: makeStripe(selColors), pointerEvents:'none' }} />
                    )}
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
                    onMouseEnter={(e) => handleMouseEnter(e, dateIdx, hour, 30)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {counts30.available > 0 && (counts30.maybe + counts30.onlineOnly) > 0 ? (
                      <SplitContent>
                        <SplitNumber>{counts30.available}</SplitNumber>
                        <SplitNumber>{counts30.maybe + counts30.onlineOnly}</SplitNumber>
                      </SplitContent>
                    ) : counts30.total > 0 ? counts30.total : ""}
                    {sel30 && selColors.length > 0 && (
                      <div style={{ position:'absolute', top:0, left:0, bottom:0, width:4, background: makeStripe(selColors), pointerEvents:'none' }} />
                    )}
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
              미정 ({tooltip.maybeNames.length}): {tooltip.maybeNames.join(", ")}
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
