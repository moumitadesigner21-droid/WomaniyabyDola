import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

// Only public catalog/CMS data is queried; customer, credential and order tables are excluded.
const sql = "SELECT image,hover_image,pallu_image,video_url FROM products; SELECT url FROM product_images; SELECT image FROM categories; SELECT image FROM product_variants; SELECT value FROM site_content;";
const raw = execFileSync("npx", ["wrangler", "d1", "execute", "womania-db", "--remote", "--json", "--command", sql], {encoding:"utf8",maxBuffer:20_000_000});
const live = JSON.parse(raw).flatMap(result => result.results).flatMap(row => Object.values(row)).filter(Boolean).join("\n");
const origin = "https://womaniabydola.com";
const prefix = origin + "/wp-content/uploads/";
function urls(text) {
  return [...text.replaceAll("${CDN}",prefix.slice(0,-1)).matchAll(/https:\/\/womaniabydola\.com\/wp-content\/uploads\/[^\s"'`<>\\)]+/g)].map(m => new URL(m[0]).href);
}
function sources(dir) { return readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory() ? sources(path.join(dir,e.name)) : /\.tsx?$/.test(e.name) ? [readFileSync(path.join(dir,e.name),"utf8")] : []); }
const active = new Set(urls(live));
const all = [...new Set([...active,...urls(sources("src").join("\n")),...urls(readFileSync("db/seed.sql","utf8"))])];
console.log(JSON.stringify({activeUrls:active.size,totalUrls:all.length}));
if (process.argv.includes("--dry-run")) process.exit(0);
let index=0, downloaded=0, present=0;
const failures=[];
await Promise.all(Array.from({length:6},async()=>{
  while(index<all.length) {
    const url=all[index++], pathname=decodeURIComponent(new URL(url).pathname);
    const destination=path.resolve("public", "."+pathname);
    if (!destination.startsWith(path.resolve("public/wp-content/uploads")+path.sep)) throw Error("Unsafe media path");
    if(existsSync(destination)){present++;continue;}
    try {
      const response=await fetch(url,{signal:AbortSignal.timeout(30_000)});
      if(!response.ok)throw Error(`HTTP ${response.status}`);
      if(!/^(image|video)\//.test(response.headers.get("content-type")??""))throw Error("Not a media response");
      const data=Buffer.from(await response.arrayBuffer());
      if(data.length>24_000_000)throw Error("Exceeds static asset size budget");
      mkdirSync(path.dirname(destination),{recursive:true});
      writeFileSync(destination,data,{flag:"wx"});
      downloaded++;
    } catch(error){failures.push({url,active:active.has(url),error:error.message});}
  }
}));
console.log(JSON.stringify({downloaded,present,failures},null,2));
if(failures.some(f=>f.active))process.exitCode=1;
