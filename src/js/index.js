// 样式
import '../scss/common.scss';
import '../scss/index.scss';
import '../csslib/animate.css';

//js模块
import $ from 'jquery';

//载入api配置
import api from '../api/indexApi.js';

//导入插件
import BScroll from 'better-scroll';
//分类菜单公用对象
const category = {
	data:[],
	firstCateIndex:1,
	depFirstCateIndex:1,
	secondCateIndex:0
}


const topCateScroll = new BScroll('.top-cate-wrapper',{
	click:true,
	scrollX:true 
});
const restaurantScroll = new BScroll('.restaurant-wrapper',{
	click:true,
	pullUpLoad: {
	  threshold: 50
	}
});





$(function(){
	//加载更多处理
	var offsetVal = 0;
	
	restaurantScroll.on('pullingUp',function(){
		offsetVal += 8;
		let id = '';

		if(category.depFirstCateIndex === 1 && category.secondCateIndex === 0){
			let subCate = category.data[1].sub_categories; 
			subCate.forEach((item,k)=>{
				id += '&restaurant_category_ids[]=' + item.id;
			});	
		}else{

			id = category.data[category.firstCateIndex].sub_categories[category.secondCateIndex].id;
		}
		
		$.ajax({
			url: api.resCateApi02,
			data:{cate_id:id,offset:offsetVal},
			dataType:'jsonp',
			jsonpCallback:'jsonp',
			beforeSend:function(){
				loadingCtrl();
			},
			success:function(data){
				loadingCtrl();
				//餐馆html结构生成
				getRestaurantHtml(data.items,'append');

				restaurantScroll.finishPullUp();
                restaurantScroll.refresh();
			}
		});
	});
	

	//获取分类数据
	let cateStep1 = new Promise((resolve,reject)=>{
		$.ajax({
			url: api.categoryApi,
			type: 'get',
			dataType: 'jsonp',
			jsonpCallback:'jsonp',
			success: function(data){
				category.data = data;
				console.log(category.data);
				let cateArr = category.data[category.firstCateIndex].sub_categories;
				
				// 生成topCate头部菜单分类
				getTopCateHtml(cateArr);

				// 生成categories所有菜单
				getCategories(category.data);

				resolve(data);

			}
		});
	});
	
	//默认获取首页餐馆数据
	cateStep1.then((res)=>{
		let subCate = category.data[1].sub_categories; 
		let id = '';
		subCate.forEach((item,k)=>{
			id += '&restaurant_category_ids[]=' + item.id;
		});
		$.ajax({
			url: api.resCateApi02,
			data:{cate_id:id},
			dataType:'jsonp',
			jsonpCallback:'jsonp',
			beforeSend:function(){
				loadingCtrl();
			},
			success:function(data){
				loadingCtrl();
				//餐馆html结构生成
				getRestaurantHtml(data.items);
			}
		});
	});

	


	//头部菜单分类点击事件处理(选中与数据加载)
	let topCate = document.querySelector('.top-cate .top-cate-wrapper .content');
	topCate.addEventListener('click',function(e){
		var target = e.target;
		document.querySelector('.top-cate .top-cate-wrapper .active').setAttribute('class','');
		target.setAttribute('class','active');

		//设置二级分类当前索引
		category.secondCateIndex = target.getAttribute('index');

		//数据获取
		let id = category.data[category.firstCateIndex].sub_categories[category.secondCateIndex].id;

		$.ajax({
			url: api.resCateApi,
			data:{cate_id:id},
			dataType:'jsonp',
			jsonpCallback:'jsonp',
			beforeSend:function(){
				$(".restaurant-list").empty();
				loadingCtrl();
			},
			success:function(data){
				loadingCtrl();
				//餐馆html结构生成
				getRestaurantHtml(data.items);
			}
		});
	}); 

	//餐馆html结构生成函数
	function getRestaurantHtml(data,mode='replace'){
		let resHtml = '';
		data.forEach(function(val,key){
			//图片地址构建
			const suffixArr = ['png','jpeg','jpg','gif','svg'];
			let dir01 = val.restaurant.image_path[0];
			let dir02 = val.restaurant.image_path[1] + val.restaurant.image_path[2];
			let src = val.restaurant.image_path.substr(3); 
			var suffix = '';
			for(let j=0;j<=suffixArr.length-1;j++){
		
				let startIndex = val.restaurant.image_path.indexOf(suffixArr[j]);
				if(startIndex !== -1){
					suffix = '.' + val.restaurant.image_path.substr(startIndex);
					break;
				}
			}

			let thumb = "http://fuss10.elemecdn.com/"+ dir01 +"/"+ dir02 +"/"+ src + suffix +"?imageMogr/format/webp/thumbnail/!80x80r/gravity/Center/crop/80x80/";

			//活动结构构建
			let activitesHtml = '';
			val.restaurant.activities.map(function(v,k){
				let classVal = '';
				if(k > 1){
					classVal = 'hide';
				}
				activitesHtml += `<li class="`+ classVal +`"><span class="icon" style="background-color:#`+ v.icon_color +`">`+ v.icon_name +`</span>`+ v.name +`</li>`;
			});


			resHtml += `<div class="restaurant-item">
				<div class="thumb">
					<img src="`+ thumb +`" alt="">
				</div>
				<div class="info">
					<h3>`+ val.restaurant.name +`</h3>
					<div class="data">
						<div class="d-top">
							<p>
								<span>4.6</span>
								<span>月售`+ val.restaurant.recent_order_num +`单</span>
							</p>
							<p>
								<span>蜂鸟配送</span>
							</p>
						</div>
						<div class="d-bottom">
							<p>
								<span>¥`+ val.restaurant.float_minimum_order_amount +`起送</span>
								<span>配送费¥2.5</span>
							</p>
							<p>
								<span>`+ val.restaurant.distance +`m</span>
								<span>`+ val.restaurant.order_lead_time +`分钟</span>
							</p>
						</div>

						<div class="tags"><span>`+ val.restaurant.recommend.reason +`</span></div>
					</div>
					<div class="activites">
						<div class="act-list">
							<ul>`+ activitesHtml +`</ul>
						</div>
						<div class="act-op">
							`+ val.restaurant.activities.length +`个活动
						</div>
					</div>
				</div>
				
			</div>`;
		});

		if(mode === 'replace'){
			$(".restaurant-list").html(resHtml);
		}else if(mode === 'append'){
			$(".restaurant-list").append(resHtml);
		}
		
	}
	


	//打开菜单分类弹出层
	let open = document.querySelector('.top-cate-op');
	open.addEventListener('click',function(){
		cateAllModle('open');
	});

	//close关闭菜单分类弹出层
	let close = document.querySelector('.categories-top .close');
	close.addEventListener('click',function(){
		cateAllModle('close');
	});

	// 菜单tab切换
	//一级菜单分类点击事件处理
	var firstCateUl = document.querySelector('.content-first ul');
	firstCateUl.addEventListener('click',function(e){
		var target = e.target;
		category.firstCateIndex = parseInt(target.getAttribute('index'));

		getCategories(category.data);
	});

	//二级菜单分类点击事件处理
	var secondCateUl = document.querySelector('.content-second ul');
	secondCateUl.addEventListener('click',function(e){
		var target = e.target;
		category.secondCateIndex = parseInt(target.getAttribute('index'));
		category.depFirstCateIndex = category.firstCateIndex; 
		// 生成topCate头部菜单分类
		let cateArr = category.data[category.firstCateIndex].sub_categories;
		getTopCateHtml(cateArr);
		autoWidth();
		//将原有当前类取消
		let liArr = document.querySelectorAll('.content-second ul li');
		for(let k=0;k<=liArr.length-1;k++){
			liArr[k].setAttribute('class','');
		}
		
		//为点击li添加当前类
		target.setAttribute('class','active');
		cateAllModle('close');

		//请求餐馆数据
		//数据获取
		let id = category.data[category.firstCateIndex].sub_categories[category.secondCateIndex].id;

		$.ajax({
			url: api.resCateApi,
			data:{cate_id:id},
			dataType:'jsonp',
			jsonpCallback:'jsonp',
			beforeSend:function(){
				$(".restaurant-list").empty();
				loadingCtrl();
			},
			success:function(data){
				loadingCtrl();
				//餐馆html结构生成
				getRestaurantHtml(data.items);
			}
		});
	});


	//生成topCate头部菜单分类函数
	function getTopCateHtml(cate){
		let topCateHtml = '';

		for(let i=0;i<=cate.length-1;i++){
			var curClass = '';
			if(i === category.secondCateIndex){
				curClass = 'active';
			}
			topCateHtml += '<a class="'+ curClass +'" index="'+ i +'" href="javascript:void(0);">'+ cate[i].name +'</a>';
		}

		$('.top-cate-wrapper .content').html(topCateHtml);

		autoWidth();
	}

	//动态计算头部菜单分类导航宽度
	function autoWidth(){
		let totalW = 0;
		$('.top-cate-wrapper .content a').each(function(i){
			totalW += $(this).outerWidth()+16;
		});

		$('.top-cate-wrapper .content').css('width',totalW+'px');
	}

	//生成categories所有菜单
	function getCategories(categories){

		//一级菜单分类生成
		let firstCateHtml = '';
		
		for(let i=1;i<=categories.length-1;i++){
			var curClass = '';
			if(i === category.firstCateIndex){
				curClass = 'active';
			}
			firstCateHtml += '<li index="'+ i +'" class="' + curClass +'">'+ categories[i].name +'<span>'+ categories[i].count +'</span></li>';
		}
		$('.content-first .content').html(firstCateHtml);

		//二级菜单分类生成
		let secondCateHtml = '';
		
		const secondCateArr = categories[category.firstCateIndex].sub_categories;
		const suffixArr = ['png','jpeg','jpg','gif','svg'];
		for(let i=0;i<=secondCateArr.length-1;i++){
			var curClass = '';
			if(i === category.secondCateIndex && category.depFirstCateIndex == category.firstCateIndex){
				curClass = 'active';
			}
			let dir01 = secondCateArr[i].image_url[0];
			let dir02 = secondCateArr[i].image_url[1] + secondCateArr[i].image_url[2];
			let src = secondCateArr[i].image_url.substr(3); 
			var suffix = '';
			
			for(let j=0;j<=suffixArr.length-1;j++){
				
				var startIndex = secondCateArr[i].image_url.indexOf(suffixArr[j]);
				if(startIndex !== -1){
					suffix = '.' + secondCateArr[i].image_url.substr(startIndex);
					break;
				}
			}
			

			let thumb = "http://fuss10.elemecdn.com/"+ dir01 +"/"+ dir02 +"/"+ src + suffix +"?imageMogr/format/webp/thumbnail/!80x80r/gravity/Center/crop/80x80/";
			secondCateHtml += '<li index="'+ i +'" class="'+ curClass +'"><img src="'+ thumb +'">'+ secondCateArr[i].name +'<span>'+ secondCateArr[i].count +'</span></li>';
		}

		$('.content-second .content').html(secondCateHtml);
	}

	//菜单分类弹出层 关闭开启函数
	// state 状态(open打开,close关)
	function cateAllModle(state){
		document.querySelector('.top-cate-all').setAttribute('class','top-cate-all '+state);
	}

	//loading控制
	function loadingCtrl(){
		let loadingCon = document.querySelector('.loading');
		let loading = document.querySelector('.loading-icon');
		let state = loadingCon.getAttribute('state');
		if(state === 'none'){
			loadingCon.style.display = 'block';
			loadingCon.setAttribute('state','block');
			loading.style.animationPlayState = 'running';
		}else{
			loadingCon.style.display = 'none';
			loadingCon.setAttribute('state','none');
			loading.style.animationPlayState = 'paused';
		}
	}

	//更多活动操作(显示|隐藏)
	let reswrapper = document.querySelector('.restaurant-wrapper');
	reswrapper.addEventListener('click',function(e){
		let target = e.target;
		if(target.getAttribute('class') === 'act-op'){
			let hideNode = $(target).siblings('.act-list').find('.hide');
			hideNode.toggle();
		}
	});
});