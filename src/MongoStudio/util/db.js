const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const Long = require('mongodb').Long;

exports.getservers = function (callback) {
    var servers = [
        {
            ID: genNonDuplicateID(3),
            PID: 0,
            Type: 'server',
            ShowName: 'LocalDB',
            Name: '127.0.0.1:27017',
            Icon: '/lib/ligerui/skins/icons/process.gif',
        }

        // you can add your db server struct here and just need modify **ShowName** and **Name**.
    ]

    if (callback) callback(servers);
}

exports.getdbs = function (id, server, callback) {
    MongoClient.connect(server, function (err, client) {
        var adminDb = client.db('admin').admin();
        // List all the available databases
        adminDb.listDatabases(function (err, dbs) {
            var dbNodes = [];
            dbs.databases.forEach(element => {
                if (element.name != 'local' && element.name != 'admin') {
                    var dbNode = {
                        ID: genNonDuplicateID(3),
                        PID: id,
                        Type: 'db',
                        ShowName: element.name,
                        Name: element.name,
                        Icon: '/lib/ligerui/skins/icons/database.gif',
                    };
                    dbNodes.push(dbNode);
                }
            });

            client.close();

            if (callback) callback(dbNodes);
        });
    })
}

exports.getcols = function (id, server, db, callback) {
    MongoClient.connect(server, function (err, client) {
        var curDb = client.db(db)
        // List all the available collections
        curDb.listCollections().toArray(function (err, items) {
            var colNodes = [];
            items.sort(function (item1, item2) {
                if (item1.name > item2.name)
                    return 1;
                else
                    return -1;
            }).forEach(element => {
                if (element.name != 'system.indexes') {
                    var colNode = {
                        ID: genNonDuplicateID(3),
                        PID: id,
                        Type: 'col',
                        ShowName: element.name,
                        Name: element.name,
                        Icon: '/lib/ligerui/skins/icons/view.gif',
                    };
                    colNodes.push(colNode);
                    //console.log(items);
                }
            });
            client.close();
            if (callback) callback(colNodes);

        });
    });
}

exports.getindexContainer = function (id, callback) {
    var indexContainerNodes = [{
        ID: genNonDuplicateID(3),
        PID: id,
        Type: 'indexContainer',
        ShowName: '索引',
        Name: '索引',
    }];
    if (callback) callback(indexContainerNodes);
}

exports.getindexes = function (id, server, db, col, callback) {
    MongoClient.connect(server, function (err, client) {
        // Create a collection we want to drop later
        var curCol = client.db(db).collection(col);
        // List all the available collections
        curCol.listIndexes().toArray(function (err, items) {
            var indexNodes = [];
            items.sort(function (item1, item2) {
                if (item1.name > item2.name)
                    return 1;
                else
                    return -1;
            }).forEach(element => {
                // if (element.name != 'system.indexes') {
                var indexNode = {
                    ID: genNonDuplicateID(3),
                    PID: id,
                    Type: 'index',
                    ShowName: element.name,
                    Name: element.name,
                    Icon: '/lib/ligerui/skins/icons/search.gif',
                };
                indexNodes.push(indexNode);
                //console.log(items);
                // }
            });
            client.close();
            if (callback) callback(indexNodes);
        });
    });
}

exports.getdata = function (server, db, col, jsonfind, jsonfield, jsonsort, skip, limit, page, pageSize, viewType, isPager, callback) {
    MongoClient.connect(server, function (err, client) {
        // Create a collection we want to drop later
        var curCol = client.db(db).collection(col);
        curCol.find(jsonfind).limit(limit).count(function (e, count) {
            var command = curCol.find(jsonfind).sort(jsonsort).project(jsonfield).skip(skip).limit(limit);
            if (isPager == 1) command.skip(((page - 1) * pageSize + skip)).limit(pageSize);  // skip function will be overwrite, so should add previous skip value
            command.toArray(function (err, items) {
                var columns = [];
                items.forEach(element => {
                    Object.keys(element).forEach(field => {
                        var fieldObj = {
                            display: field,
                            name: field,
                            align: "left",
                            width: 180,
                            minWidth: 180
                        };

                        if (JSON.stringify(columns).indexOf(JSON.stringify(fieldObj)) == -1) {
                            columns.push(fieldObj);
                        }

                        if (viewType == 0 && field != '_id') {
                            if (Object.prototype.toString.call(element[field]) == '[object Array]') {
                                element[field] = `[${element[field].length} element]`;
                            }
                            else if (Object.prototype.toString.call(element[field]) == '[object Object]') {
                                element[field] = `{ ${Object.keys(element[field]).length} fields }`;
                            }
                        }
                    });
                });

                client.close();
                if (callback) callback({ Rows: JSON.stringify(items), Total: count, Columns: columns });
            });
        });
    });
}

exports.getdatadetail = function (server, db, col, id, jsonfield, callback) {
    MongoClient.connect(server, function (err, client) {
        // Create a collection we want to drop later
        var curCol = client.db(db).collection(col);
        var jsonfind = {};
        if (ObjectID.isValid(id)) {
            jsonfind = { "_id": new ObjectID(id) };
        }
        else {
            if (isNaN(id)) {
                jsonfind = { "_id": id };
            }
            else {
                jsonfind = { "_id": Long.fromString(id) };
            }
        }

        curCol.find(jsonfind).project(jsonfield).toArray(function (err, items) {
            client.close();
            if (callback) {
                if (items.length > 1) {
                    callback({ Success: false, Message: '数据重复', Row: '' });
                }

                if (items.length < 1) {
                    callback({ Success: false, Message: '未找到数据', Row: '' });
                }

                callback({ Success: true, Message: '', Row: JSON.stringify(items[0]) });
            }
        });
    });
}

exports.explain = function (server, db, col, jsonfind, jsonfield, jsonsort, skip, limit, callback) {
    MongoClient.connect(server, function (err, client) {
        // Create a collection we want to drop later
        var curCol = client.db(db).collection(col);
        curCol.find(jsonfind).sort(jsonsort).project(jsonfield).skip(skip).limit(limit).explain(function (err, doc) {
            var list = [];
            buildTreeNode(list, 0, doc);
            client.close();
            if (callback) callback(list);
        });
    });
}

function buildTreeNode(list, pid, doc) {
    for (var key in doc) {
        var node = { ID: genNonDuplicateID(3), PID: pid };

        if ((Object.prototype.toString.call(doc[key]) != '[object Array]') && (Object.prototype.toString.call(doc[key]) == '[object Object]')) {
            node.ShowName = key;
            list.push(node);
            buildTreeNode(list, node.ID, doc[key]);
        }
        else {
            node.ShowName = `${key}:${doc[key]}`;
            list.push(node);
        }
    }
}

function genNonDuplicateID(randomLength) {
    let idStr = Date.now().toString(36)
    idStr += Math.random().toString(36).substr(3, randomLength)
    return idStr
}