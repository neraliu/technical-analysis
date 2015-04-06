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
        client = redis.createClient(6379, '174.143.140.197', {auth_pass: 'iBwl3rz6MWIBN6z'}),
        dataSample = [],
        dataDate = [];

    // promise
    var seq = new Promise(function(resolve, reject) {
        resolve(1);
    });

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

    // conf
    var targets = [
        // conf
        {symbol:'NASDAQ_FB',    size:360,type:'close'},
        {symbol:'NASDAQ_YHOO',  size:360,type:'close'},
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
        console.log("[INFO] Redis connected!");
        targets.forEach(function(target, index) {

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

            // create folder for analysis
            seq.then(function() {
                fs.existsSync(filePrefix) === true ? '' : fs.mkdirSync(filePrefix);
                return Promise.resolve();

            // basic line chart
            }).then(function() {
                console.log("[INFO] Reading data completed!"); 
                console.log("[INFO] Data size: "+dataSample.length);
                var o = "date\tclose\n";
                dataSample = dataSample.reverse();
                dataDate = dataDate.reverse();
                dataSample.forEach(function(d, i) {
                    o += "20"+dataDate[i]+"\t"+d+"\n";
                });
                fs.writeFileSync(filePrefix + "line.tsv", o, {flag:'w'});
                return Promise.resolve();

            // moving average chart
            }).then(function() {
                console.log("[INFO] Moving Average!");
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
                fs.writeFileSync(filePrefix + "movingAverage.tsv", o, {flag:'w'});
                return Promise.resolve(r);

            // end
            }).then(function() {
                console.log("[INFO] Cleaning the variables");
                dataSample = [];
                dataDate = [];
                if (index+1 === targets.length) {
                    process.exit(0);
                }
                return Promise.resolve();
            });
        }); // targets.forEach
    });

/*


        seq.then(function() {
            return Promise.resolve();
        }).then(function(r) {
            console.log("====================================================");
            console.log("[INFO] Symbol: "+target.symbol);
            console.log("[INFO] Start date range: "+dataDate[0]);
            console.log("[INFO] End date range: "+dataDate[dataDate.length-1]);
            dataSample.slice(dataSample.length-10, dataSample.length).forEach(formatString);
            console.log("[INFO] Current Price:\t\t\t\t\t\t "+str);
            function getMaxOfArray(numArray) {
                return Math.max.apply(null, numArray);
            }
            console.log("[INFO] Max price:\t\t\t\t\t\t "+getMaxOfArray(dataSample));
            function getMinOfArray(numArray) {
                return Math.min.apply(null, numArray);
            }
            console.log("[INFO] Min price:\t\t\t\t\t\t "+getMinOfArray(dataSample));
            return Promise.resolve();
        }).then(function() {
            console.log("====================================================");
            var r20 = ta.exponentialMovingAverage(dataSample, 20);
            var r50 = ta.exponentialMovingAverage(dataSample, 50);
            var r = {};
            r.data = dataSample;
            r.date = dataDate;
            r.r20 = r20;
            r.r50 = r50;
            r.r20.slice(r.r20.length-10, r.r20.length).forEach(formatString);
            console.log("[INFO] Exponential Moving Average (20-day) price:\t\t "+str);
            r.r50.slice(r.r50.length-10, r.r50.length).forEach(formatString);
            console.log("[INFO] Exponential Moving Average (50-day) price:\t\t "+str);
            return Promise.resolve(r);
        }).then(function() {
            console.log("====================================================");
            var r = ta.bollingerBands(dataSample, 20, 2, 2);
            r.upper.slice(r.upper.length-10, r.upper.length).forEach(formatString);
            console.log("[INFO] Bollinger Bands Upper Band (20-day) price:\t\t "+str);
            r.middle.slice(r.middle.length-10, r.middle.length).forEach(formatString);
            console.log("[INFO] Bollinger Bands Middle Band (20-day) price:\t\t "+str);
            r.lower.slice(r.lower.length-10, r.lower.length).forEach(formatString);
            console.log("[INFO] Bollinger Bands Lower Band (20-day) price:\t\t "+str);
            r.data = dataSample;
            r.date = dataDate;
            return Promise.resolve(r);
        }).then(function(bollingerBands) {
            console.log("====================================================");
            var accounts = [],
                size = 100,
                maxAmount = 0, amount = 0;
            dataSample.forEach(function(d, i) {
                if (bollingerBands.lower[i] >= d) {
                    console.log("[INFO] Buy Signal @ "+d+"/"+bollingerBands.lower[i]+", date:"+bollingerBands.date[i]);
                    var tran = {};
                    tran.buyPrice = d;
                    tran.bollingerBandsR3 = bollingerBands.lower[i];
                    tran.status = 'open';
                    tran.cost = 9.99;
                    tran.size = size;
                    tran.marketValueBuyPrice = tran.buyPrice * tran.size;

                    amount += tran.marketValueBuyPrice;
                    accounts.push(tran);
                } else if (bollingerBands.upper[i] <= d) {
                    console.log("[INFO] Sell Signal @ "+d+"/"+bollingerBands.upper[i]);
                    accounts.forEach(function(t) {
                        if (t.status === 'open') {
                            console.log("[INFO] Executing Sell Signal @ "+d+"/"+bollingerBands.upper[i]+", date:"+bollingerBands.date[i]);
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
            return Promise.resolve(accounts);
        }).then(function(accounts) {
            console.log("====================================================");
            var profit = 0,
                maxAmount = 0;
            accounts.forEach(function(t) {
                if (t.status !== 'final') {
                    profit += t.profitOrLoss;
                } else {
                    maxAmount = t.cost;
                }
            });
            console.log("[INFO] Profit/Loss: "+profit);
            console.log("[INFO] Cost: "+maxAmount);
            console.log("[INFO] Return: "+(profit/maxAmount));
        });
    }); // targets.forEach
*/

}).call(this);
// http://www.html5rocks.com/en/tutorials/es6/promises/
