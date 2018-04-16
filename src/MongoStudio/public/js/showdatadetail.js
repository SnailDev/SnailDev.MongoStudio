$(function () {
    var dialog = frameElement.dialog;

    $.ajax({
        url: '/getdatadetail',
        type: 'POST',
        cache: false,
        data: { server: dialog.get('data').server, db: dialog.get('data').db, col: dialog.get('data').col, jsonfield: dialog.get('data').jsonfield, did: dialog.get('data').did },
        dataType: 'json',
        success: function (rst) {
            if (rst.Success) {
                CollapsibleViewClicked(rst.Row);
            } else {
                alert(rst.Message);
            }
        },
        error: function () {
            alert('请求发生异常，请重试');
        }
    });
});