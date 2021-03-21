const performance = require('execution-time')();
const chalk = require('chalk');
const fs = require('fs');
const logger = require('simple-node-logger').createSimpleLogger('output.log');
const Canvas = require('canvas');
const stc = require('string-to-color');

const {isNotNull, handleFile} = require('../util/util.js');

handleFile('data.txt')
    .then((input) => handleData(input))
    .catch((err) => logger.error(chalk.red(err)));


const handleData = (file) => {
    let words = file
        .split(/\r?\n/)
        .map(e => {
            const arr = e.split(' ');
            if (!arr[1]) return null;
            return new Node(parseInt(arr[0]), arr[1]);
        })
        .filter(isNotNull)
        .sort((a, b) => a.word.localeCompare(b.word));


    performance.start();
    let keys = NodeUtil.prepKeys(words);
    let tree = NodeUtil.createBST(keys);
    let sumOfProbs = NodeUtil.verifySum(keys);
    logger.info(`Sum of probs: ${sumOfProbs} - should be = 1`);
    logger.info(chalk.yellow(`BST created in ${performance.stop().time}ms`));


    TreeUtil.tree = tree;
    TreeUtil.draw();
    const search = ['of', 'which', 'development', 'could', 'the', 'government', 'governmental', 'noop'];


    performance.start();
    search.forEach(TreeUtil.pocetPorovnani);
    logger.info(chalk.blue(`Search time: ${performance.stop().time}ms; words=${search.join(',')}`));

};

class TreeUtil {
    static tree;
    static currComp = 0;

    static pocetPorovnani(search) {
        TreeUtil.currComp = 0;
        const w = TreeUtil.find(1, TreeUtil.tree[1].length - 1, search);

        logger.info(chalk.green(`[${search}] \t- found ${w ? 'WORD' : 'DUMMY'} at level ${TreeUtil.currComp}`));
        return TreeUtil.currComp;
    }

    static find(i, j, str) {
        const node = TreeUtil.tree[i][j];

        TreeUtil.currComp += 1;

        if (node?.word === str || !node?.word) {
            return node?.word;
        }

        const index = node.index;

        if (str.localeCompare(node.word) > 0) {
            return TreeUtil.find(index + 1, j, str);
        }

        if (str.localeCompare(node.word) < 0) {
            return TreeUtil.find(i, index - 1, str);
        }
    }

    static draw() {
        const sizeX = TreeUtil.tree.length;
        const sizeY = TreeUtil.tree[0].length;
        const ratio = 10;

        const canvas = Canvas.createCanvas(sizeX * ratio, sizeY * ratio);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < sizeX; i++) {
            for (let j = 0; j < sizeY; j++) {
                const node = TreeUtil.tree[i][j];

                ctx.fillStyle = TreeUtil.getColor(node?.index || 0, sizeY);
                ctx.fillRect(i * ratio, j * ratio, ratio, ratio);
            }
        }

        const buffer = canvas.toBuffer('image/jpeg', {quality: 0.75});
        fs.writeFile('tree.jpg', buffer, (err => {
            if (err) {
                logger.error(chalk.red(err));
            }

            logger.info(`draw tree > tree.jpg`);
        }));
    }

    static getColor(id, max) {
        if (!id) return 'black'

        const scale = Math.round((id / max) * 255)
            .toString(16)
            .repeat(3);

        return stc(scale);
    }
}

class NodeUtil {
    /**
     * @param words : Node[]
     */
    static prepKeys(words) {
        const keys = [];

        const dummyNode = new Node(0, '');
        dummyNode.isDummy = true;
        dummyNode.q = 0;
        dummyNode.p = 0;
        keys.push(dummyNode);

        const sum = words.reduce((acc, curr) => {
            acc += curr.freq;
            return acc;
        }, 0);

        let keyId = 0;
        let qSumTmp = 0;
        for (let i = 0; i < words.length; i++) {
            let node = words[i];

            if (node.isDummy) {
                qSumTmp += node.freq;
            } else {
                node.p = node.freq / sum;
                node.q = qSumTmp / sum;

                node.index = ++keyId;

                qSumTmp = 0;
                keys.push(node);
            }
        }

        return keys;
    }

    /**
     * @param keys : Node[]
     */
    static verifySum(keys) {
        return keys.reduce((acc, curr) => {
            acc += curr.p + curr.q;
            return acc;
        }, 0);
    }

    /**
     * @param keys : Node[]
     * @return Node[][]
     */
    static createBST(keys) {
        // optimal-bst (pg. 402)
        const n = keys.length - 1; // minus dummyKey

        const e = new Array(n + 2).fill(0).map(() => new Array(n + 1).fill(0));
        const w = new Array(n + 2).fill(0).map(() => new Array(n + 1).fill(0));
        const root = new Array(n + 1).fill(0).map(() => new Array(n + 1).fill(undefined));


        for (let i = 1; i <= n + 1; i++) {
            e[i][i - 1] = keys[i - 1].q;
            w[i][i - 1] = keys[i - 1].q;
        }

        for (let l = 1; l <= n; l++) {
            for (let i = 1; i <= n - l + 1; i++) {
                const j = i + l - 1;

                e[i][j] = Infinity;
                w[i][j] = w[i][j - 1] + keys[j].p + keys[j].q;

                for (let r = i; r <= j; r++) {
                    const t = e[i][r - 1] + e[r + 1][j] + w[i][j];

                    if (t < e[i][j]) {
                        e[i][j] = t;
                        root[i][j] = keys[r];
                    }
                }
            }
        }

        NodeUtil.writeFileAsync(w.map(e => e.map(i => i.toFixed(6))), 'tmp_prob');
        NodeUtil.writeFileAsync(e.map(e => e.map(i => i.toFixed(6))), 'tmp_cost');
        NodeUtil.writeFileAsync(root.map(e => e.map(i => i?.index?.toString()?.padStart(3, '0') || '000')), 'tmp_root');

        return root;
    }

    /**
     * @param input Object[][]
     * @param filename string
     */
    static writeFileAsync(input, filename) {
        let str = '';

        input.forEach(row => {
            row.forEach(item => {
                str += `${item} `;
            });

            str += '\n';
        });

        fs.writeFile(`${filename}.txt`, str, (err => {
            if (err) {
                logger.error(chalk.red(err));
            }

            logger.info(`dump data > ${filename}.txt`);
        }));
    }

}

class Node {
    index;

    p;
    q;

    freq;
    word;

    isDummy;

    constructor(freq, word) {
        this.freq = freq;
        this.word = word;

        this.isDummy = freq <= 50000;
    }
}
