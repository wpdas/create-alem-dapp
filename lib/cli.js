const { version, name, description } = require("../package.json");
const { Command } = require("commander");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const rimraf = require("rimraf");
const { log } = require("./utils");
const { process_pkg_file } = require("./parse");

const program = new Command();

let projectName;

async function run() {
  program.name(name).description(description).version(version);

  // Project name
  program.argument("<project-name>");

  // Templates
  program
    .option(
      "--template <template>",
      "specify a template for the created project"
    )
    .action((_projectName, opts) => {
      projectName = _projectName;
      createDapp(opts).catch((err) => {
        console.error(err);
        process.exit(1);
      });
    });

  program.parse();
}

async function createDapp(opts) {
  checkPath();

  // console.log("OPTIONS:", opts);

  await downloadBoilerplate(opts.template);
}

// Check if path name is available
function checkPath() {
  try {
    fs.mkdirSync(projectName);
  } catch (err) {
    if (err.code === "EEXIST") {
      log.error(
        `The folder ${projectName} already exist in the current directory, please give it another name.`
      );
    } else {
      log.error(error);
    }
    process.exit(1);
  }
}

function isUsingYarn() {
  return (process.env.npm_config_user_agent || "").indexOf("yarn") === 0;
}

// Download the project boilerplate
async function downloadBoilerplate(template) {
  const projectPath = path.join(".", projectName);
  const git_repo_ts_template =
    "https://github.com/wpdas/alem-template-typescript.git";
  const git_repo_js_template =
    "https://github.com/wpdas/alem-template-javascript.git";
  const git_repo =
    template === "typescript" ? git_repo_ts_template : git_repo_js_template;

  try {
    log.info("[1 / 4] - Downloading files...");
    execSync(`git clone --depth 1 ${git_repo} ${projectPath}`);

    process_pkg_file(path.join(".", projectName, "package.json"), projectName);

    process.chdir(projectPath);

    log.info("[2 / 4] - Installing dependencies...");
    if (isUsingYarn()) {
      execSync("yarn install");
    } else {
      execSync("npm install");
    }

    log.info("[3 / 4] - Preparing environment file...");
    fs.writeFileSync(path.join(".", ".env"), "NODE_ENV=development");

    log.info("[4 / 4] - Removing useless files");
    rimraf.sync(path.join(".", ".git"));

    console.log("\n");
    log.sucess(`Success! Created dApp ${projectName}.`);
    log.log("We suggest that you begin by typing:");
    log.log(`\ncd ${projectName}`);
    if (isUsingYarn()) {
      log.log("yarn start");
    } else {
      log.log("npm run start");
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  run,
};
