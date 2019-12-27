



let canvas = $("#main-canvas")[0];
let ctx = canvas.getContext("2d")

ctx.imageSmoothingEnabled = true

window.addEventListener("resize", function(){
  clearCanvas()
}, false);



function resizeCanvas(canvas) {
  let o = document.getElementById("canvas-body");
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
  let blank = document.createElement('canvas');//系统获取一个空canvas对象
  blank.width = canvas.width;
  blank.height = canvas.height;
  return canvas.toDataURL() == blank.toDataURL();//比较值相等则为空
}


document.getElementById("canvasSave").addEventListener("click", function(e){

  if (isCanvasBlank(canvas)){
    alert("画布是空的！")
    return
  }

  let maxWidth = 300.0;
  let maxHeight = 300.0;
  let re = 1.0;
  if (canvas.width > canvas.height){
    re = maxWidth / canvas.width;
  }else{
    re = maxHeight / canvas.height;
  }

  canvas = resize_img(canvas, canvas.width * re, canvas.height * re)
  let bytes = canvas.toDataURL()
  // return
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


function resize_img(canvas, width, height) {
  let width_source = canvas.width;
  let height_source = canvas.height;
  width = Math.round(width);
  height = Math.round(height);

  let ratio_w = width_source / width;
  let ratio_h = height_source / height;
  let ratio_w_half = Math.ceil(ratio_w / 2);
  let ratio_h_half = Math.ceil(ratio_h / 2);

  let ctx = canvas.getContext("2d");
  let img = ctx.getImageData(0, 0, width_source, height_source);
  let img2 = ctx.createImageData(width, height);
  let data = img.data;
  let data2 = img2.data;

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      let x2 = (i + j * width) * 4;
      let weight = 0;
      let weights = 0;
      let weights_alpha = 0;
      let gx_r = 0;
      let gx_g = 0;
      let gx_b = 0;
      let gx_a = 0;
      let center_y = (j + 0.5) * ratio_h;
      let yy_start = Math.floor(j * ratio_h);
      let yy_stop = Math.ceil((j + 1) * ratio_h);
      //有点小问题以后在议～～
      for (let yy = yy_start; yy < yy_stop; yy++) {
        let dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
        let center_x = (i + 0.5) * ratio_w;
        let w0 = dy * dy;
        let xx_start = Math.floor(i * ratio_w);
        let xx_stop = Math.ceil((i + 1) * ratio_w);
        for (let xx = xx_start; xx < xx_stop; xx++) {
          let dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
          let w = Math.sqrt(w0 + dx * dx);
          if (w >= 1) {
            continue;
          }
          weight = 2 * w * w * w - 3 * w * w + 1;
          let pos_x = 4 * (xx + yy * width_source);
          gx_a += weight * data[pos_x + 3];
          weights_alpha += weight;
          if (data[pos_x + 3] < 255)
            weight = weight * data[pos_x + 3] / 250;
          gx_r += weight * data[pos_x];
          gx_g += weight * data[pos_x + 1];
          gx_b += weight * data[pos_x + 2];
          weights += weight;
        }
      }
      data2[x2] = gx_r / weights;
      data2[x2 + 1] = gx_g / weights;
      data2[x2 + 2] = gx_b / weights;
      data2[x2 + 3] = gx_a / weights_alpha;
    }
  }
  canvas.width = width;
  canvas.height = height;
  ctx.putImageData(img2, 0, 0);
  return canvas
}