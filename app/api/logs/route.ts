import { NextResponse } from 'next/server';
import prisma from '@/lib/db'; 
import fs from 'fs';
import path from 'path';

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
    
    // AUTO CLEANUP
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const oldDetections = await prisma.detection.findMany({
        where: {
          created_at: {
            lt: sevenDaysAgo, 
          },
        },
      });

      for (const det of oldDetections) {
        if (det.imageurl) {
          const filePath = path.join(process.cwd(), 'public', det.imageurl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[CLEANUP] File foto lama dihapus: ${det.imageurl}`);
          }
        }
      }

      if (oldDetections.length > 0) {
        await prisma.detection.deleteMany({
          where: {
            created_at: {
              lt: sevenDaysAgo,
            },
          },
        });
        console.log(`[CLEANUP] Berhasil menghapus ${oldDetections.length} baris data lama dari database.`);
      }
    } catch (cleanupError) {
      console.error("[WARNING] Gagal melakukan auto-cleanup:", cleanupError);
    }
    
    return NextResponse.json({ success: true, data: newDetection });

  } catch (error) {
    console.error("DETAILED ERROR:", error); 
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