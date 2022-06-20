on("ready",function(){  
	
	//const CorpseMarker = 'dead';

	//CHAT HANDLER
	on("chat:message",function(msg){
		if(msg.type==="api" && msg.content.toLowerCase().indexOf("!corpsecart")==0 && playerIsGM(msg.playerid)){
			log("CC Msg Seen");
			let args = msg.content.split(" ");
			args.shift();
			var player = getObj("player", msg.playerid);
			var mapID = player.get("_lastpage");
			var map = getObj("page", mapID);
			args.includes("del") || args.includes("map") ? findCorpses(msg.playerid,args) : false;
		}
	});

	//ON REQUEST FIND DEAD
	on("chat:message",function(msg){
		if(msg.type==="api" && msg.content.indexOf("!corpseCart")==0 && playerIsGM(msg.playerid)){
			findCorpses(msg.playerid);
        }
    });
	
	//FIND CORPSES TO DEL OR MAP
	function findCorpses(GMid,args){
		let player = getObj("player", GMid);
		let GMmapID = player.get("_lastpage");
        var corpsetokensall = findObjs({
            _type:"graphic",
			_subtype: 'token',
			status_dead : !false,
			//layer: 'objects',
            _pageid:GMmapID
        });
		var corpsetokens = corpsetokensall.filter(t => getObj('character',t.get('represents')).get('controlledby') == "");
        if (corpsetokens===undefined || corpsetokens.length == 0){
            sendChat("Corpse Cart", "/w gm No corpses found to cart.",null,{noarchive:true})
            return;
        }
		else{
			log("Number of Corpses to Cart: "+corpsetokens.length);
			args.includes("del") ? corpsetokens.forEach(deleteCorpses) : false;
			args.includes("map") ? corpsetokens.forEach(buryCorpses) : false;
			sendChat("Corpse Cart", "/w gm Carted away " + corpsetokens.length + " corpses.",null,{noarchive:true})
		}
    }
	
	//DELETE CORPSES
	function deleteCorpses(body) {
		log("Carting away: "+getObj('character',body.get('represents')).get('name'));
		body.remove();
	}
	
	//BURY CORPSES
	function buryCorpses(body){
		log("Burying away: "+getObj('character',body.get('represents')).get('name'));
		body.set({layer:"map",tint_color:"000000"});
	}
});