<?php
    //菜单分类获取
    header("Content-type: text/html; charset=utf-8");   
	include './fun.php';
    $id = isset($_GET['id'])?$_GET['id']:0;
    $url = "https://h5.ele.me/restapi/shopping/restaurant/{$id}?extras[]=activities&extras[]=albums&extras[]=license&extras[]=identification&extras[]=qualification&terminal=h5&latitude=28.227779&longitude=112.938858";

    echo httpCurl($url);
?>