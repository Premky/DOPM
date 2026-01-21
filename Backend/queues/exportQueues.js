// queues/exportQueue.js
import { Queue } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis();
export const exportQueue = new Queue("bandi-export", { connection });
