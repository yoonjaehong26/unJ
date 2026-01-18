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
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
`;

const CopyButton = styled.button`
  padding: 8px 16px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;

  &:hover {
    border-color: var(--text-muted);
  }
`;

const NameSection = styled.div`
  margin-bottom: 24px;
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
  padding: 10px 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }
`;

const GridsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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

export default function EventPage({ params }) {
  const { eventId } = use(params);
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [myAvailability, setMyAvailability] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [saving, setSaving] = useState(false);
  
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
    const currentName = localStorage.getItem(`unj-name-${eventId}`) || name.trim();
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
        const participantsRes = await fetch(`/api/events/${eventId}/participants`);
        if (participantsRes.ok) {
          setParticipants(await participantsRes.json());
        }
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

  // 컴포넌트 언마운트 시 저장
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (pendingAvailabilityRef.current && name.trim()) {
        // 언마운트 시 즉시 저장
        doSave(pendingAvailabilityRef.current);
      }
    };
  }, [doSave, name]);

  const handleAvailabilityChange = (newAvailability) => {
    setMyAvailability(newAvailability);
    saveAvailabilityDebounced(newAvailability);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("링크가 복사되었습니다!");
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
        <CopyButton onClick={handleCopyLink}>링크 복사</CopyButton>
      </Header>

      <NameSection>
        <Label>
          내 이름
          {saving && <SaveStatus>저장 중...</SaveStatus>}
        </Label>
        <NameInput
          type="text"
          placeholder="이름을 입력하세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </NameSection>

      <GridsContainer>
        <AvailabilityGrid
          dates={event.dates}
          startTime={event.startTime}
          endTime={event.endTime}
          availability={myAvailability}
          onChange={handleAvailabilityChange}
          readOnly={!name.trim()}
        />

        <GroupResultGrid
          dates={event.dates}
          startTime={event.startTime}
          endTime={event.endTime}
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
            participants.map((p) => (
              <ParticipantTag key={p._id}>{p.name}</ParticipantTag>
            ))
          )}
        </ParticipantList>
      </Participants>
    </Container>
  );
}
