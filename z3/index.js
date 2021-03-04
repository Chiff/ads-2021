const fs = require('fs');
const perf = require('execution-time')();
const chalk = require('chalk');
const logger = require('simple-node-logger').createSimpleLogger('output.log');


fs.readFile('cvicenie3data.txt', 'utf8', function (err, data) {
    if (err) {
        return logger.error(chalk.red(err));
    }

    handleData(data);
});

const handleData = (file) => {
    const input = file
        .split(/\r?\n/)
        .map(e => e.split(' ').map(e => parseInt(e)))
        .filter(e => !Number.isNaN(e));

    perf.start();


    input.forEach((row, i) => {
        if (i === 0) return;

        row.forEach((value, ii) => {
            const prevRow = input[i - 1];
            const options = [
                value + prevRow[ii + 1],
                value + prevRow[ii],
                value + prevRow[ii - 1]
            ].filter(isNotNull);

            input[i][ii] = Math.min(...options);
        });
    });

    const res = Math.min(...input.reverse()[0]);

    logger.info(chalk.blue(`Execution time: ${perf.stop().time}ms`));
    logger.info(chalk.green(`Minimal: ${res}`));
};


const isNotNull = (item) => !!item;
