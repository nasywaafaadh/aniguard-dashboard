import { Detection } from '../types';
// import prisma from '../db'; // Nanti di-uncomment kalau Prisma sudah aktif

export const getLatestDetections = async (): Promise<Detection[]> => {
  // --- MODE DUMMY (Dipakai sekarang buat tes UI) ---
  return [
    {
      id: 1,
      created_at: new Date().toISOString(),
      animal: "Cat",
      confidence: 0.92,
      imageurl: "/snapshots/dummy-cat.jpg" // Siapkan 1 foto dummy di folder public/snapshots/
    },
    {
      id: 2,
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 jam lalu
      animal: "Dog",
      confidence: 0.85,
      imageurl: "" 
    }
  ];

  // --- MODE REAL (Dipakai nanti saat Jetson/SQL sudah siap) ---
  /*
  try {
    const data = await prisma.detection.findMany({
      orderBy: { created_at: 'desc' },
      take: 50 // Ambil 50 data terbaru
    });
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
  */
};