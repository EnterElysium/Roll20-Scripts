const CritOverride = (function() {	

	const scriptIndex = {"name":"CritOverride","version":"v0.01",};

	on("chat:message", function(msg) {

		if (msg.type==="api" && msg.content.toLowerCase().indexOf("!critoverride")==0){
			ChandlerAPI(msg);
			return;
		}
		
		if(msg.inlinerolls && msg.rolltemplate && msg.rolltemplate=="atk" && msg.inlinerolls[0].results.rolls[0].dice){
			ChandlerAtk(msg);
	        return;
	    }

	});

	//ATTACK ROLL CHAT HANDLER
	function ChandlerAtk(msg){
        var character = getChar(_.clone(msg));
		if(character==undefined||getAttrByName(character.id,"npc")==1){
			logger("not a player character sheet")
			return;
		}
		let critLink = getCritLink(msg);
		let charid = character.id; 
 		let btnDivOutStyle= "width: 14em;position: relative;vertical-align: middle;font-family: 'pictos custom';display: block;background: #f2f5d3;height: 23px;text-align: right;left: -5px;top: -24px;margin-bottom: -31px;"
 		let btnDivInStyle = "position:relative;top:-31px;right:-3px;display: inline-block ; text-align: center ; vertical-align: middle ; line-height: 18px ; height: 18px ; width: 18px ;background-color: transparent";
 		let btnLinkStyle = "color:#A0A0A0;background-color: transparent;border: none;padding: 0px;width: 100%;height: 100%;overflow: hidden;white-space: nowrap;";
  		let btnCritOverride = `<div class="${scriptIndex.name}SendOuter" style="${btnDivOutStyle}"><div class="${scriptIndex.name}SendInner" style="${btnDivInStyle}"><a class="${scriptIndex.name}SendLink" style="${btnLinkStyle}" href="!critoverride reqCrit ${charid} ${critLink} critgif">r</a></div></div>`
		chatter(null,"w","gm",btnCritOverride,null,"{noarchive:true}");
	};
	//API CHAT HANDLER
	function ChandlerAPI(msg){
		let args = msg.content.split(/\s+/);
		switch(args[1]){
			//send crit override to player
			case "reqCrit":
				logger(`crit override sent to characterid ${args[2]}`);
				reqCrit(...args.slice(2));
				break;
			default:
				logger("no valid argument found");
				break;
		}
		if(_.contains(args,"critgif")){
			if (typeof CriticalGif == "undefined" || CriticalGif === null){
				logger("CriticalGif script not detected, unable to play critical gifs");
			}
			else{
				CriticalGif.reqPlay(msg,args[2]);
			}
		}
	};

	//build request for crit override to be sent
	function reqCrit(charid,critLink){
		log(`crit link: ${critLink}`);
		//-N2fCqpIGAdK6us-L_b- ~-N2fCqpIGAdK6us-L_b-|repeating_attack_-N2fCt3ohahqPsjoT6Lx_attack_crit // needs refactoring as the latter link has the charid
		let character = getObj('character',charid);

		let regex = /(repeating_attack_-.*?)_attack_crit/;
		let atkCritID = critLink.match(regex)[1];
		atkCritID = `${atkCritID}_atkname`
		let atkName = getAttrByName(charid,atkCritID)

		let container = `<div style="position:relative;margin-bottom:-5px;" class="sheet-rolltemplate-simple ${scriptIndex.name}Req">`+
			`<div class="sheet-container">`+
			`<div style="text-align:center;vertical-align:middle;line-height:initial;" class="sheet-rolltemplate-atk">`+
			`<a style="font-size: 12px;font-weight: bold;background-color:transparent;border:none;margin:-3px 0px;" href="${critLink}" title="Send critical damage link to player controlling ${character.get("name")}">`+
			`<span style="display:block;margin-bottom:-10px;padding-top:8px;1*font-size:11px;font-weight:normal;*1">${atkName}</span><br>`+
			`<span style="color:#ce0f69;display:block;margin-top:-4px;font-weight: bold;font-family: 'Times New Roman', Times, serif;font-variant: small-caps;font-size: 14px;">CRITICAL OVERRIDE?</span><br>`+
			`<span style="display:block;margin-top:-16px;padding-bottom:8px;color:#A0A0A0;font-size:11px;font-weight:normal;">${character.get("name")}</span></a>`+
			`</div></div></div>`
        chatter(null,"w",["character",character],container,null,"{noarchive:true}");
	};

	//log stuff
    function logger(logtext){
        log(scriptIndex.name+", "+scriptIndex.version+": "+logtext);
    };

	//chat bullocks
    function chatter(spkAs,slashCom,whisperTo,msgText,options){
		if(slashCom && slashCom.toLowerCase() == "w"){
			if(typeof whisperTo === "string"){
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
        options ? options = JSON.parse(options) : false ;
        sendChat(spkAs,msgContents,null,options);
    };

	//get character from just their name
	function getChar(msgDupe){
        //let msgDupe = _.clone(msg);
		let charName;
		
		if(msgDupe==undefined||msgDupe.content==undefined){
			return;
		}
		
		msgDupe.content.replace(/charname=(.+?)$/,(match,charname)=>{
			charName = charname;
		});
		
		if(charName==undefined){
			return;
		}
		
		charName = charName.replace("}}","");
		log(charName);
		
		let character = findObjs({
			type: "character",
			name: charName,
		})[0];
		return character;
	};

	//get crit link from attack roll
    function getCritLink(msg){
        let critLink = msg.content.match(/(?:{{rnamec=\[.*?\]\()(.*?)(?:\)}})/)[1];
		logger(critLink);
		return critLink;
    };

	return scriptIndex;
})();