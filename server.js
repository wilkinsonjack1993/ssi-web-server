const http = require("http");
const { createReadStream } = require("fs");
const { SSIHtmlParser } = require("./htmlParser");

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = 8000;

// Create a rudimentary cache. This is not a production-ready cache.
// It will be cleared everytime the server is restarted.
// It also will NOT update if the html is changed while the server is running. A server restart is required.
// We could return the cached object if it exists and then revalidate it so that the next user gets the most up to date version. But that is out of scope for now.
const pageCache = {};

const serveAdobeFavicon = function (req, res) {
  res.setHeader("Content-Type", "image/x-icon");
  try {
    createReadStream(__dirname + `/app${req.url}`).pipe(res);
  } catch (err) {
    res.writeHead(500);
    res.end(err);
  }
};

// Either fetches the page from the cache or parses it from the file system.
const getHtmlPage = async function (fileRoute) {
  if (pageCache[fileRoute]) {
    return pageCache[fileRoute];
  }
  // Create a new parser and parse the fileRoute
  const parser = new SSIHtmlParser(`${__dirname}/app${fileRoute}`);
  const page = parser.parse();

  // Cache the page
  pageCache[fileRoute] = page;
  return page;
};

// This is the callback function that is called when a request is made to the server. It will return a response to the client.
const serveHtmlPages = async function (req, res) {
  // If request is sent from browser - it may ask for a favicon. If so provide one.
  if (req.url.includes(".ico")) {
    serveAdobeFavicon(req, res);
    return;
  }

  const fileRoute = req.url === "/" ? "/index.shtml" : req.url;

  try {
    const page = await getHtmlPage(fileRoute);
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(page);
  } catch (err) {
    // TODO - serve 404 page if file not found
    console.log(err);
    res.writeHead(500);
    res.end(err);
    return;
  }
};

const server = http.createServer(serveHtmlPages);

const host = process.env.NODE_HOST || DEFAULT_HOST;
const port = process.env.NODE_PORT || DEFAULT_PORT;
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
