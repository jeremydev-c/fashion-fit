import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 });
    }

    // Get backend URL from environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000';
    
    // Forward the request to the backend
    const response = await fetch(`${apiUrl}/api/recommendations/fashion-stylist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(body)
    });

    // Handle non-JSON responses
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const text = await response.text();
      console.error('Failed to parse response:', text);
      return NextResponse.json(
        { 
          error: `Backend returned invalid response: ${response.status} ${response.statusText}`,
          details: text.substring(0, 200)
        }, 
        { status: response.status || 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Backend error' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fashion stylist API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to connect to fashion stylist',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
