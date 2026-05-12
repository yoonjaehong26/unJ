"use client";

import { useState } from "react";
import styled from "styled-components";
import WeekSelector, { getWeekDates } from "@/components/WeekSelector";
import TimeRangePicker from "@/components/TimeRangePicker";

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

const DayToggleRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
`;

const DayButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid ${(props) => (props.$selected ? "var(--accent)" : "var(--border-subtle)")};
  border-radius: 8px;
  background: ${(props) => (props.$selected ? "var(--accent)" : "transparent")};
  color: ${(props) => (props.$selected ? "white" : "var(--text-secondary)")};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--accent);
  }
`;

const ResultBox = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 20px;
`;

const ResultTitle = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
`;

const LinkBlock = styled.div`
  margin-bottom: 12px;
`;

const LinkLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
`;

const LinkRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const LinkInput = styled.input`
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 12px;
  min-width: 0;
`;

const CopyBtn = styled.button`
  padding: 8px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    border-color: var(--text-muted);
  }
`;

const EnterButton = styled.a`
  display: block;
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-size: 15px;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  margin-top: 16px;
  cursor: pointer;
  box-sizing: border-box;
`;

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export default function CreateEventForm() {
  const [name, setName] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [timeRange, setTimeRange] = useState({ startTime: 9, endTime: 18 });
  const [selectedDays, setSelectedDays] = useState([true, true, true, true, true, true, true]);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [copiedAdmin, setCopiedAdmin] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const hasDay = selectedDays.some(Boolean);
  const canSubmit = name.trim() && selectedWeek !== null && hasDay;

  const toggleDay = (idx) => {
    setSelectedDays((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      const allDates = getWeekDates(selectedWeek);
      const dates = allDates.filter((_, idx) => selectedDays[idx]);

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
        setCreated({ eventId: data.eventId, adminToken: data.adminToken });
      }
    } catch (error) {
      alert("이벤트 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, setFlag) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setFlag(true);
    setTimeout(() => setFlag(false), 2000);
  };

  if (created) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const adminUrl = `${origin}/${created.eventId}?admin=${created.adminToken}`;
    const shareUrl = `${origin}/${created.eventId}`;

    return (
      <ResultBox>
        <ResultTitle>이벤트가 생성되었습니다. 링크를 저장해두세요.</ResultTitle>

        <LinkBlock>
          <LinkLabel>방장 링크 — 시간·날짜 수정 가능 (본인만 보관)</LinkLabel>
          <LinkRow>
            <LinkInput readOnly value={adminUrl} />
            <CopyBtn onClick={() => copyToClipboard(adminUrl, setCopiedAdmin)}>
              {copiedAdmin ? "✓ 복사됨" : "복사"}
            </CopyBtn>
          </LinkRow>
        </LinkBlock>

        <LinkBlock>
          <LinkLabel>공유 링크 — 참가자에게 전달</LinkLabel>
          <LinkRow>
            <LinkInput readOnly value={shareUrl} />
            <CopyBtn onClick={() => copyToClipboard(shareUrl, setCopiedShare)}>
              {copiedShare ? "✓ 복사됨" : "복사"}
            </CopyBtn>
          </LinkRow>
        </LinkBlock>

        <EnterButton href={adminUrl}>방 입장하기 →</EnterButton>
      </ResultBox>
    );
  }

  return (
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
        <WeekSelector selectedWeek={selectedWeek} onChange={setSelectedWeek} />
        <Label>요일 선택</Label>
        <DayToggleRow>
          {DAY_LABELS.map((day, idx) => (
            <DayButton
              key={idx}
              type="button"
              $selected={selectedDays[idx]}
              onClick={() => toggleDay(idx)}
            >
              {day}
            </DayButton>
          ))}
        </DayToggleRow>
      </Section>

      <Button type="submit" disabled={!canSubmit || loading}>
        {loading ? "생성 중..." : "이벤트 만들기"}
      </Button>
    </Form>
  );
}
