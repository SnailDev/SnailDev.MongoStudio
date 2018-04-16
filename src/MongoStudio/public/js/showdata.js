var navtab = null;
var datagrid = null;
var datagrid_TextView = null;
var explainTree = null;
var combox = null;
var _id;

$(function () {
    //searchPanel
    $("#spanel").ligerPanel({
        title: '查询条件',
        width: '99.2%',
        height: '25%'
    });

    //创建表单结构 
    form = $("#sform").ligerForm({
        inputWidth: 170, labelWidth: 90, space: 40,

        fields: [
               { display: "{Find}", name: "Find", newline: true, type: "textarea", width: 320 },
               { display: "{Field}", name: "Field", newline: false, type: "textarea", width: 320 },
               { display: "{Sort}", name: "Sort", newline: false, type: "textarea", width: 320 },
               { display: 'Skip#', name: 'Skip', newline: false, type: 'spinner', width: 58, options: { type: 'int', isNegative: false } },
               { display: 'Limit#', name: 'Limit', newline: false, type: 'spinner', width: 58, options: { type: 'int', isNegative: false } },
        ],

        buttons: [
                   { text: '查询', width: 60, click: f_search }
        ]
    });

    $("input[name='Limit']").val(30);
    $("#Find").attr({ "placeholder": "{\"Name1\":\"Value1\",\"Name2\":\"Value2\",...}\r\n注： Name、字段名，Value、字段值 " });
    $("#Field").attr({ "placeholder": "{\"Name1\":\"1/0\",\"Name2\":\"1/0\",...}\r\n注： 1、显示，0、隐藏" });
    $("#Sort").attr({ "placeholder": "{\"Name1\":\"1/-1\",\"Name2\":\"1/-1\",...}\r\n注： 1、升序，-1、降序" });

    //Tab
    $("#rtab").ligerTab({
        contextmenu: false,
        onBeforeSelectTabItem: function (tabid) {
            if (navtab.getSelectedTabItemID() == tabid) return;
            switch (tabid) {
                case "TextView":
                    initDataTextView();
                    break;
                case "TableView":
                    datagrid.reload();
                    break;
                case "Explain":
                    initExplainTree();
                    break;
            }
        }
    });
    navtab = $("#rtab").ligerGetTabManager();

    $("#datagrid").ligerGrid({
        title: "30 Documents",
        height: "102%",
        url: '/getdata',
        parms: [{ name: "server", value: $("#serverName").val() }, { name: "db", value: $("#dbName").val() }, { name: "col", value: $("#collectionName").val() }, { name: "jsonfind", value: $("#Find").val() }, { name: "jsonfield", value: $("#Field").val() }, { name: "jsonsort", value: $("#Sort").val() }, { name: "skip", value: $("input[name='Skip']").val() }, { name: "limit", value: $("input[name='Limit']").val() }],
        dataType: 'server',
        dataAction: 'server',
        pageSize: 30,
        pageSizeOptions: [10, 20, 30, 40, 50, 100, 200, 500, 999],
        rownumbers: true,
        allowAdjustColWidth: true,
        isScroll: true,
        enabledSort: false,
        onRClickToSelect: true,
        onDblClickRow: function (data, rowindex, rowobj) {
            _id = data._id;
            viewclick();
        },
        onContextmenu: function (parm, e) {
            _id = parm.data._id;
            // TableView
            menu = $.ligerMenu({
                width: 120, items: [{ text: '查看', click: viewclick }]
            });
            menu.show({ top: e.pageY, left: e.pageX });
            return false;
        },
        toolbar: {
            items: [
                    { text: '导出', click: exportclick, img: 'lib/ligerui/skins/icons/save.gif' },
            ]
        }
    });
    datagrid = $("#datagrid").ligerGetGridManager();

    //Tree
    $("#explainTree").ligerTree({
        checkbox: false,
        slide: false,
        nodeWidth: "100%",
        textFieldName: 'ShowName',
        idFieldName: 'ID',
        parentIDFieldName: 'PID',
        slide: false,
        isExpand: 2,
    });
    explainTree = $("#explainTree").ligerGetTreeManager();

    $(document).bind("keydown", function (e) {
        e = window.event || e;
        if (e.keyCode == 116) {
            //e.keyCode = 0;
            f_search();
            return false; //屏蔽F5刷新键   
        }
    });
});

function f_select() {
    alert(1);
}

function viewclick(item, i) {
    $.ligerDialog.open({
        width: $(window).width() * 0.9,
        height: $(window).height() * 0.9,
        title: "查看详细记录(" + _id + ")",
        url: '/showdatadetail',
        showMax: true,
        showToggle: false,
        showMin: false,
        isResize: true,
        slide: true,
        data: {
            server: $("#serverName").val(),
            db: $("#dbName").val(),
            col: $("#collectionName").val(),
            jsonfield: $("#Field").val(),
            did: _id,
        }
    });
}

function exportclick(item, i) {
    $.ligerDialog.open({
        width: $(window).width() * 0.2,
        height: $(window).height() * 0.22,
        title: "导出记录",
        url: '/showexportoptions',
        showMax: false,
        showToggle: false,
        showMin: false,
        isResize: false,
        slide: true,
        data: {
            server: $("#serverName").val(),
            db: $("#dbName").val(),
            col: $("#collectionName").val(),
            jsonfind: $("#Find").val(),
            jsonfield: $("#Field").val(),
            jsonsort: $("#Sort").val(),
            skip: $("input[name='Skip']").val(),
            limit: $("input[name='Limit']").val()
        }
    });
}

function f_search(page) {
    if (navtab.getSelectedTabItemID() == "TextView") navtab.selectTabItem("TableView");
    datagrid.options.parms = [{ name: "server", value: $("#serverName").val() }, { name: "db", value: $("#dbName").val() }, { name: "col", value: $("#collectionName").val() }, { name: "jsonfind", value: $("#Find").val() }, { name: "jsonfield", value: $("#Field").val() }, { name: "jsonsort", value: $("#Sort").val() }, { name: "skip", value: $("input[name='Skip']").val() }, { name: "limit", value: $("input[name='Limit']").val() }];
    datagrid.options.newPage = page > 1 ? page : 1;
    datagrid.loadData();
}

function initDataTextView() {
    var height = $(".l-tab-content").height();
    var width = $(".l-tab-content").width();
    $("#Canvas").height(height);
    $("#Canvas").width(width);
    $.ajax({
        url: '/getdata',
        type: 'POST',
        data: [{ name: "server", value: $("#serverName").val() }, { name: "db", value: $("#dbName").val() }, { name: "col", value: $("#collectionName").val() }, { name: "jsonfind", value: $("#Find").val() }, { name: "jsonfield", value: $("#Field").val() }, { name: "jsonsort", value: $("#Sort").val() }, { name: "skip", value: $("input[name='Skip']").val() }, { name: "limit", value: $("input[name='Limit']").val() }, { name: "page", value: datagrid.options.newPage }, { name: "pageSize", value: datagrid.options.pageSize }, { name: "type", value: 1 }],
        cache: false,
        dataType: 'json',
        success: function (rst) {
            //$("#RawJson").val(rst.Rows);
            CollapsibleViewClicked(rst.Rows);
        },
        error: function () {
            alert('请求发生异常，请重试');
        }
    });
}

function initExplainTree() {
    var height = $(".l-tab-content").height();
    var width = $(".l-tab-content").width();
    $("#explainInfo").height(height);
    $("#explainInfo").width(width);
    param = { server: $("#serverName").val(), db: $("#dbName").val(), col: $("#collectionName").val(), jsonfind: $("#Find").val(), jsonfield: $("#Field").val(), jsonsort: $("#Sort").val(), skip: $("input[name='Skip']").val(), limit: $("input[name='Limit']").val() };

    try {
        explainTree.clear();
        explainTree.nodeWidth = width;
        $("#explainTree_loading").show();
        explainTree.loadData(null, "/explain", param);
        $("#explainTree_loading").hide();
    }
    catch (e) {
        alert("请求发生异常，请重试");
    }
}