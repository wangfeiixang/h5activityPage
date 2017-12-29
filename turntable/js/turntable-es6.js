import _Promise from 'babel-runtime/core-js/promise';
import _JSON$stringify from 'babel-runtime/core-js/json/stringify';


var turntable = {
    // lostDeg: [109, 217, 324],//没中奖的角度
    prizeDeg: [180, 288, 72, 36, 144, 0, 252, 109, 217, 324], //获奖角度
    prize: null, //根据后台的数据判断是几等奖
    winPrice: null, //获得奖金
    type: '', //这是几等奖
    prizeArr: '', //获几等奖转的角度
    num: 0, //转盘运行次数
    prizeNum: [], //服务器端返回中奖的次数
    getBamboo: 0, //获得竹子数量
    running: false, //控制转盘运转时按钮开关
    describe: null, //记录是否需要轮询
    param: {}, //分享游戏的参数
    init: function () {

        if (this.num > 0 && this.getBamboo >= 10) {
            //判断是否抽奖的图片更换
            // console.log('可以抽奖')
            $(".btnImg").attr('src', 'http://f.appstore.zshiliu.com/clubberimg/h5active/btn.png');
        } else {

            $(".btnImg").attr('src', 'http://f.appstore.zshiliu.com/clubberimg/h5active/btn-no.png');
            // console.log('不可以抽奖')
        }
        // console.log( '竹子数量'+this.bamboo,'抽奖次数'+this.num )
    },
    rotateFn: function (angles, duration, drawType) {
        // console.log('旋转执行','角度'+angles,'这是几等奖'+drawType,'时间'+duration)
        var that = this;
        this.running = true;

        if (drawType == '20') {
            duration = parseInt(duration) + 8000;
        } else {
            duration = parseInt(duration) + 5000;
        }

        // console.log('duration时间:'+duration,angles)
        $("#rotateImg").rotate({
            angle: 1800,
            animateTo: angles + 2880,
            duration: duration,
            easing: function (x, t, b, c, d) {
                return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
            },
            callback: function () {
                that.running = false;
                that.judge(drawType);
                that.init();
                that.showPrize();
                // console.log('回调函数','竹子数量'+that.getBamboo,'抽奖次数'+that.num)
            }
        });
    },
    judge: function (prize) {
        //判断几等奖
        var that = this;
        switch (prize) {
            case 0:
                that.type = "特等奖";that.winPrice = '5000元';
                break;
            case 1:
                that.type = "一等奖";that.winPrice = '500元';
                break;
            case 2:
                that.type = "二等奖";that.winPrice = '200元';
                break;
            case 3:
                that.type = "三等奖";that.winPrice = '50元';
                break;
            case 4:
                that.type = "四等奖";that.winPrice = '10元';
                break;
            case 5:
                that.type = "五等奖";that.winPrice = '5元';
                break;
            case 6:
                that.type = "六等奖";that.winPrice = '1元';
                break;
            case 7:
                that.type = "谢谢参与";
                break;
            case 8:
                that.type = "谢谢参与";
                break;
            case 9:
                that.type = "谢谢参与";
                break;
            default:
                that.type = "";break;
        }

        // console.log( that.type )
    },
    ajax: function () {
        //第一次请求数据
        var that = this;
        $.ajax({
            url: "./draw/001-查询用户当前状态应答.json",
            dataType: "json",
            async: false,
            data: {},
            success: function (data) {
                // console.log('首次接收数据成功',data)
                // console.log( data.resultCode )
                if (data.resultCode == "OK") {
                    that.getBamboo = data.totalBamboos;
                    that.num = data.luckyDrawTimes;
                    that.init();
                    $("#bamboo").html(that.getBamboo);

                    var time = data.beginTime + "-" + data.endTime; //获取每期时间开始和结束
                    $(".centertop p").html(time);
                    var during = "第" + data.drawNum + "期"; //确定当前是哪期
                    $("#inner p").html(during);

                    // that.messageHide();
                    if (data.luckyDrawAlready == "Y") {
                        // console.log( '上次抽过奖' )
                        that.searchResult(0);
                    }
                } else {

                    if (data.resultCode == "ERROR") {
                        // console.log( 'error',data.resultMsg )
                        that.getBamboo = data.totalBamboos;
                        that.num = data.luckyDrawTimes;
                        $("#bamboo").html(that.getBamboo);
                        $('.mask').show();
                        $(".message").show().find('p').html(data.resultMsg);
                        that.messageHide();
                    }
                }
            },
            error: function (XMLHttpRequest, textStatus) {
                //请求数据错误
                console.log(XMLHttpRequest, textStatus);
            }

        });
    },
    messageHide: function () {
        //隐藏弹出框
        setTimeout(function () {
            $('.message').hide();
            $('.mask').hide();
        }, 3000);
    },
    searchResult: function (type) {
        //刚进页面就进行抽奖查询
        // console.log('查询结果')
        var that = this;
        var url = '';
        switch (type) {
            case 0:
                url = "./draw/003-查询抽奖结果应答.json";
                break;
            case 1:
                url = "./draw/003-查询抽奖结果应答try.json";
                break;
            default:
                url = "./draw/003-查询非第一次抽奖结果应答.json";
                break;
        }

        $.ajax({
            url: url,
            dataType: "json",
            async: false,
            data: {},
            success: function (data) {
                var timer = null;

                if (data.resultCode == "OK") {
                    var time = parseInt(data.interval) * 1000;
                    that.describe = data.luckyDrawResult;
                    // console.log( '查询抽奖结果',that.describe )
                    if (data.luckyDrawResult == "nextQuery") {
                        //这是代表需要再一次查询
                        // console.log( '这是代表需要再一次查询',data.interval )

                        timer = setTimeout(function () {
                            // console.log( time+'秒后再次请求数据',timer )
                            that.searchResult(1);
                            // console.log( '延时器开启');
                        }, time);

                        that.rotateFn(7920, time, 20);
                    } else if (data.luckyDrawResult == "queryResult") {
                        clearTimeout(timer);
                        // console.log('正在处理延时器问题',timer)
                        var drawType = data.drawType; //定义中几等奖
                        drawType = parseInt(drawType.slice(5));
                        // console.log( '中几等奖'+drawType )
                        that.prizeArr = that.prizeDeg[drawType];
                        // console.log( data.share )
                        /* 与客户端进行交互需要的参数 */
                        that.param = {
                            title: data.share.shareTitle,
                            content: data.share.shareDesc,
                            icon: data.share.iconUrl,
                            url: data.share.shareUrl
                        };

                        that.param = _JSON$stringify(that.param);

                        // console.log( that.param )

                        if (type == "0") {
                            // console.log('展示效果')
                            that.judge(drawType);
                            that.showPrize();
                        } else {
                            // console.log('旋转角度'+that.prizeArr,'中'+drawType+'奖');
                            that.rotateFn(that.prizeArr, 3000, drawType);
                            // console.log( '旋转进行中',that.prizeArr,drawType ) 
                        }
                    }
                } else {
                    clearTimeout(timer);
                    if (data.resultCode == "ERROR") {
                        console.log('error', data.resultMsg);
                    }
                }
            },
            error: function (XMLHttpRequest, textStatus) {
                //请求数据错误
                console.log(XMLHttpRequest, textStatus);
            }

        });
    },
    showPrize: function () {
        //显示抽奖结果
        var that = this;
        if (this.type != "谢谢参与") {
            // console.log("中奖了")
            if (this.type == "") {
                //这个代表什么都没中
                return;
            }

            $('.mask').show();
            $(".prizeModal").show().find('.win').html(this.type).parent().parent().find('.bonus').html(this.winPrice);
            document.onclick = function (e) {
                if ($('.prizeModal').css('display') == 'block') {
                    // console.log( '用户已经中奖关闭弹窗',$('.missModal').css('display') )
                    that.inform();
                }
                // console.log(e.target)

                if (e.target.id === "shareGame") {
                    // console.log('这是分享游戏',that.param)
                    /*客户端与js交互的方法*/
                    window.JSInterface.shareActiveMessage(that.param);
                }

                $(".prizeModal").hide();
                $('.mask').hide();
            };
        } else {
            // console.log("没有中奖")
            $('.mask').show();
            $(".missModal").show();
            // console.log( '用户没中奖关闭弹窗',$('.missModal').css('display') )
            document.onclick = function (e) {
                if ($('.missModal').css('display') == 'block') {
                    // console.log( '点击用户没中奖关闭弹窗',$('.missModal').css('display'),'用户已经中奖关闭弹窗',$('.prizeModal').css('display') )
                    that.inform();
                }
                $(".missModal").hide();
                $('.mask').hide();

                // console.log( '点击用户没中奖关闭弹窗',$('.missModal').css('display'),'用户已经中奖关闭弹窗',$('.prizeModal').css('display') )
            };
        }
    },
    inform: function () {
        $.ajax({
            url: "./draw/require.json",
            dataType: "json",
            // async:false,
            data: {},
            success: function (data) {
                // console.log('已经收到关闭弹窗的信息',data)
            }

        });
    }
};

turntable.ajax();

$("#rotate").click(function () {

    // console.log( '旋转按钮判断'+turntable.running )

    if (turntable.running) {
        //在转盘运行中，按钮点击无效
        return;
    }

    if (turntable.num <= 0 || turntable.getBamboo < 10) {
        //次数判定
        // console.log( '次数超过三次或小于0次' );
        return;
    }

    // console.log( '旋转次数'+turntable.num,'竹子数量'+turntable.getBamboo )


    //请求数据
    $.ajax({
        url: "./draw/002-开始抽奖应答.json",
        dataType: "json",
        // async:false,
        data: {},
        timeout: 5000,
        beforeSend: function () {
            turntable.running = true;
            $("#rotateImg").rotate({
                angle: 0,
                animateTo: 1800,
                duration: 1000,
                callback: function () {
                    turntable.running = false;
                }
            });
            // console.log('beforeSend',turntable.running)
        },
        success: function (data) {
            // console.log('数据接收成功',data)
            if (data.resultCode == "OK") {
                turntable.running = false;
                turntable.getBamboo = data.totalBamboos;
                turntable.num = data.luckyDrawTimes;
                $("#bamboo").html(turntable.getBamboo);
                // console.log('数据接收成功','竹子数量'+turntable.getBamboo)
                turntable.searchResult();
            } else if (data.resultCode == "ERROR") {

                console.log('数据接收失败');
                turntable.getBamboo = data.totalBamboos;
                turntable.num = data.luckyDrawTimes;
                $("#bamboo").html(turntable.getBamboo);
                $('.mask').show();
                $(".message").show().find('p').html(turntable.resultMsg);
                turntable.messageHide();
            }
        },
        complete: function (XMLHttpRequest, textStatus) {

            if (textStatus == 'timeout') {
                //网络超时状态
                turntable.running = false;
                $('.mask').show();
                $(".message").show().find('p').html('网络超时,请重新点击抽奖');
                turntable.messageHide();
                console.log("状态完成,网络超时！" + turntable.num); //网络超时,次数应该是原次数,没改变
            }

            if (textStatus == 'error') {
                //请求数据错误状态
                turntable.running = false;
                $('.mask').show();
                $(".message").show().find('p').html('数据请求错误,请重新点击抽奖');
                turntable.messageHide();
                console.log("请求数据错误" + turntable.num); //网络超时,次数应该是原次数,没改变
            }
        }

    });
});

//点击显示抽奖活动规则

$("#rule").click(function (e) {
    $('.rulesModal').show();
    $('.maskTwo').show();
    e.stopPropagation();
    // console.log(  $('.maskTwo').css('display') )
    if ($('.maskTwo').css('display') == "block") {
        $(document).click(function () {
            $('.rulesModal').hide();
            $('.maskTwo').hide();
        });
    }
});

/*个人中奖记录*/
var personRecord = {
    type: "",
    winPrice: "",
    init: function () {
        var that = this;
        $("#record").click(function (e) {
            $('.recordModal').show();
            $('.maskTwo').show();

            that.acceptData("./draw/05.personRecord.json"); //请求中奖记录

            e.stopPropagation();
            // console.log(  $('.maskTwo').css('display') )
            if ($('.maskTwo').css('display') == "block") {
                $(document).click(function () {
                    $('.recordModal').hide();
                    $('.maskTwo').hide();
                });
            }
        });
    },
    acceptData: function (url) {
        var that = this;
        $.ajax({
            url: url,
            dataType: "json",
            // type:"post",
            async: false,
            data: {},
            success: function (data) {
                // console.log( data.status )
                if (data.status == 0) {
                    //个人中奖请求数据成功
                    $(".prizeRecord").show();
                    $(".missRecord").hide();
                    var html = "";
                    var list = data.data;
                    var content = "";
                    var drawType = 0;

                    for (var i = 0; i < list.length; i++) {
                        drawType = parseInt(list[i].drawType.slice(5));
                        // console.log( drawType )
                        that.personJudge(drawType);
                        if (drawType === 7 || drawType === 8 || drawType === 9) {
                            //   console.log('没中奖了');
                            content = "很遗憾您没有中奖，下次中奖的概率会更高哦。";
                        } else {
                            //   console.log('中奖');
                            content = "恭喜您抽中了" + that.type + that.winPrice + "!";
                        }
                        html += '<div class="flexBox">' + '<p>' + content + '</p>' + '<span>' + list[i].drawTime + '</span>' + '</div>';
                    }

                    $(".prizeRecord").html(html);
                } else {
                    $(".prizeRecord").hide();
                    $(".missRecord").show();
                }
            }

        });
    },
    personJudge: function (prize) {
        //处理返回的个人中奖结果
        var that = this;
        switch (prize) {
            case 0:
                that.type = "特等奖";that.winPrice = '5000元';
                break;
            case 1:
                that.type = "一等奖";that.winPrice = '500元';
                break;
            case 2:
                that.type = "二等奖";that.winPrice = '200元';
                break;
            case 3:
                that.type = "三等奖";that.winPrice = '50元';
                break;
            case 4:
                that.type = "四等奖";that.winPrice = '10元';
                break;
            case 5:
                that.type = "五等奖";that.winPrice = '5元';
                break;
            case 6:
                that.type = "六等奖";that.winPrice = '1元';
                break;
            case 7:
                that.type = "谢谢参与";that.winPrice = "0";
                break;
            case 8:
                that.type = "谢谢参与";that.winPrice = "0";
                break;
            case 9:
                that.type = "谢谢参与";that.winPrice = "0";
                break;
        }
    }

    /*字幕上下滚动*/
};personRecord.init();
//中奖队列名单
var prize = {
    index: -1, //获取滚动的li的当前下标
    oul: $("#prize-list ul"), //获取滚动的ul
    ali: $("#prize-list ul li"), //获取滚动的li
    html: "", //获取动态拼接的数据
    timer: null, //控制轮询时间
    num: 0,
    pollingTime: 0,
    scrollNum: 0,
    list: [], //获取轮播的li数据
    init: function () {
        var that = this;

        that.timer = setInterval(function () {
            // return;
            // console.log(that.num)
            that.scrollNum++;
            that.getPrize();
            // console.log('这是发送数据',that.pollingTime,that.scrollNum)
        }, 15000);

        this.ajax("./draw/04.record.json", 1); //这是第一次请求数据
        this.setAuto();
    },
    scroll: function () {
        //开启字幕滚动
        var that = this;
        this.ali = $(this.oul).find("li");
        // console.log( this.ali.get(0) )
        if (this.index === this.ali.length - 1) {
            this.index = 0;
        } else {
            this.index++;
        }

        // console.log( $(this.ali)[this.index],this.index );

        $($(this.ali)[this.index]).addClass("active").animate({ top: "-25px" }, 1000, "linear").siblings("li").removeClass("active").css({ top: "25px", opacity: "0" });

        if (this.index === this.ali.length - 1) {
            $($(this.ali)[0]).css("opacity", "1").animate({ top: "0px" }, 1000, "linear");
        } else {
            $($(this.ali)[this.index + 1]).css("opacity", "1").animate({ top: "0px" }, 1000, "linear");
        }
    },
    getPrize: function () {
        //获取实时所有人中奖记录
        // console.log("次数")
        this.ajax("./draw/04.record.1.json"); //非第一次获取数据
    },
    setAuto: function () {
        var time = null;
        var that = this;
        time = setInterval(function () {
            that.scroll();
            // console.log('这是自动滚动')
        }, 3000);
    },
    ajax: function (url, type) {
        //请求数据方法
        var that = this;
        $.ajax({
            url: url,
            dataType: "json",
            async: false,
            // type:"post",
            data: {
                recordNum: "5"
            },
            success: function (data) {

                if (data.status == 0) {
                    //字幕滚动请求数据成功
                    that.list = data.data;
                    that.num = that.list.length;
                    that.pollingTime = parseInt(that.num) * 3000;
                    // console.log( that.pollingTime )

                    that.list.forEach(function (ele, i) {
                        // console.log( ele )
                        that.html += "<li>恭喜<span>" + ele.phoneNum + "</span>抽中红包奖金<span>" + ele.drawPrice + "</span>元</li>";
                    });

                    $(that.oul).get(0).innerHTML += that.html;

                    if (type === 1) {
                        $($(that.oul).find("li")[0]).addClass("active");
                    }

                    that.html = "";

                    /*  that.timer = setTimeout(function(){
                         // return;
                         // console.log(that.num)
                         that.scrollNum++;
                         that.getPrize();
                         console.log('这是发送数据',that.pollingTime,that.scrollNum)
                     },that.pollingTime) */
                }
            }

        });
    }

};

prize.init();

let promise = {
    num: 0,
    promise: null,
    init() {
        // console.log("promise3111",this)
        let that = this;
        this.promise = new _Promise((resolve, reject) => {
            //使用promise的基本方法
            let timer = setInterval(() => {
                that.num++;
                if (that.num % 2 === 0) {
                    // console.log("running")
                    resolve();
                } else if (that.num > 2) {
                    that.num = 0;
                    clearInterval(timer);
                }
            }, 1000);
        });

        // console.log(  "num值",this.num  )

        this.promise.then(function () {
            console.log("success");
        }, function (error) {
            console.log("error");
        });
    }
};

promise.init();

let sleep = time => {
    return new _Promise(function (resolve, reject) {
        setTimeout(() => {
            // 返回 ‘ok’
            resolve('ok');
        }, time);
    });
};

let start = async () => {
    let result = await sleep(3000);
    alert(result); // 收到 ‘ok’
};

start();


