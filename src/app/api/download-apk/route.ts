import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Direct Firebase Storage download URL for latest version
    const firebaseDownloadURL = 'https://firebasestorage.googleapis.com/v0/b/goldplus-finance.firebasestorage.app/o/apk%2Fgoldplus-advisory-latest.apk?alt=media&token=YOUR_NEW_TOKEN_HERE';
    
    // Redirect to Firebase Storage for automatic download
    return NextResponse.redirect(firebaseDownloadURL, 307);
  } catch (error) {
    console.error('Error redirecting to Firebase Storage:', error);
    return NextResponse.json({ 
      error: 'Failed to download APK. Please try again later.' 
    }, { status: 500 });
  }
} 