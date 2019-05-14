const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const indexPath = path.join(__dirname, "..", "build", "index.html");
const $ = cheerio.load(fs.readFileSync(indexPath, "utf8"));

// Inject entities
const phenylApiExplorerClientGlobals = cheerio("<script></script>").text(`
  window.phenylApiExplorerClientGlobals = {
    phenylApiUrlBase: "<%- phenylApiUrlBase %>",
    PhenylFunctionalGroupSkeleton: <%- JSON.stringify(functionalGroup) %>,
  }
`);
$("script")
  .eq(0)
  .before(phenylApiExplorerClientGlobals);

fs.writeFileSync(indexPath, $.html(), "utf8");
