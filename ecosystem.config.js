/* ============================================================
   Phase 40 - PM2 ecosystem for the file-engine runtime
   Usage: pm2 start ecosystem.config.js --env production
         pm2 reload ecosystem.config.js
   ============================================================ */
"use strict";
module.exports = {
  apps: [
    {
      name: "pakistan-mcqs-hub",
      script: "runtime-v2/server.cjs",
      cwd: __dirname,
      instances: 1, // file-engine runtime — single writer
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      node_args: "--max-old-space-size=384",
      env: {
        NODE_ENV: "production",
        MCQS_JSON_PORT: "8766"
      },
      env_production: {
        NODE_ENV: "production",
        MCQS_JSON_PORT: "8766"
      },
      out_file: "srv-out.log",
      error_file: "srv-err.log",
      merge_logs: true,
      time: true
    }
  ]
};
