import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 });
    }

    // Forward the request to the backend
    const response = await fetch('http://localhost:5000/api/recommendations/fashion-stylist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Backend error' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fashion stylist API error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to fashion stylist' },
      { status: 500 }
    );
  }
}
