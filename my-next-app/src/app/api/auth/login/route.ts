import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Mock login logic
  if (email === 'test@example.com' && password === 'password123') {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
}
