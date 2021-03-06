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

    describe('Technical Analysis Bollinger Bands Test Suite', function(){
        var ta;
        before(function(){
            ta = new TA();
        })

        it('Technical Analysis Bollinger Bands not enought data test', function(){
            try {
                var d = [1,2,3,4,5,6,7,8,9,10];
                var r = ta.bollingerBands(d, 11, 2, 2);
            } catch (err) {
                expect(err).to.match(/^\[ERROR\]/);
            }
        });

        it('Technical Analysis Bollering Bands basic test', function(){
            var t = [
                { d:[90.70,92.90,92.99,91.80,92.66,92.68,92.30,92.77,92.54,92.95,93.20,91.07,89.83,89.74,90.40,90.74,88.02,88.09,88.84,90.78,90.54,91.39,90.65], t:20, std:2, 
                upper:[NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,94.53,94.53,94.37,94.15],
                middle:[NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,91.25,91.24,91.17,91.05],
                lower:[NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,87.97,87.95,87.96,87.95],
                },
                { d:[90.70,92.90,92.99,91.80,92.66,92.68,92.30,92.77,92.54,92.95,93.20,91.07,89.83,89.74,90.40,90.74,88.02,88.09,88.84,90.78,90.54,91.39,90.65], t:20, std:1.9, 
                upper:[NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,94.37,94.37,94.21,93.99],
                middle:[NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,91.25,91.24,91.17,91.05],
                lower:[NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,88.13,88.12,88.12,88.11],
                },
            ];
            t.forEach(function(obj) {
                var r = ta.bollingerBands(obj.d, obj.t, obj.std, obj.std);
                expect(r.upper).to.deep.equal(obj.upper);
                expect(r.middle).to.deep.equal(obj.middle);
                expect(r.lower).to.deep.equal(obj.lower);
            });
        });
    });

}());
