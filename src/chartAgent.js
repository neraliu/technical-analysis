/*
Copyright (c) 2015, All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@yahoo-inc.com>
*/
/*jshint -W083 */
/*
var debug = require("debug");
    progname = 'agent';
debug.enable(progname);
*/

/* promise */
var Promise = require('promise'),
    fs = require('fs');

(function() {

    var ONE_DAY_MILLISECOND = 86400000;

    // redis
    var redis = require("redis"),
        client = redis.createClient(6379, '174.143.140.197', {auth_pass: 'iBwl3rz6MWIBN6z'});

    // conf
    var targets = [
        // conf
        {symbol:'NASDAQ_FB',    size:90,type:'close'},
        {symbol:'NASDAQ_YHOO',  size:90,type:'close'},
        ],
        d = new Date(),
        ts = d.getTime();

    // technical analysis
    var TechnicalAnalysis = require("./technical-analysis.js").TechnicalAnalysis,
        ta = new TechnicalAnalysis();

    var str;
    function formatString(e, i, arr) {
        if (i === 0) str = '';
        str += e.toFixed(2) + " ";
    }

    // main
    client.on("error", function (err) {
        console.log("[ERROR] " + err);
    });
    client.on("connect", function () {
        console.log("[AGENT] Redis connected!");
        targets.forEach(function(target, index) {

            // data 
            var dataSample = [],
                dataDate = [];

            // read data
            var readDataPromise = function(key) {
                return new Promise(function(resolve, reject) {
                    client.get(key, function(err, reply) {
                        if (reply !== null) {
                            console.log("[AGENT] Reading key: "+key+",value:"+reply);
                            dataSample.push(parseFloat(reply));
                            dataDate.push(key.substring(0, 6));
                        }
                        resolve(reply);
                    });
                });
            };
            var readData = function(key, seq) {
                return seq.then(function() { 
                    return readDataPromise(key); 
                });
            };

            var seq = new Promise(function(resolve, reject) {
                dataSample = [];
                dataDate = [];
                resolve(1);
            });

            // reading data
            var filePrefix = "./app/public/data/"+target.symbol+"/";
            var fileTemplatePrefix = "./app/public/data/";
            for(var i=0;i<target.size;++i) {
                var d = new Date(ts-ONE_DAY_MILLISECOND*i),
                y = d.getFullYear().toString().replace(/^20/, ""),
                m = d.getMonth()+1 < 10? "0"+(d.getMonth()+1) : d.getMonth()+1,
                da = d.getDate() < 10? "0"+d.getDate() : d.getDate(),
                dString = y+m+da;
                var key = dString+":"+target.symbol+":"+target.type;
                seq = readData(key, seq);
            }

            // reading data completed
            seq.then(function() {
                console.log("[AGENT] DataSample size: "+dataSample.length);
                return Promise.resolve();

            // basic line chart
            }).then(function() {
                fs.existsSync(filePrefix) === true ? '' : fs.mkdirSync(filePrefix);

                // index.html
                var o = "<html><body><h1>"+target.symbol+"</h1>";
                o += "<ul>";
                o += "<li><a href='line.html'>Basic Chart</a></li>";
                o += "<li><a href='movingAverage.html'>Moving Average Chart</a></li>";
                o += "<li><a href='exponentialMovingAverage.html'>Exponential Moving Average Chart</a></li>";
                o += "<li><a href='bollingerBands.html'>Bollinger Bands Chart</a></li>";
                o += "</ul><a href='../index.html'>back</a></body></html>";
                fs.writeFileSync(filePrefix+"index.html", o, {flag:'w'});
                return Promise.resolve();

            // basic line chart
            }).then(function() {
                console.log("[AGENT] Basic Line Chart!");
                var o = "date\tclose\n";
                dataSample = dataSample.reverse();
                dataDate = dataDate.reverse();
                dataSample.forEach(function(d, i) {
                    o += "20"+dataDate[i]+"\t"+d+"\n";
                });
                fs.writeFileSync(filePrefix + "line.tsv", o, {flag:'w'});

                // line.html
                fs.existsSync(filePrefix+"line.html") !== true ? '' : o = fs.readFileSync(fileTemplatePrefix+"line.tmpl").toString();
                o += "<h1>"+target.symbol+"</h1>";
                o += "<table>";
                o += "<tr><td>Data Size</td><td>"+dataSample.length+"</td></tr>";
                o += "<tr><td>Current Price</td><td>"+dataSample[dataSample.length-1]+"</td></tr>";
                var r = ta.max(dataSample, dataSample.length); 
                o += "<tr><td>Max Price</td><td>"+r[r.length-1]+"</td></tr>";
                r = ta.min(dataSample, dataSample.length); 
                o += "<tr><td>Min Price</td><td>"+r[r.length-1]+"</td></tr>";
                o += "</table>";
                o += "<a href='./index.html'>back</a>";
                o += "</body></html>";
                fs.writeFileSync(filePrefix+"line.html", o, {flag:'w'});
                return Promise.resolve();

            // moving average chart
            }).then(function() {
                console.log("[AGENT] Moving Average Chart!");
                var r20 = ta.movingAverage(dataSample, 20);
                var r50 = ta.movingAverage(dataSample, 50);
                var r = {};
                var o = "date\tm0\tm20\tm50\n";
                r.data = dataSample;
                r.date = dataDate;
                r.r20 = r20;
                r.r50 = r50;
                dataSample.forEach(function(d, i) {
                    o += "20"+dataDate[i]+"\t"
                    o += d+"\t";
                    isNaN(r.r20[i]) === true ? o += d+"\t" : o += r.r20[i]+"\t";
                    isNaN(r.r50[i]) === true ? o += d+"\n" : o += r.r50[i]+"\n";
                });
                fs.writeFileSync(filePrefix+"movingAverage.tsv", o, {flag:'w'});

                // movingAverage.html
                fs.existsSync(filePrefix+"movingAverage.html") !== true ? '' : o = fs.readFileSync(fileTemplatePrefix+"movingAverage.tmpl").toString();
                o += "<h1>"+target.symbol+"</h1>";
                o += "<table>";
                o += "</table>";
                o += "<a href='./index.html'>back</a>";
                o += "</body></html>";
                fs.writeFileSync(filePrefix+"movingAverage.html", o, {flag:'w'});
                return Promise.resolve(r);

            // exponential moving average chart
            }).then(function() {
                console.log("[AGENT] Exponential Moving Average Chart!");
                var r20 = ta.exponentialMovingAverage(dataSample, 20);
                var r50 = ta.exponentialMovingAverage(dataSample, 50);
                var r = {};
                var o = "date\tm0\tm20\tm50\n";
                r.data = dataSample;
                r.date = dataDate;
                r.r20 = r20;
                r.r50 = r50;
                dataSample.forEach(function(d, i) {
                    o += "20"+dataDate[i]+"\t"
                    o += d+"\t";
                    isNaN(r.r20[i]) === true ? o += d+"\t" : o += r.r20[i]+"\t";
                    isNaN(r.r50[i]) === true ? o += d+"\n" : o += r.r50[i]+"\n";
                });
                fs.writeFileSync(filePrefix+"exponentialMovingAverage.tsv", o, {flag:'w'});

                // exponentialMovingAverage.html
                fs.existsSync(filePrefix+"exponentialMovingAverage.html") !== true ? '' : o = fs.readFileSync(fileTemplatePrefix+"exponentialMovingAverage.tmpl").toString();
                o += "<h1>"+target.symbol+"</h1>";
                o += "<table>";
                o += "</table>";
                o += "<a href='./index.html'>back</a>";
                o += "</body></html>";
                fs.writeFileSync(filePrefix+"exponentialMovingAverage.html", o, {flag:'w'});
                return Promise.resolve(r);

            // bollinger bands chart
            }).then(function() {
                console.log("[AGENT] Bollinger Bands Chart!");
                var r = ta.bollingerBands(dataSample, 20, 2, 2);
                r.data = dataSample;
                r.date = dataDate;
                var o = "date\tb0\tlower\tmiddle\tupper\n";
                dataSample.forEach(function(d, i) {
                    o += "20"+dataDate[i]+"\t"
                    o += d+"\t";
                    isNaN(r.lower[i]) === true ? o += d+"\t" : o += r.lower[i]+"\t";
                    isNaN(r.middle[i]) === true ? o += d+"\t" : o += r.middle[i]+"\t";
                    isNaN(r.upper[i]) === true ? o += d+"\n" : o += r.upper[i]+"\n";
                });
                fs.writeFileSync(filePrefix+"bollingerBands.tsv", o, {flag:'w'});

                // bollingerBands.html
                fs.existsSync(filePrefix+"bollingerBands.html") !== true ? '' : o = fs.readFileSync(fileTemplatePrefix+"bollingerBands.tmpl").toString();
                o += "<h1>"+target.symbol+"</h1>";
                o += "<table>";
                o += "</table>";
                o += "<a href='./index.html'>back</a>";
                o += "</body></html>";
                fs.writeFileSync(filePrefix+"bollingerBands.html", o, {flag:'w'});
                return Promise.resolve(r);

            // end
            }).then(function() {
                console.log("[AGENT] Completed!");
                dataSample = [];
                dataDate = [];
                if (index+1 === targets.length) {
                    process.exit(0);
                }
                return Promise.resolve(0);
            });
        }); // targets.forEach
    });
}).call(this);
// http://www.html5rocks.com/en/tutorials/es6/promises/
