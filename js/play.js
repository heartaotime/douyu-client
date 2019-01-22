var layer, roomid, player;

function init() {
    Util.statistics('douyu_play');
    $(function () {
        roomid = getUrlParam('roomid');
        isFavo();
        favo();
        flv_load();
        getDM();
        setInterval(function () {
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();
            var VHeight = $('.video').height();
            var DMHeight;
            // 768 xs屏幕
            if (windowWidth > 768) {
                DMHeight = windowHeight;
            } else {
                DMHeight = windowHeight - VHeight;
            }
            // alert(windowHeight + '-' + VHeight + '=' + DMHeight);
            $('.dm').css("height", DMHeight - 15 + "px");
            if ($('.dm')[0].scrollHeight > windowHeight * 3) {
                $('.dm').empty();
            }
            $('.dm')[0].scrollTop = $('.dm')[0].scrollHeight;
        }, 10);
    });
}

layui.use(['layer'], function () {
    layer = layui.layer;
    init();
});


function getUrlParam(name) {
    //构造一个含有目标参数的正则表达式对象
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    //匹配目标参数
    var r = window.location.search.substr(1).match(reg); //搜索
    //返回参数值
    if (r != null) return unescape(r[2]);
    return null;
}

function flv_load() {
    var data = {
        "roomid": roomid
    };
    Util.postJson("./common-server/douyu/api/v1/room", data, function (response) {
        var data = response.data;

        var row1 = data.nickname + ' · ' + data.online;
        var row2 = data.room_name;
        $('img:eq(0)').attr('src', data.owner_avatar);
        $('p:eq(0)').html(row1).attr('title', row1);
        $('p:eq(1)').html(row2).attr('title', row2);


        var playUrl = data.rtmp_url + '/' + data.rtmp_live;

        console.log(playUrl);

        var str = playUrl.split('/')[2].split('.')[0];

        playUrl = './proxylive/' + str + "/" + playUrl.split('/')[3] + "/" + playUrl.split('/')[4];

        console.log(playUrl);

        console.log('isSupported: ' + flvjs.isSupported());

        var mediaDataSource = {
            type: 'flv',
            url: playUrl
        };
        flv_load_mds(mediaDataSource);
    });
}


function flv_load_mds(mediaDataSource) {
    var element = $('#video')[0];
    if (typeof player !== "undefined") {
        if (player != null) {
            player.unload();
            player.detachMediaElement();
            player.destroy();
            player = null;
        }
    }
    player = flvjs.createPlayer(mediaDataSource, {
        enableWorker: false,
        lazyLoadMaxDuration: 3 * 60,
        seekType: 'range'
    });
    player.attachMediaElement(element);
    player.load();
}

function getDM() {
    var url = document.location.toString();
    url = 'ws://' + url.split('/')[2].split(':')[0] + ':5000/dm';
    var ws = new WebSocket(url);
    // var ws = new WebSocket('ws://106.13.46.83/dm');
    ws.onopen = function (evt) {  //绑定连接事件
        console.log("Connection open ...");
        layer.msg('弹幕正在路上...');
        ws.send(roomid);
        setInterval(function () {
            ws.send('keepalive');
        }, 40000);
    };


    ws.onmessage = function (evt) {//绑定收到消息事件
        console.log("Received Message: " + evt.data);
        $('.dm').append("&nbsp;&nbsp;" + evt.data + "<br>");
    };

    ws.onclose = function (evt) { //绑定关闭或断开连接事件
        console.log("Connection closed.");
    };

    window.onbeforeunload = function (event) {
        ws.close();
    }
}

function favo() {
    $('#favo').on('click', function () {
        var userInfo = Util.getUserInfo();
        if (userInfo == undefined) {
            layer.msg("请先登陆");
            return;
        }

        var data = {
            "userid": userInfo.id,
            "roomid": roomid
        };
        Util.postJson("./common-server/user/api/v1/favo", data, function (response) {
            // layer.msg(response.message);
            if (response.code == 0) {
                var userFavo = response.userFavo;
                if (userFavo.isFavo == 0) {
                    // 取消关注成功
                    $('#favo').attr('src', 'img/nofavo.png');
                    layer.msg('取消关注成功');
                } else {
                    // 关注成功
                    $('#favo').attr('src', 'img/favo.png');
                    layer.msg('关注成功');
                }
            }

        });
    });
}

function isFavo() {
    var userInfo = Util.getUserInfo();
    if (userInfo == undefined) {
        return;
    }

    var data = {
        "userid": userInfo.id,
        "roomid": roomid
    };
    Util.postJson("./common-server/user/api/v1/isfavo", data, function (response) {
        if (response.code == 0) {
            if (response.isFavo == 1) {// 0：未关注 1：已关注
                // 已关注
                $('#favo').attr('src', 'img/favo.png');
            }
        }
    });
}

// $(document).ready(function () {
//     var windowHeight = $(window).height();
//     if ($(this).height() < windowHeight) {
//         $(this).height(windowHeight);
//     }
// });
