/*
Copyright (c) 2015, Nera Liu. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@yahoo-inc.com>
*/
(function() {
"use strict";

var debugMA = require('debug')('ma');

function TechnicalAnalysis() {
    this.data = [];
}

TechnicalAnalysis.prototype.movingAverage = function(data) {
};

module.exports = {
    TechnicalAnalysis: TechnicalAnalysis
};

})();
