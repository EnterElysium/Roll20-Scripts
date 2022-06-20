on("ready",function(){  

	//ON MAP CHANGE
	on("change:campaign:playerpageid",function(){
        setTimeout(function(){
			log("Sending ping spawn request");
            pingSpawn();
        },1500);
    });

	//CHAT HANDLER
	on("chat:message",function(msg){
		if(msg.type==="api" && msg.content.toLowerCase().indexOf("!partyup")==0 && playerIsGM(msg.playerid)){
			log("DP | SF | Message Recieved");
			let args = msg.content.split(/\s+/);
			args.shift();
			var player = getObj("player", msg.playerid);
			var mapID = player.get("_lastpage");
			var map = getObj("page", mapID);
			args.includes("here") && args.includes("ping") ? (PartytoMap(player, mapID, map),setTimeout(function(){pingSpawn(msg.playerid);},1500)) : false;
			args.includes("here") && !args.includes("ping") ? PartytoMap(player, mapID, map) : false;
			!args.includes("here") && args.includes("ping") ? pingSpawn(msg.playerid) : false;
			args.includes("delspawn") ? deleteStartToken(msg.playerid) : false;
			args.includes("test") ? reqObjLayerMove(msg.playerid) : false;
		}
	});

	//MOVE PARTY TO MAP
	const PartytoMap = (player, mapID, map) => {
	    //log("DP | SF | Running Party Start");
        Campaign().set("playerspecificpages", false);
		Campaign().set("playerpageid", mapID);
		let mapName = map.get("name") !== "" ? map.get("name") : "Unnamed Map";
		//log(mapName);
		sendChat("PartytoMap", "/w gm All players moved to '" + mapName + "'",null,{noarchive:true})
        // setTimeout(function(){
			// log("Sending ping spawn request");
            // pingSpawn();
        // },1500);
    };
	
	//PING SPAWN
    function pingSpawn(GMid){
        var tokens = findObjs({
            _name:"SpawnPoint",
            _type:"graphic",
            _pageid:Campaign().get("playerpageid")
        },{caseInsensitive: true});
        var spawnToken = tokens[0];
        if (spawnToken===undefined){
            log("spawnToken undefined");
            return;
        }
		if (GMid===undefined || GMid ==""){
            log("GMid undefined");
			let GMid = "";
        }
        sendPing(spawnToken.get("left"),spawnToken.get("top"),spawnToken.get("pageid"),GMid,true);
    }
	
	//ON REQUEST DELETE START
	on("chat:message",function(msg){
		if(msg.type==="api" && msg.content.indexOf("!deleteStart")==0 && playerIsGM(msg.playerid)){
			log("pingStart msg seen");
			deleteStartToken(msg.playerid);
        }
    });
		
	//DELETE START TOKEN
	function deleteStartToken(GMid){
		let GMplayer = getObj("player", GMid);
		let GMmapID = GMplayer.get("_lastpage");
        var tokens = findObjs({
            _name:"SpawnPoint",
            _type:"graphic",
            _pageid:GMmapID
        },{caseInsensitive: true});
        var spawnToken = tokens[0];
        if (spawnToken===undefined){
            log("spawnToken undefined");
            return;
        }
		log("Deleting spawnToken");
        spawnToken.remove();
    }
	
	//REQ PLAYERS TO OBJECT LAYER
    function reqObjLayerMove(GMid){
		let GMplayer = getObj("player", GMid);
        var hiddentokens = findObjs({
            _type:"graphic",
			_subtype:"token",
			layer:"gmlayer",
			// represents:true,
			// controlledby:true,
            _pageid:GMplayer.get("_lastpage")
        },{caseInsensitive: true});
		var partytokens = hiddentokens.filter(t => t.get("represents") !== "" && getObj('character',t.get('represents')).get('controlledby') !== "");
		partytokens.forEach(objLayerMove);
    }
	
	//PLACE TOKEN ON OBJ LAYER
	function objLayerMove(token){
		log("Moving to obj layer: "+token.name+" | Rep: "+token.get("represents")+" | Control: "+getObj('character',token.get('represents')).get('controlledby'));
		token.set("layer","objects");
	}
});
