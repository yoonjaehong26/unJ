/**
 * 홈페이지 - 이벤트 생성 (주간 선택으로 단순화)
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import WeekSelector, { getWeekDates } from "@/components/WeekSelector";
import TimeRangePicker from "@/components/TimeRangePicker";

const Container = styled.main`
  max-width: 520px;
  margin: 0 auto;
  padding: 32px 20px;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 6px;
  text-align: center;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 24px;
  font-size: 13px;
`;

const Form = styled.form`
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 20px;
`;

const Section = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-secondary);
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 15px;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }
`;

const TopRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const NameSection = styled.div`
  flex: 1;
`;

const TimeSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-size: 15px;
  font-weight: 500;
  transition: opacity 0.15s;
  margin-top: 16px;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [timeRange, setTimeRange] = useState({ startTime: 9, endTime: 18 });
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim() && selectedWeek !== null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      const dates = getWeekDates(selectedWeek);

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          dates: dates.map((d) => d.toISOString()),
          startTime: timeRange.startTime,
          endTime: timeRange.endTime,
        }),
      });

      const data = await res.json();
      if (data.eventId) {
        router.push(`/${data.eventId}`);
      }
    } catch (error) {
      alert("이벤트 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>일정 조율</Title>
      <Subtitle>모두가 가능한 시간을 찾아보세요</Subtitle>

      <Form onSubmit={handleSubmit}>
        <TopRow>
          <NameSection>
            <Label>이벤트 이름</Label>
            <Input
              type="text"
              placeholder="예: 프로젝트 미팅"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </NameSection>
          <TimeSection>
            <Label>시간 범위</Label>
            <TimeRangePicker
              startTime={timeRange.startTime}
              endTime={timeRange.endTime}
              onChange={setTimeRange}
            />
          </TimeSection>
        </TopRow>

        <Section>
          <WeekSelector
            selectedWeek={selectedWeek}
            onChange={setSelectedWeek}
          />
        </Section>

        <Button type="submit" disabled={!canSubmit || loading}>
          {loading ? "생성 중..." : "이벤트 만들기"}
        </Button>
      </Form>
    </Container>
  );
}

