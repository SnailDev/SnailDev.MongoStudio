var tab = null;
var tree = null;
var accordion = null;
var tabnumber = 0;
var menu;
var actionNodeID;

var dbicon = "lib/ligerUI/skins/icons/database.gif";

$(document).ready(function () {
    //布局
    $("#body").ligerLayout({
        leftWidth: 290,
        height: '100%',
        heightDiff: -34,
        space: 2,
        onHeightChanged: f_heightChanged
    });

    //Tab
    var height = $(".l-layout-center").height();
    $("#framecenter").ligerTab({
        showSwitchInTab: true,
        showSwitch: true,
        height: height
    });
    tab = $("#framecenter").ligerGetTabManager();

    //面板
    $("#left").ligerAccordion({
        height: height, speed: null, changeHeightOnResize: true
    });
    $(".l-accordion-header").attr({ "hidden": "hidden" }); //隐藏面板头
    accordion = liger.get("left");

    //Tree
    $("#tree").ligerTree({
        checkbox: false,
        slide: false,
        nodeWidth: 500,
        textFieldName: 'ShowName',
        idFieldName: 'ID',
        parentIDFieldName: 'PID',
        iconFieldName: 'Icon',
        slide: false,
        needCancel: false,
        isExpand: 2,
        isLeaf: function (data) {
            if (!data) return false;
            return data.Type == 'index';
        },
        delay: function (e) {
             var data = e.data;
             switch (data.Type) {
                case 'server':
                    return { url: '/getserver?id=' + data.ID + '&type=db&server=' + data.Name };
                case 'db':
                    return { url: '/getserver?id=' + data.ID + '&type=col&server=' + tree.getDataByID(data.PID).Name + '&db=' + data.ShowName };
                case 'col':
                    return { url: '/getserver?id=' + data.ID + '&type=indexContainer' };
                case 'indexContainer':
                    return { url: '/getserver?id=' + data.ID + '&type=index&server=' + tree.getDataByID(tree.getDataByID(tree.getDataByID(data.PID).PID).PID).Name + '&db=' + tree.getDataByID(tree.getDataByID(data.PID).PID).ShowName + '&col=' + tree.getDataByID(data.PID).Name };
                default:
                    return false;
            }
        },
        onSelect: function (node) {
            if (!node.flag) return;
            if (node.data.Type != 'col') return;
            actionNodeID = node.data.ID;
            f_addTab(undefined, tree.getDataByID(tree.getDataByID(node.data.PID).PID).ShowName + "\\" + node.data.Name, "/showdata?server=" + tree.getDataByID(tree.getDataByID(node.data.PID).PID).Name + "&db=" + tree.getDataByID(node.data.PID).ShowName + "&col=" + node.data.Name + "&serverName=" + tree.getDataByID(tree.getDataByID(node.data.PID).PID).ShowName);
        },
        onContextmenu: function (node, e) {
            if (node.data.Type == 'server') {
                actionNodeID = node.data.ID;
                // 树的右击菜单
                menu = $.ligerMenu({
                    top: 100, left: 100, width: 120, items: [{ text: '刷新', click: refreshclick }]
                });
                menu.show({ top: e.pageY, left: e.pageX });
            }
            return false;
        }
    });
    tree = $("#tree").ligerGetTreeManager();
    initTree();
    $("#loading").hide();

    $("#left").each(function () {
        $(this).height($(this).parent().height() - $(this).prev().height());
    });

    addShowUpdateHistoryBtn("0");

    $(document).bind("keydown", function (e) {
        e = window.event || e;
        if (e.keyCode == 116) {
            return false; //屏蔽F5刷新键   
        }

        // 开始
        var keyChar = String.fromCharCode(e.keyCode).toLowerCase();
        var keyArray = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        var nodeSelected = tree.getSelected();
        if (!nodeSelected) return;
        var nodeDom = tree.getNodeDom(nodeSelected.data);
        var preHight = $(nodeDom).offset().top;

        if (keyChar == "&" && $(nodeDom).prev().length) {
            tree.selectNode($(nodeDom).prev(), false);
            scrollToSelected(preHight);
            return false;
        }
        else if (keyChar == "(" && $(nodeDom).next().length) {
            tree.selectNode($(nodeDom).next(), false);
            scrollToSelected(preHight);
            return false;
        }
        else if (keyArray.in_array(keyChar)) {
            var flag = false;
            if (nodeSelected.data.ShowName.toLowerCase().startWith(keyChar)) {
                $(nodeDom).nextAll().each(function () {
                    if ($(this).text().startWith(keyChar)) {
                        tree.selectNode(this, false);
                        scrollToSelected(preHight);
                        flag = true;
                        return false;
                    }
                });
                if (!flag) {
                    var firstNode = $(nodeDom).prevAll().last();
                    if ($(firstNode[0]).text().startWith(keyChar)) {
                        tree.selectNode(firstNode[0], false);
                        scrollToSelected(preHight);
                        return false;
                    }
                    else {
                        firstNode.nextAll().each(function () {
                            if ($(this).text().startWith(keyChar)) {
                                tree.selectNode(this, false);
                                scrollToSelected(preHight);
                                return false;
                            }
                        });
                    }
                }
            } else {
                $(nodeDom).siblings().each(function () {
                    if ($(this).text().startWith(keyChar)) {
                        tree.selectNode(this, false);
                        scrollToSelected(preHight)
                        return false;
                    }
                });
            }
        }
    });
});

function refreshclick(item, i) {
    initTree();
}

function initTree() {
    try {
        tree.clear();
        tab.removeAll();
        $("#tree_loading").show();
        tree.loadData(null, "/getserver?type=server");
        $("#tree_loading").hide();
    }
    catch (e) {
        alert("请求发生异常，请重试");
    }
}

function f_heightChanged(options) {
    //if (tab)
    //    tab.addHeight(options.diff);
    //$("#left").each(function () {
    //    $(this).height($(this).parent().height() - $(this).prev().height());
    //});

    if (tab)
        tab.addHeight(options.diff);
    if (accordion && options.middleHeight > 0)
        accordion.setHeight(options.middleHeight);
}

function f_addTab(tabid, text, url) {
    tabid = tabid || liger.getId();
    tab.addTabItem({ tabid: tabid, text: text, url: url });
}

function addShowUpdateHistoryBtn(tabid) {
    var viewSourceBtn = $('<a class="viewupdatahistorylink" href="javascript:void(0)">查看更新历史</a>');
    var jiframe = $("#" + tabid);
    viewSourceBtn.insertBefore(jiframe);
    viewSourceBtn.click(function () {
        showUpdateHistory();
    }).hover(function () {
        viewSourceBtn.addClass("viewupdatahistorylink-over");
    }, function () {
        viewSourceBtn.removeClass("viewupdatahistorylink-over");
    });
}

function showUpdateHistory() {
    $.ligerDialog.open({
        title: '更新说明',
        url: '/updatehistory',
        width: $(window).width() * 0.9,
        height: $(window).height() * 0.9,
        showMax: true,
        showToggle: false,
        showMin: false,
        isResize: true,
        slide: true,
    });

}

function scrollToSelected(preH) {
    //获取当前选中的node  
    var targetNode = tree.getSelected();

    if (targetNode != null) {
        //判断节点是否在可视区域                 
        var $targetNode = $(tree.getNodeDom(targetNode.data));
        var container = $(".l-scroll");
        var containerH = container.height();
        if (preH < $targetNode.offset().top) {
            var nodeOffsetHeight = $targetNode.offset().top - container.offset().top;
            if (nodeOffsetHeight > (containerH - 30)) {
                var scrollHeight = container.scrollTop() + nodeOffsetHeight - containerH + 40;
                container.scrollTop(scrollHeight);
            }
        } else {
            var nodeOffsetHeight = $targetNode.offset().top - container.offset().top;
            if (nodeOffsetHeight < (30 - container.offset().top)) {
                var scrollHeight = container.scrollTop() + nodeOffsetHeight;
                container.scrollTop(scrollHeight);
            }
        }

    }
}

// 数组扩展
Array.prototype.in_array = function (str) {
    return $.inArray(str, this) > -1;
}
// 字符串扩展
String.prototype.startWith = function (str) {
    return this[0].toLowerCase() == str;
}