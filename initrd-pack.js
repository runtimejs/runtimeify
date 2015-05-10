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

var fs = require('fs');
var CombinedStream = require('combined-stream');
var streamifier = require('streamifier');
var crc32 = require('buffer-crc32');
var streamToBuffer = require('stream-to-buffer');
var async = require('async');
var nullByte = new Buffer([0]);

module.exports = function(out, files) {
  var combinedStream = CombinedStream.create();

  var headerBuffer = new Buffer(12);
  headerBuffer.writeUInt32BE(0xCAFECAFE, 0);
  headerBuffer.writeUInt8('P'.charCodeAt(0), 4);
  headerBuffer.writeUInt8('C'.charCodeAt(0), 5);
  headerBuffer.writeUInt8('K'.charCodeAt(0), 6);
  headerBuffer.writeUInt8('G'.charCodeAt(0), 7);
  headerBuffer.writeUInt32BE(files.length, 8);

  combinedStream.append(streamifier.createReadStream(headerBuffer));

  async.mapSeries(files, function(file, cb) {
    streamToBuffer(file.stream, function(err, fileBuffer) {
      if (err) {
        return cb(err);
      }

      var buf1 = new Buffer(8);
      var buf2 = new Buffer(file.name, 'utf8');
      buf1.writeUInt32BE(0xAA, 0);        // type default
      buf1.writeUInt32BE(buf2.length, 4); // name length
      var buf3 = crc32(fileBuffer);
      var buf4 = new Buffer(4);
      buf4.writeUInt32BE(fileBuffer.length, 0); // file length
      var b = Buffer.concat([buf1, buf2, nullByte, buf3, buf4]);
      combinedStream.append(streamifier.createReadStream(b));
      combinedStream.append(streamifier.createReadStream(fileBuffer));
      cb(null);
    });
  }, function(err) {
    if (err) {
      console.log(err.message);
      process.exit(1);
      return;
    }

    combinedStream.pipe(out);
  });
};
