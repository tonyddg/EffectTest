var canvanani;

var effectInf =
{
    posOffset: 10,
    avgSize: 20,
    avgDuration: 160
}

$(document).ready(function()
{
    canvanani = new BlockList("#backblock");
    canvanani.start();

    /////////////////////
    //控制按钮的效果

    const blockBotton = $(".blockbotton");
    blockBotton.ready(function(){blockBotton.css("background-color", blockBotton.attr("outclr"));});
    blockBotton.hover(function(){blockBotton.animate({backgroundColor: blockBotton.attr("inclr")}, 50);});
    blockBotton.mouseout(function(){blockBotton.animate({backgroundColor: blockBotton.attr("outclr")}, 50);});
    blockBotton.mousedown(function(){blockBotton.css("background-color", blockBotton.attr("actclr"));});
    blockBotton.mouseup(function()
    {
        blockBotton.css("background-color", blockBotton.attr("inclr"));
        if(canvanani.isrunning)
        {
            canvanani.stop();
            blockBotton.text("Off");
        }
        else
        {
            canvanani.start();
            blockBotton.text("On");
        }
    });

    ///////////////////////
    //获取数值条的取值并实时更新

    const ctinputSet = $(".controltable");
    const inpPosOffset = ctinputSet.find(".inpPosOffset");
    const inpAvgSize = ctinputSet.find(".inpAvgSize");
    const inpAvgDuration = ctinputSet.find(".inpAvgDuration");

    ctinputSet.ready(function(){
        parseInt(inpAvgDuration.children("input").val(effectInf.avgDuration));
        parseInt(inpPosOffset.children("input").val(effectInf.posOffset));
        parseInt(inpAvgSize.children("input").val(effectInf.avgSize));

        inpAvgDuration.children("span").text(effectInf.avgDuration.toString());
        inpPosOffset.children("span").text(effectInf.posOffset.toString());
        inpAvgSize.children("span").text(effectInf.avgSize.toString());
    });
    ctinputSet.change(function(){
        effectInf.avgDuration = parseInt(inpAvgDuration.children("input").val());
        effectInf.posOffset = parseInt(inpPosOffset.children("input").val());
        effectInf.avgSize = parseInt(inpAvgSize.children("input").val());

        inpAvgDuration.children("span").text(effectInf.avgDuration.toString());
        inpPosOffset.children("span").text(effectInf.posOffset.toString());
        inpAvgSize.children("span").text(effectInf.avgSize.toString());
    });

});

function DrawFrame()
{
    canvanani.draw();
    requestAnimationFrame(DrawFrame);
}

//色块单元
//x 色块中心x坐标
//y 色块中心y坐标
//color RGBA颜色，数组
//duration 持续时间，单位帧
//size 色块大小，单位像素
function BlockUnit(x, y, color, duration, size)
{
    this.color = color;
    this.duration = duration;
    this.x = x;
    this.y = y;
    this.size = size;
    
    this.lifetime = 0;
    this.isdie = false;
}
BlockUnit.prototype.draw = function(ctx)
{
    let rate = 1 - this.lifetime / this.duration;
    let changesize = this.size * rate;
    let changecolor = this.color;
    changecolor[3] *= rate;

    ctx.fillStyle = RGBAarrToStr(changecolor);
    ctx.fillRect(this.x - changesize / 2, this.y - changesize / 2, changesize, changesize);
    this.lifetime++;

    if(this.lifetime > this.duration)this.isdie = true;
    else this.isdie = false;
}

//播放BlockList中的方块动画
//canvasSelector jquery选择器字符串，选择播放动画的canvas
function BlockList(canvasSelector)
{
    this.canvasEl = $(canvasSelector);

    this.ctx = this.canvasEl[0].getContext('2d');
    this.width = $(document).width();
    this.height = $(document).height();
    this.canvasEl.attr("width", this.width);
    this.canvasEl.attr("height", this.height);

    this.BlockArr = [];
    this.isrunning = false;
    this.RafHandle = 0;

    this.canvasEl.mousemove(function(event)
    {
        if(!this.isrunning)return;

        let tmpcolor = [
            randomRange(0, 255),
            randomRange(0, 255),
            randomRange(0, 255),
            Math.random()];
            this.insert(
            event.pageX + randomRange(-effectInf.posOffset, effectInf.posOffset),
            event.pageY + randomRange(-effectInf.posOffset, effectInf.posOffset),
            tmpcolor,
            randomRange(effectInf.avgDuration - 80, effectInf.avgDuration + 80),
            randomRange(effectInf.avgSize - 10, effectInf.avgSize + 10));
    }.bind(this));

    $(window).resize(this.fullscreen.bind(this));
}

BlockList.prototype.draw = function () 
{
    this.ctx.clearRect(0, 0, this.width, this.height);
    for(let i = this.BlockArr.length - 1; i >= 0; i--)
    {
        this.BlockArr[i].draw(this.ctx);
        if(this.BlockArr[i].isdie)
        {
            this.BlockArr.pop();
        }
    }
    if(this.isrunning)
    {
        this.RafHandle = requestAnimationFrame(this.draw.bind(this));
    }
}
BlockList.prototype.insert = function(x, y, color, duration, size)
{
    this.BlockArr.push(new BlockUnit(x, y, color, duration, size));
    this.BlockArr.sort(function(a, b)
    {
        return (b.duration - b.lifetime) - (a.duration - a.lifetime);
    });
}
BlockList.prototype.fullscreen = function()
{
    this.canvasEl.attr("width", $(document).width());
    this.canvasEl.attr("height", $(document).height());
    this.width = $(document).width();
    this.height = $(document).height();
}
BlockList.prototype.stop = function()
{
    this.isrunning = false;
    cancelAnimationFrame(this.RafHandle);
}
BlockList.prototype.start = function()
{
    this.isrunning = true;
    requestAnimationFrame(this.draw.bind(this));
}

//将一个储存RGBA的数组转化为字符串
function RGBAarrToStr(RGBAarr)
{
    let str = '';
    str += 'rgba('
    for(let i = 0; i < 4; i++)
    {
        str += RGBAarr[i];
        str += ',';
    }
    str = str.substring(0, str.length - 1);
    str += ')';
    return str;
}

//生成一个a到b的随机整数
function randomRange(a, b)
{
    // console.log("////");
    // console.log(Math.floor(Math.random() * (b - a) + a));
    // console.log(a);
    // console.log(b);
    return Math.floor(Math.random() * (b - a) + a);
}