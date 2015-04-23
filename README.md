Technical Analysis (this branch is just for FUN!)
=================================================

technical-analysis is the npm package implementing well known technical analysis formulas.

## Quick Start

### Server-side (nodejs)

Install the [technical-analysis npm](https://www.npmjs.com/package/technical-analysis)
```sh
npm install technical-analysis
```

```
var TA = require("technical-analysis").TechnicalAnalysis;
var ta = new TA();

/* prepare the data array */
var d = [1,2,3,4,5];

/* get the moving average of the data set */
var r = ta.movingAverage(d, 5);
/* r = [NaN,NaN,NaN,NaN,3] */
```

## Supported Technical Analysis Formulas

* bollingerBands(data, interval, upperBandStd, lowerBandStd)
* exponentialMovingAverage(data, interval)
* max(data, interval)
* min(data, interval)
* movingAverage(data, interval)

## Development & Contributions

### How to test
```sh
npm test
```

And you are welcome to contribute to this library.

### Build

## License

This software is free to use under the BSD license.
See the [LICENSE file](./LICENSE) for license text and copyright information.
