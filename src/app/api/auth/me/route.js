/**
 * 현재 사용자 정보 API
 */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const client = await clientPromise;
    const db = client.db("unj");

    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        username: user.username,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ user: null });
  }
}

