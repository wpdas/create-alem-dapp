const log = {
  loading: (text = "", enabledots = true) => {
    let x = 0;
    const chars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    const dots = [
      "   ",
      "   ",
      ".  ",
      ".  ",
      ".  ",
      ".. ",
      ".. ",
      ".. ",
      "...",
      "...",
      "...",
    ];
    const delay = 80;

    const interval = setInterval(function () {
      // change dots slower than the chars
      process.stdout.write(
        "\r" +
          chars[x++] +
          " " +
          text +
          (enabledots ? dots[x % dots.length] : "")
      );
      x = x % chars.length;
    }, delay);

    return {
      finish: (text1 = text) => {
        clearInterval(interval);
        process.stdout.write(
          "\r\x1b[32m\x1b[1m\u2713\x1b[0m " +
            text1 +
            "                                      \n"
        );
      },
      error: (text1 = text) => {
        clearInterval(interval);
        process.stdout.write(
          "\r\x1b[31m\x1b[1m\u2717\x1b[0m " +
            text1 +
            "                                      \n"
        );
      },
    };
  },
  error: (text) => {
    process.stdout.write("\x1b[31m\x1b[1m\u2717\x1b[0m " + text + "\n");
  },
  sucess: (text) => {
    process.stdout.write("\x1b[32m\x1b[1m\u2713\x1b[0m " + text + "\n");
  },
  info: (text) => {
    process.stdout.write("\x1b[34m\x1b[1m⋅\x1b[0m " + text + "\n");
  },
  log: (text) => {
    process.stdout.write(text + "\n");
  },
};

module.exports = {
  log,
};
