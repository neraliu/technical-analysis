/*
Copyright (c) 2015, Nera Liu. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@gmail.com>
*/
(function() {
"use strict";

var fs = require('fs');
var utils = {};

utils.readConf = function(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
};

utils.writeFile = function(file, data) {
    var f = fs.openSync(file, 'w');
    fs.writeSync(f, data);
    fs.closeSync(f);
};

module.exports = utils;

})();
