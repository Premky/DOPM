import { Queue, Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { generateBandiExcel, generateBandiExcelWithPhoto } from "../services/bandiExcelService.js"; // your existing code

// Queue
export const exportQueue = new Queue("export_bandi", { connection: redis });

// Worker: processes export jobs
export const exportWorker = new Worker(
  "export_bandi",
  async (job) => {
    console.log(`Processing export job ${job.id} for user ${job.data.userId}`);
    
    // Keep all your columns and streaming logic
    const filePath = await generateBandiExcel(job, job.data.filters);

    return { filePath };
  },
  {
    connection: redis,
    concurrency: 1, // safe default
  }
);

// Optional logging
exportWorker.on("completed", (job, returnvalue) => {
  console.log(`✅ Export job ${job.id} completed: ${returnvalue.filePath}`);
});

exportWorker.on("failed", (job, err) => {
  console.error(`❌ Export job ${job.id} failed:`, err);
});

console.log("🚀 Export Worker running...");
