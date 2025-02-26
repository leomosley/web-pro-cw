import path from 'path';
import { readFile } from 'fs/promises';

export function getScripts(html) {
  const regex = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi;
  const scripts = [];

  let match;
  while ((match = regex.exec(html)) !== null) {
    scripts.push(match[1]);
  }

  return scripts;
}

export async function bundle(file) {
  let html = await readFile(file, 'utf-8');

  const scripts = getScripts(html);

  html = html.replace(/<script\b[^>]*\bsrc=["'][^"']+["'][^>]*><\/script>/gi, '');

  let bundledScripts = '';
  const baseDir = path.dirname(file); // Get the directory of the HTML file

  for (const scriptPath of scripts) {
    const absolutePath = path.resolve(baseDir, scriptPath); // Resolve relative to the HTML file
    const scriptContent = await readFile(absolutePath, 'utf-8');

    bundledScripts += `\n// ${scriptPath}\n${scriptContent}\n`;
  }

  html = html.replace('</html>', `<script type="module">\n${bundledScripts}</script>\n</html>`);

  return html;
}
