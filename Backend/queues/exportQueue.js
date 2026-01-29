import { Queue, Worker } from "bullmq";
import { redis } from "../config/redis.js";
import {
  // generateBandiExcel,
  generateBandiExcelWithPhoto
} from "../services/bandiExcelService.js";

// Queue
export const exportQueue = new Queue( "export_bandi", {
  connection: redis,
} );

// Worker
// Worker
export const exportWorker = new Worker(
  "export_bandi",
  async (job) => {
    console.log(`Processing export job ${job.id}`);

    // ✅ Capture the returned file path
    const filePath = await generateBandiExcelWithPhoto(job, job.data.filters);

    return { filePath };
  },
  {
    connection: redis,
    concurrency: 1,
  }
);


exportWorker.on( "completed", ( job, result ) => {
  console.log( `✅ Export job ${ job.id } done → ${ result.filePath }` );
} );

exportWorker.on( "failed", ( job, err ) => {
  console.error( `❌ Export job ${ job?.id } failed`, err );
} );

console.log( "🚀 Export Worker running..." );
