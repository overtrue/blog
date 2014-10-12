var  SNS ={
	defaultConfig:{
		sharedomain:'',
		title:'',
		description:'',
		pic : '',
		w:'_blank'
	},
	share:function(type){
		var shareurl,sharetitle,sharepic,finalurl="";
		switch(type){
			case 1:
				shareurl="http://service.weibo.com/share/share.php?url="+encodeURIComponent(this.defaultConfig.sharedomain);
				sharetitle="&title="+encodeURIComponent(this.defaultConfig.description);
				sharepic="&pic="+encodeURIComponent(this.defaultConfig.sharedomain+this.defaultConfig.pic);
				finalurl=shareurl+sharetitle+sharepic;
			break;
			case 2:
				shareurl="http://share.v.t.qq.com/index.php?c=share&a=index&url="+encodeURIComponent(this.defaultConfig.sharedomain);
				sharetitle="&title="+encodeURIComponent(this.defaultConfig.description);
				sharepic="&pic="+encodeURIComponent(this.defaultConfig.sharedomain+this.defaultConfig.pic);
				finalurl=shareurl+sharetitle+sharepic;
			break;
			case 3:
				shareurl="http://widget.renren.com/dialog/share?resourceUrl="+encodeURIComponent(this.defaultConfig.sharedomain);
				sharetitle="&title="+encodeURIComponent(this.title)+"&description="+encodeURIComponent(this.defaultConfig.description+""+this.defaultConfig.sharedomain);
				sharepic="&pic="+encodeURIComponent(this.defaultConfig.sharedomain+this.defaultConfig.pic);
				finalurl=shareurl+sharetitle+sharepic;
			break;
			case 4:
				shareurl="http://www.kaixin001.com/rest/records.php?url="+encodeURIComponent(this.defaultConfig.sharedomain);
				sharetitle="&content="+encodeURIComponent(this.defaultConfig.description);
				sharepic="&pic="+encodeURIComponent(this.defaultConfig.sharedomain+this.defaultConfig.pic);
				finalurl=shareurl+sharetitle+sharepic+"&starid=0&aid=0&style=11&stime=&sig=";
			break;
			case 5:
				shareurl="http://shuo.douban.com/!service/share?href="+encodeURIComponent(this.defaultConfig.sharedomain);
				sharetitle="&name="+encodeURIComponent(this.defaultConfig.title)+"&text="+encodeURIComponent(this.defaultConfig.description);
				sharepic="&image="+encodeURIComponent(this.defaultConfig.sharedomain+this.defaultConfig.pic);
				finalurl=shareurl+sharetitle+sharepic+"&starid=0&aid=0&style=11&stime=&sig=";
			break;
		}
		this.openNew(finalurl);
	},
	getParamsOfShareWindow:function(width,height){
		var top=(document.body.clientHeight-height)/2;
		var left=(document.body.clientWidth-width)/2;
		return ['toolbar=0,status=0,resizable=1,width=' + width + ',height=' + height + ',left='+left+',top='+top].join('');
	},
	openNew:function(url){
		window.open(url,this.w, this.getParamsOfShareWindow(680,420));
	},
	init:function(newConfig){
		for(var i in newConfig){
			if(newConfig[i]){
				this.defaultConfig[i]=newConfig[i];
			}
		}
	}
}