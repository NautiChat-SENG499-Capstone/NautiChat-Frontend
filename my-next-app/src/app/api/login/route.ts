import { NextRequest, NextResponse } from "next/server";
import { users, User } from "../../../lib/users";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are both required." },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken." },
        { status: 409 }
      );
    }

    // Add new user to our “database”
    users.push({ username, password });
    return NextResponse.json(
      { message: "User created successfully." },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request data." },
      { status: 400 }
    );
  }
}
