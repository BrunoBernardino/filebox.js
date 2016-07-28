# filebox.js

[![Build Status](http://img.shields.io/travis/BrunoBernardino/filebox.js.svg?style=flat)](http://travis-ci.org/BrunoBernardino/filebox.js)
[![Coverage Status](https://coveralls.io/repos/BrunoBernardino/filebox.js/badge.svg)](https://coveralls.io/r/BrunoBernardino/filebox.js)
[![Code Climate](https://codeclimate.com/github/BrunoBernardino/filebox.js/badges/gpa.svg)](https://codeclimate.com/github/BrunoBernardino/filebox.js)

filebox.js is just a simple and personal file hosting system.

This is **not** a complex system with auth or permissions. For that I use and recommend [SugarSync](https://www.sugarsync.com/), [Dropbox](https://www.dropbox.com/), or [Google Drive](https://drive.google.com).

Currently at version 0.0.1

## Screenshots

![](https://raw.githubusercontent.com/BrunoBernardino/filebox.js/master/assets/public/img/screenshot.png) ![](https://raw.githubusercontent.com/BrunoBernardino/filebox.js/master/assets/public/img/screenshot-mobile.png)

## Current Features

- Supports drag & drop to upload
- Supports 1 file at a time (multiple files on TODO)
- Load more images on scroll
- Mobile first approach
  - For design
  - For bandwidth/screen-size (each "page" downloads only how many images fit per screen)
  - Shows thumbnails instead of the actual images when listing
- All file types supported
- No file size limit (it'll be limited by your server settings)

## Pre-requisites

filebox.js requires you to have [Node.js](http://nodejs.org/), [npm](https://www.npmjs.org/), [mongodb](http://www.mongodb.org/), [redis](http://redis.io/), and [imagemagick](http://www.imagemagick.org/) installed.

Additionally, some global npm modules are required to build the front-end:

```
$ npm install -g gulp
```

## Install

1. [Download filebox.js](https://github.com/BrunoBernardino/filebox.js/archive/master.zip)
2. Run `$ npm install -d`
3. Run `$ gulp build`

## Configure/Setup

1. Copy `./generic.png` to your `uploads/` directory (default config needs it in `../uploads`).
2. Create a `boot/local.js` if you're developing locally. It's not versioned, but you can copy it from `boot/local.sample.js`
3. Look around in `boot/config.js` if you need to change anything (db name, session & cookie prefix, for example). You can do them there or in `boot/local.js`

Please note `boot/local.js` is only loaded if you're in `development` mode (no `NODE_ENV`, or `NODE_ENV === 'development`).

## Run

If you're doing this for production, don't forget to put it under http basic auth, as the app itself doesn't have auth

To run it locally, simply do `$ node app`.

There's a lot of [information and possibilities if you want to run the app in production](http://stackoverflow.com/questions/8386455/deploying-a-production-node-js-server). I like `forever`. You should, however, `$ export NODE_ENV=production` before running it.

## Test

`$ npm test` for e2e tests

## Development

I follow these [coding standards/guidelines](http://jscode.org/readable).

## License

[MIT](http://opensource.org/licenses/MIT)

## TODOs

- Make upload show a progress bar instead of just a loading icon
- Support multiple files upload
- Make search work
- Actually fetch tags to show them "prettier" when editing an image
- Update `db.tags` whenever a file is updated
- Make it consistent in the code to have/say `file` instead of `image`, since it does allow anything to be uploaded.
