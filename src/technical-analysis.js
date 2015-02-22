/*
Copyright (c) 2015, Nera Liu. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@yahoo-inc.com>
*/
(function() {
"use strict";

function TechnicalAnalysis() {
    this.decimalRoundingFactor = 1000;
}

TechnicalAnalysis.prototype.movingAverage = function(d, t) {
    if (d.length >= t && d.constructor === Array) {
        var r = [],
            s = 0,
            c = 1;
        for(var i=0;i<d.length;++i) {
            if (c-1 < t) {
                s += d[i];
                if (c === t) {
                    r.push(Math.round((s*this.decimalRoundingFactor)/t)/this.decimalRoundingFactor);
                } else {
                    r.push(NaN);
                }
                ++c;
            } else {
                s += d[i];
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
