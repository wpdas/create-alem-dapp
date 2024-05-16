const fs = require("fs");

// process each file
function process_pkg_file(filePath, projectName) {
  let fileContent = fs.readFileSync(filePath, "utf8");

  // remove original file
  fs.unlinkSync(filePath);

  // change package project name
  fileContent = fileContent.replace("alem-template", projectName);

  fs.writeFileSync(filePath, fileContent);
}

module.exports = {
  process_pkg_file,
};
