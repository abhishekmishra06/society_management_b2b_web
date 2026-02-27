import { NextResponse } from 'next/server';

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function jsonResponse(data, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders() });
}

export function errorResponse(message, status = 500) {
  return NextResponse.json({ error: message }, { status, headers: corsHeaders() });
}

export function optionsResponse() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// Extract society ID from the user's token/session
export function getSocietyId(request) {
  // Check header first
  const societyId = request.headers.get('x-society-id');
  if (societyId) return societyId;
  
  // Check query params
  const url = new URL(request.url);
  return url.searchParams.get('societyId') || null;
}
