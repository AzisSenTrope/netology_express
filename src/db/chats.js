const messages = [
    {
        idBook: '1',
        text: 1,
        username: '1',
    },
    {
        idBook: '1',
        text: 2,
        username: '2',
    },
];

exports.getMessagesByBook = function (id) {
    return messages.filter((message) => message.idBook === id);
}

exports.insert = function(data) {
    messages.push(data);
    console.log()
    return messages;
}