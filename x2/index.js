const performance = require('execution-time')();
const chalk = require('chalk');
const fs = require('fs');
const logger = require('simple-node-logger').createSimpleLogger('output.log');

const {isNotNull, handleFile, empty} = require('../util/util.js');

handleFile('predmety.txt')
    .then((input) => handleData(input))
    .catch((err) => logger.error(chalk.red(err)));


const handleData = (file) => {
    let input = file
        .split(/\r?\n/)
        .map(e => {
            const arr = e.split(' ').map(e => parseInt(e));

            if (Number.isNaN(arr[0])) return null;
            return new Item(arr[0], arr[1], arr[2], arr[3]);
        })
        .filter(isNotNull);

    const COUNT = input.shift().num;
    const MAX_WEIGHT = input.shift().num;
    const MAX_FRAGILE = input.shift().num;

    performance.start();
    const knapsack = new Array(COUNT + 1).fill(0)
        .map(() => new Array(MAX_WEIGHT + 1).fill(0)
            .map(() => new Array(MAX_FRAGILE + 1).fill(0)));


    input.push(empty());
    input.reduce((acc, item, i) => {
        if (i === 0) return item;

        for (let weight = 0; weight < knapsack[i].length; weight++) {
            for (let fragile = 0; fragile < knapsack[i][weight].length; fragile++) {

                if (acc.weight > weight) {
                    knapsack[i][weight][fragile] = knapsack[i - 1][weight][fragile];
                } else if (acc.fragile > fragile) {
                    knapsack[i][weight][fragile] = knapsack[i - 1][weight][fragile];
                } else {
                    knapsack[i][weight][fragile] = Math.max(
                        knapsack[i - 1][weight][fragile],
                        knapsack[i - 1][weight - acc.weight][fragile - acc.fragile] + acc.val,
                    );
                }

            }
        }

        return item;
    }, new Item());

    const result = [];
    result.push(knapsack[COUNT][MAX_WEIGHT][MAX_FRAGILE]); // best value

    let currW = MAX_WEIGHT, currF = MAX_FRAGILE;

    input.pop();
    input.unshift(empty());

    for (let i = COUNT; i > 0; i--) {
        if (knapsack[i][currW][currF] > knapsack[i - 1][currW][currF]) {
            const item = input[i];
            result.push(item.num);

            currF -= item.fragile;
            currW -= item.weight;
        }
    }

    result.splice(1, 0, result.length - 1); // cnt of items
    writeFileAsync(result, 'out');

    logger.info(chalk.yellow(`Best val = ${result[0]}`));
    logger.info(chalk.blue(`Execution time: ${performance.stop().time}ms`));

};

const writeFileAsync = (input, filename) => {
    let str = '';

    input.forEach(row => {
        str += `${row}\n`;
    });

    fs.writeFile(`${filename}.txt`, str, (err => {
        if (err) {
            logger.error(chalk.red(err));
        }

        logger.info(`dump data > ${filename}.txt`);
    }));
};

/**
 * @typedef {Object} Item
 * @property {number} num
 * @property {number} val
 * @property {number} weight
 * @property {number} fragile
 */
class Item {
    num;
    val;
    weight;
    fragile;

    constructor(
        num,
        val,
        weight,
        fragile,
    ) {
        this.num = num;
        this.val = val;
        this.weight = weight;
        this.fragile = fragile;
    }
}
