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
var sourceMapper = require('source-mapper');
var format = require('format-text');
var tmpl = fs.readFileSync(__dirname + '/source-maps.js', 'utf8');

module.exports = function (opts, cb) {
  var b = browserify(opts.file, {
    builtins: opts.builtins,
    debug: opts.debug
  });

  // TODO: include files separately
  // var rows = [];
  //
  // b.pipeline.get('deps').push(through.obj(
  //   function(row, enc, next) { rows.push(row); next() },
  //   function() {
  //     console.log(rows);
  //   }
  // ));

  b.require(require.resolve('source-map'));

  b.bundle(function (err, res) {
    if (err) {
      cb(err);
    } else {

      if (opts.debug) {
        var map = JSON.stringify(sourceMapper.extract(res.toString()).map);
        var sourceMapPath = require.resolve('source-map');

        sourceMaps = format(tmpl, {
          sourceMapPath: sourceMapPath,
          map: map
        });

        res = Buffer.concat([ res, new Buffer(sourceMaps)]);
      }

      var bundle = { buffer: res, name: '/bundle.js' };
      var out = fs.createWriteStream(path.resolve(opts.output));
      initrdPack(out, [bundle]);
      out.once('finish', cb);
      out.once('error', cb);
    }
  });
};

module.exports.builtins = builtins;
