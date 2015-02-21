/*
Copyright (c) 2015, Nera Liu. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@yahoo-inc.com>
*/
(function () {

    require("mocha");
    var TA = require("../../src/technical-analysis").TechnicalAnalysis,
        redis = require('redis'),
        client = redis.createClient();

    describe('Technical Analysis Moving Average Test Suite', function(){

        var data = [];
        before(function(){
        })

        it('Technical Analysis Moving Average basic test', function(){
        });

    });
}());
