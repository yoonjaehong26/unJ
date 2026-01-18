/**
 * 회원가입 API
 */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword, createToken, createAuthCookie } from "@/lib/auth";

// 아이디 유효성 검사 (영문, 숫자, 밑줄만 허용 - 인젝션 방지)
function isValidUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password, name } = body;

    // 유효성 검사
    if (!username || !password || !name) {
      return NextResponse.json(
        { error: "아이디, 비밀번호, 이름은 필수입니다" },
        { status: 400 }
      );
    }

    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: "아이디는 3~20자의 영문, 숫자, 밑줄만 사용할 수 있습니다" },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: "비밀번호는 4자 이상이어야 합니다" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("unj");

    // 아이디 중복 확인
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용 중인 아이디입니다" },
        { status: 400 }
      );
    }

    // 비밀번호 해싱 후 사용자 생성
    const hashedPassword = await hashPassword(password);
    const result = await db.collection("users").insertOne({
      username,
      password: hashedPassword,
      name: name.trim(),
      createdAt: new Date(),
    });

    // JWT 토큰 생성
    const token = await createToken(result.insertedId.toString());
    const cookie = createAuthCookie(token);

    const response = NextResponse.json({
      user: {
        _id: result.insertedId.toString(),
        username,
        name: name.trim(),
      },
    });

    response.cookies.set(cookie);
    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "회원가입에 실패했습니다" },
      { status: 500 }
    );
  }
}

