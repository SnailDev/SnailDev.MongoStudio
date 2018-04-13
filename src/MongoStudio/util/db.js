exports.getservers = function () {
    var servers = [
        {
            ID: new Date().getTime(),
            PID: 0,
            Type: 1,
            ShowName: 'LocalDB',
            Name: '127.0.0.1:27017',
            Icon: '/lib/ligerui/skins/icons/process.gif',
        }
    ]

    return servers;
}