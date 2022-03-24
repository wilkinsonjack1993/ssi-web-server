const fs = require("fs").promises;
const { asyncStringReplace } = require("./helpers/asyncStringReplace");

const ATTRIBUTE_MATCHER = /([a-z]+)="(.+?)"/g;

class SSIHtmlParser {
  constructor(filepath) {
    this.filepath = filepath;
    this.file = null;
  }

  // This method was taken from: https://github.com/kidwm/node-ssi/blob/166c716cbc22ecaf340d63093977785942a988ef/lib/DirectiveHandler.js#L113
  // All it does is parse the attributes of the directive.
  parseAttributes(directive) {
    const attributes = [];

    directive.replace(ATTRIBUTE_MATCHER, function (attribute, name, value) {
      attributes.push({ name: name, value: value });
    });
    return attributes;
  }

  // Here we check that the directive is valid. We then get the corresponding file name and recursively parse it.
  // This allows us to have nested SSI files.
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

    // Get the file path. It's file attribute is relative to the file we are currently parsing.
    // TODO - would be nice to have some file path validation here.
    const file = attributes[0].value;
    const pathOfFileToBeIncluded = this.filepath.replace(
      /([^\/]+$)/,
      file[0] === "/" ? file.substring(1) : file
    );

    // Recursively repeat the same process on this new file until we have all the HTML parsed.
    const newFileParser = new SSIHtmlParser(pathOfFileToBeIncluded);
    const parsedResult = await newFileParser.parse();
    return parsedResult.toString();
  }

  // Here we find each instance of an SSI directive in the file and replace it with the corresponding file.
  async parseServerSideIncludes() {
    const htmlString = this.file.toString();

    const parsedHtmlString = await asyncStringReplace(
      htmlString,
      /<!--#([a-z]+)([ ]+([a-z]+)="(.+?)")* -->/g, // Matches <!--#include file="filename" --> and other directives - taken from node-ssi
      this.directiveParser.bind(this)
    );

    return new Buffer(parsedHtmlString, "utf8");
  }

  // If it is not and SSI file, just return the file.
  // Else recursively parse the SSI file and return the result.
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
