<?php
    //菜单分类获取
    header("Content-type: text/html; charset=utf-8");   
	include './fun.php';
    
    $url = "https://h5.ele.me/restapi/shopping/v2/restaurant/category?latitude=28.227779&longitude=112.938858";
    echo httpCurl($url);
?>