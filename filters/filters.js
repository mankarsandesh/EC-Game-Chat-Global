const Filter = require('bad-words');
const filter = new Filter();

module.exports = (message) => {
    return filter.clean(message);
}