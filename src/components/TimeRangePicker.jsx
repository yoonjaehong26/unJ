/**
 * 시간 범위 선택 컴포넌트 (컴팩트 버전)
 */
"use client";

import styled from "styled-components";

const Container = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 13px;
`;

const Select = styled.select`
  padding: 6px 10px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }
`;

const Separator = styled.span`
  color: var(--text-muted);
  font-size: 12px;
`;

// 0~24시 (24시 = 자정)
const START_HOURS = Array.from({ length: 24 }, (_, i) => i); // 0-23
const END_HOURS = Array.from({ length: 25 }, (_, i) => i); // 0-24

export default function TimeRangePicker({ startTime = 9, endTime = 18, onChange }) {
  const handleStartChange = (e) => {
    const newStart = parseInt(e.target.value);
    onChange({ startTime: newStart, endTime: Math.max(newStart + 1, endTime) });
  };

  const handleEndChange = (e) => {
    onChange({ startTime, endTime: parseInt(e.target.value) });
  };

  const formatHour = (hour) => {
    if (hour === 24) return "24:00 (자정)";
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  return (
    <Container>
      <Select value={startTime} onChange={handleStartChange}>
        {START_HOURS.map((h) => (
          <option key={h} value={h}>
            {formatHour(h)}
          </option>
        ))}
      </Select>
      <Separator>~</Separator>
      <Select value={endTime} onChange={handleEndChange}>
        {END_HOURS.filter((h) => h > startTime).map((h) => (
          <option key={h} value={h}>
            {formatHour(h)}
          </option>
        ))}
      </Select>
    </Container>
  );
}
