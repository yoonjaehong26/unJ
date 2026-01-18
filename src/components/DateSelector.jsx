/**
 * 날짜 선택 컴포넌트
 */
"use client";

import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  margin-bottom: 24px;
`;

const MonthHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const MonthTitle = styled.span`
  font-size: 16px;
  font-weight: 500;
`;

const NavButton = styled.button`
  padding: 8px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;

  &:hover {
    background: var(--bg-hover);
  }
`;

const WeekHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
`;

const WeekDay = styled.span`
  font-size: 12px;
  color: var(--text-muted);
  padding: 8px 0;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const DayCell = styled.button`
  aspect-ratio: 1;
  border: 1px solid ${(props) => (props.$selected ? "var(--accent)" : "transparent")};
  border-radius: 8px;
  background: ${(props) => (props.$selected ? "var(--accent)" : "transparent")};
  color: ${(props) => {
    if (props.$selected) return "white";
    if (props.$disabled) return "var(--text-muted)";
    return "var(--text-primary)";
  }};
  font-size: 14px;
  cursor: ${(props) => (props.$disabled ? "default" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.3 : 1)};

  &:hover:not(:disabled) {
    background: ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-hover)")};
  }
`;

const EmptyCell = styled.div`
  aspect-ratio: 1;
`;

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function DateSelector({ selectedDates = [], onChange }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  const isSelected = (date) => {
    if (!date) return false;
    return selectedDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
  };

  const isPast = (date) => {
    if (!date) return false;
    return date < today;
  };

  const handleDayClick = (date) => {
    if (!date || isPast(date)) return;

    const exists = selectedDates.find(
      (d) => d.toDateString() === date.toDateString()
    );

    if (exists) {
      onChange(selectedDates.filter((d) => d.toDateString() !== date.toDateString()));
    } else {
      onChange([...selectedDates, date].sort((a, b) => a - b));
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  return (
    <Container>
      <MonthHeader>
        <NavButton onClick={prevMonth}>◀</NavButton>
        <MonthTitle>{year}년 {month + 1}월</MonthTitle>
        <NavButton onClick={nextMonth}>▶</NavButton>
      </MonthHeader>

      <WeekHeader>
        {WEEK_DAYS.map((day) => (
          <WeekDay key={day}>{day}</WeekDay>
        ))}
      </WeekHeader>

      <DaysGrid>
        {days.map((date, i) =>
          date ? (
            <DayCell
              key={i}
              type="button"
              $selected={isSelected(date)}
              $disabled={isPast(date)}
              onClick={() => handleDayClick(date)}
            >
              {date.getDate()}
            </DayCell>
          ) : (
            <EmptyCell key={i} />
          )
        )}
      </DaysGrid>
    </Container>
  );
}
