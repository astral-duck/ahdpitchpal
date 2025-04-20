import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` }); // Loads .env by default for both local and live environments

import { list } from "@vercel/blob";

(async () => {
  try {
    console.log("Loaded BLOB_READ_WRITE_TOKEN:", process.env.BLOB_READ_WRITE_TOKEN); // Debug
    const { blobs } = await list();
    console.log("Blobs:", blobs);
  } catch (e) {
    console.error("Direct SDK error:", e);
  }
})();