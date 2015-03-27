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

    describe('Technical Analysis Moving Average Test Suite', function(){
        var ta;
        before(function(){
            ta = new TA();
        })

        it('Technical Analysis Moving Average not enought data test', function(){
            try {
                var d = [1,2,3,4,5,6,7,8,9,10];
                var r = ta.movingAverage(d, 11);
            } catch (err) {
                expect(err).to.match(/^\[ERROR\]/);
            }
        });

        it('Technical Analysis Moving Average basic test', function(){
            var t = [
                { d:[1,2,3,4,5], t:5, r:[NaN,NaN,NaN,NaN,3] },
                { d:[5,4,3,2,1], t:5, r:[NaN,NaN,NaN,NaN,3] },
                { d:[1.1,2.1,3.1,4.1,5.1], t:5, r:[NaN,NaN,NaN,NaN,3.1] },
                { d:[1,2,3,4,5,6,7,8,9,10], t:5, r:[NaN,NaN,NaN,NaN,3,4,5,6,7,8] },
                { d:[10000,20000,30000,40000,50000,60000,70000,80000,90000,100000], t:5, r:[NaN,NaN,NaN,NaN,30000,40000,50000,60000,70000,80000] }
            ];
            t.forEach(function(obj) {
                var r = ta.movingAverage(obj.d, obj.t);
                expect(r).to.deep.equal(obj.r);
            });
        });
    });

}());
