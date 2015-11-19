'use strict';

$(document).ready(function(){

	$('.sliding-panel-button,.sliding-panel-fade-screen,.sliding-panel-close').on('click touchstart',function (e) {
	    $('.sliding-panel-content,.sliding-panel-fade-screen,.sliding-panel-button').toggleClass('is-visible');
	    e.preventDefault();
	  });

});

var looper_rotate;
var degrees = 0;
function stopAnimation(looper_anim){
	clearTimeout(looper_anim);
}

function rotateAnimation(el,speed,sense){
	var elem = document.getElementById(el);
	elem.style.transform = "rotate("+degrees+"deg)";
	looper_rotate = setTimeout('rotateAnimation(\''+el+'\','+speed+')',speed);
	if( sense = 1){
		degrees++;
		if(degrees > 359){
			degrees = 1;
		}
	}
	else{
		degrees--;
		if (degrees < -359) {
			degrees = -1;
		}
	}	
}