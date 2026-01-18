/**
 * 사용자 일정 API - 참가한 모든 이벤트의 가용시간 통합
 */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("unj");

    // 사용자 정보 조회
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
    }

    // 해당 사용자가 참가한 모든 참가 기록 조회
    const participations = await db.collection("participants")
      .find({ userId: new ObjectId(userId) })
      .toArray();

    // 이벤트 ID 목록
    const eventIds = participations.map((p) => p.eventId);

    // 이벤트 정보 조회
    const events = await db.collection("events")
      .find({ _id: { $in: eventIds } })
      .toArray();

    // 이벤트와 참가 정보 결합
    const schedule = events.map((event) => {
      const participation = participations.find(
        (p) => p.eventId.toString() === event._id.toString()
      );
      return {
        eventId: event._id.toString(),
        eventName: event.name,
        dates: event.dates,
        startTime: event.startTime,
        endTime: event.endTime,
        availability: participation?.availability || [],
      };
    });

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
      },
      schedule,
    });
  } catch (error) {
    console.error("Schedule fetch error:", error);
    return NextResponse.json({ error: "일정 조회 실패" }, { status: 500 });
  }
}
