
          var SourceMapConsumer = require('{sourceMapPath}').SourceMapConsumer;
          var smc = new SourceMapConsumer({map});
          Error.prepareStackTrace = function (error) {
            return error.stack
              .replace(/[a-z10-9\.\/]+:(\d+):(\d+)/g, function (match, p1, p2) {
                var line = Number(p1);
                var column = Number(p2);
                var original = smc.originalPositionFor({
                  line: line,
                  column: column
                });
                return original.source + ':' + original.line + ':' + original.column;
              })
              .split('\n')
              .filter(function (row) {
                return row.indexOf('browser-pack/_prelude.js:1:0') === -1;
              })
              .join('\n');

          }
