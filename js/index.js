Util.statistics('douyu_index');
var limit = 30;
var offset = 0;
var shortname = "";
var needempty = true;
var iscarousel = false;

var isFavoList = false;


function init() {

    var userInfo = Util.getUserInfo();
    if (userInfo) {
        $('a[data-target="#logindiv"]').html(userInfo.userName);
    }

    getColumnList();

    $('#favo').on('click', function () {
        searchFavoInfo();
    });


    $('.nav-link').on('click', function () {
        var data = $(this).attr('shortname');
        if (data && data != '') {
            offset = 0;
            shortname = data;
            if (data == 'hot') {
                needempty = true;
                iscarousel = false;
                shortname = '';
                getHotCate();
                $("#hot").show();
            } else {
                if (data == 'all') {
                    shortname = '';
                }
                needempty = true;
                iscarousel = true;
                searchInfo();
                $("#hot").hide();
            }
        } else {
            iscarousel = false;
        }

        if ($('#list').attr('class') == 'collapse show') {
            $('#tempClick').trigger('click');
        }
        if ($('.dropdown-menu').attr('class') == 'dropdown-menu show') {
            $('#classify').trigger('click');
        }
    });

    $('a[shortname=hot]').trigger('click');


    $('#submit').on('click', function () {
        var username = $('#name').val();
        if (username == "") {
            Util.tips("请填写用户名");
            return;
        }

        var password = $('#pwd').val();
        if (password === "") {
            Util.tips("请填写密码");
            return;
        }

        var param = {
            username: username,
            password: password
        };
        Util.postJson("./common-server/user/api/v1/login", param, function (response) {
            if (response.code != 0) {
                Util.tips(response.message);
                return;
            }

            $('#logindiv').modal('hide');
            $('a[data-target="#logindiv"]').html(response.userInfo.userName);

            // 设置cookie的有效期为10天
            // $.cookie("userInfo", JSON.stringify(response.userInfo), {
            //     expires: 10
            // });

            if (localStorage) {
                localStorage.setItem("userInfo", JSON.stringify(response.userInfo));
            }

        }, true, false);
    });

    $('#loadmore').on('click', function () {
        if (iscarousel && $(this).attr('more') == 1) {
            offset += limit;
            needempty = false;
            searchInfo();
        } else {
            $(this).html('到底了').attr('more', '0');
        }
    });

    // 滑动滚动条
    // $(window).scroll(function () {
    //     var scrollTop = $(this).scrollTop();
    //     var scrollHeight = $(document).height();
    //     var windowHeight = $(this).height();
    //     if (iscarousel) {
    //         if (scrollHeight - (scrollTop + windowHeight) < 5) { //滚动到底部执行事件
    //             // Util.tips("我到底部了");
    //             offset += limit;
    //             needempty = false;
    //             searchInfo();
    //         }
    //     }
    //
    //     // if (scrollTop == 0) { //滚动到头部部执行事件
    //     //     Util.tips("我到头部了");
    //
    //     // }
    // });
}

function searchFavoInfo() {
    var userInfo = Util.getUserInfo();
    if (!userInfo) {
        Util.tips('请先登陆');
        return;
    }

    var param = {
        userid: userInfo.id
    };
    Util.postJson("./common-server/user/api/v1/favolist", param, function (response) {
        if (response.code == 0) {
            var userFavos = response.userFavos;

            needempty = true;
            iscarousel = false;
            isFavoList = true;
            $("#hot").hide();
            setData(userFavos.open);

            isFavoList = true;
            needempty = false;
            setData(userFavos.close);
        }
    })
}

function getHotCate() {
    // 获取热播
    // var containerwidth = $('.container').width();
    Util.postJson("./common-server/douyu/api/v1/getHotCate", {}, function (response) {
        var data = response.data;
        $('.carousel-indicators').empty();
        $('.carousel-inner').empty();

        var dataList = [];
        $.each(data, function (i, v) {
            $.each(v.room_list, function (j, val) {
                if (j < 2) {
                    dataList.push(val);
                }
            });
            if (dataList.length > 11) {
                return false;
            }
        });

        $.each(dataList, function (i, v) {

            var divStr = "hot1";
            if (i > 5) {
                divStr = "hot2";
            }

            if (i === 0 || i === 6) {
                $("#" + divStr + " .carousel-indicators").append(
                    '<li class="active" data-target="#"' + divStr + ' data-slide-to="' + i + '""></li>');
            } else {
                $("#" + divStr + " .carousel-indicators").append(
                    '<li data-target="#"' + divStr + ' data-slide-to="' + i + '""></li>');
            }


            $('#hotcopy > div').attr('class', 'carousel-item');
            var row1 = v.nickname + ' · ' + v.online;
            var row2 = v.room_name;

            if (i === 0 || i === 6) {
                $('#hotcopy > div').attr('class', 'carousel-item active')
            }
            $('#hotcopy a').attr('href', './play.html?roomid=' + v.room_id);
            $('#hotcopy img').attr('src', v.room_src);
            $('#hotcopy p').html(row1).attr('title', row1);
            // .width(containerwidth);

            $('#' + divStr + ' .carousel-inner').append($('#hotcopy').html());
        });

        needempty = true;
        iscarousel = false;

        var list = [];
        $.each(data, function (i, v) {
            $.each(v.room_list, function (i, v) {
                list.push(v);
            });
        });
        setData(list.slice(0, parseInt(list.length / 3) * 3));
    })
}

function getColumnList() {
    // 获取所有频道
    Util.postJson("./common-server/douyu/api/v1/getColumnList", {}, function (response) {
        var data = response.data;
        $.each(data, function (i, v) {
            $('.dropdown-menu').append(
                '<a class="dropdown-item" href="#" data-toggle="collapse" data-target="#list" shortname="' + v.short_name + '">' + v.cate_name + '</a>');
        });
        $('.dropdown-item').on('click', function () {
            getColumnDetail($(this).attr('shortname'));
        });
    });
}

function getColumnDetail(data) {
    $('.list-inline').empty();

    // 获取子频道
    var getColumnDetailParam = {
        "shortName": data
        // "shortName": "syxx"
    };
    Util.postJson("./common-server/douyu/api/v1/getColumnDetail", getColumnDetailParam, function (response) {
        var data = response.data;

        $.each(data, function (i, v) {
            $('.list-inline').append(
                '<li class="list-inline-item"><a href="#" class="btn btn-link" shortname="' +
                v.short_name + '">' + v.tag_name + '</a></li>');
        });
        $('.btn-link').on('click', function () {
            // $('#btnAll').trigger('click');
            $('#tempClick').trigger('click');

            shortname = $(this).attr('shortname');

            if (!shortname) {
                shortname = "";
            }

            needempty = true;
            iscarousel = true;
            $("#hot").hide();
            searchInfo();
        });
    });
}

function judgeLen(str) {
    if (str.length > 16) {
        return str.substr(0, 16) + '...';
    }
    return str;
}

function searchInfo() {
    // 获取当前全部直播
    var liveParam = {
        "limit": limit,
        "offset": offset,
        "shortname": shortname
    };
    Util.postJson("./common-server/douyu/api/v1/live", liveParam, function (response) {
        var data = response.data;
        setData(data);
    })
}

function setData(data) {
    if (needempty) {
        $('#listRow').empty();
    }

    if (iscarousel && data.length > 0) {
        $('#loadmore').html('加载更多').attr('more', '1');
    } else {
        $('#loadmore').html('到底了').attr('more', '0');
    }

    $.each(data, function (i, v) {
        var row1 = v.nickname + ' · ' + v.online;
        var row2 = v.room_name;

        $('#copy a').attr('href', './play.html?roomid=' + v.room_id);
        $('#copy img:eq(0)').attr('src', v.room_src);
        $('#copy img:eq(1)').attr('src', v.avatar_mid);

        //judgeLen
        $('#copy h6').html(row1).attr('title', row1);
        $('#copy p').html(row2).attr('title', row2);


        // $('#copy .row:eq(0) > img').attr('src', v.avatar_small)
        // $('#copy .row:eq(1) > span').html(row1)
        // $('#copy .row:eq(2) > span').html(row2)

        $('#listRow').append($('#copy').html());

    });
    isFavoList = false;
}


$(function () {
    init();
});