const fs = require('fs');
const perf = require('execution-time')();
const chalk = require('chalk');
const logger = require('simple-node-logger').createSimpleLogger('output.log');


fs.readFile('data.txt', 'utf8', function (err, data) {
    if (err) {
        return logger.error(chalk.red(err));
    }

    handleData(data);
});

const MAX_WEIGHT = 2000;

const handleData = (file) => {
    const input = file
        .split(/\r?\n/)
        .map(e => {
            const arr = e.split(',').map(e => parseInt(e));
            return {
                first: {
                    value: arr[0],
                    weight: arr[1],
                },
                second: {
                    value: arr[2],
                    weight: arr[3],
                },
            };
        })
        .filter(e => !!e?.first?.value);

    perf.start();

    const knapsack = new Array(input.length + 1).fill(0).map(() => new Array(MAX_WEIGHT  +1).fill(0));

    input.push(empty());
    input.reduce((acc, item, i) => {
        if (i === 0) return item;

        for (let weight = 0; weight < knapsack[i].length; weight++) {
            if (acc.first.weight > weight && acc.second.weight > weight) {

                knapsack[i][weight] = knapsack[i - 1][weight];

            } else if (acc.first.weight > weight && weight >= acc.second.weight) {

                knapsack[i][weight] = Math.max(
                    knapsack[i - 1][weight],
                    acc.second.value + knapsack[i - 1][weight - acc.second.weight],
                );

            } else if (acc.second.weight > weight && weight >= acc.first.weight) {


                knapsack[i][weight] = Math.max(
                    knapsack[i - 1][weight],
                    acc.first.value + knapsack[i - 1][weight - acc.first.weight],
                );


            } else if (
                (acc.first.weight < weight && acc.second.weight < weight) ||
                (acc.first.weight === weight || acc.second.weight === weight)
            ) {

                knapsack[i][weight] = Math.max(
                    knapsack[i - 1][weight],
                    acc.first.value + knapsack[i - 1][weight - acc.first.weight],
                    acc.second.value + knapsack[i - 1][weight - acc.second.weight],
                );
            }
        }

        return item;
    }, {});


    const res = knapsack.reverse()[0].reverse()[0];

    logger.info(chalk.blue(`Execution time: ${perf.stop().time}ms`));
    logger.info(chalk.green(`Knapsack: ${res}`));
};

const empty = () => undefined;
