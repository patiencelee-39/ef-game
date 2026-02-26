var fs = require("fs");
var sw = fs.readFileSync("sw.js", "utf8");
var m = sw.match(/PRE_CACHE\s*=\s*\[([\s\S]*?)\]/);
if (!m) {
  console.log("Cannot parse PRE_CACHE");
  process.exit(1);
}
var entries = m[1].match(/"[^"]+"/g) || [];
var missing = 0;
entries.forEach(function (e) {
  var p = e.replace(/"/g, "").replace(/^\//, "");
  if (p === "/" || p === "") return;
  if (!fs.existsSync(p)) {
    console.log("  ❌ " + p);
    missing++;
  }
});
console.log("Total: " + entries.length + " entries, " + missing + " missing");
