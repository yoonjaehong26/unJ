/**
 * 내 일정 페이지
 */
"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const Container = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 24px;
  font-size: 14px;
`;

const ShareSection = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const ShareTitle = styled.h2`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
`;

const ShareLinkBox = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ShareInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
`;

const CopyButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }
`;

const EventsSection = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EventCard = styled(Link)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-primary);
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const EventName = styled.span`
  font-size: 15px;
  font-weight: 500;
`;

const EventMeta = styled.span`
  font-size: 13px;
  color: var(--text-muted);
`;

const EmptyMessage = styled.p`
  color: var(--text-muted);
  font-size: 14px;
  text-align: center;
  padding: 32px;
`;

const Loading = styled.div`
  text-align: center;
  padding: 60px;
  color: var(--text-muted);
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 60px;
  color: var(--text-muted);
`;

export default function MySchedulePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchedule() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/users/${user._id}/schedule`);
        if (res.ok) {
          const data = await res.json();
          setSchedule(data);
        }
      } catch (error) {
        console.error("Failed to load schedule:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadSchedule();
    }
  }, [user, authLoading]);

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/share/${user._id}`;
    navigator.clipboard.writeText(shareUrl);
    alert("공유 링크가 복사되었습니다!");
  };

  if (authLoading || loading) {
    return <Loading>불러오는 중...</Loading>;
  }

  if (!user) {
    return (
      <Container>
        <LoginPrompt>
          로그인이 필요합니다.
        </LoginPrompt>
      </Container>
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Container>
      <Title>{user.name}님의 일정</Title>
      <Subtitle>참가한 이벤트와 나의 가용시간을 확인하세요</Subtitle>

      <ShareSection>
        <ShareTitle>일정 공유하기</ShareTitle>
        <ShareLinkBox>
          <ShareInput
            type="text"
            readOnly
            value={`${typeof window !== "undefined" ? window.location.origin : ""}/share/${user._id}`}
          />
          <CopyButton onClick={handleCopyLink}>링크 복사</CopyButton>
        </ShareLinkBox>
      </ShareSection>

      <EventsSection>
        <SectionTitle>참가한 이벤트</SectionTitle>
        {schedule?.schedule?.length === 0 ? (
          <EmptyMessage>아직 참가한 이벤트가 없습니다</EmptyMessage>
        ) : (
          <EventList>
            {schedule?.schedule?.map((event) => (
              <EventCard key={event.eventId} href={`/${event.eventId}`}>
                <EventName>{event.eventName}</EventName>
                <EventMeta>
                  {event.dates?.length > 0 && (
                    <>
                      {formatDate(event.dates[0])} ~{" "}
                      {formatDate(event.dates[event.dates.length - 1])}
                    </>
                  )}
                </EventMeta>
              </EventCard>
            ))}
          </EventList>
        )}
      </EventsSection>
    </Container>
  );
}
