/**
 * 
 * functions polarToCartesian and describeArc taken from:
 * https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
 * By user: opsb
 * https://stackoverflow.com/users/162337/opsb
 * 
 */

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle){

  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
console.log(startAngle, endAngle);

  var d = [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
  if (startAngle == 0) 
    console.log(d);
    
  return d;       
}

// Easing functions from https://easings.net/

function easeInSine(x) {
  return 1 - Math.cos((x * Math.PI) / 2);
}
function easeOutSine(x) {
  return Math.sin((x * Math.PI) / 2);
}
function easeInOutSine(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}
function easeInQuad(x) {
  return x * x;
}
function easeOutQuad(x) {
  return 1 - (1 - x) * (1 - x);
}
function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}
function easeInCubic(x) {
  return x * x * x;
}
function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}
function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
function easeInQuart(x) {
  return x * x * x * x;
}
function easeOutQuart(x) {
  return 1 - Math.pow(1 - x, 4);
}
function easeInOutQuart(x) {
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}
function easeInQuint(x) {
  return x * x * x * x * x;
}
function easeOutQuint(x) {
  return 1 - Math.pow(1 - x, 5);
}
function easeInOutQuint(x) {
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}
function easeInExpo(x) {
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}
function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}
function easeInOutExpo(x) {
  return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2
    : (2 - Math.pow(2, -20 * x + 10)) / 2;
}
function easeInCirc(x) {
  return 1 - Math.sqrt(1 - Math.pow(x, 2));
}
function easeOutCirc(x) {
  return Math.sqrt(1 - Math.pow(x - 1, 2));
}
function easeInOutCirc(x) {
return x < 0.5
  ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
  : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

// Main function to create a gauge
// type: 'arch', 'semi', 'circle'
// Hallucinated by Luke Boland, 2025

function moveGauge(gaugeobj, newStart, newEnd, duration, easingFunc) {
  var oldStart = gaugeobj.startAngle;
  var oldEnd = gaugeobj.endAngle;
  var frames = duration * 60;
  if (newStart === oldStart && newEnd === oldEnd) {
    return;
  }
  if (newStart < gaugeobj.min) {
    newStart = gaugeobj.min;
  }
  if (newStart > gaugeobj.max) {
    newStart = gaugeobj.max;
  }
  if (newEnd < gaugeobj.min) {
    newEnd = gaugeobj.min;
  }
  if (newEnd > gaugeobj.max) {
    newEnd = gaugeobj.max;
  }
  if (newEnd < newStart) {
    let tmp = newStart;
    newStart = newEnd;
    newEnd = tmp;
  }
  var startRange = newStart - oldStart;
  var endRange = newEnd - oldEnd;
  var frameArray = [];
   for (let frame = 0; frame <= frames; frame++) {
    var progress = frame / frames;    
    frameArray.push([oldStart + easingFunc(progress) * startRange, oldEnd + easingFunc(progress) * endRange]);
  }
  gaugeobj.startAngle = newStart;
  gaugeobj.endAngle = newEnd;
  clearInterval(gaugeobj.animation);
  gaugeobj.animation = null;
  gaugeobj.animation = setInterval(() => {
    if (frameArray.length > 0) {
      var vals = frameArray.shift();
      let tmpCircle1, tmpCircle2;
      switch(gaugeobj.type) {
        case 'arch':
          var pathDescription = describeArc(gaugeobj.centerX, gaugeobj.centerY, gaugeobj.radius, (gaugeobj.degrees * (vals[0] - gaugeobj.min) / (gaugeobj.max - gaugeobj.min)) + 45, (gaugeobj.degrees * (vals[1] - gaugeobj.min) / (gaugeobj.max - gaugeobj.min)) + 45);
          tmpCircle1 = polarToCartesian(gaugeobj.centerX, gaugeobj.centerY, gaugeobj.radius, (gaugeobj.degrees * (vals[0] - gaugeobj.min) / (gaugeobj.max - gaugeobj.min)) + 45 + 180);
          tmpCircle2 = polarToCartesian(gaugeobj.centerX, gaugeobj.centerY, gaugeobj.radius, (gaugeobj.degrees * (vals[1] - gaugeobj.min) / (gaugeobj.max - gaugeobj.min)) + 45 + 180);
          break;
        case 'semi':
          var pathDescription = describeArc(gaugeobj.centerX, gaugeobj.centerY, gaugeobj.radius, (gaugeobj.degrees * (vals[0] - gaugeobj.min) / (gaugeobj.max - gaugeobj.min)) + 90, (gaugeobj.degrees * (vals[1] - gaugeobj.min) / (gaugeobj.max - gaugeobj.min)) + 90);
          tmpCircle1 = polarToCartesian(gaugeobj.centerX, gaugeobj.centerY, gaugeobj.radius, (gaugeobj.degrees * (vals[0] - gaugeobj.min) / (gaugeobj.max - gaugeobj.min)) + 90+ 180);
          tmpCircle2 = polarToCartesian(gaugeobj.centerX, gaugeobj.centerY, gaugeobj.radius, (gaugeobj.degrees * (vals[1] - gaugeobj.min) / (gaugeobj.max - gaugeobj.min)) + 90+ 180);
          break;
        case 'circle':
        default:
          var pathDescription = describeArc(gaugeobj.centerX, gaugeobj.centerY, gaugeobj.radius, (gaugeobj.degrees * (vals[0] - gaugeobj.min) / (gaugeobj.max - gaugeobj.min)), (gaugeobj.degrees * (vals[1] - gaugeobj.min) / (gaugeobj.max - gaugeobj.min)));
          tmpCircle1 = polarToCartesian(gaugeobj.centerX, gaugeobj.centerY, gaugeobj.radius, (gaugeobj.degrees * (vals[0] - gaugeobj.min) / (gaugeobj.max - gaugeobj.min)) + 180);
          tmpCircle2 = polarToCartesian(gaugeobj.centerX, gaugeobj.centerY, gaugeobj.radius, (gaugeobj.degrees * (vals[1] - gaugeobj.min) / (gaugeobj.max - gaugeobj.min)) + 180);
          break;
      }
      gaugeobj.startAngle = vals[0];
      gaugeobj.endAngle = vals[1];
      var arc_fg = gaugeobj.svg.getElementsByTagName('path')[1];
      arc_fg.setAttributeNS(null, "d", pathDescription);

      var circle = gaugeobj.svg.getElementsByTagName('circle')[0];
   
      circle.setAttributeNS(null, "cx", tmpCircle1.x);
      circle.setAttributeNS(null, "cy", tmpCircle1.y);
      var circle2 = gaugeobj.svg.getElementsByTagName('circle')[1];
      
      circle2.setAttributeNS(null, "cx", tmpCircle2.x);
      circle2.setAttributeNS(null, "cy", tmpCircle2.y);
    }
    else {
      clearInterval(gaugeobj.animation);
      gaugeobj.animation = null;
      return;
    }
  }, 1000 / 60);
}

function createGauge(parentElem, radius, start, end, min, max, color, strokeWidth, type) {
  var gaugeobj = {};
  gaugeobj.type = type;
  gaugeobj.centerX = radius + strokeWidth;
  gaugeobj.centerY = radius + strokeWidth;
  gaugeobj.radius = radius;
  gaugeobj.startAngle = start;
  gaugeobj.endAngle = end;
  gaugeobj.min = min;
  gaugeobj.max = max;
  gaugeobj.color = color;
  gaugeobj.strokeWidth = strokeWidth;
  gaugeobj.animation = null;
  switch(type) {
    case 'arch':
      gaugeobj.degrees = 315-45;
      gaugeobj.gaugeStartAngle = (gaugeobj.degrees * (start - min) / (max - min)) + 45;
      gaugeobj.gaugeEndAngle = (gaugeobj.degrees * (end - min) / (max - min)) + 45;
      break;
    case 'semi':
      gaugeobj.degrees = 180;
      gaugeobj.gaugeStartAngle = (gaugeobj.degrees * (start - min) / (max - min)) +90;
      gaugeobj.gaugeEndAngle = (gaugeobj.degrees * (end - min) / (max - min)) + 90;
      break;
    case 'circle':
    default:
      gaugeobj.degrees = 359.9;
      gaugeobj.gaugeStartAngle = (gaugeobj.degrees * (start - min) / (max - min));
      gaugeobj.gaugeEndAngle = (gaugeobj.degrees * (end - min) / (max - min));
      break;
  } 
  gaugeobj.svg = createGaugeSVG(gaugeobj.centerX, gaugeobj.centerY, radius, gaugeobj.gaugeStartAngle, gaugeobj.gaugeEndAngle, color, strokeWidth, type);
  parentElem.appendChild(gaugeobj.svg);
  return gaugeobj;
}

function createGaugeSVG(centerX, centerY, radius, startAngle, endAngle, color, strokeWidth, type) {
  var pathDescription = describeArc(centerX, centerY, radius, startAngle, endAngle);
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute('style', 'border: 1px solid black');
  svg.setAttribute('width', 2 * (radius + strokeWidth));
  svg.setAttribute('height', 2 * (radius + strokeWidth));
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  var arc_bg = document.createElementNS("http://www.w3.org/2000/svg", "path");
  switch(type) {
    case 'arch':
      arc_bg.setAttributeNS(null, "d", describeArc(centerX, centerY, radius, 45, 315));
      break;
      case 'semi':
      arc_bg.setAttributeNS(null, "d", describeArc(centerX, centerY, radius, 90, 270));
      break;
    case 'circle':
    default:
      arc_bg.setAttributeNS(null, "d", describeArc(centerX, centerY, radius, 0, 359.9));
      break;
  }
  arc_bg.setAttributeNS(null, "stroke", "#aaa");
  arc_bg.setAttributeNS(null, "stroke-width", strokeWidth);
  arc_bg.setAttributeNS(null, "fill", "none");
  arc_bg.setAttributeNS(null, "stroke-linecap", "round");
  arc_bg.setAttributeNS(null, "transform", "rotate(180)");
  arc_bg.setAttributeNS(null, "transform-origin", centerX + " " + centerY);
  svg.appendChild(arc_bg);
  var arc_fg = document.createElementNS("http://www.w3.org/2000/svg", "path");
  arc_fg.setAttributeNS(null, "d", pathDescription);
  arc_fg.setAttributeNS(null, "stroke", color);
  arc_fg.setAttributeNS(null, "stroke-width", strokeWidth-5);
  arc_fg.setAttributeNS(null, "fill", "none");
  arc_fg.setAttributeNS(null, "stroke-linecap", "round");
  arc_fg.setAttributeNS(null, "transform", "rotate(180)");
  arc_fg.setAttributeNS(null, "transform-origin", centerX + " " + centerY);
  svg.appendChild(arc_fg);
  var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  let tmp = polarToCartesian(centerX, centerY, radius, startAngle+180);
  circle.setAttributeNS(null, "cx", tmp.x);
  circle.setAttributeNS(null, "cy", tmp.y);
  circle.setAttributeNS(null, "r", strokeWidth * .35);
  circle.setAttributeNS(null, "fill", "white");
  svg.appendChild(circle);
  var circle2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  tmp = polarToCartesian(centerX, centerY, radius, endAngle+180);
  circle2.setAttributeNS(null, "cx", tmp.x);
  circle2.setAttributeNS(null, "cy", tmp.y);
  circle2.setAttributeNS(null, "r", strokeWidth * .35);
  circle2.setAttributeNS(null, "fill", "white");
  svg.appendChild(circle2);
  return svg;
}