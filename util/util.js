const fs = require('fs');

const handleFile = (path, opts = 'utf8') => new Promise((resolve, reject) => {
    fs.readFile(path, opts, function (err, data) {
        if (err) {
            reject(err);
        }

        resolve(data);
    });
});

const isNotNull = (item) => !!item;
const empty = () => undefined;

module.exports = {
    handleFile,
    isNotNull,
    empty,
};
