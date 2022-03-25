# Server Side Includes Web Server

## Requirements

Node version 16
npm

No third party libraries were used.

## Usage

Run the following commands
`npm ci`
`npm start`

Then go to `localhost:8000` - this will by default serve you the index.shtml file in the app folder. However routing is included and so going to `localhost:8000/example.shtml` will serve the example shtml file instead.

### Custom Host and Port

By default, the hostname is set to 'localhost' and the port is set to 8000. If you would like to override either/or both of these, you can do so by setting Environment Variables. For example:

`NODE_HOST=custom_hostname NODE_PORT=1234 npm start`

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

## Resources used:

- [Digital Ocean - Used as a reference in creating the basic HTTP Web Server](https://www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module)
- [node-ssi - Used as a reference in parsing shtml files.](https://github.com/kidwm/node-ssi)
- [helpers/asyncStringReplace.js was copied from this article](https://dev.to/ycmjason/stringprototypereplace-asynchronously-28k9)
