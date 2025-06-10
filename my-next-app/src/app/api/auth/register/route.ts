import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, password, token } = await req.json();

  // Mock token validation
  if (token !== 'OCEAN2025') {
    return NextResponse.json({ message: 'Invalid token' }, { status: 400 });
  }

  // Check if email already exists (mocked)
  if (email === 'existing@example.com') {
    return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
  }

  // Save to DB (mocked)
  console.log('Registering:', { email, password, token });

  return NextResponse.json({ success: true });
}
