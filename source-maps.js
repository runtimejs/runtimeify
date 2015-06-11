
          var SourceMapConsumer = require('{sourceMapPath}').SourceMapConsumer;
          var smc = new SourceMapConsumer({map});
          Error.prepareStackTrace = function (error) {
            return error.stack.replace(/([a-z10-9\.\/]+):(\d+):(\d+)/g, function (match, file, p1, p2) {
              var line = Number(p1);
              var column = Number(p2);
              var original = smc.originalPositionFor({
                line: line,
                column: column
              });
              return original.source + ':' + original.line + ':' + original.column;
            });
          }