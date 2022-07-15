const corpsecart = (function() {	

	const scriptIndex = {"name":"corpsecart","version":"v0.03",};
	
	//commands
	const comMap = "map";
	const comMapAlias = ["map","bury","dig"];
	const comDel = "del";
	const comDelAlias = ["del","remove","rem","delete"];
	const flagTagDeadAlias = ["tag","look","find","search","flag"]
	const corpseMarker = "status_dead";
	const hpbarNum = "bar1_value";
	const autoBury = true;

	class CSS{
		static container = `position: relative; border:1px solid #333; background-color: #fff; padding:4px 6px 6px 6px;margin: -16px -6px 0px -6px;z-index:11;`;
		static text = `font-size:12px;`;
		static bullet = `font-family: Pictos; padding-right: 0.5em;`
		static btnInvis = `vertical-align: middle;color: #000; background-color: transparent; padding: 0; border: none; overflow: hidden; text-overflow: ellipsis; width:100%; margin: 0px;`;
		static icon(type){
			let char = `}`
			let col = `color: `
			switch(type){
				case `up`:
				case `{`:  char = `{`; col += `darkgreen`; break;
				case `#`:
				case `bin`:  char = `#`; col += `darkred`; break;
				case `down`:
				case `}`:
				default: char = `}`; col += `darkred`; break;
			}
			return `<span style="${CSS.bullet}${col}">${char}</span>`
		}
	}

	//Automatically bury DEAD tokens
	on("change:token:statusmarkers",function(obj,prev){
		if(!autoBury || obj.get(hpbarNum) > 0){
			return;
		}
		let oStatus = obj.get("statusmarkers").split(",");
		let pStatus = prev.statusmarkers.split(",");
		if(oStatus.includes(corpseMarker.slice(7)) && !pStatus.includes(corpseMarker.slice(7))){
			autoTokenBurial(obj);
		}
	});

	on(`change:token:${hpbarNum}`,function(obj,prev){
		if(!autoBury || obj.get(hpbarNum) > 0 || prev[hpbarNum] <= 0){
			return;
		}
		autoTokenBurial(obj);
	});

	function autoTokenBurial(obj){
		let npc = true;
		if(typeof obj.get == "function" && obj.get('represents') !== undefined && obj.get('represents') !== ""){
			if(getObj('character',obj.get('represents')) && getObj('character',obj.get('represents')).get('controlledby') !== ""){
				npc = false;
			}
		}
		if(npc){
			log(`Burying away: ${obj.get("name")}`);
			obj.set({layer:"map",tint_color:"000000"});
			let ids = [obj.id];
			let msgContents = msgConstructor(`Buried ${obj.get("name")}.`,`down`,ids);
			chatter(msgContents,`w`,`gm`,`noarchive`);
		}
	};

	function msgConstructor(txt,icon=`bin`,ids=false){
		let html = ``
		html += `<div style="${CSS.container}">`
		html += ids ? `<a style="${CSS.btnInvis}" href="!corpsecart undo ${String(ids)}">` : `` ;
		html += CSS.icon(icon)
		html += `<span style="${CSS.text}">`
		html += txt
		html += `</span>`
		html += ids ? `</a>` : `` ;
		html += `</div>`
		return html
	}

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
		untaggedTokens = untaggedTokens.filter(t => !getObj('character',t.get('represents')) || getObj('character',t.get('represents')).get('controlledby') == "");		
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
		corpsetokens = corpseTokens.filter(t => !getObj('character',t.get('represents')) || getObj('character',t.get('represents')).get('controlledby') == "");
		if (corpsetokens===undefined || corpsetokens.length == 0){
			sendChat("Corpse Cart", "/w gm No corpses found to cart.",null,{noarchive:true})
			return;
		}
		else{
			let msgtext = ``;
			let ids = false;
			let names = ``;
			let i = 1;
			for(let corpse of corpsetokens){
				if(corpsetokens.length > 1 && i !== 1){
					if(corpsetokens.length > 2){
						names += `,`
					}
					if(i === corpsetokens.length){
						names += ` and`
					}
					names += ` ${corpse.get("name")}`
				}
				else{
					names += ` ${corpse.get("name")}`
				}
				i++;
			}
			msgtext += `.`
			if(corpseCom == comDel){
				corpsetokens.forEach(deleteCorpses);
				msgtext = `Carted away ${names}`;
				chatter(msgConstructor(msgtext,`bin`,ids),`w`,`gm`,`noarchive`)
			}
			else if(corpseCom == comMap){
				ids = [];
				corpsetokens.forEach(t => {ids.push(t.id)});
				corpsetokens.forEach(buryCorpses);
				msgtext = `Buried ${names}`;
				chatter(msgConstructor(msgtext,`down`,ids),`w`,`gm`,`noarchive`)
			}
			//sendChat("Corpse Cart", "/w gm Carted away " + corpsetokens.length + " corpses.",null,{noarchive:true})
		}
	}

	//DELETE CORPSES
	function deleteCorpses(body) {
		log("Carting away: "+body.get('name'));
		body.remove();
	}

	//BURY CORPSES
	function buryCorpses(body){
		log("Burying away: "+body.get('name'));
		body.set({layer:"map",tint_color:"000000"});
	}

	//undo
	function undoBurial(ids){
		ids = ids.split(",")
		let msgtext = `Undid burial of`;
		let i = 1;
		for(let id of ids){
			let token = getObj('graphic',id);
			token.set({layer:"objects",tint_color:"transparent"});
			if(ids.length > 1 && i !== 1){
				if(ids.length > 2){
					msgtext += `,`
				}
				if(i === ids.length){
					msgtext += ` and`
				}
				msgtext += ` ${token.get("name")}`
			}
			else{
				msgtext += ` ${token.get("name")}`
			}
			i++;
		}
		msgtext += `.`
		let msgContents = msgConstructor(msgtext,`up`);
		chatter(msgContents,`w`,`gm`,`noarchive`)
	}
		
	on("chat:message", function(msg) {
		if (msg.type==="api" && msg.content.toLowerCase().indexOf("!corpsecart")==0 && playerIsGM(msg.playerid)){
			Chandler(msg);
			return;
		}
	});

	//API CHAT HANDLER
	function Chandler(msg){
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
		var mapID = Campaign().get("playerpageid");
		
		flagTagDead == true ? tagDead(mapID) : false ;
					
		switch(corpseCom){
			case comMap:
				findCorpses(mapID,corpseCom)
				break;
			case comDel:
				findCorpses(mapID,corpseCom)
				break;
			case `undo`:
				let ids=msg.content.split(/\s+/)[2]
				undoBurial(ids)
				break;
			default:
				return;
		}
	};

	//error handler
	function errorHandler(errorMsg,who,useChat,useLog){
		useLog === false ? log(errorMsg) : false;
		useChat === false ? sendChat(`${scriptIndex.name} Error`,errorMsg,null,{noarchive:true}) : false;
		useLog === true ? logger(errorMsg) : false;
		useChat === true ? chatter(errorMsg,"w",who,"noarchive") : false;
		return;
	}

	//log stuff
    function logger(logtext){
        log(scriptIndex.name+", "+scriptIndex.version+": "+logtext);
    };

	//chat bullocks
    function chatter(msgText,slashCom,whisperTo,options,spkAs){
		if(slashCom && slashCom.toLowerCase() == "w"){
			if(typeof whisperTo === "string"){
				whisperTo = whisperTo.replace(/\(GM\)/, '').trim();
				slashCom = slashCom.concat(` ${whisperTo}`);
			}
			else if(Array.isArray(whisperTo)){
				if(whisperTo[0].toLowerCase() == "character"){
					switch(whisperTo[1].get("controlledby")){
						//whispering to everyone, DOH! change to public
						case "all":
							slashCom = "";
							whisperTo = "";
							break;
						//whispering to no one, change to GM
						case "":
							whisperTo = "gm";
							slashCom = slashCom.concat(` ${whisperTo}`);
							break;
						//whispering we hope to a name? go ahead
						default:
							whisperTo = `"${whisperTo[1].get("name")}"`;
							slashCom = slashCom.concat(` ${whisperTo}`);
							break;
					}
				}
				else{
					logger("whisper target not recognised as string or tagged array object");
					return;
				}
			}
		}

        let msgContents = "";
        spkAs ? false : spkAs = scriptIndex.name ;
        if(slashCom){
			msgContents = msgContents.concat(`/${slashCom}`);
		}
		//slashCom ? msgContents = msgContents.concat(`/${slashCom}`) : false ;
		//whisperTo && slashCom == "w" ? msgContents = msgContents.concat(` ${whisperTo}`) : false ;
        msgText ? msgContents = msgContents.concat(` ${msgText}`) : logger("chat request but no msgText specified") ;
        options == "noarchive" ? options = {noarchive:true} : false ;
        sendChat(spkAs,msgContents,null,options);
    };

	return scriptIndex;
})();