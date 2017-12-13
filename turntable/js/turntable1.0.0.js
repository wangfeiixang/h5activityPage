

console.log("js--- url :"+basePath);
var turntable ={
    // lostDeg: [109, 217, 324],//没中奖的角度
    prizeDeg : [180, 288, 72,36,144,0,252,109, 217, 324],//获奖角度
    prize:null,//根据后台的数据判断是几等奖
    winPrice:null,//获得奖金
    type:'',//这是几等奖
    prizeArr:'',//获几等奖转的角度
    num:0,//转盘运行次数
    prizeNum:[],//服务器端返回中奖的次数
    getBamboo:0,//获得竹子数量
    running:false,//控制转盘运转时按钮开关
    describe:null,//记录是否需要轮询
    init:function(){//判断是否抽奖的图片更换
        if ( this.num>0 && this.getBamboo>=10  ) {
            // console.log('可以抽奖')
            $(".btnImg").attr('src','http://f.appstore.zshiliu.com/clubberimg/h5active/btn.png');
        } else {
            $(".btnImg").attr('src','http://f.appstore.zshiliu.com/clubberimg/h5active/btn-no.png');
            // console.log('不可以抽奖')
        }
        // console.log( '竹子数量'+this.bamboo,'抽奖次数'+this.num )
    },
    rotateFn:function( angles,duration,drawType ){
        // console.log('旋转执行','角度'+angles,'这是几等奖'+drawType,'时间'+duration)
        var that = this;
        this.running = true;
        if ( drawType=='20' ) {
            duration = parseInt(duration)+8000;
        } else {
            duration = parseInt(duration)+5000;
        }

        // console.log('duration时间:'+duration,angles)
        $("#outer").rotate({
            angle:1800,
            animateTo:angles+2880,
            duration:duration,
            easing:function (x, t, b, c, d) {
                return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
            },
            callback:function (){
                that.running = false;
                that.judge( drawType );
                that.init()
                that.showPrize();
            }
        })
    },
    judge:function(prize){//判断几等奖
        var that = this;
        switch(prize){
            case 0:that.type = "特等奖";that.winPrice = '5000元';
            break;
            case 1:that.type = "一等奖";that.winPrice = '500元';
            break;
            case 2:that.type = "二等奖";that.winPrice = '200元';
            break;
            case 3:that.type = "三等奖";that.winPrice = '50元';
            break;
            case 4:that.type = "四等奖";that.winPrice = '10元';
            break;
            case 5:that.type = "五等奖";that.winPrice = '5元';
            break;
            case 6:that.type = "六等奖";that.winPrice = '1元';
            break;
            case 7:that.type = "谢谢参与";
            break;
            case 8:that.type = "谢谢参与";
            break;
            case 9:that.type = "谢谢参与";
            break;
            default:that.type = "";break;
        }

        // console.log( that.type )
    },
    ajax:function(){//第一次请求数据
        var that = this;
        $.ajax({
            url: basePath + "/queryUserluckyDrawStatus",
            dataType: "json",
            type:"post",
            async:false,
            data:{
               
            },
            success: function(data) {
                // console.log('首次接收数据成功',data)
                if( data.resultCode=="OK" ) {
                    that.getBamboo = data.totalBamboos;
                    that.num = data.luckyDrawTimes;
                    that.init()
                    $("#bamboo").html( that.getBamboo );
                    // that.messageHide();
                    if ( data.luckyDrawAlready=="Y" ) {
                        // console.log( '上次抽过奖' )
                        that.searchResult(0);
                    } 

                } else{

                    if ( data.resultCode=="ERROR" ) {
                        // console.log( 'error',data.resultMsg )
                        that.getBamboo = data.totalBamboos;
                        that.num = data.luckyDrawTimes;
                        $("#bamboo").html( that.getBamboo );
                        $('.mask').show();
                        $(".message").show().find('p').html( data.resultMsg );
                        that.messageHide();
                        
                    } 
                }
                
            },
            error: function(XMLHttpRequest, textStatus) {//请求数据错误
                console.log( XMLHttpRequest,textStatus )
            }
            
        })
    },
    messageHide:function(){//隐藏弹出框
        setTimeout(function(){
            $('.message').hide();
            $('.mask').hide();
        },3000)
    },
    searchResult:function(type){//刚进页面就进行抽奖查询
        // console.log('查询结果')
        var that = this;
        var url = basePath + '/getqueryLuckyDrawResult';
        $.ajax({
            url: url,
            dataType: "json",
            type:"post",
            async:false,
            data:{
               
            },
            success: function(data) {
                var timer = null;
               
                if( data.resultCode=="OK" ) {
                    var time = parseInt( data.interval )*1000;
                    that.describe =  data.luckyDrawResult;

                    
                    // console.log(data.luckyDrawResult)
                    // console.log( '查询抽奖结果',that.describe )
                    if ( data.luckyDrawResult=="nextQuery" ) {//这是代表需要再一次查询
                        // console.log( '这是代表需要再一次查询',data.interval )
                        
                        timer = setTimeout(function(){
                            // console.log( time+'秒后再次请求数据',timer )
                            that.searchResult(1);
                            // console.log( '延时器开启');
                        },time)

                        

                    } else if( data.luckyDrawResult=="queryResult" ){
                        clearTimeout(timer);
                        // console.log('正在处理延时器问题',timer)
                        // setTimeout(function(){
                        var drawType = data.drawType;//定义中几等奖
                        drawType = parseInt( drawType.slice(5) );
                        that.prizeArr = that.prizeDeg[drawType];
                        if ( type == "0" ) {
                            // console.log('展示效果')
                            that.judge( drawType )
                            that.showPrize();
                        }else{
                            // console.log('旋转角度'+that.prizeArr,'中'+drawType+'奖');
                            that.rotateFn(that.prizeArr,3000,drawType);
                            // console.log( '旋转进行中',that.prizeArr,drawType ) 
                        }
                        // },0)
                        
                        
                    }

                } else{
                    clearTimeout(timer);
                    if ( data.resultCode=="ERROR" ) {
                        console.log( 'error',data.resultMsg )
                      
                    } 
                }
                
            },
            error: function(XMLHttpRequest, textStatus) {//请求数据错误
                console.log( XMLHttpRequest,textStatus )
            }
            
        })
    },
    showPrize:function(){//显示抽奖结果
        var that = this;
        if ( this.type != "谢谢参与" ) {
            // console.log("中奖了")
            if ( this.type=="" ) {//这个代表什么都没中
                return;
            } 

            $('.mask').show();
            $(".prizeModal").show().find('.win').html(this.type).parent().parent().find('.bonus').html(this.winPrice);
            document.onclick = function(e){
                if ( $('.prizeModal').css('display')=='block' ) {
                    // console.log( '用户已经关闭弹窗' )
                    that.inform();
                } 
		        $(".prizeModal").hide();
                $('.mask').hide();
            }
            
        } else {
            // console.log("没有中奖")
            $('.mask').show();
            $(".missModal").show();
            document.onclick = function(e){
                if ( $('.missModal').css('display')=='block' ) {
                    // console.log( '用户已经关闭弹窗' )
                    that.inform();
                    
                } 
                
		        $(".missModal").hide();
                $('.mask').hide();
            }
            
        }
    },
    inform:function(){
        $.ajax({
            url: basePath + "/clubberReceiveLuckyDraw",
            dataType: "json",
            // async:false,
            data:{
            },
            success: function(data) {
                // console.log('已经收到关闭弹窗的信息',data)
            },
            
        })
    }
}

turntable.ajax();


$("#rotate").click(function() {

    console.log( '旋转按钮判断'+turntable.running );
   
    if ( turntable.running ) {//在转盘运行中，按钮点击无效
        return;
    } 


   

    if (  turntable.num<=0 || turntable.getBamboo<10 ) {//次数判定
        // console.log( '次数超过三次或小于0次' );
        return;
    } 

    // console.log( '旋转次数'+turntable.num,'竹子数量'+turntable.getBamboo )


    //请求数据
    $.ajax({
        url: basePath + "/getLuckyDraw",
        dataType: "json",
        type:"post",
        // async:false,
        data:{
        },
        timeout:5000,
        beforeSend: function() {
            turntable.running = true;
            $("#outer").rotate({
                angle:0,
                animateTo:1800,
                duration:3000,
                callback:function (){
                    turntable.running = false;
                }
            })
            // console.log('beforeSend',turntable.running)
        },
        success: function(data) {
            // console.log('数据接收成功',data)
            if( data.resultCode=="OK" ) {
                turntable.running = false;
                turntable.getBamboo = data.totalBamboos;
                turntable.num = data.luckyDrawTimes;
                $("#bamboo").html( turntable.getBamboo );
                // console.log('数据接收成功','竹子数量'+turntable.getBamboo)
                turntable.searchResult();
                
            } else if( data.resultCode=="ERROR" ){

                console.log( '数据接收失败' );
                turntable.getBamboo = data.totalBamboos;
                turntable.num = data.luckyDrawTimes;
                $("#bamboo").html( turntable.getBamboo );
                $('.mask').show();
                $(".message").show().find('p').html( turntable.resultMsg );
                turntable.messageHide();

            }
            
        },
        complete: function (XMLHttpRequest,textStatus) {
        	if(textStatus == 'timeout'){//网络超时状态 
		        turntable.running = false;
                $('.mask').show();
                $(".message").show().find('p').html( '网络超时,请重新点击抽奖' );
                turntable.messageHide();
                console.log( "状态完成,网络超时！"+turntable.num );//网络超时,次数应该是原次数,没改变 .
        	}
        	if(textStatus=='error'){//请求数据错误状态
		        turntable.running = false;
                $('.mask').show();
                $(".message").show().find('p').html( '数据请求错误,请重新点击抽奖' );
                turntable.messageHide();
                console.log( "请求数据错误"+turntable.num );//网络超时,次数应该是原次数,没改变.
        	}
        }
    });
});

//点击显示抽奖活动规则

$("#rule").click(function(e){
    $('.rulesModal').show();
    $('.maskTwo').show();
    e.stopPropagation()
    // console.log(  $('.maskTwo').css('display') )
    if (  $('.maskTwo').css('display')=="block" ) {
        $(document).click(function(){
            $('.rulesModal').hide();
            $('.maskTwo').hide();
        })
    } 
    
})





