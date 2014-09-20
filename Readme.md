# filebox.js

filebox.js is just a simple and personal file hosting system.

This is **not** a complex system with auth or permissions. For that I use and recommend [SugarSync](https://www.sugarsync.com/), [Dropbox](https://www.dropbox.com/), or [Google Drive](https://drive.google.com).

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

## Configure

1. Copy `./generic.png` to your `uploads/` directory (default config needs it in `../uploads`).
2. Create a `boot/local.js` if you're developing locally. It's not versioned, but you can copy it from `boot/local.sample.js`

## Run

If you're doing this for production, don't forget to put it under http basic auth, as the app itself doesn't have auth

To run it locally, simply do `$ node app`.

There's a lot of [information and possibilities if you want to run the app in production](http://stackoverflow.com/questions/8386455/deploying-a-production-node-js-server). I like `forever`. You should, however, `$ export NODE_ENV=production` before running it.

## Test

`$ export NODE_ENV=test && npm test` for e2e tests

## License

[MIT](http://opensource.org/licenses/MIT)