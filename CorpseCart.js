/*
CORPSE CART
v0.02
Release Notes
- tag now tags the map
- del now deletes from the map layer
- excess logging removed
*/
on("ready",function(){  

	//commands
	const comMap = "map";
	const comMapAlias = ["map","bury","dig"];
	const comDel = "del";
	const comDelAlias = ["del","remove","rem","delete"];
	const flagTagDeadAlias = ["tag","look","find","search","flag"]
	const corpseMarker = "status_dead";
	const hpbarNum = "bar1_value";

	//CHAT HANDLER
	on("chat:message",function(msg){
		if(msg.type==="api" && msg.content.toLowerCase().indexOf("!corpsecart")==0 && playerIsGM(msg.playerid)){
			log("CC Msg Seen");
			
			let args = msg.content.toLowerCase().split(/\s+/);
			args.shift();
			
			if (args == undefined || args.length == 0){
				return;
			}
			
			var corpseCom = args[0];
			
			var flagTagDead = false;
			args.some(arg => flagTagDeadAlias.includes(arg)) ? flagTagDead = true : false ;
			
			comMapAlias.includes(corpseCom) ? corpseCom = comMap : false ;
			comDelAlias.includes(corpseCom) ? corpseCom = comDel : false ;
			
			var player = getObj("player", msg.playerid);
			var mapID = player.get("_lastpage");
			
			flagTagDead == true ? tagDead(mapID) : false ;
						
			switch(corpseCom){
				case comMap:
					findCorpses(mapID,corpseCom)
					break;
				case comDel:
					findCorpses(mapID,corpseCom)
					break;
				default:
					return;
			}
			
		}
	});
	
	//FIND CORPSES WHO DON'T REALISE IT
	function tagDead(mapID){
        var untaggedTokens = findObjs({
            _type:"graphic",
			_subtype: "token",
			status_dead : false,
			layer: "objects",
            _pageid: mapID,
        });
		
		let untaggedTokensMap = findObjs({
            _type:"graphic",
			_subtype: "token",
			status_dead : false,
			layer: "map",
            _pageid: mapID,
		});
		untaggedTokens = untaggedTokens.concat(untaggedTokensMap);
		untaggedTokens = untaggedTokens.filter(t => t.get('represents') !== "");
		untaggedTokens = untaggedTokens.filter(t => getObj('character',t.get('represents')).get('controlledby') == "");		
		untaggedTokens = untaggedTokens.filter(t => parseInt(t.get(hpbarNum)) <= 0);
		untaggedTokens.forEach(utCorpse => utCorpse.set(corpseMarker, true));
    }

	//FIND CORPSES TO DEL OR MAP
	function findCorpses(mapID,corpseCom){
        var corpseTokens = findObjs({
            _type:"graphic",
			_subtype: "token",
			status_dead : true,
			layer: "objects",
            _pageid: mapID,
        });
		
		if (corpseCom==comDel){
			let corpseTokensMap = findObjs({
				_type:"graphic",
				_subtype: "token",
				status_dead : true,
				layer: "map",
				_pageid: mapID,
			});
			corpseTokens = corpseTokens.concat(corpseTokensMap);
		}
		corpseTokens = corpseTokens.filter(t => t.get('represents') !== "");
		corpsetokens = corpseTokens.filter(t => getObj('character',t.get('represents')).get('controlledby') == "");
        if (corpsetokens===undefined || corpsetokens.length == 0){
            sendChat("Corpse Cart", "/w gm No corpses found to cart.",null,{noarchive:true})
            return;
        }
		else{
			corpseCom == comDel ? corpsetokens.forEach(deleteCorpses) : false;
			corpseCom == comMap ? corpsetokens.forEach(buryCorpses) : false;
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