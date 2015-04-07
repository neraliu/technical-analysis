/*
Copyright (c) 2015, All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@gmail.com>
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
    var _size = 360;
    var targets = [
        // conf
        {symbol:'NASDAQ_AAPL',    size:_size,type:'close', 
            tests: {std: [2.0,1.9,1.8,1.7,1.6,1.5,1.4,1.3,1.2,1.1,1.0] },
        },
        {symbol:'NASDAQ_FB',      size:_size,type:'close', 
            tests: {std: [2.0,1.9,1.8,1.7,1.6,1.5,1.4,1.3,1.2,1.1,1.0] },
        },
        {symbol:'NASDAQ_GOOG',    size:_size,type:'close', 
            tests: {std: [2.0,1.9,1.8,1.7,1.6,1.5,1.4,1.3,1.2,1.1,1.0] },
        },
        {symbol:'NASDAQ_GOOGL',   size:_size,type:'close', 
            tests: {std: [2.0,1.9,1.8,1.7,1.6,1.5,1.4,1.3,1.2,1.1,1.0] },
        },
        {symbol:'NASDAQ_YHOO',    size:_size,type:'close', 
            tests: {std: [2.0,1.9,1.8,1.7,1.6,1.5,1.4,1.3,1.2,1.1,1.0] },
        },
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
                dataSample = dataSample.reverse();
                dataDate = dataDate.reverse();
                return Promise.resolve();

            // bollinger bands chart
            }).then(function() {
                var results = [],
                    ma = 20;

                target.tests.std.forEach(function(std, j) {
                console.log("====================================================");
                console.log("[INFO] BollingerBands std:"+std);

                var bollingerBands = ta.bollingerBands(dataSample, ma, std, std);
                bollingerBands.date = dataDate;
                var accounts = [],
                    size = 100,
                    maxAmount = 0, amount = 0;

                dataSample.forEach(function(d, i) {
                    if (!isNaN(bollingerBands.lower[i]) && bollingerBands.lower[i] >= d) {
                        // console.log("[INFO] Buy Signal @ "+d+"/"+bollingerBands.lower[i]+", date:"+bollingerBands.date[i]);
                        var tran = {};
                        tran.buyPrice = d;
                        tran.bollingerBandsR3 = bollingerBands.lower[i];
                        tran.status = 'open';
                        tran.cost = 9.99;
                        tran.size = size;
                        tran.marketValueBuyPrice = tran.buyPrice * tran.size;

                        amount += tran.marketValueBuyPrice;
                        accounts.push(tran);
                    } else if (!isNaN(bollingerBands.upper[i]) && bollingerBands.upper[i] <= d) {
                        accounts.forEach(function(t) {
                            if (t.status === 'open') {
                                // console.log("[INFO] Sell Signal @ "+d+"/"+bollingerBands.upper[i]+", date:"+bollingerBands.date[i]);
                                // console.log("[INFO] Executing Sell Signal @ "+d+"/"+bollingerBands.upper[i]+", date:"+bollingerBands.date[i]);
                                t.sellPrice = d;
                                t.cost += 9.99;
                                t.status = 'closed';
                                t.marketValueSellPrice = t.sellPrice * t.size;
                                t.profitOrLoss = (t.sellPrice-t.buyPrice)*t.size - t.cost;
                                if (amount > maxAmount) {
                                    maxAmount = amount;
                                }
                                amount = 0;
                            }
                        });
                    }
                });
                var tran = {};
                tran.status = 'final';
                tran.cost = maxAmount;
                accounts.push(tran);

                var profit = 0,
                    maxAmount = 0;
                accounts.forEach(function(t) {
                    if (t.status !== 'final') {
                        profit += t.profitOrLoss;
                    } else {
                        maxAmount = t.cost;
                    }
                });

                var res = {};
                res.t = ma;
                res.std = std;
                res.profit = profit;
                res.maxAmount = maxAmount;
                res.return = (profit/maxAmount);
                results.push(res);
                console.log("[INFO] Profit/Loss: "+profit);
                console.log("[INFO] Cost: "+maxAmount);
                console.log("[INFO] Return: "+(profit/maxAmount));
                }); // targets.tests.forEach(function(std, j) {

                return Promise.resolve(results);
            // end
            }).then(function(results) {
                console.log("[AGENT] Completed!");
                dataSample = [];
                dataDate = [];
                var f = fs.openSync(filePrefix+"backTestingBollingerBandsAgent.html", 'w');
                var o = '<table border="1">';
                o += '<tr><td>ma</td><td>std</td><td>profit</td><td>maxAmount</td><td>return</td></tr>';
                results.forEach(function(res, i) {
                    o += "<tr><td>"+res.ma+"</td><td>"+res.std+"</td><td>"+res.profit+"</td><td>"+res.maxAmount+"</td><td>"+res.return+"</td></tr>";
                });
                o += '</table>';
                o += "<a href='index.html'>back</a>";
                fs.writeSync(f, o);
                fs.closeSync(f);
                if (index+1 === targets.length) {
                    process.exit(0);
                }
                return Promise.resolve(0);
            });
        }); // targets.forEach
    });

}).call(this);
// http://www.html5rocks.com/en/tutorials/es6/promises/
