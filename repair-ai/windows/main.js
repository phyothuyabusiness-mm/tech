const { app, BrowserWindow } = require("electron");
const http = require("http");
const fs = require("fs");
const path = require("path");

let server;
let mainWindow;
const root = path.join(__dirname, "public");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml" };

function startLocalServer() {
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      let pathname = decodeURIComponent((req.url || "/").split("?")[0]);
      if (pathname === "/") pathname = "/index.html";
      const filePath = path.normalize(path.join(root, pathname));
      if (!filePath.startsWith(root)) { res.writeHead(403); res.end("Forbidden"); return; }
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end("Not found"); return; }
        res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream", "X-Content-Type-Options": "nosniff" });
        res.end(data);
      });
    });
    server.once("error", reject);
    server.listen(8788, "127.0.0.1", () => resolve());
  });
}

async function createWindow() {
  await startLocalServer();
  mainWindow = new BrowserWindow({
    width: 1280, height: 850, minWidth: 360, minHeight: 600,
    backgroundColor: "#07101d",
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  mainWindow.loadURL("http://localhost:8788/");
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => { if (server) server.close(); if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
