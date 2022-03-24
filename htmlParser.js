const fs = require("fs").promises;

const ATTRIBUTE_MATCHER = /([a-z]+)="(.+?)"/g;

// This method was taken from: https://dev.to/ycmjason/stringprototypereplace-asynchronously-28k9
const asyncStringReplace = async (str, regex, aReplacer) => {
  const substrs = [];
  let match;
  let i = 0;
  while ((match = regex.exec(str)) !== null) {
    // put non matching string
    substrs.push(str.slice(i, match.index));
    // call the async replacer function with the matched array spreaded
    substrs.push(aReplacer(...match));
    i = regex.lastIndex;
  }
  // put the rest of str
  substrs.push(str.slice(i));
  // wait for aReplacer calls to finish and join them back into string
  return (await Promise.all(substrs)).join("");
};

class SSIHtmlParser {
  constructor(filepath) {
    this.filepath = filepath;
    this.file = null;
  }

  // This method was taken from: https://github.com/kidwm/node-ssi/blob/166c716cbc22ecaf340d63093977785942a988ef/lib/DirectiveHandler.js#L113
  parseAttributes(directive) {
    const attributes = [];

    directive.replace(ATTRIBUTE_MATCHER, function (attribute, name, value) {
      attributes.push({ name: name, value: value });
    });
    return attributes;
  }

  async directiveParser(directive, directiveName) {
    if (directiveName !== "include") {
      console.error(
        "Unknown directive: " +
          directiveName +
          '. Currently only "include" is supported.'
      );

      // Could replace this with an error widget - for now just do load nothing.
      return "";
    }

    const attributes = this.parseAttributes(directive);

    // Check that attribute is of correct type
    if (attributes.length !== 1 || attributes[0].name !== "file") {
      console.error(
        "Include directive currently only supports one file attribute"
      );
    }

    const file = attributes[0].value;
    const newFilepath = this.filepath.replace(
      /([^\/]+$)/,
      file[0] === "/" ? file.substring(1) : file
    );

    const newFileParser = new SSIHtmlParser(newFilepath);
    const parsedResult = await newFileParser.parse();
    return parsedResult.toString();
  }

  async parseServerSideIncludes() {
    const htmlString = this.file.toString();

    const parsedHtmlString = await asyncStringReplace(
      htmlString,
      /<!--#([a-z]+)([ ]+([a-z]+)="(.+?)")* -->/g,
      this.directiveParser.bind(this)
    );

    return new Buffer(parsedHtmlString, "utf8");
  }

  parse() {
    const isSSI = this.filepath.endsWith(".shtml");

    return fs
      .readFile(this.filepath)
      .then((file) => {
        // If file is not an SSI file, return the file as is.
        if (!isSSI) return file;

        // else parse the file
        this.file = file;
        return this.parseServerSideIncludes();
      })
      .catch((err) => {
        throw err;
      });
  }
}

module.exports = { SSIHtmlParser };
