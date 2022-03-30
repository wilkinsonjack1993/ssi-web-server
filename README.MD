# Server Side Includes Web Server

## Contents

- [Requirements](#requirements)
- [Usage](#usage)
- [Custom Host and Port](#custom-host-and-port)
- [How it works](#how-it-works)
- [Future Improvements](#future-improvements)
- [Resources Used](#resources-used)

#

## Requirements

Node version 16
npm

No third party libraries were used.

#

## Usage

Run the following commands
`npm ci`
`npm start`

Then go to `localhost:8000` - this will by default serve you the index.shtml file in the app folder. However routing is included and so going to `localhost:8000/example.shtml` will serve the example shtml file instead.

#

### Custom Host and Port

By default, the hostname is set to 'localhost' and the port is set to 8000. If you would like to override either/or both of these, you can do so by setting Environment Variables. For example:

`NODE_HOST=custom_hostname NODE_PORT=1234 npm start`

#

## How it works

### server.js

This is a basic http server. When it receives a request, if the request requires a favicon, return the Adobe favicon.

Otherwise, get the HTML page from the local file system. There is a very basic in memory cache that means if an page is required twice, we will pull it from the cache and serve it from there.

If the file is not in the cache, we create a new instance of SSIHtmlParser (see htmlparser.js) and parse the file.

<p>&nbsp;</p>

### htmlParser.js

The class parses the file at the given filepath and if it contains an SSI include element, we create a new instance of the parser and recursively call it with the linked file until we can assemble a full html page.

This allows .shtml files to include other .shtml files in a nested fashion.

<p>&nbsp;</p>

### helpers/asyncStringReplace.js

This function was copied from [here](https://dev.to/ycmjason/stringprototypereplace-asynchronously-28k9) and allows us to do string replacements with asynchronous functions.

<p>&nbsp;</p>

### app folder

This folder contains html and shtml files. The partials folder contains smaller elements such as the header, sub header and footer elements. These are very simple and are mainly there to demonstrate how the parser works.

#

## Future improvements

This repo could be improved with more time in a number of ways - here are a couple of quick suggestions:

- Tests!
- Moving to Typescript
- Ability to handle more file types
- Ability to handle more directives
- Ability for the Include directive to suport error and virtual attributes
- Better error handling
- Configure eslint and prettier within the project
- Automatically restart the server on change in development mode

#

## Resources used:

- [Digital Ocean - Used as a reference in creating the basic HTTP Web Server](https://www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module)
- [node-ssi - Used as a reference in parsing shtml files.](https://github.com/kidwm/node-ssi)
- [helpers/asyncStringReplace.js was copied from this article](https://dev.to/ycmjason/stringprototypereplace-asynchronously-28k9)
