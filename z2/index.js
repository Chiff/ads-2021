const fs = require('fs');
const perf = require('execution-time')();
const chalk = require('chalk');
const logger = require('simple-node-logger').createSimpleLogger('output.log');

fs.readFile('cvicenie2data.txt', 'utf8', function (err, data) {
    if (err) {
        return logger.error(chalk.red(err));
    }

    handleData(data);
});

const DESIRED_DISTANCE_PRE_DAY = 400;
const penalize = (x) => Math.pow(DESIRED_DISTANCE_PRE_DAY - x, 2);

const handleData = (file) => {
    const townList = file
        .split(/\r?\n/)
        .map(e => parseInt(e))
        .filter(e => !Number.isNaN(e));

    perf.start();

    const pens = townList.map(penalize);
    townList.forEach((town, i) => {
        pens[i] = townList.slice(0, i).reduce((best, dist, ii) => {
            const possibility = pens[ii] + penalize(town - dist);
            return possibility < best ? possibility : best;
        }, pens[i]);
    });

    logger.info(chalk.blue(`Execution time: ${perf.stop().time}ms`));
    logger.info(chalk.green(`Penalty: ${pens.reverse()[0]}`));
};

