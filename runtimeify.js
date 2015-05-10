#!/usr/bin/env node

// Copyright 2014-2015 runtime.js project authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

require('colors');
var shell = require('shelljs');
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var browserify = require('browserify');
var through = require('through2');
var initrdPack = require('./initrd-pack');
var fs = require('fs');
var bundlePath = path.resolve('./bundle.js');

var arglist = argv._;
if (arglist.length === 0) {
  shell.echo('error: no input file'.red);
  return shell.exit(1);
}

var output = argv.o || 'initrd';
var file = path.resolve(arglist[arglist.length - 1]);
var b = browserify(file);

// TODO: include files separately
// var rows = [];
//
// b.pipeline.get('deps').push(through.obj(
//   function(row, enc, next) { rows.push(row); next() },
//   function() {
//     console.log(rows);
//   }
// ));

var stream = b.bundle();
var bundle = { stream: stream, name: '/system/bundle.js' };
var out = fs.createWriteStream(path.resolve(output));
initrdPack(out, [bundle]);
