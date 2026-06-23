/**
 * 이벤트 페이지 (When2Meet 방식)
 */
"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import styled, { keyframes, css } from "styled-components";
import AvailabilityGrid from "@/components/AvailabilityGrid";
import GroupResultGrid from "@/components/GroupResultGrid";
import ScheduleImportExport from "@/components/ScheduleImportExport";
import { addVisitedEvent, saveEventSchedule } from "@/lib/visitedEvents";

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
  margin-bottom: 12px;
  gap: 12px;

  @media (max-width: 768px) {
    margin-bottom: 8px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const CopyButton = styled.button`
  padding: 10px 16px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;
  white-space: nowrap;

  &:hover {
    border-color: var(--text-muted);
  }

  &:active {
    background: var(--bg-tertiary);
  }
`;

const AdminPanel = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--accent);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const AdminPanelTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: ${(props) => (props.$open ? "12px" : "0")};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

const AdminRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
`;

const AdminLabel = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 60px;
`;

const AdminDayToggleRow = styled.div`
  display: flex;
  gap: 6px;
`;

const AdminDayBtn = styled.button`
  width: 34px;
  height: 34px;
  border: 1px solid ${(props) => (props.$selected ? "var(--accent)" : "var(--border-subtle)")};
  border-radius: 8px;
  background: ${(props) => (props.$selected ? "var(--accent)" : "transparent")};
  color: ${(props) => (props.$selected ? "white" : "var(--text-secondary)")};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--accent);
  }
`;

const AdminSaveRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
`;

const AdminSaveBtn = styled.button`
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AdminSaveMsg = styled.span`
  font-size: 12px;
  color: ${(props) => (props.$error ? "#e74c3c" : "var(--accent)")};
`;

const AdminNote = styled.p`
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 8px;
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

const shakeAndPulse = keyframes`
  0%   { transform: translateX(0);    border-color: #ef5350; box-shadow: 0 0 0 0 rgba(239,83,80,0.5); }
  15%  { transform: translateX(-7px); border-color: #ef5350; }
  30%  { transform: translateX(7px);  border-color: #ef5350; }
  45%  { transform: translateX(-5px); border-color: #ef5350; }
  60%  { transform: translateX(5px);  border-color: #ef5350; }
  75%  { transform: translateX(-3px); border-color: #ef5350; box-shadow: 0 0 0 6px rgba(239,83,80,0); }
  100% { transform: translateX(0);    border-color: #ef5350; box-shadow: 0 0 0 0 rgba(239,83,80,0); }
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

  ${(props) => props.$shake && css`animation: ${shakeAndPulse} 0.5s ease;`}

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
  position: relative;
  padding: 4px 10px;
  background: ${(props) => props.$hidden ? "transparent" : props.$activeColor ? props.$activeColor : "var(--bg-secondary)"};
  color: ${(props) => props.$hidden ? "var(--text-muted)" : props.$activeColor ? "white" : "var(--text-primary)"};
  border: 1px solid ${(props) => props.$hidden ? "var(--border-subtle)" : props.$activeColor ? props.$activeColor : "transparent"};
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  text-decoration: ${(props) => props.$hidden ? "line-through" : "none"};

  &:hover {
    border-color: ${(props) => props.$activeColor || "var(--accent)"};
  }
`;

const HideToggle = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;

  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  line-height: 1;
`;

const DeleteBadge = styled.span`
  position: absolute;
  top: -6px;
  left: -6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid #ef5350;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;

  font-size: 11px;
  font-weight: 600;
  color: #ef5350;
  line-height: 1;
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

// 모바일 그리드 토글
const MobileGridToggle = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    border-bottom: 1px solid var(--border-subtle);
    margin-bottom: 16px;
  }
`;

const ToggleTab = styled.button`
  padding: 10px 20px;
  border: none;
  border-bottom: 2px solid ${(props) => (props.$active ? "var(--accent)" : "transparent")};
  background: transparent;
  color: ${(props) => (props.$active ? "var(--accent)" : "var(--text-muted)")};
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? "600" : "400")};
  cursor: pointer;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
`;

const MobileGrid = styled.div`
  min-width: 0;

  @media (max-width: 768px) {
    display: ${(props) => (props.$visible ? "block" : "none")};
  }
`;

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function getSelectedDaysFromDates(dates) {
  const selected = [false, false, false, false, false, false, false];
  (dates || []).forEach((d) => {
    const dow = new Date(d).getDay(); // 0=Sun
    const idx = dow === 0 ? 6 : dow - 1; // 0=Mon...6=Sun
    selected[idx] = true;
  });
  return selected;
}

function getDatesFromSelectedDays(selectedDays, existingDates) {
  if (!existingDates?.length) return [];
  const refDate = new Date(existingDates[0]);
  const dow = refDate.getDay();
  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() - (dow === 0 ? 6 : dow - 1));
  return selectedDays
    .map((selected, idx) => {
      if (!selected) return null;
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return d.toISOString();
    })
    .filter(Boolean);
}

export default function EventPage({ params }) {
  const { eventId } = use(params);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // 참가 상태
  const [nameInput, setNameInput] = useState("");
  const [joined, setJoined] = useState(false);
  const [nameShake, setNameShake] = useState(false);
  const nameInputRef = useRef(null);
  const [joinedName, setJoinedName] = useState("");       // 실명 (localStorage 복원용)
  const [myDisplayName, setMyDisplayName] = useState(""); // UI 표시용 이름 (익명 모드 시 별칭 포함)
  const [participantId, setParticipantId] = useState(null);
  const [hasPassword, setHasPassword] = useState(false);

  // 비밀번호 모달
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalMode, setPasswordModalMode] = useState("verify");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [pendingJoinName, setPendingJoinName] = useState("");

  const [myAvailability, setMyAvailability] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedAdmin, setCopiedAdmin] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [hiddenNames, setHiddenNames] = useState(new Set());
  const [activeGrid, setActiveGrid] = useState("availability");
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  // 방장 관련
  const [adminToken, setAdminToken] = useState(null);
  const [adminStartTime, setAdminStartTime] = useState(null);
  const [adminEndTime, setAdminEndTime] = useState(null);
  const [adminSelectedDays, setAdminSelectedDays] = useState(null);
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminSaveMsg, setAdminSaveMsg] = useState(null); // { text, error }

  const PARTICIPANT_COLORS = [
    '#4CAF50', '#2196F3', '#FF7043', '#E91E63',
    '#9C27B0', '#00BCD4', '#FF9800', '#607D8B',
    '#8BC34A', '#F06292', '#26A69A', '#7986CB',
    '#FFA726', '#AB47BC', '#29B6F6', '#EF5350',
  ];

  // URL에서 admin 토큰 읽기
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("admin");
    if (token) setAdminToken(token);
  }, []);

  // event 로드 후 admin 초기값 설정
  useEffect(() => {
    if (event && adminToken && adminSelectedDays === null) {
      setAdminStartTime(event.startTime);
      setAdminEndTime(event.endTime);
      setAdminSelectedDays(getSelectedDaysFromDates(event.dates));
    }
  }, [event, adminToken, adminSelectedDays]);

  const toggleSelectedParticipant = (p) => {
    setSelectedParticipants((prev) => {
      const isSelected = prev.some((sp) => sp._id === p._id);
      if (isSelected) return prev.filter((sp) => sp._id !== p._id);
      return [...prev, p];
    });
  };

  const toggleHidden = (id) => {
    setHiddenNames((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectedParticipants((prev) => prev.filter((sp) => sp._id !== id));
  };

  const visibleParticipants = participants.filter((p) => !hiddenNames.has(p._id));

  const handleDeleteParticipant = async (p) => {
    if (!adminToken) return;
    if (!window.confirm(`'${p.name}' 참가자를 삭제할까요? 되돌릴 수 없습니다.`)) return;

    try {
      const res = await fetch(`/api/events/${eventId}/participants/${p._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminToken }),
      });

      if (res.ok) {
        setParticipants((prev) => prev.filter((x) => x._id !== p._id));
        setSelectedParticipants((prev) => prev.filter((sp) => sp._id !== p._id));
        setHiddenNames((prev) => {
          const next = new Set(prev);
          next.delete(p._id);
          return next;
        });
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "삭제 실패");
      }
    } catch {
      alert("삭제 실패");
    }
  };

  const saveTimeoutRef = useRef(null);
  const pendingAvailabilityRef = useRef(null);

  const buildParticipantsUrl = useCallback((token, pId) => {
    const params = new URLSearchParams();
    if (token) params.set("adminToken", token);
    if (pId) params.set("participantId", pId);
    const qs = params.toString();
    return `/api/events/${eventId}/participants${qs ? `?${qs}` : ""}`;
  }, [eventId]);

  // 이벤트 및 참가자 로드
  useEffect(() => {
    async function load() {
      try {
        const token = new URLSearchParams(window.location.search).get("admin");
        const [eventRes, participantsRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch(buildParticipantsUrl(token, null)),
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
  }, [eventId, buildParticipantsUrl]);

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
        const res = await fetch(buildParticipantsUrl(adminToken, participantId));
        if (res.ok) {
          const data = await res.json();
          if (participantId) {
            setParticipants((prev) => {
              const others = data.filter((p) => p._id !== participantId);
              const me = prev.find((p) => p._id === participantId);
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
  }, [eventId, adminToken, participantId, buildParticipantsUrl]);

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
        setMyDisplayName(data.displayName || data.name);
        setParticipantId(data.participantId);
        setHasPassword(data.hasPassword);
        setMyAvailability(data.availability || []);
        setShowPasswordModal(false);

        // 참가자 목록을 participantId로 다시 조회해서 최신 displayName 반영
        fetch(buildParticipantsUrl(adminToken, data.participantId))
          .then((r) => r.ok ? r.json() : null)
          .then((fresh) => {
            if (fresh) setParticipants(fresh);
          })
          .catch(() => {});

        localStorage.setItem(
          `unj-participant-${eventId}`,
          JSON.stringify({ name: data.name })
        );
      }
    } catch (error) {
      console.error("Join error:", error);
    }
  }, [eventId, nameInput]);

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
          const others = prev.filter((p) => p._id !== participantId);
          const me = prev.find((p) => p._id === participantId);
          const myData = { ...(me || {}), _id: participantId, availability };
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

  // 참가 완료 시 "최근 참가한 방" 목록에 기록
  useEffect(() => {
    if (joined && event) {
      addVisitedEvent({ eventId, eventName: event.name, adminToken });
    }
  }, [joined, event, eventId, adminToken]);

  // 내 가용시간을 방별 일정으로 저장 (다른 방에서 "일정 가져오기"에 사용)
  useEffect(() => {
    if (joined && event) {
      saveEventSchedule(eventId, {
        eventName: event.name,
        availability: myAvailability,
        startTime: event.startTime,
        endTime: event.endTime,
        dates: event.dates,
      });
    }
  }, [joined, event, eventId, myAvailability]);

  const handleAvailabilityChange = (newAvailability) => {
    setMyAvailability(newAvailability);
    saveAvailabilityDebounced(newAvailability);
  };

  const handleReadOnlyGridClick = () => {
    setNameShake(true);
    nameInputRef.current?.focus();
    setTimeout(() => setNameShake(false), 500);
  };

  const copyText = async (text, setFlag) => {
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

  const handleCopyShareLink = () => copyText(window.location.origin + "/" + eventId, setCopied);
  const handleCopyAdminLink = () => copyText(window.location.href, setCopiedAdmin);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    handleJoin();
  };

  const handleSignOut = () => {
    setJoined(false);
    setJoinedName("");
    setMyDisplayName("");
    setParticipantId(null);
    setHasPassword(false);
    setMyAvailability([]);
    setNameInput("");
    localStorage.removeItem(`unj-participant-${eventId}`);
  };

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

  const handleVerifyPassword = () => {
    handleJoin(pendingJoinName, passwordInput);
  };

  const openSetPasswordModal = () => {
    setPasswordModalMode("set");
    setPasswordInput("");
    setPasswordError("");
    setShowPasswordModal(true);
  };

  const handleAdminSave = async () => {
    if (!adminSelectedDays?.some(Boolean)) {
      setAdminSaveMsg({ text: "최소 1일을 선택해야 합니다", error: true });
      return;
    }
    if (adminStartTime >= adminEndTime) {
      setAdminSaveMsg({ text: "시작 시간은 종료 시간보다 빨라야 합니다", error: true });
      return;
    }

    setAdminSaving(true);
    setAdminSaveMsg(null);

    try {
      const newDates = getDatesFromSelectedDays(adminSelectedDays, event.dates);
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminToken,
          startTime: adminStartTime,
          endTime: adminEndTime,
          dates: newDates,
        }),
      });

      if (res.ok) {
        setEvent((prev) => ({
          ...prev,
          startTime: adminStartTime,
          endTime: adminEndTime,
          dates: newDates,
        }));
        setAdminSaveMsg({ text: "저장됨", error: false });
        setTimeout(() => setAdminSaveMsg(null), 2000);
      } else {
        const data = await res.json();
        setAdminSaveMsg({ text: data.error || "저장 실패", error: true });
      }
    } catch {
      setAdminSaveMsg({ text: "저장 실패", error: true });
    } finally {
      setAdminSaving(false);
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
      <PageHeader>
        <Title>
          {event.name}
          {event.anonymous && (
            <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: "var(--text-muted)", verticalAlign: "middle" }}>
              🐾 익명
            </span>
          )}
        </Title>
        <HeaderButtons>
          {adminToken && (
            <CopyButton onClick={handleCopyAdminLink}>
              {copiedAdmin ? "✓ 방장 링크 복사됨" : "방장 링크 복사"}
            </CopyButton>
          )}
          <CopyButton onClick={handleCopyShareLink}>
            {copied ? "✓ 복사됨" : "공유 링크 복사"}
          </CopyButton>
        </HeaderButtons>
      </PageHeader>

      {adminToken && adminSelectedDays && (
        <AdminPanel>
          <AdminPanelTitle $open={adminPanelOpen} onClick={() => setAdminPanelOpen((v) => !v)}>
            방장 설정
            <span style={{
              fontSize: 10,
              display: "inline-block",
              transform: adminPanelOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}>▼</span>
          </AdminPanelTitle>

          {adminPanelOpen && (
            <>
              <AdminRow>
                <AdminLabel>시간 범위</AdminLabel>
                <TimeSelect
                  value={adminStartTime}
                  onChange={(e) => setAdminStartTime(Number(e.target.value))}
                >
                  {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                    <option key={h} value={h}>{`${h.toString().padStart(2, "0")}:00`}</option>
                  ))}
                </TimeSelect>
                <span style={{ color: "var(--text-muted)", fontSize: 14 }}>~</span>
                <TimeSelect
                  value={adminEndTime}
                  onChange={(e) => setAdminEndTime(Number(e.target.value))}
                >
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>{`${h.toString().padStart(2, "0")}:00`}</option>
                  ))}
                </TimeSelect>
              </AdminRow>

              <AdminRow>
                <AdminLabel>요일</AdminLabel>
                <AdminDayToggleRow>
                  {DAY_LABELS.map((day, idx) => (
                    <AdminDayBtn
                      key={idx}
                      type="button"
                      $selected={adminSelectedDays[idx]}
                      onClick={() =>
                        setAdminSelectedDays((prev) => {
                          const next = [...prev];
                          next[idx] = !next[idx];
                          return next;
                        })
                      }
                    >
                      {day}
                    </AdminDayBtn>
                  ))}
                </AdminDayToggleRow>
              </AdminRow>

              <AdminSaveRow>
                <AdminSaveBtn onClick={handleAdminSave} disabled={adminSaving}>
                  {adminSaving ? "저장 중..." : "설정 저장"}
                </AdminSaveBtn>
                {adminSaveMsg && (
                  <AdminSaveMsg $error={adminSaveMsg.error}>{adminSaveMsg.text}</AdminSaveMsg>
                )}
              </AdminSaveRow>

              {participants.length > 0 && (
                <AdminNote>
                  ※ 참가자가 있는 상태에서 날짜를 변경하면 기존 일정 데이터가 맞지 않을 수 있습니다.
                </AdminNote>
              )}
            </>
          )}
        </AdminPanel>
      )}

      <NameSection>
        {!joined ? (
          <>
            <Label>이름을 입력하여 참가하세요</Label>
            {event.anonymous && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, marginTop: -2 }}>
                🌆 익명 모드 — 다른 참가자에게 이름 대신 도시 별칭으로 표시됩니다. 방장에게는 실명이 공개됩니다.
              </p>
            )}
            <form onSubmit={handleNameSubmit}>
              <NameInputRow>
                <NameInput
                  ref={nameInputRef}
                  type="text"
                  placeholder="이름"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  $shake={nameShake}
                  autoFocus
                />
                <JoinButton type="submit" disabled={!nameInput.trim()}>
                  참가
                </JoinButton>
              </NameInputRow>
            </form>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
              비밀번호를 설정하지 않으면 같은 이름으로 누구든 참가할 수 있습니다.
            </p>
          </>
        ) : (
          <>
            <Label>
              참가자
              {saving && <SaveStatus>저장 중...</SaveStatus>}
            </Label>
            <NameInputRow>
              <JoinedName>{myDisplayName || joinedName}</JoinedName>
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
        <Label>
          참가자 ({participants.length}명)
          {selectedParticipants.length > 0 && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "var(--text-muted)" }}>
              — {selectedParticipants.map((sp) => sp.name).join(", ")} 일정 보는 중
            </span>
          )}

        </Label>
        <ParticipantList>
          {participants.length === 0 ? (
            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              아직 참가자가 없습니다
            </span>
          ) : (
            participants.map((p, index) => {
              const selIdx = selectedParticipants.findIndex((sp) => sp._id === p._id);
              const activeColor = !hiddenNames.has(p._id) && selIdx !== -1
                ? PARTICIPANT_COLORS[selIdx % PARTICIPANT_COLORS.length]
                : null;
              return (
                <ParticipantTag
                  key={p._id || index}
                  $activeColor={activeColor}
                  $hidden={hiddenNames.has(p._id)}
                  data-hidden={hiddenNames.has(p._id)}
                  onClick={() => !hiddenNames.has(p._id) && toggleSelectedParticipant(p)}
                >
                  {p.name}
                  <HideToggle
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHidden(p._id);
                    }}
                  >
                    {hiddenNames.has(p._id) ? "+" : "−"}
                  </HideToggle>
                  {adminToken && (
                    <DeleteBadge
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteParticipant(p);
                      }}
                      title="참가자 삭제 (방장)"
                    >
                      ×
                    </DeleteBadge>
                  )}
                </ParticipantTag>
              );
            })
          )}
        </ParticipantList>
      </Participants>

      <MobileGridToggle>
        <ToggleTab $active={activeGrid === "availability"} onClick={() => setActiveGrid("availability")}>
          내 일정
        </ToggleTab>
        <ToggleTab $active={activeGrid === "group"} onClick={() => setActiveGrid("group")}>
          그룹 결과
        </ToggleTab>
      </MobileGridToggle>

      <GridsContainer>
        <MobileGrid $visible={activeGrid === "availability"}>
          <AvailabilityGrid
            dates={event.dates}
            startTime={event.startTime}
            endTime={event.endTime}
            availability={myAvailability}
            onChange={handleAvailabilityChange}
            readOnly={!joined}
            onReadOnlyClick={handleReadOnlyGridClick}
          />
        </MobileGrid>

        <MobileGrid $visible={activeGrid === "group"}>
          <GroupResultGrid
            dates={event.dates}
            startTime={event.startTime}
            endTime={event.endTime}
            participants={visibleParticipants}
            selectedParticipants={selectedParticipants.map((sp, idx) => ({
              ...sp,
              color: PARTICIPANT_COLORS[idx % PARTICIPANT_COLORS.length],
            }))}
          />
        </MobileGrid>
      </GridsContainer>

      {joined && (
        <ScheduleImportExport
          event={event}
          eventId={eventId}
          myAvailability={myAvailability}
          onImport={handleAvailabilityChange}
        />
      )}

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
