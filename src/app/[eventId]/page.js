/**
 * 이벤트 페이지
 */
"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import styled from "styled-components";
import AvailabilityGrid from "@/components/AvailabilityGrid";
import GroupResultGrid from "@/components/GroupResultGrid";

const Container = styled.main`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 20px;
  
  @media (max-width: 768px) {
    padding: 16px 12px;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 12px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const CopyButton = styled.button`
  padding: 10px 16px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    border-color: var(--text-muted);
  }
  
  &:active {
    background: var(--bg-tertiary);
  }
`;

const NameSection = styled.div`
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-secondary);
`;

const NameInput = styled.input`
  width: 200px;
  padding: 12px 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 16px; /* 모바일에서 확대 방지 */

  &:focus {
    outline: none;
    border-color: var(--accent);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 280px;
  }
`;

const GridsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const Participants = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
`;

const ParticipantList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const ParticipantTag = styled.span`
  padding: 4px 10px;
  background: var(--bg-secondary);
  border-radius: 6px;
  font-size: 13px;
`;

const Loading = styled.div`
  text-align: center;
  padding: 60px;
  color: var(--text-muted);
`;

const SaveStatus = styled.span`
  margin-left: 12px;
  font-size: 12px;
  color: var(--accent);
`;

const TimeFilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const TimeFilterLabel = styled.span`
  font-size: 13px;
  color: var(--text-secondary);
`;

const TimeSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--accent);
  }
`;

export default function EventPage({ params }) {
  const { eventId } = use(params);
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [myAvailability, setMyAvailability] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [viewStartTime, setViewStartTime] = useState(null);
  const [viewEndTime, setViewEndTime] = useState(null);
  const [copied, setCopied] = useState(false);
  const [previousName, setPreviousName] = useState("");
  
  // 디바운스용 타이머
  const saveTimeoutRef = useRef(null);
  const pendingAvailabilityRef = useRef(null);

  // 이벤트 및 참가자 로드
  useEffect(() => {
    async function load() {
      try {
        const [eventRes, participantsRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch(`/api/events/${eventId}/participants`),
        ]);

        if (eventRes.ok) {
          setEvent(await eventRes.json());
        }
        if (participantsRes.ok) {
          setParticipants(await participantsRes.json());
        }
      } catch (error) {
        console.error("Load error:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  // 5초마다 참가자 데이터 폴링 (실시간 협업)
  // 내 데이터는 덮어쓰지 않음 (깜빡임 방지)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/participants`);
        if (res.ok) {
          const data = await res.json();
          // 내 이름이 있으면 다른 참가자 데이터만 업데이트
          const currentName = name.trim();
          if (currentName) {
            setParticipants((prev) => {
              const others = data.filter((p) => p.name !== currentName);
              const me = prev.find((p) => p.name === currentName);
              return me ? [...others, me] : data;
            });
          } else {
            setParticipants(data);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [eventId, name]);

  // 로컬스토리지에서 내 이름 복원
  useEffect(() => {
    const savedName = localStorage.getItem(`unj-name-${eventId}`);
    if (savedName) {
      setName(savedName);
      // 이름이 있으면 해당 참가자의 가용시간 로드
      const participant = participants.find((p) => p.name === savedName);
      if (participant) {
        setMyAvailability(participant.availability || []);
      }
    }
  }, [eventId, participants]);

  // 실제 저장 함수
  const doSave = useCallback(async (availability) => {
    const currentName = name.trim();
    if (!currentName) return;
    
    setSaving(true);

    try {
      const res = await fetch(`/api/events/${eventId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentName,
          availability: availability,
        }),
      });

      if (res.ok) {
        // 저장 성공 시 로컬 상태만 업데이트 (다시 fetch 안 함)
        // 내 데이터를 participants에 반영
        setParticipants((prev) => {
          const others = prev.filter((p) => p.name !== currentName);
          const myData = { name: currentName, availability };
          return [...others, myData];
        });
      } else {
        console.error("Save failed:", await res.text());
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  }, [eventId, name]);

  // 디바운스된 저장 (드래그 끝난 후 500ms 후에 저장)
  const saveAvailabilityDebounced = useCallback((newAvailability) => {
    if (!name.trim()) return;
    
    localStorage.setItem(`unj-name-${eventId}`, name.trim());
    pendingAvailabilityRef.current = newAvailability;
    
    // 기존 타이머 취소
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // 500ms 후에 저장
    saveTimeoutRef.current = setTimeout(() => {
      if (pendingAvailabilityRef.current) {
        doSave(pendingAvailabilityRef.current);
        pendingAvailabilityRef.current = null;
      }
    }, 500);
  }, [name, eventId, doSave]);

  // 컴포넌트 언마운트 시 저장 (sendBeacon으로 확실하게)
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (pendingAvailabilityRef.current && name.trim()) {
        // sendBeacon으로 페이지 떠나도 저장 보장
        const payload = JSON.stringify({
          name: name.trim(),
          availability: pendingAvailabilityRef.current,
        });
        navigator.sendBeacon(
          `/api/events/${eventId}/participants`,
          new Blob([payload], { type: "application/json" })
        );
      }
    };
  }, [eventId, name]);

  const handleAvailabilityChange = (newAvailability) => {
    setMyAvailability(newAvailability);
    saveAvailabilityDebounced(newAvailability);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 이름 변경 시 저장
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
  };

  // 이름 입력 완료 시 (blur) 저장
  const handleNameBlur = () => {
    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== previousName) {
      localStorage.setItem(`unj-name-${eventId}`, trimmedName);
      setPreviousName(trimmedName);
      // 가용시간이 있으면 새 이름으로 저장
      if (myAvailability.length > 0) {
        doSave(myAvailability);
      }
    }
  };

  if (loading) {
    return <Loading>불러오는 중...</Loading>;
  }

  if (!event) {
    return <Loading>이벤트를 찾을 수 없습니다</Loading>;
  }

  return (
    <Container>
      <Header>
        <Title>{event.name}</Title>
        <CopyButton onClick={handleCopyLink}>
          {copied ? "✓ 복사됨" : "링크 복사"}
        </CopyButton>
      </Header>

      <TimeFilterSection>
        <TimeFilterLabel>시간 범위:</TimeFilterLabel>
        <TimeSelect 
          value={viewStartTime ?? event.startTime} 
          onChange={(e) => setViewStartTime(Number(e.target.value))}
        >
          {Array.from({ length: event.endTime - event.startTime }, (_, i) => event.startTime + i).map((h) => (
            <option key={h} value={h}>{`${h.toString().padStart(2, '0')}:00`}</option>
          ))}
        </TimeSelect>
        <span>~</span>
        <TimeSelect 
          value={viewEndTime ?? event.endTime} 
          onChange={(e) => setViewEndTime(Number(e.target.value))}
        >
          {Array.from({ length: event.endTime - event.startTime }, (_, i) => event.startTime + i + 1).map((h) => (
            <option key={h} value={h}>{`${h.toString().padStart(2, '0')}:00`}</option>
          ))}
        </TimeSelect>
      </TimeFilterSection>

      <NameSection>
        <Label>
          내 이름
          {saving && <SaveStatus>저장 중...</SaveStatus>}
        </Label>
        <NameInput
          type="text"
          placeholder="이름을 입력하세요"
          value={name}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
        />
      </NameSection>

      <GridsContainer>
        <AvailabilityGrid
          dates={event.dates}
          startTime={viewStartTime ?? event.startTime}
          endTime={viewEndTime ?? event.endTime}
          availability={myAvailability}
          onChange={handleAvailabilityChange}
          readOnly={!name.trim()}
        />

        <GroupResultGrid
          dates={event.dates}
          startTime={viewStartTime ?? event.startTime}
          endTime={viewEndTime ?? event.endTime}
          participants={participants}
        />
      </GridsContainer>

      <Participants>
        <Label>참가자 ({participants.length}명)</Label>
        <ParticipantList>
          {participants.length === 0 ? (
            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              아직 참가자가 없습니다
            </span>
          ) : (
            participants.map((p, index) => (
              <ParticipantTag key={p._id || p.name || index}>{p.name}</ParticipantTag>
            ))
          )}
        </ParticipantList>
      </Participants>
    </Container>
  );
}
