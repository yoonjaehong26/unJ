/**
 * 로그인 API
 */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyPassword, createToken, createAuthCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "아이디와 비밀번호를 입력하세요" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("unj");

    // 사용자 찾기
    const user = await db.collection("users").findOne({ username });
    if (!user) {
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않습니다" },
        { status: 401 }
      );
    }

    // 비밀번호 확인
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않습니다" },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const token = await createToken(user._id.toString());
    const cookie = createAuthCookie(token);

    const response = NextResponse.json({
      user: {
        _id: user._id.toString(),
        username: user.username,
        name: user.name,
      },
    });

    response.cookies.set(cookie);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "로그인에 실패했습니다" },
      { status: 500 }
    );
  }
}

