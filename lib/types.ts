export interface Detection {
  id: number;
  created_at: string;
  animal: string;
  confidence: number;
  imageurl: string;
}

export interface SystemSettings {
  stream_url: string;
}