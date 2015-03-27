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
* @function module:technical-analysis#_standardDeviation
*/
TechnicalAnalysis.prototype._standardDeviation = function(d, m, t) {
    var sum = 0;
    var sqrDiffs = d.map(function(v) {
        var diff = v - m;
        return diff*diff;
    });
    sum = sqrDiffs.reduce(function(p, c) {
        return p + c;
    });
    return Math.sqrt(sum/t);
};

/**
* @function module:technical-analysis#bollingerBands
*
* @param {Array} d - the array of data.
* @param {int} t - the moving window of moving average.
* @param {float} stdUpper - the standard deviation of upper bands.
* @param {float} stdLower - the standard deviation of lower bands.
* @returns {Array} - the result.
*
*/
TechnicalAnalysis.prototype.bollingerBands = function(d, t, stdUpper, stdLower) {
    if (d.length >= t && d.constructor === Array) {
        var r = {},
            stds = [], f = this.decimalRoundingFactor;

        r.upper = [];
        r.middle = this.movingAverage(d, t, false);
        r.lower = [];

        var ta = this;
        r.middle.map(function(v, i) {
            if (!isNaN(v)) {
                var data = d.slice(i+1-t, i+1);
                var std = ta._standardDeviation(data, v, t);
                stds.push(std);
            } else {
                stds.push(NaN);
            }
        });

        r.middle.map(function(v, i) {
            // upper band
            r.upper.push(Math.round((v+stdUpper*stds[i])*f)/f);
            // middle band
            r.middle[i] = Math.round(r.middle[i]*f)/f;
            // lower band
            r.lower.push(Math.round((v-stdLower*stds[i])*f)/f);
        });

        return r;
    } else {
        throw "[ERROR] TechnicalAnalysis#bollingerBands: Not enought data! OR data is not Array!";
    }
};

/**
* @function module:technical-analysis#_expoentialMovingAverage
*/
TechnicalAnalysis.prototype._exponentialMovingAverage = function(d, t, i, m, pema, r) {
    if (i >= t && i<d.length) {
        pema = (d[i]-pema)*m + pema;
        r.push(pema);
    } else if (i>=0 && i<t) {
        pema = isNaN(pema)? d[i] : pema + d[i];
        if (i === t-1) {
            pema = pema/t;
            r.push(pema);
        } else {
            r.push(NaN);
        }
    }

    if (i<d.length) {
        return this._exponentialMovingAverage(d, t, i+1, m, pema, r);
    }
    return r;
};

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
        var m = (2/(t+1)),
            r = this._exponentialMovingAverage(d, t, 0, m, NaN, []),
            f = this.decimalRoundingFactor,
            result = [];
        
        r.forEach(function(data) {
            var s = isNaN(data) ? result.push(NaN) : result.push(Math.round(data*f)/f);
        });
        return result;
    } else {
        throw "[ERROR] TechnicalAnalysis#exponentialMovingAverage: Not enought data! OR data is not Array!";
    }
};

/**
* @function module:technical-analysis#max
*
* @param {Array} d - the array of data.
* @param {int} t - the moving window of data.
* @returns {Array} - the result.
*
*/
TechnicalAnalysis.prototype.max = function(d, t) {
    if (d.length >= t && d.constructor === Array) {
        var r = [];

        for(var i=0;i<d.length;++i) {
            if (i < t-1) {
                r.push(NaN);
            } else {
                var arr = d.slice(i+1-t, i+1);
                var max = Math.max.apply(null, arr);
                r.push(max);
            }
        }

        return r;
    } else {
        throw "[ERROR] TechnicalAnalysis#max: Not enought data! OR data is not Array!";
    }
};

/**
* @function module:technical-analysis#min
*
* @param {Array} d - the array of data.
* @param {int} t - the moving window of data.
* @returns {Array} - the result.
*
*/
TechnicalAnalysis.prototype.min = function(d, t) {
    if (d.length >= t && d.constructor === Array) {
        var r = [];

        for(var i=0;i<d.length;++i) {
            if (i < t-1) {
                r.push(NaN);
            } else {
                var arr = d.slice(i+1-t, i+1);
                var min = Math.min.apply(null, arr);
                r.push(min);
            }
        }

        return r;
    } else {
        throw "[ERROR] TechnicalAnalysis#min: Not enought data! OR data is not Array!";
    }
};

/**
* @function module:technical-analysis#movingAverage
*
* @param {Array} d - the array of data.
* @param {int} t - the moving window of moving average.
* @param {boolean} roundUp - round up the result?
* @returns {Array} - the result.
*
*/
TechnicalAnalysis.prototype.movingAverage = function(d, t, roundUp) {
    if (d.length >= t && d.constructor === Array) {
        var r = [],
            s = 0, f = this.decimalRoundingFactor, ma;

        roundUp = typeof roundUp === undefined? true : roundUp;

        for(var i=0;i<d.length;++i) {
            s += isNaN(d[i])? 0: d[i];
            if (i < t-1) {
                r.push(NaN);
            } else if (i+1 === t) {
                ma = roundUp? Math.round((s/t)*f)/f: s/t;
                r.push(ma);
            } else {
                s -= isNaN(d[i-t])? 0: d[i-t];
                ma = roundUp? Math.round((s/t)*f)/f: s/t;
                r.push(ma);
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
