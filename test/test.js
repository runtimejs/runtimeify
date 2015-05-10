var test = require('tape');
var shell = require('shelljs');
var path = require('path');
var fs = require('fs');

test('bundle', function(t) {
  shell.cd(__dirname);
  var indexPath = path.resolve(__dirname, 'bundle_index.js');
  var cliPath = path.resolve(__dirname, '../runtimeify.js');
  var outPath = path.resolve(__dirname, 'initrd');

  if (shell.exec(cliPath + ' ' + indexPath).code !== 0) {
    shell.exit(1);
  }

  fs.statSync(outPath);
  shell.rm(outPath);
  t.end();
});
