/*
Copyright (c) 2015, All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@yahoo-inc.com>
*/
var debug = require("debug");
    progname = 'agent';
debug.enable(progname);

var redis = require("redis"),
    client = redis.createClient();

(function() {

    client.on("error", function (err) {
        console.log("[ERROR] " + err);
        process.exit(-1);
    });

}).call(this);
