import { NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Pastikan path ini benar

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Data diterima dari Python:", body); // Tambahkan ini untuk cek di terminal Next.js

    const newDetection = await prisma.detection.create({
      data: {
        animal: body.animal,
        confidence: body.confidence,
        imageurl: body.imageurl,
      }
    });
    
    return NextResponse.json({ success: true, data: newDetection });
  } catch (error) {
    console.error("DETAILED ERROR:", error); // Ini akan memunculkan alasan asli kenapa 500
    return NextResponse.json({ error: "Gagal simpan ke DB" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await prisma.detection.findMany({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}