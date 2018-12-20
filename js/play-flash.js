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


function flv_load() {
    var data = {
        "roomid": roomid
    };
    Util.postJson("./douyu/api/v1/room", data, function (response) {
        var data = response.data;
        var playUrl = data.rtmp_url + '/' + data.rtmp_live;

        console.log(playUrl);

        // $('#example_video_1').attr('src', playUrl);


        var options = {
            sources: [
                {
                    src: playUrl,
                    type: 'video/flv'
                },
                {
                    src: playUrl,
                    type: 'video/mp4'
                }
            ],
            // width: window.innerWidth - 15,
            // height: window.innerHeight - 20,
            controls: true,
            autoplay: true,
            techOrder: ['flash', 'html5']
        };

        videojs('video', options, function onPlayerReady() {
            videojs.log('播放器已经准备好了!');

            // In this context, `this` is the player that was created by Video.js.<br>  // 注意，这个地方的上下文， `this` 指向的是Video.js的实例对像player
            // this.play();

            // How about an event listener?<br>  // 如何使用事件监听？
            // this.on('ended', function () {
            //     videojs.log('播放结束了!');
            // });
        });

    })


}

function getDM() {
    var url = document.location.toString();
    url = 'ws://' + url.split('/')[2] + '/dm';
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
            alert("请先登陆");
            return;
        }

        var data = {
            "userid": userInfo.id,
            "roomid": roomid
        };
        Util.postJson("./douyu/api/v1/favo", data, function (response) {
            // alert(response.message);
            if (response.code == 0) {
                var userFavo = response.userFavo;
                if (userFavo.isFavo == 0) {
                    // 取消关注成功
                    $('#favo').html('关注');
                } else {
                    // 关注成功
                    $('#favo').html('已关注');
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
    Util.postJson("./douyu/api/v1/isfavo", data, function (response) {
        if (response.code == 0) {
            if (response.isFavo == 1) {// 0：未关注 1：已关注
                // 已关注
                $('#favo').html('已关注');
            }
        }
    });
}


$(function () {
    isFavo();
    favo();
    flv_load();
    getDM();
    setInterval(function () {
        $('.dm')[0].scrollTop = $('.dm')[0].scrollHeight;
        var height = ($('.left').css("height").split('px')[0] - $('.top').css("height").split('px')[0]) + "px";
        $('.dm').css("height", height);
        if ($('.dm')[0].scrollHeight > $(window).height() * 3) {
            $('.dm').empty();
        }
    }, 10);

})