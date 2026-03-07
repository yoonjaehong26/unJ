/**
 * 내 일정 섹션 - 홈페이지용
 * 요일별 가용시간을 저장/불러오기 (localStorage)
 */
"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import AvailabilityGrid from "./AvailabilityGrid";
import { loadMySchedule, saveMySchedule } from "@/lib/mySchedule";

const Section = styled.div`
  margin-top: 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: ${(props) => (props.$open ? "12px 12px 0 0" : "12px")};
  cursor: pointer;
  transition: border-radius 0.15s;

  &:hover {
    border-color: var(--text-muted);
  }
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SlotCount = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 10px;
`;

const ToggleIcon = styled.span`
  font-size: 12px;
  color: var(--text-muted);
  transition: transform 0.2s;
  transform: ${(props) => (props.$open ? "rotate(180deg)" : "rotate(0)")};
  display: inline-block;
`;

const Body = styled.div`
  border: 1px solid var(--border-subtle);
  border-top: none;
  border-radius: 0 0 12px 12px;
  padding: 16px;
  background: var(--bg-card);
`;

const TimeRangeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const TimeLabel = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
`;

const TimeSelect = styled.select`
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

const HintText = styled.p`
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 12px;
`;

export default function MyScheduleSection() {
  const [open, setOpen] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [startTime, setStartTime] = useState(8);
  const [endTime, setEndTime] = useState(22);

  useEffect(() => {
    const data = loadMySchedule();
    setAvailability(data.availability || []);
  }, []);

  const handleChange = (newAvailability) => {
    setAvailability(newAvailability);
    saveMySchedule(newAvailability);
  };

  const handleStartChange = (val) => {
    const v = Number(val);
    setStartTime(v);
    if (v >= endTime) setEndTime(Math.min(v + 1, 24));
  };

  const handleEndChange = (val) => {
    const v = Number(val);
    setEndTime(v);
    if (v <= startTime) setStartTime(Math.max(v - 1, 0));
  };

  return (
    <Section>
      <SectionHeader $open={open} onClick={() => setOpen((v) => !v)}>
        <SectionTitle>
          📅 내 일정
          {availability.length > 0 && (
            <SlotCount>{availability.length}개 슬롯</SlotCount>
          )}
        </SectionTitle>
        <ToggleIcon $open={open}>▼</ToggleIcon>
      </SectionHeader>

      {open && (
        <Body>
          <HintText>
            요일별 가용시간을 미리 저장해두면, 이벤트 조율 시 빠르게 가져올 수 있어요.
          </HintText>
          <TimeRangeRow>
            <TimeLabel>시간 범위</TimeLabel>
            <TimeSelect
              value={startTime}
              onChange={(e) => handleStartChange(e.target.value)}
            >
              {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                <option key={h} value={h}>{`${h.toString().padStart(2, "0")}:00`}</option>
              ))}
            </TimeSelect>
            <TimeLabel>~</TimeLabel>
            <TimeSelect
              value={endTime}
              onChange={(e) => handleEndChange(e.target.value)}
            >
              {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h}>{`${h.toString().padStart(2, "0")}:00`}</option>
              ))}
            </TimeSelect>
          </TimeRangeRow>

          <AvailabilityGrid
            mode="personal"
            startTime={startTime}
            endTime={endTime}
            availability={availability}
            onChange={handleChange}
          />
        </Body>
      )}
    </Section>
  );
}
