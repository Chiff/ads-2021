const performance = require('execution-time')();
const chalk = require('chalk');
const logger = require('simple-node-logger').createSimpleLogger('output.log');

const {isNotNull, handleFile} = require('../util/util.js');

handleFile('data.txt')
    .then((input) => handleData(input))
    .catch((err) => logger.error(chalk.red(err)));


const handleData = (file) => {
    let coins = file
        .split('')
        .map(e => parseInt(e))
        .filter(isNotNull);


    performance.start();

    // coins = [1, 2, 8, 3] // result: 9;
    const result = new Array(coins.length).fill(0).map(() => new Array(coins.length).fill(0));

    //https://www.geeksforgeeks.org/optimal-strategy-for-a-game-dp-31/
    for (let interval = 0; interval < coins.length; interval++) {
        for (let i = 0, j = interval; j < coins.length; i++, j++) {
            let a = 0, b = 0, c = 0;
            if (i + 2 <= j) { //beriem I
                a = result[i + 2][j];
            }
            if (i + 1 <= j - 1) { // beriem I/J
                b = result[i + 1][j - 1];
            }
            if (i <= j - 2) { // beriem J
                c = result[i][j - 2];
            }

            let optI = 0, optJ = 0;
            if (i + 1 <= j) { //ak som zobral I
                optI = coins[i + 1] > coins[j] ? a : b;
            }
            if (i <= j - 1) { //ak som zobral J
                optJ = coins[i] > coins[j - 1] ? b : c;
            }
            // result[i][j] = Math.max(coins[i] + Math.min(a, b), coins[j] + Math.min(b, c));
            result[i][j] = Math.max(coins[i] + optI, coins[j] + optJ);
        }
    }

    // result.forEach(row => console.log(row))

    logger.info(chalk.blue(`Execution time: ${performance.stop().time}ms;`));
    logger.info(chalk.blue(`Result: ${result[0][coins.length - 1]}`));
};
