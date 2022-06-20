on("ready",function(){  
	on("chat:message",function(msg){
		if(msg.type==="api" && msg.content.indexOf("!partytomap")==0 && playerIsGM(msg.playerid)){
			//log("DP | SF | Message Recieved");
			//log("DP | SF | Permissions Valid");
			var player = getObj("player", msg.playerid);
			var mapID = player.get("_lastpage");
			var map = getObj("page", mapID);
			
			if (mapID !== undefined)
			{
				//log("DP | SF | Starting the Party");
				PartytoBattleMap(player, mapID, map);
			}
		}
	});
	
	const PartytoBattleMap = (player, mapID, map) => {
	    //log("DP | SF | Running Party Start");
        Campaign().set("playerspecificpages", false);
		Campaign().set("playerpageid", mapID);
		let mapName = map.get("name") !== "" ? map.get("name") : "Unnamed Map";
		//log(mapName);
		sendChat("PartytoMap", "/w gm All players moved to '" + mapName + "'",null,{noarchive:true})
    };
});
