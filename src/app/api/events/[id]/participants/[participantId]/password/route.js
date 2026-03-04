/**
 * 참가자 비밀번호 설정 API
 */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export async function POST(request, { params }) {
  try {
    const { id, participantId } = await params;
    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: "비밀번호는 4자 이상이어야 합니다" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id) || !ObjectId.isValid(participantId)) {
      return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("unj");

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.collection("participants").findOneAndUpdate(
      {
        _id: new ObjectId(participantId),
        eventId: new ObjectId(id),
      },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "참가자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: "ok", hasPassword: true });
  } catch (error) {
    console.error("Password set error:", error);
    return NextResponse.json({ error: "비밀번호 설정 실패" }, { status: 500 });
  }
}
