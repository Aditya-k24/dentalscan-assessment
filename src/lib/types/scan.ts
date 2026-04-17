export type ScanStatus = "pending" | "completed" | "failed";

export interface ScanRecord {
  id: string;
  status: ScanStatus;
  images: string;
  createdAt: Date;
  updatedAt: Date;
}
