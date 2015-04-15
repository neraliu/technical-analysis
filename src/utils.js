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

utils.saveBuyTransaction = function(stockid, price, volume, extra) {
    var tran = {};
    tran.stockid = stockid;
    tran.buyPrice = price;
    tran.status = 'open';
    tran.cost = 9.99;
    tran.volume = volume;
    tran.marketValueBuyPrice = tran.buyPrice * tran.volume;
    tran.extra = extra;
    return tran;
};

/* we assume sell the transaction atomically */
utils.saveSellTransaction = function(tran, price, volume, extra) {
    tran.sellPrice = price;
    tran.status = 'closed';
    tran.cost += 9.99;
    tran.volume -= volume;
    tran.marketValueSellPrice = tran.sellPrice * volume;
    tran.profitOrLoss = (tran.sellPrice-tran.buyPrice)*volume - tran.cost;
    tran.return = (tran.profitOrLoss/tran.marketValueBuyPrice);

    var o = tran.extra;
    tran.extra = extra;
    for (var key in o) {
        if (o.hasOwnProperty(key)) {
            tran.extra[key] = o[key];
        }
    }

    return tran;
};

module.exports = utils;

})();
