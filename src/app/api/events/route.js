/**
 * 이벤트 API - POST (생성), GET (조회)
 */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, dates, startTime, endTime } = body;

    if (!name || !dates?.length) {
      return NextResponse.json(
        { error: "이름과 날짜는 필수입니다" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("unj");

    const event = {
      name,
      dates: dates.map((d) => new Date(d)),
      startTime: startTime || 9,
      endTime: endTime || 18,
      createdAt: new Date(),
    };

    const result = await db.collection("events").insertOne(event);

    return NextResponse.json({ eventId: result.insertedId.toString() });
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json(
      { error: "이벤트 생성 실패" },
      { status: 500 }
    );
  }
}
