Malu
====

A basic JS end-to-end test harness for MediaWiki.

Features
--------

 - Testing against a single MediaWiki instance with any browser
   supported by selenium-webdriver's builder
 - Configuration via the standard `MW_SERVER` and `MW_SCRIPT_PATH`
   environment variables
 - Anonymous API access and autoconfiguration of the article path by
   querying siteinfo
 - Support for taking screenshots
 - Basic page objects using CSS strings by default but supporting
   selenium-webdriver's locators for more complex definitions
 - Qualifying of relative page paths based on the wiki/site context

Setup
-----

Make sure you have a newish version of Node installed. On OS X, do:

    brew install node

Add `malu` to your `package.json` and install.

    npm install


TODO: implement a generator and add documentation about running it

Running tests
-------------

Run the entire suite of tests using `npm run`.

    npm run e2e

Run a single test file by executing mocha directly and passing the specific
filename. You'll need to specify the mocha timeout directly on the command
line as well.

    node_modules/.bin/mocha --timeout 10000 -- tests/e2e/scenarios/{filename}.js

Currently, this test suite assumes you have a MediaWiki install running at
`http://127.0.0.1:8080/` (the default MediaWiki-Vagrant setup). If you want to
run the tests against a different environment, you must set `MW_SERVER` and
`MW_SCRIPT_PATH` accordingly.

    export MW_SERVER=http://en.wikipedia.beta.wmflabs.org
    export MW_SCRIPT_PATH=/w
    node_modules/.bin/mocha --timeout 10000 -- tests/e2e/scenarios/{filename}.js

A single test within a scenario can be executed using Mocha's `-g` argument.

    node_modules/.bin/mocha -g 'Just this test' -- tests/e2e/scenarios/{filename}.js

Debugging
---------

Debugging scenarios is easy. Just add a `debugger` breakpoint and invoke Mocha
with `mocha debug`.

    node_modules/.bin/mocha debug --timeout 10000 -- tests/e2e/scenarios/{filename}.js
                            ^^^^^

