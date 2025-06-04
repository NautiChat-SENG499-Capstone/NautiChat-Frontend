import { NextResponse } from 'next/server'; // This imports a helper function from Next.js to send HTTP responses like (JSON) back to the frontend

const mockUsers = [
  { username: 'admin', password: 'admin123' },
  { username: 'user', password: 'pass123' },
  {username: 'paisley', password:'rivos'},
  {username: 'luca', password:'rizz'}
]; // Mock database, Each object is a user account with a username and password

export async function POST(req: Request) { // This creates a handler for POST requests to /api/login. The req - request cotains the data sent by the log in form. Async allows us to use await for things like reading request data. 
  const { username, password } = await req.json(); // This reads the body of the POST request and it turns into a javascript object. Expecting the front end to send something like "username: admin" "password"

  const user = mockUsers.find(
    (u) => u.username === username && u.password === password
  ); // We search for a user in the mockUsers array whose username and password match the ones sent from the form. .find() returns the matching user if found, undefined if not found

  if (user) {
    return NextResponse.json({ success: true, message: 'Login successful!' });
  } // If the user is found, we send back a JSON message confirming that the log in is successful 

  return NextResponse.json(
    { success: false, message: 'Invalid username or password' },
    { status: 401 }
  );
}
