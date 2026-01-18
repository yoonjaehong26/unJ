/**
 * 이벤트 API - [id] 조회
 */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("unj");

    const event = await db.collection("events").findOne({
      _id: new ObjectId(id),
    });

    if (!event) {
      return NextResponse.json({ error: "이벤트를 찾을 수 없습니다" }, { status: 404 });
    }

    return NextResponse.json({
      _id: event._id.toString(),
      name: event.name,
      dates: event.dates,
      startTime: event.startTime,
      endTime: event.endTime,
      createdAt: event.createdAt,
    });
  } catch (error) {
    console.error("Event fetch error:", error);
    return NextResponse.json({ error: "이벤트 조회 실패" }, { status: 500 });
  }
}
