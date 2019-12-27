



let canvas = $("#main-canvas")[0];
let ctx = canvas.getContext("2d")

ctx.imageSmoothingEnabled = true

window.addEventListener("resize", function(){
  clearCanvas()
}, false);



function resizeCanvas(canvas) {
  let o = document.getElementById("main-canvas");
  let w = o.offsetWidth;
  let h = o.offsetHeight;
  canvas.width = w;
  canvas.height = h;

  let width = canvas.width, height=canvas.height;
  if (window.devicePixelRatio) {
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.height = height * window.devicePixelRatio;
    canvas.width = width * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

}

resizeCanvas(canvas)

document.body.addEventListener('touchmove', (e) => {
  e.preventDefault();
}, { passive: false });


if (document.body.ontouchstart !== undefined){
  canvas.ontouchstart = function(e){
    lastPoint(e.touches[0].clientX - canvas.offsetLeft, e.touches[0].clientY - canvas.offsetTop)
    canvas.ontouchmove = function(e) {
      moveDraw(e.touches[0].clientX - canvas.offsetLeft, e.touches[0].clientY - canvas.offsetTop)
    }
  }
  canvas.ontouchend = function(e){
    lastPoint(e.touches[0].clientX - canvas.offsetLeft, e.touches[0].clientY - canvas.offsetTop)
    canvas.ontouchmove = null
  }
}else{
  canvas.onmousedown = function(e){
    lastPoint(e.offsetX, e.offsetY)
    canvas.onmousemove =function(e){
      moveDraw(e.offsetX, e.offsetY)
    }
  }

  canvas.onmouseup = function(e){
    lastPoint(e.offsetX, e.offsetY)
    canvas.onmousemove = null
  }
}

function lastPoint(x, y){
  // alert("x:"+x+",y:"+y)
  canvas.lastPoint = {x: x , y: y }

}

function moveDraw(x, y){
  draw(x,y)
  canvas.lastPoint = {x: x , y: y }
}

function draw(x,y){
  ctx.beginPath();

  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.moveTo(x,y);
  ctx.lineTo(canvas.lastPoint.x,canvas.lastPoint.y);
  ctx.stroke();
  ctx.closePath();
}

function clearCanvas(){
  resizeCanvas(canvas)
}

document.getElementById("canvasClear").addEventListener("click", function(e){
  clearCanvas()
})

let bindText = $("#bindText")
let readyText = $("#readyText")
let canvasSave = $("#canvasSave")
document.getElementById("bindText").addEventListener("click", function(){
  let status = bindText.attr("status")
  if (status === "wait") {
    if (readyText.val() === ""){
      alert("需要输入绑定值")
      return
    }
    readyText.attr("disabled", "disabled")
    bindText.attr("status", "bind")
    bindText.html("解绑")
    canvasSave.removeAttr("disabled")
    clearCanvas()
    return
  }

  if (status === "bind"){
    readyText.removeAttr("disabled")
    bindText.attr("status", "wait")
    canvasSave.attr("disabled", "disabled")
    bindText.html("绑定")
    return
  }
})
function isCanvasBlank(canvas) {
  var blank = document.createElement('canvas');//系统获取一个空canvas对象
  blank.width = canvas.width;
  blank.height = canvas.height;
  return canvas.toDataURL() == blank.toDataURL();//比较值相等则为空
}


document.getElementById("canvasSave").addEventListener("click", function(e){
  let bytes = canvas.toDataURL()
  if (isCanvasBlank(canvas)){
    alert("画布是空的！")
    return
  }
  let text = readyText.val()
  $.ajax({
    method: "POST",
    url: "/canvas",
    data: {
      bind_text: text,
      image_bytes: bytes
    },
    success: function(response){
      if ($("#lastInput > img").length >= 2){
        $("#lastInput > img").last().remove();
      }
      $("#lastInput").prepend('<img src="/canvas'+response.path_key+'" style="height:100%" />')
      clearCanvas()
    }
  })
})