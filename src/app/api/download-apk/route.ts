import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const apkPath = path.join(process.cwd(), 'public', 'downloads', 'goldplus-advisory-v1.apk');
    
    // Check if file exists
    try {
      await fs.access(apkPath);
    } catch (error) {
      return NextResponse.json({ error: 'APK file not found' }, { status: 404 });
    }

    // Read the file
    const apkBuffer = await fs.readFile(apkPath);
    
    // Get file stats for content length
    const stats = await fs.stat(apkPath);

    // Return the file with proper headers
    return new NextResponse(apkBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="goldplus-advisory-v1.apk"',
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error serving APK:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 