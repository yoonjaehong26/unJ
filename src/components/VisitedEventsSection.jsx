/**
 * 최근 참가한 방 목록 - 홈페이지용
 */
"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { getVisitedEvents } from "@/lib/visitedEvents";

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

const Badge = styled.span`
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
  padding: 12px 16px;
  background: var(--bg-card);
`;

const EventItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  margin-bottom: 8px;
  background: var(--bg-secondary);

  &:last-child {
    margin-bottom: 0;
  }
`;

const EventInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const EventName = styled.a`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: var(--accent);
  }
`;

const EventMeta = styled.div`
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
`;

const LinkButton = styled.button`
  flex-shrink: 0;
  padding: 5px 10px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`;

const AdminBadge = styled.span`
  display: inline-block;
  font-size: 11px;
  color: var(--accent);
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 4px;
  padding: 1px 6px;
  margin-right: 6px;
`;

export default function VisitedEventsSection() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    setEvents(getVisitedEvents());
  }, [open]);

  if (events.length === 0 && !open) {
    return null;
  }

  const copyLink = async (text, id) => {
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
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <Section>
      <SectionHeader $open={open} onClick={() => setOpen((v) => !v)}>
        <SectionTitle>
          🗂️ 최근 참가한 방
          {events.length > 0 && <Badge>{events.length}개</Badge>}
        </SectionTitle>
        <ToggleIcon $open={open}>▼</ToggleIcon>
      </SectionHeader>

      {open && (
        <Body>
          {events.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "8px 0" }}>
              참가한 방이 없습니다.
            </p>
          ) : (
            events.map((e) => {
              const shareUrl = `${origin}/${e.eventId}`;
              const adminUrl = e.adminToken ? `${origin}/${e.eventId}?admin=${e.adminToken}` : null;
              const adminCopyKey = `admin-${e.eventId}`;
              const shareCopyKey = `share-${e.eventId}`;

              return (
                <EventItem key={e.eventId}>
                  <EventInfo>
                    <EventName href={shareUrl}>
                      {e.adminToken && <AdminBadge>방장</AdminBadge>}
                      {e.eventName || e.eventId}
                    </EventName>
                    <EventMeta>{formatDate(e.joinedAt)} 참가</EventMeta>
                  </EventInfo>

                  {adminUrl && (
                    <LinkButton onClick={() => copyLink(adminUrl, adminCopyKey)}>
                      {copiedId === adminCopyKey ? "✓ 복사됨" : "방장 링크"}
                    </LinkButton>
                  )}
                  <LinkButton onClick={() => copyLink(shareUrl, shareCopyKey)}>
                    {copiedId === shareCopyKey ? "✓ 복사됨" : "공유 링크"}
                  </LinkButton>
                </EventItem>
              );
            })
          )}
        </Body>
      )}
    </Section>
  );
}
