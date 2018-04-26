//js模块
import $ from 'jquery';

$(function(){
	$.ajax({
		url:'api/resDetailApi.json',
		dataType:'json',
		success:function(data){
			console.log(data);
		}
	});
});


