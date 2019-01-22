Util.statistics('douyu_play');
var roomid = getUrlParam('roomid');

function getUrlParam(name) {
    //构造一个含有目标参数的正则表达式对象
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    //匹配目标参数
    var r = window.location.search.substr(1).match(reg); //搜索
    //返回参数值
    if (r != null) return unescape(r[2]);
    return null;
}

function load() {
    var data = {
        "roomid": roomid
    };
    Util.postJson("./common-server/douyu/api/v1/getLive", data, function (response) {
        var data = response.data;
        var playUrl = data.hls_url;
        console.log(playUrl);
        var options = {
            sources: [
                {
                    src: playUrl,
                    type: 'application/x-mpegURL'
                }
            ],
            // width: window.innerWidth - 15,
            // height: window.innerHeight - 20,
            controls: true,
            autoplay: true,
            techOrder: ['html5']
        };

        videojs('video', options, function onPlayerReady() {
            videojs.log('播放器已经准备好了!');
        });
    });

    Util.postJson("./common-server/douyu/api/v1/getRoomInfo", data, function (response) {
        var data = response.data;
        var row1 = data.owner_name + ' · ' + data.online;
        var row2 = data.room_name;
        $('.card-body img:eq(0)').attr('src', data.avatar);
        $('.card-body h6').html(row1).attr('title', row1);
        $('.card-body p').html(row2).attr('title', row2);
    });
}


function getDM() {
    var url = document.location.toString();
    url = 'ws://' + url.split('/')[2].split(':')[0] + ':5000/dm';
    var ws = new WebSocket(url);
    // var ws = new WebSocket('ws://106.13.46.83/dm');
    ws.onopen = function (evt) {  //绑定连接事件
        console.log("Connection open ...");
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
            Util.tips("请先登陆");
            return;
        }

        var data = {
            "userid": userInfo.id,
            "roomid": roomid
        };
        Util.postJson("./common-server/user/api/v1/favo", data, function (response) {
            // Util.tips(response.message);
            if (response.code == 0) {
                var userFavo = response.userFavo;
                if (userFavo.isFavo == 0) {
                    // 取消关注成功
                    $('#favo').attr('src', 'img/nofavo.png');
                } else {
                    // 关注成功
                    $('#favo').attr('src', 'img/favo.png');
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

$(document).ready(function () {
    var windowHeight = $(window).height();
    if ($(this).height() < windowHeight) {
        $(this).height(windowHeight);
    }
});

$(function () {
    isFavo();
    favo();
    load();
    getDM();

    setInterval(function () {

        $('#center').css('width', $('.col-lg-9').css("width").split('px')[0] - 58 - 40 - 20 + 'px');


        var windowWidth = $(window).width();
        var windowHeight = $(window).height();

        // margin-left: 5px;margin-right: 30px


        var flag = false; // 是否时小屏幕
        if (windowWidth < 992) { // 小屏幕
            flag = true;
        }

        var VHeight;
        if (flag) {
            VHeight = windowHeight / 2;
        } else {
            VHeight = windowHeight;
        }
        VHeight = VHeight - 10;
        $('.col-lg-9').css("height", VHeight + 'px');
        $('#video').css('height', VHeight - $('.card-body').css("height").split('px')[0] - 2 + 'px');


        var DMHeight;
        if (flag) { // 小屏幕
            DMHeight = windowHeight - VHeight - 5;
        } else {
            DMHeight = VHeight - 2;
        }
        $('.dm').css("height", DMHeight + "px");
        if ($('.dm')[0].scrollHeight > windowHeight * 3) {
            $('.dm').empty();
        }

        $('.dm')[0].scrollTop = $('.dm')[0].scrollHeight;
    }, 10);

    // if (windowWidth < 800) { // 小屏幕
    //     setInterval(function () {
    //         $('.dm')[0].scrollTop = $('.dm')[0].scrollHeight;
    //         var height = windowHeight - $('.col-lg-9').css("height").split('px')[0] - $('.top').css("height").split('px')[0] - 5 + "px";
    //         $('.dm').css("height", height);
    //         if ($('.dm')[0].scrollHeight > windowHeight * 3) {
    //             $('.dm').empty();
    //         }
    //
    //     }, 10);
    //
    // } else {
    //     setInterval(function () {
    //         $('.dm')[0].scrollTop = $('.dm')[0].scrollHeight;
    //         var height = ($('.col-lg-9').css("height").split('px')[0] - $('.top').css("height").split('px')[0]) + "px";
    //         $('.dm').css("height", height);
    //         if ($('.dm')[0].scrollHeight > windowHeight * 3) {
    //             $('.dm').empty();
    //         }
    //     }, 10);
    // }

})