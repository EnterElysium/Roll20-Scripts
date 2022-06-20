on("ready",function(){  
	on("chat:message",function(msg){
		if (msg.type==="api" && msg.content.toLowerCase().indexOf("!testsel")==0){
            //sendChat("Sel Prop", "/w gm "+JSON.stringify(msg.selected),null,{noarchive:true})
			
        var untaggedTokens = findObjs({
            _type:"graphic",
			_subtype: "token",
			status_dead : false,
			layer: "objects",
            _pageid:Campaign().get("playerpageid"),
        });
		
		var map = getObj("page", Campaign().get("playerpageid"));
		log("Map name: "+map.get("name"));
		
		untaggedTokens = untaggedTokens.map(t => t.name);

		log("unTok list length: "+untaggedTokens.length+" | List: "+JSON.stringify(untaggedTokens));
	    }
	});	
});
