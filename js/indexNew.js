var layer, element, limit = 30, offset = 0, shortname, needempty = true;

function init() {
    Util.statistics('douyu_index');
    getHotCate();
}

layui.use(['layer', 'element'], function () {
    layer = layui.layer;
    element = layui.element;

    init();

    element.on('nav', function (elem) {
        // console.log(this); //当前Tab标题所在的原始DOM元素
        $('#loadmore').parent().hide(); // 更多
        $('.layui-collapse').hide(); // 分类
        $('.layui-row').hide(); // 直播


        var typeext = $(this).attr('typeext');
        if (typeext == 'hot') { // Douyu
            getHotCate();
            return;
        }
        if (typeext == 'classify') { // 分类
            getColumnList();
            return;
        }

        shortname = $(this).attr('shortname');
        if (shortname) {
            if (shortname == 'all') {
                shortname = '';
            }
            offset = 0;
            needempty = true;
            searchInfo();
        }

    });

    element.on('collapse', function (data) {
        // console.log(data.show); //得到当前面板的展开状态，true或者false
        // console.log(data.title); //得到当前点击面板的标题区域DOM对象
        // console.log(data.content); //得到当前点击面板的内容区域DOM对象
        // console.log(this);
        if (data.show) {
            getColumnDetail($(this).attr('shortname'));
        }

    });

});


function searchInfo() {
    // 获取直播
    var liveParam = {
        "limit": limit,
        "offset": offset,
        "shortname": shortname
    };
    Util.postJson("./common-server/douyu/api/v1/live", liveParam, function (response) {
        $('#loadmore').parent().show();
        var data = response.data;
        if (data.length <= 0) {
            layer.msg('到底了');
            return;
        }
        setData(data);
    })
}

function setData(data) {
    if (needempty) {
        $('.layui-row').empty();
    }
    $.each(data, function (i, v) {
        var row1 = v.nickname + ' · ' + v.online;
        var row2 = v.room_name;
        var playUrl = './play.html?roomid=' + v.room_id;
        var html = '' +
            '<div class="layui-col-lg4 layui-col-md4 layui-col-sm6 layui-col-xs12 layui-anim layui-anim-upbit">' +
            '   <div class="layui-card">' +
            '       <div class="layui-card-body">' +
            '           <a target="_blank" href="' + playUrl + '"><img style="width: 100%;" src="' + v.room_src + '"/></a>' +
            '       </div>' +
            '       <div class="layui-card-header">' +
            '           <img class="" style="width: 58px; height: 58px;float: left" src="' + v.avatar_mid + '"/>' +
            '           <div style="float: left;margin-left: 10px;line-height: 30px;max-width: 70%;">' +
            '              <p>' + row1 + '</p>' +
            '              <p>' + row2 + '</p>' +
            '           </div>' +
            '       </div>' +
            '   </div>' +
            '</div>';
        $('.layui-row').append(html);
    });
    $('.layui-row').show();

}

function getColumnList() {
    $('.layui-collapse').empty();
    // 获取所有频道
    Util.postJson("./common-server/douyu/api/v1/getColumnList", {}, function (response) {
        var data = response.data;
        $.each(data, function (i, v) {
            var html = '<div class="layui-colla-item">' +
                '            <h2 class="layui-colla-title" shortname="' + v.short_name + '">' + v.cate_name + '</h2>' +
                '            <div class="layui-colla-content"></div>' +
                '        </div>';
            $('.layui-collapse').append(html);
        });
        element.render('collapse');
        $('.layui-collapse').show();
    });
}

function getColumnDetail(data) {
    $('.layui-colla-content').empty();
    // 获取子频道
    var getColumnDetailParam = {
        "shortName": data
    };
    Util.postJson("./common-server/douyu/api/v1/getColumnDetail", getColumnDetailParam, function (response) {
        var data = response.data;

        var html = '<span class="layui-breadcrumb" lay-separator="|">';
        $.each(data, function (i, v) {
            html += '<a href="javascript:;" shortname="' + v.short_name + '">' + v.tag_name + '</a>';
        });
        html += '</span>';
        $('.layui-colla-content').append(html);
        element.render('breadcrumb');
    });
}

$('.layui-collapse').on('click', 'a[shortname]', function () {
    shortname = $(this).attr('shortname');
    offset = 0;
    needempty = true;
    $('.layui-collapse').hide();
    searchInfo();
});

$('#loadmore').on('click', function () {
    offset += limit;
    needempty = false;
    searchInfo();
});

function getHotCate() {
    // 获取热播
    Util.postJson("./common-server/douyu/api/v1/getHotCate", {}, function (response) {
        var data = response.data;
        needempty = true;
        var list = [];
        $.each(data, function (i, v) {
            $.each(v.room_list, function (i, v) {
                list.push(v);
            });
        });
        setData(list.slice(0, parseInt(list.length / 3) * 3));
    });
}