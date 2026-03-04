/**
 * 이벤트 페이지 (When2Meet 방식)
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

const PageHeader = styled.header`
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

const NameInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NameInput = styled.input`
  width: 200px;
  padding: 12px 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }

  &:disabled {
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 280px;
  }
`;

const JoinButton = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SignOutButton = styled.button`
  padding: 8px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: none;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;

  &:hover {
    border-color: var(--text-muted);
    color: var(--text-secondary);
  }
`;

const LockButton = styled.button`
  padding: 8px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: none;
  color: ${(props) => (props.$locked ? "var(--accent)" : "var(--text-muted)")};
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    border-color: var(--text-muted);
    color: var(--text-secondary);
  }
`;

const JoinedName = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
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

const ParticipantTag = styled.button`
  padding: 4px 10px;
  background: ${(props) => (props.$active ? "var(--accent)" : "var(--bg-secondary)")};
  color: ${(props) => (props.$active ? "white" : "var(--text-primary)")};
  border: 1px solid ${(props) => (props.$active ? "var(--accent)" : "transparent")};
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--accent);
  }
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

// 비밀번호 모달
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
`;

const Modal = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 24px;
  width: 340px;
  max-width: 90vw;
`;

const ModalTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 16px;
  margin-bottom: 12px;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: ${(props) => (props.$primary ? "none" : "1px solid var(--border-subtle)")};
  background: ${(props) => (props.$primary ? "var(--accent)" : "none")};
  color: ${(props) => (props.$primary ? "white" : "var(--text-secondary)")};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 13px;
  margin-bottom: 12px;
`;

export default function EventPage({ params }) {
  const { eventId } = use(params);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // 참가 상태
  const [nameInput, setNameInput] = useState("");
  const [joined, setJoined] = useState(false);
  const [joinedName, setJoinedName] = useState("");
  const [participantId, setParticipantId] = useState(null);
  const [hasPassword, setHasPassword] = useState(false);

  // 비밀번호 모달
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalMode, setPasswordModalMode] = useState("verify"); // "verify" | "set"
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [pendingJoinName, setPendingJoinName] = useState("");

  const [myAvailability, setMyAvailability] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [viewStartTime, setViewStartTime] = useState(null);
  const [viewEndTime, setViewEndTime] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

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

  // localStorage에서 참가 상태 복원 → 자동 join
  useEffect(() => {
    if (loading || joined) return;

    const saved = localStorage.getItem(`unj-participant-${eventId}`);
    if (saved) {
      try {
        const { name } = JSON.parse(saved);
        if (name) {
          handleJoin(name);
        }
      } catch {
        localStorage.removeItem(`unj-participant-${eventId}`);
      }
    }
  }, [loading, eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 5초마다 참가자 데이터 폴링
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/participants`);
        if (res.ok) {
          const data = await res.json();
          const currentName = joinedName;
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
  }, [eventId, joinedName]);

  // join API 호출
  const handleJoin = useCallback(async (name, password) => {
    const trimmed = (name || nameInput).trim();
    if (!trimmed) return;

    try {
      const res = await fetch(`/api/events/${eventId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, password }),
      });

      const data = await res.json();

      if (data.status === "password_required") {
        setPendingJoinName(trimmed);
        setPasswordModalMode("verify");
        setPasswordInput("");
        setPasswordError("");
        setShowPasswordModal(true);
        return;
      }

      if (data.status === "error") {
        setPasswordError(data.message);
        return;
      }

      if (data.status === "ok") {
        setJoined(true);
        setJoinedName(data.name);
        setParticipantId(data.participantId);
        setHasPassword(data.hasPassword);
        setMyAvailability(data.availability || []);
        setShowPasswordModal(false);

        // 참가자 목록에 반영
        setParticipants((prev) => {
          const others = prev.filter((p) => p.name !== data.name);
          return [...others, { _id: data.participantId, name: data.name, availability: data.availability || [] }];
        });

        // localStorage에 저장
        localStorage.setItem(
          `unj-participant-${eventId}`,
          JSON.stringify({ name: data.name })
        );
      }
    } catch (error) {
      console.error("Join error:", error);
    }
  }, [eventId, nameInput]);

  // 실제 저장 함수
  const doSave = useCallback(async (availability) => {
    if (!joinedName) return;

    setSaving(true);

    try {
      const res = await fetch(`/api/events/${eventId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: joinedName,
          availability: availability,
        }),
      });

      if (res.ok) {
        setParticipants((prev) => {
          const others = prev.filter((p) => p.name !== joinedName);
          const myData = { _id: participantId, name: joinedName, availability };
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
  }, [eventId, joinedName, participantId]);

  // 디바운스된 저장
  const saveAvailabilityDebounced = useCallback((newAvailability) => {
    if (!joinedName) return;

    pendingAvailabilityRef.current = newAvailability;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (pendingAvailabilityRef.current) {
        doSave(pendingAvailabilityRef.current);
        pendingAvailabilityRef.current = null;
      }
    }, 500);
  }, [joinedName, doSave]);

  // 컴포넌트 언마운트 시 저장
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (pendingAvailabilityRef.current && joinedName) {
        const payload = JSON.stringify({
          name: joinedName,
          availability: pendingAvailabilityRef.current,
        });
        navigator.sendBeacon(
          `/api/events/${eventId}/participants`,
          new Blob([payload], { type: "application/json" })
        );
      }
    };
  }, [eventId, joinedName]);

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

  // 이름 입력 후 참가
  const handleNameSubmit = (e) => {
    e.preventDefault();
    handleJoin();
  };

  // 로그아웃 (이 방에서 나가기)
  const handleSignOut = () => {
    setJoined(false);
    setJoinedName("");
    setParticipantId(null);
    setHasPassword(false);
    setMyAvailability([]);
    setNameInput("");
    localStorage.removeItem(`unj-participant-${eventId}`);
  };

  // 비밀번호 설정
  const handleSetPassword = async () => {
    if (!passwordInput || passwordInput.length < 4) {
      setPasswordError("비밀번호는 4자 이상이어야 합니다");
      return;
    }

    try {
      const res = await fetch(
        `/api/events/${eventId}/participants/${participantId}/password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passwordInput }),
        }
      );

      if (res.ok) {
        setHasPassword(true);
        setShowPasswordModal(false);
        setPasswordInput("");
        setPasswordError("");
      } else {
        const data = await res.json();
        setPasswordError(data.error || "설정 실패");
      }
    } catch (error) {
      console.error("Set password error:", error);
      setPasswordError("비밀번호 설정 실패");
    }
  };

  // 비밀번호 검증 후 참가
  const handleVerifyPassword = () => {
    handleJoin(pendingJoinName, passwordInput);
  };

  // 비밀번호 설정 모달 열기
  const openSetPasswordModal = () => {
    setPasswordModalMode("set");
    setPasswordInput("");
    setPasswordError("");
    setShowPasswordModal(true);
  };

  if (loading) {
    return <Loading>불러오는 중...</Loading>;
  }

  if (!event) {
    return <Loading>이벤트를 찾을 수 없습니다</Loading>;
  }

  return (
    <Container>
      <PageHeader>
        <Title>{event.name}</Title>
        <CopyButton onClick={handleCopyLink}>
          {copied ? "✓ 복사됨" : "링크 복사"}
        </CopyButton>
      </PageHeader>

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
        {!joined ? (
          <>
            <Label>이름을 입력하여 참가하세요</Label>
            <form onSubmit={handleNameSubmit}>
              <NameInputRow>
                <NameInput
                  type="text"
                  placeholder="이름"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                />
                <JoinButton type="submit" disabled={!nameInput.trim()}>
                  참가
                </JoinButton>
              </NameInputRow>
            </form>
          </>
        ) : (
          <>
            <Label>
              참가자
              {saving && <SaveStatus>저장 중...</SaveStatus>}
            </Label>
            <NameInputRow>
              <JoinedName>{joinedName}</JoinedName>
              <LockButton
                $locked={hasPassword}
                onClick={hasPassword ? undefined : openSetPasswordModal}
                title={hasPassword ? "비밀번호 설정됨" : "비밀번호 설정"}
              >
                {hasPassword ? "🔒" : "🔓"} {hasPassword ? "잠금" : "비밀번호 설정"}
              </LockButton>
              <SignOutButton onClick={handleSignOut}>나가기</SignOutButton>
            </NameInputRow>
          </>
        )}
      </NameSection>

      <Participants>
        <Label>참가자 ({participants.length}명){selectedParticipant && <span style={{ marginLeft: 8, fontSize: 12, color: "var(--accent)" }}>— {selectedParticipant.name}의 일정 보는 중</span>}</Label>
        <ParticipantList>
          {participants.length === 0 ? (
            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              아직 참가자가 없습니다
            </span>
          ) : (
            participants.map((p, index) => (
              <ParticipantTag
                key={p._id || p.name || index}
                $active={selectedParticipant?.name === p.name}
                onClick={() => setSelectedParticipant(selectedParticipant?.name === p.name ? null : p)}
              >
                {p.name}
              </ParticipantTag>
            ))
          )}
        </ParticipantList>
      </Participants>

      <GridsContainer>
        <AvailabilityGrid
          dates={event.dates}
          startTime={viewStartTime ?? event.startTime}
          endTime={viewEndTime ?? event.endTime}
          availability={myAvailability}
          onChange={handleAvailabilityChange}
          readOnly={!joined}
        />

        <GroupResultGrid
          dates={event.dates}
          startTime={viewStartTime ?? event.startTime}
          endTime={viewEndTime ?? event.endTime}
          participants={participants}
          selectedParticipant={selectedParticipant}
        />
      </GridsContainer>

      {/* 비밀번호 모달 */}
      {showPasswordModal && (
        <Overlay onClick={() => setShowPasswordModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            {passwordModalMode === "verify" ? (
              <>
                <ModalTitle>비밀번호 입력</ModalTitle>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                  &quot;{pendingJoinName}&quot; 이름에 비밀번호가 설정되어 있습니다.
                </p>
                {passwordError && <ErrorText>{passwordError}</ErrorText>}
                <form onSubmit={(e) => { e.preventDefault(); handleVerifyPassword(); }}>
                  <ModalInput
                    type="password"
                    placeholder="비밀번호"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    autoFocus
                  />
                  <ModalButtons>
                    <ModalButton type="button" onClick={() => setShowPasswordModal(false)}>
                      취소
                    </ModalButton>
                    <ModalButton $primary type="submit" disabled={!passwordInput}>
                      확인
                    </ModalButton>
                  </ModalButtons>
                </form>
              </>
            ) : (
              <>
                <ModalTitle>비밀번호 설정</ModalTitle>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                  다른 기기에서 접속할 때 본인 확인을 위해 비밀번호를 설정하세요.
                </p>
                {passwordError && <ErrorText>{passwordError}</ErrorText>}
                <form onSubmit={(e) => { e.preventDefault(); handleSetPassword(); }}>
                  <ModalInput
                    type="password"
                    placeholder="비밀번호 (4자 이상)"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    autoFocus
                  />
                  <ModalButtons>
                    <ModalButton type="button" onClick={() => setShowPasswordModal(false)}>
                      취소
                    </ModalButton>
                    <ModalButton $primary type="submit" disabled={!passwordInput || passwordInput.length < 4}>
                      설정
                    </ModalButton>
                  </ModalButtons>
                </form>
              </>
            )}
          </Modal>
        </Overlay>
      )}
    </Container>
  );
}
