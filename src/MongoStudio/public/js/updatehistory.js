$(f_init);

function f_init() {
    var v107 = [
      { tag: '查询', type: '需求', content: 'MongoDB C# Driver 升级' },
      { tag: '索引', type: 'BUG', content: 'Unique Index bug 修复' },
    ];
    var v107 = [
      { tag: '查询', type: '需求', content: 'MongoDB C# Driver 升级' },
    ];

    var v106 = [
      { tag: '数据', type: 'Bug', content: '修复导出数据时因查询条件过长而导出失败' },
    ];

    var v105 = [
      { tag: '格式', type: '优化', content: '时间格式再详细界面修整' },
      { tag: '树', type: '优化', content: '树宽度调整' }
    ];

    var v104 = [
      { tag: '查询', type: 'BUG', content: '树节点定位浏览器兼容' },
      { tag: '查询', type: 'BUG', content: '树高度与浏览器高度适应' }
    ];

    var v103 = [
      { tag: '查询', type: '需求', content: '新增字段过滤功能' }
    ];

    var v102 = [
      { tag: '列表', type: '需求', content: '按字母键和上下方向键快速定位到树节点' },
      { tag: '查询', type: '需求', content: '提供了导出json和导出excel的功能' },
    ];

    var v101 = [
      { tag: '列表', type: '需求', content: '增加集合下的索引节点展示' },
      { tag: '列表', type: '需求', content: '服务器、数据库、集合、索引节点图片更改，便于区分' },
      { tag: '查询', type: '需求', content: '提供了F5热键查询功能' },
      { tag: '展示', type: '优化', content: '数据默认按_id升序排序' },
      { tag: '展示', type: '优化', content: '值类型明确区分（去掉所有值类型的引号）' },
      { tag: '展示', type: 'BUG', content: '解决查询数据为空时，表头说明不更新的问题' },
    ];

    f_addVersionLog('V1.0.7更新记录', v107);
    f_addVersionLog('V1.0.6更新记录', v106);
    f_addVersionLog('V1.0.5更新记录', v105);
    f_addVersionLog('V1.0.4更新记录', v104);
    f_addVersionLog('V1.0.3更新记录', v103);
    f_addVersionLog('V1.0.2更新记录', v102);
    f_addVersionLog('V1.0.1更新记录', v101);
}

function f_addVersionLog(title, items, subtitle) {
    var jtitle = $("<h2 class='l-title'></h2>");
    jtitle.html(title).appendTo('#updateLog');
    if (subtitle) {
        $("<div class='subtitle'>" + subtitle + "</div>").appendTo('#updateLog');
    }
    var tagGroups = [];
    var tagItems = [];
    $(items).each(function (i, item) {
        if (!item) return;
        var tag = item['tag'];
        var tagIndex = $.inArray(tag, tagGroups);
        if (tagIndex == -1) {
            tagGroups.push(tag);
            tagIndex = tagGroups.length - 1;
            tagItems.push([]);
        }
        tagItems[tagIndex].push(item);
    });
    $(tagGroups).each(function (i, item) {
        f_addVersionTagLog(item, tagItems[i]);
    });
}
function f_addVersionTagLog(tag, items) {
    var jtitle = $("<h3 class='l-title'></h3>");
    jtitle.html(tag).appendTo('#updateLog');
    $(items).each(function () {
        var jitem = $('<p class="l-log-content"><span class="l-log-content-tag"></span></p>');
        $("span:first", jitem).html("[" + this.type + "]");
        jitem.append(this.content).appendTo('#updateLog');
    });
}