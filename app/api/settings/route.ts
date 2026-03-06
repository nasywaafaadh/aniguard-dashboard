import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    
    // Kalau belum ada data setting di database, kasih nilai default kosong
    if (!settings) {
      return NextResponse.json({ stream_url: "" });
    }

    return NextResponse.json({ stream_url: settings.stream_url });
  } catch (error) {
    return NextResponse.json({ stream_url: "" });
  }
}