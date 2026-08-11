/* ============================================================
   Phase 26 - STEP 9: Pakistan MCQS Hub — PM2 ecosystem (Enterprise)
   Usage: pm2 start ecosystem.config.js --env production
         pm2 reload ecosystem.config.js
   ============================================================ */
"use strict";
module.exports = {
  apps: [
    {
      name: "pakistan-mcqs-hub",
      script: "server.js",
      cwd: __dirname,
      instances: 1, // SQLite file backend — single writer
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        MCQS_PORT: "8765"
      },
      env_production: {
        NODE_ENV: "production",
        MCQS_PORT: "8765",
        MCQS_READONLY: "1"
      },
      out_file: "srv-out.log",
      error_file: "srv-err.log",
      merge_logs: true,
      time: true
    }
  ]
};
