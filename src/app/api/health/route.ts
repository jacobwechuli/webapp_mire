import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export async function GET() {
  try {
    // Test basic Firebase connectivity
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(1));
    const snapshot = await getDocs(q);

    return NextResponse.json({
      status: 'healthy',
      message: 'Firebase connection successful',
      usersCollection: 'exists',
      userCount: snapshot.size
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Firebase connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 