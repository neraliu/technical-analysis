/*
Copyright (c) 2015, Nera Liu. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@yahoo-inc.com>
*/
(function () {

    var mocha = require("mocha"),
        expect = require('chai').expect;

    var TA = require("../../src/technical-analysis").TechnicalAnalysis;

    describe('Technical Analysis Exponential Moving Average Test Suite', function(){
        var ta;
        before(function(){
            ta = new TA();
        })

        it('Technical Analysis Exponential Moving Average not enought data test', function(){
            try {
                var d = [1,2,3,4,5,6,7,8,9,10];
                var r = ta.exponentialMovingAverage(d, 11);
            } catch (err) {
                expect(err).to.match(/^\[ERROR\]/);
            }
        });

        it('Technical Analysis Exponential Moving Average basic test', function(){
            var t = [
                { d:[22.27,22.19,22.08,22.17,22.18,22.13,22.23,22.43,22.24,22.29], t:10, r:[NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,22.22] },
                { d:[22.27,22.19,22.08,22.17,22.18,22.13,22.23,22.43,22.24,22.29,22.15,22.39,22.38,22.61,23.36,24.05,23.75,23.83,23.95,23.63,23.82,23.87,23.65,23.19,23.10,23.33,22.68,23.10,22.40,22.17], t:10, r:[NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,22.22,22.21,22.24,22.27,22.33,22.52,22.80,22.97,23.13,23.28,23.34,23.43,23.51,23.54,23.48,23.41,23.40,23.27,23.24,23.09,22.92] }
            ];
            t.forEach(function(obj) {
                var r = ta.exponentialMovingAverage(obj.d, obj.t);
                expect(r).to.deep.equal(obj.r);
            });
        });
    });

}());
