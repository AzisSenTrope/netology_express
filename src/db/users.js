const records = [
    {
        id: 1,
        username: '1',
        password: '1',
        displayName: 'demo user',
        email: 'user@mail.ru',
    },
    {
        id: 2,
        username: '2',
        password: '2',
        displayName: 'Jill',
        email: 'jill@example.com',
    },
];

exports.isUsernameBusy = function (username) {
    for (const record of records) {
        if (record.username === username) {
            return true;
        }
    }
    return false;
}

exports.getUsers = function () {
    return records;
}

exports.insert = function(data) {
    const id = records[records.length - 1].id + 1;
    const newData = {...data, id};
    records.push(newData);
    return newData;
}

exports.findById = function(id, cb) {
    process.nextTick(function () {
        const idx = id - 1
        if (records[idx]) {
            cb(null, records[idx])
        } else {
            cb(new Error('User ' + id + ' does not exist'))
        }
    })
}

exports.findByUsername = function(username, cb) {
    process.nextTick(function () {
        let i = 0, len = records.length
        for (; i < len; i++) {
            const record = records[i]
            if (record.username === username) {
                return cb(null, record)
            }
        }
        return cb(null, null)
    })
}

exports.verifyPassword = (user, password) => {
    return user.password === password
}