const http = require("http");
const { createReadStream } = require("fs");
const { SSIHtmlParser } = require("./htmlParser");

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = 8000;

// TODO - implement cache

const serveAdobeFavicon = function (req, res) {
  res.setHeader("Content-Type", "image/x-icon");
  try {
    createReadStream(__dirname + `/app${req.url}`).pipe(res);
  } catch (err) {
    res.writeHead(500);
    res.end(err);
  }
};

// This is the callback function that is called when a request is made to the server. It will return a response to the client.
const serveHtmlPages = async function (req, res) {
  // If request is sent from browser - it may ask for a favicon. If so provide one.
  if (req.url.includes(".ico")) {
    serveAdobeFavicon(req, res);
    return;
  }

  // TODO - allow routing again
  //   const fileRoute = req.url === "/" ? "/index" : req.url;
  // Set the content header to HTML
  const parser = new SSIHtmlParser(__dirname + `/app/index.shtml`);

  try {
    const page = await parser.parse();
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
