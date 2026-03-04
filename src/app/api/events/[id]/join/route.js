/**
 * 이벤트 참가 API (When2Meet 방식)
 * 이름으로 참가자를 식별하고, 비밀번호가 설정된 경우 검증
 */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, password } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "이름은 필수입니다" }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("unj");

    // 해당 이벤트에서 같은 이름의 참가자 조회
    const existing = await db.collection("participants").findOne({
      eventId: new ObjectId(id),
      name: name.trim(),
    });

    // 참가자가 없으면 새로 생성
    if (!existing) {
      const newParticipant = {
        eventId: new ObjectId(id),
        name: name.trim(),
        password: null,
        availability: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("participants").insertOne(newParticipant);

      return NextResponse.json({
        status: "ok",
        participantId: result.insertedId.toString(),
        name: name.trim(),
        availability: [],
        hasPassword: false,
      });
    }

    // 참가자가 있고 비밀번호가 없으면 바로 접근 허용
    if (!existing.password) {
      return NextResponse.json({
        status: "ok",
        participantId: existing._id.toString(),
        name: existing.name,
        availability: existing.availability || [],
        hasPassword: false,
      });
    }

    // 참가자가 있고 비밀번호가 있는데, 비밀번호를 제공하지 않은 경우
    if (!password) {
      return NextResponse.json({
        status: "password_required",
        message: "이 이름은 비밀번호가 설정되어 있습니다",
      });
    }

    // 비밀번호 검증
    const isValid = await bcrypt.compare(password, existing.password);
    if (!isValid) {
      return NextResponse.json(
        { status: "error", message: "비밀번호가 일치하지 않습니다" },
        { status: 401 }
      );
    }

    // 비밀번호 일치 → 접근 허용
    return NextResponse.json({
      status: "ok",
      participantId: existing._id.toString(),
      name: existing.name,
      availability: existing.availability || [],
      hasPassword: true,
    });
  } catch (error) {
    console.error("Join error:", error);
    return NextResponse.json({ error: "참가 실패" }, { status: 500 });
  }
}
