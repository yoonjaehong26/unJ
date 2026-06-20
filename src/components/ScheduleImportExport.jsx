"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import AvailabilityGrid from "./AvailabilityGrid";
import { loadMySchedule, importToEvent, exportFromEvent } from "@/lib/mySchedule";
import { getVisitedEventSchedules } from "@/lib/visitedEvents";

const FAB = styled.button`
  position: fixed;
  bottom: 24px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
  }

  &:active {
    transform: scale(0.96);
  }

  @media (max-width: 768px) {
    bottom: 20px;
    right: 16px;
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px 16px;

  @media (max-width: 480px) {
    align-items: flex-end;
    padding: 0;
  }
`;

const Modal = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 20px;
  width: 380px;
  max-width: 100%;

  @media (max-width: 480px) {
    border-radius: 20px 20px 0 0;
    width: 100%;
    padding: 20px 16px 28px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
`;

const TabRow = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Tab = styled.button`
  flex-shrink: 0;
  padding: 5px 12px;
  border: 1px solid ${(p) => (p.$active ? "var(--accent)" : "var(--border-subtle)")};
  border-radius: 20px;
  background: ${(p) => (p.$active ? "rgba(76,175,80,0.12)" : "transparent")};
  color: ${(p) => (p.$active ? "var(--accent)" : "var(--text-muted)")};
  font-size: 12px;
  font-weight: ${(p) => (p.$active ? "600" : "400")};
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`;

const PreviewScaler = styled.div`
  zoom: 0.65;
  margin-bottom: 14px;
  border-radius: 10px;
  overflow: hidden;
  max-height: 210px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;

  /* AvailabilityGrid Container 의 border-radius 덮어쓰기 */
  > div {
    border-radius: 0;
  }
`;

const EmptyBox = styled.div`
  padding: 28px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const CancelButton = styled.button`
  padding: 9px 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: none;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;

  &:hover { border-color: var(--text-muted); }
`;

const ActionButton = styled.button`
  padding: 9px 16px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;

  &:hover:not(:disabled) { opacity: 0.9; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const SuccessMsg = styled.div`
  text-align: center;
  padding: 24px 0 10px;
  font-size: 14px;
  color: var(--accent);
  font-weight: 500;
`;

export default function ScheduleImportExport({ event, eventId, myAvailability, onImport }) {
  const [open, setOpen] = useState(false);
  const [myAvail, setMyAvail] = useState([]);
  const [otherEvents, setOtherEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    const { availability } = loadMySchedule();
    setMyAvail(availability || []);
    setOtherEvents(getVisitedEventSchedules(eventId));
    setSelectedTab(0);
    setDone(false);
  }, [open, eventId]);

  // sources: 다른 방들 + 내 일정(있으면)
  const sources = [
    ...otherEvents.map((e) => ({ type: "event", label: e.eventName || e.eventId, item: e })),
    ...(myAvail.length > 0 ? [{ type: "personal", label: "내 일정" }] : []),
  ];

  const current = sources[selectedTab] ?? null;

  const applyAndClose = (newAvailability) => {
    onImport(newAvailability);
    setDone(true);
    setTimeout(() => setOpen(false), 700);
  };

  const handleApply = () => {
    if (!current) return;

    if (current.type === "personal") {
      const newAvailability = importToEvent(
        myAvail,
        event.dates,
        event.startTime,
        event.endTime,
        myAvailability,
        "replace"
      );
      applyAndClose(newAvailability);
    } else {
      const { item } = current;
      const dayOfWeekBased = exportFromEvent(item.schedule.availability, item.schedule.dates);
      const newAvailability = importToEvent(
        dayOfWeekBased,
        event.dates,
        event.startTime,
        event.endTime,
        myAvailability,
        "replace"
      );
      applyAndClose(newAvailability);
    }
  };

  const renderPreview = () => {
    if (!current) return null;

    if (current.type === "personal") {
      return (
        <AvailabilityGrid
          mode="personal"
          startTime={event.startTime}
          endTime={event.endTime}
          availability={myAvail}
          readOnly
          hideHeader
        />
      );
    }

    const { item } = current;
    return (
      <AvailabilityGrid
        dates={item.schedule.dates}
        startTime={item.schedule.startTime}
        endTime={item.schedule.endTime}
        availability={item.schedule.availability}
        readOnly
        hideHeader
      />
    );
  };

  return (
    <>
      <FAB onClick={() => setOpen(true)} title="내 일정 가져오기">
        📋
      </FAB>

      {open && (
        <Overlay onClick={() => setOpen(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>일정 가져오기</ModalTitle>
              <CloseButton onClick={() => setOpen(false)}>✕</CloseButton>
            </ModalHeader>

            {done ? (
              <SuccessMsg>✓ 적용됐습니다!</SuccessMsg>
            ) : sources.length === 0 ? (
              <>
                <EmptyBox>
                  저장된 일정이 없습니다.<br />
                  홈페이지에서 내 일정을 등록하거나<br />
                  다른 방에 먼저 참가해 보세요.
                </EmptyBox>
                <BottomRow>
                  <CancelButton onClick={() => setOpen(false)}>닫기</CancelButton>
                </BottomRow>
              </>
            ) : (
              <>
                {sources.length > 1 && (
                  <TabRow>
                    {sources.map((s, i) => (
                      <Tab
                        key={i}
                        $active={selectedTab === i}
                        onClick={() => setSelectedTab(i)}
                      >
                        {s.label}
                      </Tab>
                    ))}
                  </TabRow>
                )}

                <PreviewScaler>
                  {renderPreview()}
                </PreviewScaler>

                <BottomRow>
                  <CancelButton onClick={() => setOpen(false)}>취소</CancelButton>
                  <ActionButton onClick={handleApply}>가져오기</ActionButton>
                </BottomRow>
              </>
            )}
          </Modal>
        </Overlay>
      )}
    </>
  );
}
