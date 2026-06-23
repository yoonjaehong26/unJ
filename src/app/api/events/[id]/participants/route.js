/**
 * 참가자 API
 */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getAlias, getDisplayName } from "@/lib/cities";

// 참가자 목록 조회
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const adminToken = searchParams.get("adminToken");
    const participantId = searchParams.get("participantId");

    const client = await clientPromise;
    const db = client.db("unj");

    const event = await db.collection("events").findOne({ _id: new ObjectId(id) });
    if (!event) {
      return NextResponse.json({ error: "이벤트를 찾을 수 없습니다" }, { status: 404 });
    }

    const isAnonymous = !!event.anonymous;
    const isAdmin = isAnonymous && adminToken && adminToken === event.adminToken;

    const participants = await db.collection("participants")
      .find({ eventId: new ObjectId(id) })
      .toArray();

    return NextResponse.json(
      participants.map((p) => {
        if (!isAnonymous) {
          return {
            _id: p._id.toString(),
            name: p.name,
            availability: p.availability,
            hasPassword: !!p.password,
          };
        }

        const alias = getAlias(p.aliasIndex);
        const isMe = participantId && p._id.toString() === participantId;
        const showReal = isAdmin || isMe;

        return {
          _id: p._id.toString(),
          name: showReal ? getDisplayName(p.aliasIndex, p.name) : alias,
          availability: p.availability,
          hasPassword: !!p.password,
        };
      })
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
