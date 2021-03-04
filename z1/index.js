const fs = require('fs');
const logger = require('simple-node-logger').createSimpleLogger('output.log');

fs.readFile('cvicenie1data.txt', 'utf8', function (err, data) {
    if (err) {
        return logger.error(err);
    }

    readData(data);
});

const readData = (data) => {
    const rows = data.split('\n');

    const d = rows
        .slice(2)
        .map(i => i.split(' ').map(e => parseInt(e)).filter(e => !Number.isNaN(e)))
        .sort((r1, r2) => {
            const s1 = r1.reduce(sumAbs, 0);
            const s2 = r2.reduce(sumAbs, 0);
            return s1 > s2 ? -1 : 1;
        });


    let sum, sums, choices;
    let its = 0;

    const start = new Date();
    while (true) {
        sum = 0;
        sums = [];
        choices = [];

        const magik = shuffle(d);
        magik.forEach((r) => {
            const options = r.map((el) => sum + el);
            const best = closest(options, 0);
            // const best = closest(options, -sum);

            choices.push(best - sum);
            sums.push(best);

            sum = best;
        });

        its += 1;
        if (sum === 0) {
            break;
        }
    }

    logger.info('progress:');
    logger.info(sums);
    logger.info('choices:');
    logger.info(choices);
    logger.info('res:', sum);
    logger.info('its:', its);
    logger.info('Execution time: %dms', new Date() - start);
};

const sumAbs = (acc, curr) => Math.abs(curr) + acc;

// https://stackoverflow.com/questions/8584902/get-the-closest-number-out-of-an-array
const closest = (inp, goal = 0) => inp.reduce((prev, curr) => (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev));

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
