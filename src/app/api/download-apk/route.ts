import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Direct Firebase Storage download URL
    const firebaseDownloadURL = 'https://firebasestorage.googleapis.com/v0/b/goldplus-finance.firebasestorage.app/o/apk%2Fgoldplus-advisory-v1.apk?alt=media&token=f9c9d5b6-a1e9-40d4-b736-ffd77a506d78';
    
    // Redirect to Firebase Storage for automatic download
    return NextResponse.redirect(firebaseDownloadURL, 307);
  } catch (error) {
    console.error('Error redirecting to Firebase Storage:', error);
    return NextResponse.json({ 
      error: 'Failed to download APK. Please try again later.' 
    }, { status: 500 });
  }
} 