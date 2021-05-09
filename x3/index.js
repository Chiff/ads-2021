const performance = require('execution-time')();
const chalk = require('chalk');
const logger = require('simple-node-logger').createSimpleLogger('output.log');

const {isNotNull, handleFile} = require('../util/util.js');

handleFile('data.txt')
    .then((input) => handleData(input))
    .catch((err) => logger.error(chalk.red(err)));


const handleData = (file) => {
    let input = file
        .split(/\r?\n/)
        .map(e => {
            const arr = e.split(' ').map(e => parseInt(e));

            if (Number.isNaN(arr[0])) return null;
            return arr;
        })
        .filter(isNotNull);

    const [VARIABLE_COUNT, CLAUSE_COUNT] = input.shift();

    performance.start();

    // fix data
    const clauses = input.map(c => {
        const tmp = c.map(t => t || null).filter(isNotNull);

        if (tmp.length === 1) {
            return new Array(VARIABLE_COUNT).fill(tmp[0]);
        }

        return tmp;
    });

    // init objs
    const graph = createObject(VARIABLE_COUNT, () => []);
    const graphRev = createObject(VARIABLE_COUNT, () => []);
    let visited = createObject(VARIABLE_COUNT, () => false);

    // create graph
    clauses.forEach((element) => {
        const [c1, c2] = element;

        graph[-c1].push(c2);
        graph[-c2].push(c1);
        graphRev[c1].push(-c2);
        graphRev[c2].push(-c1);
    });

    const dfs1 = (vertex) => {
        if (visited[vertex]) return;

        visited[vertex] = true;
        graph[vertex].forEach(dfs1);

        stack.push(vertex);
    };

    const dfs2 = (vertex, component) => {
        if (visited[vertex]) return component;

        visited[vertex] = true;

        if (!component[vertex]) {
            component[vertex] = true;
        }

        graphRev[vertex].forEach(c => dfs2(c, component));
        return component;
    };

    const stack = [];
    for (let i = 0; i < VARIABLE_COUNT; i++) {
        dfs1((i + 1));
        dfs1(-(i + 1));
    }
    visited = createObject(VARIABLE_COUNT, () => false);

    const components = stack.reverse().map((vertex) => dfs2(vertex, {}));

    ////// SATISFIABLE?
    let SAT = true;
    components.forEach(component => {
        Object.entries(component).forEach(([vertex, _]) => {
            const parsedVertexNeg = -(parseInt(vertex)) + '';

            if (component[parsedVertexNeg]) {
                SAT = false;
            }
        });
    });

    if (SAT) {
        logger.info(chalk.yellow(`satisfiable`));

        const vals = {};
        components.reverse().forEach(component => {
            Object.entries(component).forEach(([vertex, _]) => {
                const parsedVertex = Math.abs(parseInt(vertex));

                if (typeof vals[parsedVertex] === 'undefined') {
                    vals[parsedVertex] = parsedVertex === parseInt(vertex);
                }
            });
        });

        Object.entries(vals).forEach(([vertex, value]) => {
            logger.info(chalk.green(`x${vertex}: ${value}`));
        });

    } else {
        logger.info(chalk.yellow(`NOT satisfiable`));
    }

    logger.info(chalk.blue(`Execution time: ${performance.stop().time}ms`));

};

const createObject = (count, createValue) => {
    const obj = {};

    range(-count, count).forEach((number) => {
        if (number === 0) return;
        obj[number] = createValue();
    });

    return obj;
};

const range = (min, max) => {
    return Array(max - min + 1)
        .fill(0)
        .map((_, i) => i + min);
};

// https://jgke.fi/blog/posts/2015/03/2sat-implementation/
