/* ============================================================
   Pakistan MCQs Hub - Electron preload (Phase 25)
   Minimal, sandboxed bridge. No privileged access exposed.
   ============================================================ */
"use strict";
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("pmhDesktop", {
  platform: process.platform,
  version: process.versions.electron ? "electron" : "web",
  isDesktop: true
});
