# MongoStudio
a tool for mongodb web search

### How to start
```bash
git clone https://github.com/SnailDev/SnailDev.MongoStudio.git
cd src/MongoStudio
npm install
npm start
```

### How to add db server
open src/MongoStudio/util/db.js

```node
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
```

### Preview
- index
![](images/home.jpg)

- tableview
![](images/tableview.jpg)

- textview
![](images/textview.jpg)

- explain
![](images/explain.jpg)

### Reference
- [ligerui](http://www.ligerui.com/)
- [jsonformat](http://tool.oschina.net/codeformat/json)
- [jquery](http://jquery.com/)

### Donate
if this project is useful to you, you could ask me for a cup of coffee.
<div  width="100" height="100">![](images/wechatpay.jpg)</div> <div  width="100" height="100"> ![](images/alipay.jpg)</div>

## License

The MIT License (MIT). Please see [LICENSE](LICENSE) for more information.
