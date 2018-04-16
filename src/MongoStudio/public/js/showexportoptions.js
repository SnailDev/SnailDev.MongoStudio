var dialog = null;
$(function () {
    dialog = frameElement.dialog;
    //创建表单结构 
    form = $("#options").ligerForm({
        inputWidth: 170, labelWidth: 90, space: 40,

        fields: [
            { display: "token", name: "token", hidden: true, newline: true, type: "text", width: 120 },
            { display: "导出类型", name: "soptions", newline: true, type: "select", options: { data: [{ id: "json", text: 'Json(.txt)', select: true }/*, { id: "excel", text: 'MS Excel(.xls)' }*/] }, width: 120 },
        ],

        buttons: [
            { text: '导出', width: 60, click: f_export },
            { text: '关闭', width: 60, click: f_cancel }
        ]
    });

    // 设置下拉框的默认值
    form.setData({
        soptions: 'json'
    });
});

function f_export() {
    var type = liger.get("soptions").getValue();
    var token = liger.get("token").getValue();
    if (type == "json") {
        $.ajax({
            url: '/getdata',
            type: 'POST',
            data: [{ name: "server", value: dialog.get('data').server }, { name: "db", value: dialog.get('data').db }, { name: "col", value: dialog.get('data').col }, { name: "jsonfind", value: dialog.get('data').jsonfind }, { name: "jsonfield", value: dialog.get('data').jsonfield }, { name: "jsonsort", value: dialog.get('data').jsonsort }, { name: "skip", value: dialog.get('data').skip }, { name: "limit", value: dialog.get('data').limit }, { name: "type", value: 1 }, { name: "isPager", value: 0 }],
            cache: false,
            dataType: 'json',
            success: function (rst) {
                CollapsibleViewClicked(rst.Rows);
                export_raw(dialog.get('data').col + new Date().getTime() + '.json', $("#Canvas").text());
            },
            error: function () {
                alert('请求发生异常，请重试');
            }
        });
    }
    else if (type == "excel") {
        // 暂时就这样
        // post("/exportdata?_token=" + token, { server: dialog.get('data').server, db: dialog.get('data').db, col: dialog.get('data').col, jsonfind: dialog.get('data').jsonfind, jsonfield: dialog.get('data').jsonfield, jsonsor: dialog.get('data').jsonsort, ski: dialog.get('data').skip, limit: dialog.get('data').limit });
    }
}

function fake_click(obj) {
    var ev = document.createEvent("MouseEvents");
    ev.initMouseEvent(
        "click", true, false, window, 0, 0, 0, 0, 0
        , false, false, false, false, 0, null
    );
    obj.dispatchEvent(ev);
}

function export_raw(name, data) {
    var urlObject = window.URL || window.webkitURL || window;

    var export_blob = new Blob([data]);

    var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    fake_click(save_link);
}

function f_cancel() {
    dialog.close();
}

function post(URL, PARAMS) {
    var temp = document.createElement("form");
    temp.action = URL;
    temp.method = "post";
    temp.style.display = "none";
    for (var x in PARAMS) {
        var opt = document.createElement("textarea");
        opt.name = x;
        opt.value = PARAMS[x];
        temp.appendChild(opt);
    }
    document.body.appendChild(temp);
    temp.submit();
    //return temp;
    document.body.removeChild(temp);
}