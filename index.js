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

var browserify = require('browserify');
var initrdPack = require('./initrd-pack');
var fs = require('fs');
var path = require('path');
var builtins = require('browserify/lib/builtins');

module.exports = function (opts, cb) {
  var b = browserify(opts.file, opts);

  // TODO: include files separately
  // var rows = [];
  //
  // b.pipeline.get('deps').push(through.obj(
  //   function(row, enc, next) { rows.push(row); next() },
  //   function() {
  //     console.log(rows);
  //   }
  // ));

  b.bundle(function (err, res) {
    if (err) {
      cb(err);
    } else {
      var bundle = { buffer: res, name: '/bundle.js' };
      var out = fs.createWriteStream(path.resolve(opts.output));
      initrdPack(out, [bundle]);
      out.once('finish', cb);
      out.once('error', cb);
    }
  });
};

module.exports.builtins = builtins;
