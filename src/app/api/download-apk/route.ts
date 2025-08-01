import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Redirect directly to GitHub releases download
    const githubDownloadUrl = 'https://github.com/jacobwechuli/webapp_mire/releases/download/v1.0.0/goldplus-advisory-v1.apk';
    
    // Use 307 redirect to preserve the request method and trigger download
    return NextResponse.redirect(githubDownloadUrl, 307);
  } catch (error) {
    console.error('Error redirecting to GitHub download:', error);
    return NextResponse.json({ error: 'Failed to redirect to download' }, { status: 500 });
  }
} 