on("ready",function(){  
	on("chat:message",function(msg){
		if(msg.type=="api" && msg.content.indexOf("!pingMe")==0){
			var character = findObjs({type:"character",controlledby:msg.playerid})[0];
			var playerToken = findObjs({
				type:"graphic",
				subtype:"token",
				represents:character.get("id"),
				pageid:Campaign().get("playerpageid")
			})[0];
			sendPing(playerToken.get("left"),playerToken.get("top"),playerToken.get("pageid"),msg.playerid,true,msg.playerid);
		}
	});
	
	
	/*on("chat:message",function(msg){
		if(msg.type=="api" && msg.content.indexOf("!pingMe")==0){
			var characterList = findObjs({type:"character",controlledby:msg.playerid});
			var playerName = getObj("player",msg.playerid).get("displayname");
			if(characterList.length==1){
				sendChat("PingMeAPI","!pingCharacter " + characterList[0].get("id") + " " + msg.playerid + " " + playerName);
			}
			else{
				var pingList="";
				_.each(characterList,function(character){
					pingList+='<a href="!pingCharacter ' + character.get("id") + ' ' + msg.playerid + ' ' + playerName + '">' + character.get("name") +'</a>';
				});
				sendChat("PingMeAPI","/w " + playerName + " Which character?<br/>"+pingList);
				
			}
		}
	});

	on("chat:message",function(msg){
		if(msg.type=="api" && msg.content.indexOf("!pingCharacter")==0){
			var args = msg.content.split(" ");
			var characterID = args[1];
			var playerID = args[2];
			var playerName = args[3];
			var playerToken = findObjs({
				type:"graphic",
				subtype:"token",
				represents:characterID,
				pageid:Campaign().get("playerpageid")
			})[0];
			
			if(playerToken===undefined){
				sendChat("PingMeAPI","/w " + playerName + " That character is not on the map.");
				return;
			}
			
			sendPing(playerToken.get("left"),playerToken.get("top"),playerToken.get("pageid"),playerID,true,playerID);
		}
	});*/
});