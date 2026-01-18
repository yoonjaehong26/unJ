/**
 * 주간 선택 탭 컴포넌트
 */
"use client";

import styled from "styled-components";

const TabContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 4px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: ${(props) => (props.$selected ? "var(--accent)" : "transparent")};
  color: ${(props) => (props.$selected ? "white" : "var(--text-secondary)")};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    color: ${(props) => (props.$selected ? "white" : "var(--text-primary)")};
  }
`;

const DateLabel = styled.span`
  display: block;
  font-size: 10px;
  margin-top: 2px;
  opacity: 0.8;
`;

function getWeekRange(weekOffset) {
  const today = new Date();
  const currentDay = today.getDay();
  
  // 이번주 월요일
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDay + 1 + weekOffset * 7);
  
  // 이번주 일요일
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return { monday, sunday };
}

function formatDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getWeekDates(weekOffset) {
  const { monday } = getWeekRange(weekOffset);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
}

const WEEKS = [
  { offset: 0, label: "이번주" },
  { offset: 1, label: "다음주" },
  { offset: 2, label: "그다음주" },
];

export default function WeekSelector({ selectedWeek, onChange }) {
  return (
    <TabContainer>
      {WEEKS.map((week) => {
        const { monday, sunday } = getWeekRange(week.offset);
        const isSelected = selectedWeek === week.offset;

        return (
          <Tab
            key={week.offset}
            type="button"
            $selected={isSelected}
            onClick={() => onChange(week.offset)}
          >
            {week.label}
            <DateLabel>
              {formatDate(monday)}~{formatDate(sunday)}
            </DateLabel>
          </Tab>
        );
      })}
    </TabContainer>
  );
}

export { getWeekDates };
