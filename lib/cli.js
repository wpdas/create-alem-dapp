const { version, name, description } = require("../package.json");
const os = require("os");
const { Command } = require("commander");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const rimraf = require("rimraf");
const { log } = require("./utils");
const { process_pkg_file } = require("./parse");

const program = new Command();

let projectName;

const isWindows = os.platform().includes("win32");

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

// Define a sleep function that returns a promise
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Download the project boilerplate
async function downloadBoilerplate(template) {
  const projectPath = path.join(".", projectName);
  // const git_repo_ts_template =
  //   "https://github.com/wpdas/alem-template-typescript.git";
  // const git_repo_js_template =
  //   "https://github.com/wpdas/alem-template-javascript.git";
  // const git_repo =
  //   template === "typescript" ? git_repo_ts_template : git_repo_js_template;

  const git_repo = "https://github.com/wpdas/alem-templates.git";
  const templates = ["javascript", "typescript", "typescript-tailwind"];
  const selectedTemplate = template || "javascript";

  if (!templates.includes(selectedTemplate)) {
    log.error(`Template ${selectedTemplate} not found!`);
    process.exit(1);
  }

  try {
    let loading = log.loading("[1 / 4] - Downloading files...");
    await sleep(100); // Wait for one second to show the message above
    // execSync(`git clone --depth 1 ${git_repo} ${projectPath}`);

    execSync(
      `git clone --filter=blob:none --no-checkout ${git_repo} ${projectName}`
    );
    // Baixa apenas o template especifico na pasta temporaria
    execSync(
      `cd ${projectName}; git sparse-checkout set --cone; git checkout main; git sparse-checkout set ${selectedTemplate}`
    );

    // Copiar todos os arquivos um nivel acima
    fs.cpSync(
      path.join(`./${projectName}/${selectedTemplate}`),
      path.join(`./${projectName}/`),
      { recursive: true },
      (err) => {
        if (err) {
          console.error(err);
        }
      }
    );

    loading.finish();

    process_pkg_file(path.join(".", projectName, "package.json"), projectName);

    process.chdir(projectPath);

    log.sucess("[2 / 4] - Preparing environment file...");
    fs.writeFileSync(path.join(".", ".env"), "NODE_ENV=development");

    log.sucess("[3 / 4] - Removing useless files");
    rimraf.sync(path.join(".", ".git"));
    rimraf.sync(path.join(".", selectedTemplate));

    loading = log.loading("[4 / 4] - Installing dependencies...");
    await sleep(100); // Wait for one second to show the message above

    if (isUsingYarn()) {
      execSync("yarn install");
    } else {
      execSync("npm install");
    }

    loading.finish();

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
