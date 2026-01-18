/**
 * 공유된 일정 보기 페이지
 */
"use client";

import { useState, useEffect, use } from "react";
import styled from "styled-components";
import Link from "next/link";

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

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EventCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 20px;
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const EventName = styled.h3`
  font-size: 16px;
  font-weight: 500;
`;

const EventLink = styled(Link)`
  font-size: 13px;
  color: var(--accent);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const DateRange = styled.p`
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
`;

const AvailabilityLabel = styled.p`
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
`;

const TimeSlots = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const TimeSlot = styled.span`
  padding: 4px 8px;
  background: var(--accent);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0.8;
`;

const NoAvailability = styled.span`
  font-size: 13px;
  color: var(--text-muted);
`;

const Loading = styled.div`
  text-align: center;
  padding: 60px;
  color: var(--text-muted);
`;

const NotFound = styled.div`
  text-align: center;
  padding: 60px;
  color: var(--text-muted);
`;

export default function SharePage({ params }) {
  const { userId } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const res = await fetch(`/api/users/${userId}/schedule`);
        if (res.ok) {
          setData(await res.json());
        } else {
          setError("사용자를 찾을 수 없습니다");
        }
      } catch (error) {
        setError("일정을 불러오는데 실패했습니다");
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, [userId]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const formatSlot = (slot) => {
    // slot format: "2026-01-20T09:00" etc
    const [datePart, timePart] = slot.split("T");
    const date = new Date(datePart);
    const hour = parseInt(timePart.split(":")[0]);
    return `${date.getMonth() + 1}/${date.getDate()} ${hour}시`;
  };

  if (loading) {
    return <Loading>불러오는 중...</Loading>;
  }

  if (error || !data) {
    return <NotFound>{error || "일정을 찾을 수 없습니다"}</NotFound>;
  }

  return (
    <Container>
      <Title>{data.user.name}님의 일정</Title>
      <Subtitle>참가 중인 이벤트와 가능한 시간을 확인하세요</Subtitle>

      {data.schedule.length === 0 ? (
        <NotFound>공개된 일정이 없습니다</NotFound>
      ) : (
        <EventList>
          {data.schedule.map((event) => (
            <EventCard key={event.eventId}>
              <EventHeader>
                <EventName>{event.eventName}</EventName>
                <EventLink href={`/${event.eventId}`}>이벤트 보기 →</EventLink>
              </EventHeader>

              <DateRange>
                {event.dates?.length > 0 && (
                  <>
                    {formatDate(event.dates[0])} ~ {formatDate(event.dates[event.dates.length - 1])}
                    {" | "}
                    {event.startTime}:00 - {event.endTime}:00
                  </>
                )}
              </DateRange>

              <AvailabilityLabel>가능한 시간</AvailabilityLabel>
              {event.availability?.length > 0 ? (
                <TimeSlots>
                  {event.availability.slice(0, 10).map((slot, idx) => (
                    <TimeSlot key={idx}>{formatSlot(slot)}</TimeSlot>
                  ))}
                  {event.availability.length > 10 && (
                    <TimeSlot style={{ opacity: 0.6 }}>
                      +{event.availability.length - 10}개 더
                    </TimeSlot>
                  )}
                </TimeSlots>
              ) : (
                <NoAvailability>등록된 가능 시간 없음</NoAvailability>
              )}
            </EventCard>
          ))}
        </EventList>
      )}
    </Container>
  );
}
