/**
 * 참가자 삭제 API (방장 전용)
 */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(request, { params }) {
  try {
    const { id, participantId } = await params;
    const { adminToken } = await request.json();

    if (!adminToken) {
      return NextResponse.json({ error: "권한 없음" }, { status: 401 });
    }

    if (!ObjectId.isValid(id) || !ObjectId.isValid(participantId)) {
      return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("unj");

    const event = await db.collection("events").findOne({
      _id: new ObjectId(id),
      adminToken,
    });

    if (!event) {
      return NextResponse.json({ error: "권한 없음" }, { status: 401 });
    }

    const result = await db.collection("participants").deleteOne({
      _id: new ObjectId(participantId),
      eventId: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "참가자를 찾을 수 없습니다" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Participant delete error:", error);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
