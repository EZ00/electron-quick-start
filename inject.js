__myYoutubeTools={
    getMP: function(){
        return document.getElementById('movie_player')
    }
    ,pauseVideo: function(){
        var t=__myYoutubeTools
        t.clearPNSTo()
        t.getMP().pauseVideo()
        t.isPaused=true
    }
    ,playVideo: function(){
        var t=__myYoutubeTools
        t.clearPNSTo()
        t.getMP().playVideo()
        t.isPaused=false
    }
    ,clearPNSTo: function(){
        var t=__myYoutubeTools
        try{clearTimeout(t.toPNS);}catch(x){}
    }
    ,isPaused: true
    ,toPNS: null
    ,playNpauseVideo: function(){
        // debugger
        var t=__myYoutubeTools
        if(t.isPaused){
            t.playVideo()
        }else{
            t.pauseVideo()
        }
        t.toPNS = setTimeout("__myYoutubeTools.playNpauseVideo()",1000);
    }
}

__aliTools={
  send:function(){require("electron").ipcRenderer.send('ping', { windowUId: require("electron").remote.getCurrentWindow().id });},
  getZeroEffectProducts: function(query){

    seajs.iuse("//i.alicdn.com/ida-mydata/common/bridge/bridge.js")(function(Bridge){
  		Bridge.Jquery.ajax({
  			type : 'POST',
  			url : server + 'self/.json?action=CommonAction&iName=getIneffectiveProducts' + '&' + Math.random(),
  			data : query,
  			success : function(result){
  				if(null == result || !result.successed){
  					return;
  				}
  				var data = null;
  				try{
  					data = result.value;
  				}catch(e){}
  				if (null == data || 0 == data.total) {
  					return;
  				}
          else{
            console.log(data);
            // socket.emit("logZeroEffectProducts",data);
            if(this.query.pageNO*this.query.pageSize < data.total){
              this.query.pageNO += 1;
              __aliTools.getZeroEffectProducts(this.query);
            }
          }
  			}.bind({query:query})
  		});
    });
  }
}
