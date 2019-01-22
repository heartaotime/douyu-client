var layer, util, element, form, carousel, userInfo, limit = 30, offset = 0, shortname, needempty = true;

function init() {
    userInfo = Util.getUserInfo();
    if (userInfo) {
        // $('.layui-nav li:eq(3) a:eq(0)').html(userInfo.userName);
        // $('.layui-nav li:eq(1) a:eq(2)').html(userInfo.userName);
        // element.render('nav');
    }
    util.fixbar();
    Util.statistics('douyu_index');
    getHotCate();
}

layui.use(['layer', 'util', 'element', 'form', 'carousel'], function () {
    layer = layui.layer;
    util = layui.util;
    element = layui.element;
    form = layui.form;
    carousel = layui.carousel;

    init();


    element.on('nav', function (elem) {
        // console.log(this);
        hideAll();

        var typeext = $(this).attr('typeext');

        if (typeext == 'me') {
            me();
            return;
        }

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
        if (data.show) {
            getColumnDetail($(this).attr('shortname'));
        }
    });

    form.on('submit(submit-login)', function (data) {
        var field = data.field;
        var param = {
            username: field.username,
            password: field.password
        };
        Util.postJson("./common-server/user/api/v1/login", param, function (response) {
            if (response.code != 0) {
                layer.msg('密码错误，请重新输入');
                form.val('login', {
                    'password': ''
                });
                return;
            }
            userInfo = response.userInfo;
            Util.setUserInfo(response.userInfo);
            // $('.layui-nav li:eq(3) a:eq(0)').html(response.userInfo.userName);
            // $('.layui-nav li:eq(1) a:eq(2)').html(response.userInfo.userName);
            // element.render('nav');
            layer.msg("登陆成功[" + response.userInfo.userName + "]");
            hideAll();
            me();
        });
        return false;
    });
});

function me() {
    if (!userInfo) {
        $('.layui-form').show();
    } else {
        var html = '<blockquote class="layui-elem-quote layui-bg-gray layui-anim layui-anim-upbit">' +
            '<i class="layui-icon layui-icon-username"></i>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:;" onclick="logout()" style="color: #009688;">' + userInfo.userName + '</a><br>'
        '</blockquote>';
        $('.loginstatus').empty().append(html).show();
        searchFavoInfo();
    }
}

function logout() {
    var html = '<span style="color: #FFB800;">确认退出[' + userInfo.userName + ']吗?</span>';
    layer.confirm(html, {icon: 3, title: '提示'}, function (index) {
        isLogin = false;
        Util.removeUserInfo();
        layer.msg('退出成功');
        history.go(0);
    });
}


function hideAll() {
    $('.layui-carousel').hide(); // 轮播图
    $('#loadmore').parent().hide(); // 更多
    $('.layui-collapse').hide(); // 分类
    $('.layui-row').hide(); // 直播
    $('.layui-form').hide(); // 登陆
    $('.loginstatus').hide(); // 登陆状态
}

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

// width: 320px; height: 180px;
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

        var dataList = [];
        $.each(data, function (i, v) {
            $.each(v.room_list, function (j, val) {
                if (j < 2) {
                    dataList.push(val);
                    return true;
                }
                return false;
            });

            if (dataList.length == 6) {
                return false;
            }
        });

        var html = '';
        $.each(dataList, function (i, v) {
            var playUrl = './play.html?roomid=' + v.room_id;
            html += '<a class="layui-bg-black" target="_blank" href="' + playUrl + '"><img width="100%" src="' + v.room_src + '"></a>';
            // if (i == 4) {
            //     return false;
            // }
        });
        $('.layui-carousel div:eq(0)').empty().append(html);

        carousel.render({
            elem: '.layui-carousel',
            width: '100%', //设置容器宽度
            height: '194px',
            arrow: 'always', //始终显示箭头
            // anim: 'fade' //切换动画方式
        });
        $('.layui-carousel').show();


        var list = [];
        $.each(data, function (i, v) {
            $.each(v.room_list, function (i, v) {
                list.push(v);
            });
        });
        setData(list.slice(5, parseInt(list.length / 3) * 3));
    });
}

function searchFavoInfo() {
    if (!userInfo) {
        layer.msg('请先登陆');
        return;
    }
    var param = {
        userid: userInfo.id
    };
    Util.postJson("./common-server/user/api/v1/favolist", param, function (response) {
        if (response.code == 0) {
            var userFavos = response.userFavos;
            needempty = true;
            setData(userFavos.open);
        }
    })
}