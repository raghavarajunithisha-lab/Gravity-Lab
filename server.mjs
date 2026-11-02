// A small local web server using only built-in Node.js modules.
// Run with npm start, then visit http://localhost:5173.

import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Serve only these public files. Other paths receive a 404 response.
const allowedFiles = new Set([
  "index.html",
  "app.js",
  "physics.js",
  "style.css",
]);
const contentTypes = {
  html: "text/html; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
};

// PORT can override the default when another app already uses port 5173.
const port = Number(process.env.PORT || 5173);
http
  .createServer(async (request, response) => {
    // The root URL opens index.html.
    const requestedFile =
      new URL(request.url, "http://localhost").pathname.slice(1) ||
      "index.html";
    if (!allowedFiles.has(requestedFile)) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    // Resolve files relative to this script, independent of the terminal folder.
    try {
      const fileContents = await readFile(
        fileURLToPath(new URL(requestedFile, import.meta.url)),
      );
      response.writeHead(200, {
        "Content-Type": contentTypes[requestedFile.split(".").pop()],
        "Cache-Control": "no-store",
      });
      response.end(fileContents);
    } catch {
      response.writeHead(500);
      response.end("Could not read app file");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Gravity Lab: http://localhost:${port}`),
  )
  .on("error", (error) => {
    console.error(error.message);
    process.exit(1);
  });
