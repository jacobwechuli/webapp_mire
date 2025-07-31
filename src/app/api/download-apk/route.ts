import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // GitHub releases URL - replace with your actual repository URL
    const githubReleasesUrl = 'https://github.com/yourusername/goldplus-advisory/releases/latest/download/goldplus-advisory-v1.apk';
    
    // Redirect to GitHub releases
    return NextResponse.redirect(githubReleasesUrl, 302);
  } catch (error) {
    console.error('Error redirecting to GitHub releases:', error);
    return NextResponse.json({ error: 'Failed to redirect to download' }, { status: 500 });
  }
} 