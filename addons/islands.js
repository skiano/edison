import fs from 'fs';
import path from 'path';

let snippet;
export function islandTrigger() {
  if (!snippet) {
    try {
      snippet = fs.readFileSync(path.join(import.meta.dirname, './client.min.js')).toString();
    } catch (_) {
      snippet = fs.readFileSync(path.join(import.meta.dirname, './client.js')).toString();
    }
  }
  return snippet;
}

export function createIslands(names) {
  
}