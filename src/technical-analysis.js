/*
Copyright (c) 2015, Nera Liu. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@yahoo-inc.com>
*/
(function() {
"use strict";

function TechnicalAnalysis() {
    this.decimalRoundingFactor = 100;
    this.decimalInternalRoundingFactor = 10000;
}

/**
* @function module:technical-analysis#expoentialMovingAverage
*
* @param {Array} d - the array of data.
* @param {int} t - the moving window of moving average.
* @returns {Array} - the result.
*
*/
TechnicalAnalysis.prototype.exponentialMovingAverage = function(d, t) {
    if (d.length >= t && d.constructor === Array) {
        var r = [],
            s = 0,
            last = NaN,
            multipler = Math.round((2/(t+1))*this.decimalInternalRoundingFactor)/this.decimalInternalRoundingFactor;

        for(var i=0;i<d.length;++i) {
            s += d[i];

            if (i < t-1) {
                r.push(NaN);
            } else if (i+1 === t) {
                last = Math.round((s*this.decimalRoundingFactor)/t)/this.decimalRoundingFactor;
                r.push(last);
            } else {
                last = Math.round(((d[i]-last)*multipler+last)*this.decimalRoundingFactor)/this.decimalRoundingFactor;
                r.push(last);
            }
        }
        return r;
    } else {
        throw "[ERROR] TechnicalAnalysis#exponentialMovingAverage: Not enought data! OR data is not Array!";
    }
};

/**
* @function module:technical-analysis#movingAverage
*
* @param {Array} d - the array of data.
* @param {int} t - the moving window of moving average.
* @returns {Array} - the result.
*
*/
TechnicalAnalysis.prototype.movingAverage = function(d, t) {
    if (d.length >= t && d.constructor === Array) {
        var r = [],
            s = 0;

        for(var i=0;i<d.length;++i) {
            s += d[i];

            if (i < t-1) {
                r.push(NaN);
            } else if (i+1 === t) {
                r.push(Math.round((s*this.decimalRoundingFactor)/t)/this.decimalRoundingFactor);
            } else {
                s -= d[i-t];
                r.push(Math.round((s*this.decimalRoundingFactor)/t)/this.decimalRoundingFactor);
            }
        }
        return r;
    } else {
        throw "[ERROR] TechnicalAnalysis#movingAverage: Not enought data! OR data is not Array!";
    }
};

module.exports = {
    TechnicalAnalysis: TechnicalAnalysis
};

})();
