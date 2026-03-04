/**
 * 참가자 API
 */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// 참가자 목록 조회
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("unj");

    const participants = await db.collection("participants")
      .find({ eventId: new ObjectId(id) })
      .toArray();

    return NextResponse.json(
      participants.map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        availability: p.availability,
        hasPassword: !!p.password,
      }))
    );
  } catch (error) {
    console.error("Participants fetch error:", error);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

// 참가자 추가/업데이트
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, availability } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "이름은 필수입니다" }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("unj");

    // 같은 이름이 있으면 업데이트, 없으면 생성
    const updateDoc = {
      $set: {
        availability: availability || [],
        updatedAt: new Date(),
      },
      $setOnInsert: {
        eventId: new ObjectId(id),
        name: name.trim(),
        password: null,
        createdAt: new Date(),
      },
    };

    const result = await db.collection("participants").findOneAndUpdate(
      { eventId: new ObjectId(id), name: name.trim() },
      updateDoc,
      { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json({
      _id: result._id.toString(),
      name: result.name,
      availability: result.availability,
      hasPassword: !!result.password,
    });
  } catch (error) {
    console.error("Participant save error:", error);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
