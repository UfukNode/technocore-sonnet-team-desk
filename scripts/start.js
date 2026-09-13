"use strict";

/**
 * Installs the one dependency before starting, when it is not there yet.
 *
 * A fresh Codespace checks the repository out and stops; nothing runs npm install
 * for you. So "npm start" on its own used to bring the server up with node_modules
 * missing, which serves every page correctly and every icon as a 404, and the desk
 * arrives looking broken for a reason nothing on screen explains. Rather than ask
 * people to remember a second command, the start script does it.
 */

const { existsSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const iconBundle = path.join(__dirname, "..", "node_modules", "lucide", "dist", "umd", "lucide.min.js");

if (!existsSync(iconBundle)) {
  process.stdout.write("Installing dependencies, this happens once.\n");
  const install = spawnSync("npm", ["install", "--no-audit", "--no-fund"], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (install.status !== 0) {
    // The desk is usable without icons, so a failed install is reported and stepped over.
    process.stdout.write("Dependencies could not be installed. Starting anyway, icons will be missing.\n");
  }
}

require("../server");
