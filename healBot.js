const healBot = (function() {	

	const scriptIndex = {"name":"healBot","version":"v0.01",};

	// format text message feedback to look pretty

	on("chat:message", function(msg) {

		let healTarget = false;
		let secondDmg = false;

		if(msg.inlinerolls && msg.rolltemplate && msg.rolltemplate=="dmg"){

			let dmgType = msg.content.match(/(?:{{dmg1type=)(.*?)(?:}})/)[1];

			if(dmgType.toLowerCase() !== "healing" && dmgType.toLowerCase() !== "heal"){
				dmgType = msg.content.match(/(?:{{dmg2type=)(.*?)(?:}})/)[1];
				secondDmg = true;
			}

			if(!dmgType){
				return;
			}
			if(dmgType.toLowerCase() !== "healing" && dmgType.toLowerCase() !== "heal"){
				return;
			}

			healTarget = true;
			ChandlerHeal(msg,healTarget,secondDmg);
	        return;
	    }

		if(msg.inlinerolls && msg.rolltemplate && msg.rolltemplate=="simple"){

			let rName = msg.content.match(/(?:{{rname=\^{)(.*?)(?:}}})/)[1];

			if(!rName){
				return;
			}
			if(rName.toLowerCase() !== "hit-dice-u"){
				return;
			}
			ChandlerHeal(msg,healTarget,secondDmg);
	        return;
	    }

		if (msg.type==="api" && msg.content.toLowerCase().indexOf("!healbot")==0){
			Chandler(msg);
			return;
		}
	});

	//HEAL ROLL CHAT HANDLER
	function ChandlerHeal(msg,showBtnTarget,useDmg2){
		
		let healAmount = 0;

		//dmg2 heal
		if(useDmg2){
			healAmount = parseInt(msg.inlinerolls[1].results.total);
			//add crit heal
			if(msg.inlinerolls[3] && msg.inlinerolls[3].results.total && msg.inlinerolls[3].results.total >= 1){
				healAmount += parseInt(msg.inlinerolls[3].results.total);
			}
		}
		else{
			//normal heal
			healAmount = parseInt(msg.inlinerolls[0].results.total);
			//add crit heal
			if(msg.inlinerolls[2] && msg.inlinerolls[2].results.total && msg.inlinerolls[2].results.total >= 1){
				healAmount += parseInt(msg.inlinerolls[2].results.total);
			}

			//table blocked heal
			if(!healAmount && 
				!msg.inlinerolls[0].signature &&
				msg.inlinerolls[1] && msg.inlinerolls[1].results && msg.inlinerolls[1].results.total >= 1){
				healAmount = parseInt(msg.inlinerolls[1].results.total);
				//add crit heal
				if(msg.inlinerolls[3] && msg.inlinerolls[3].results.total && msg.inlinerolls[3].results.total >= 1){
					healAmount += parseInt(msg.inlinerolls[3].results.total);
				}
			}
		}

		var character = getChar(_.clone(msg));
		let selfID = "&#64;{target|token_id}";
		let showHealSelf = "display: inline-block;";
		let showHealTarget = "display: inline-block;";
		showBtnTarget ? false : showHealTarget = "display:none;";

		if(character==undefined||getAttrByName(character.id,"npc")==1){
			logger("not a player character sheet")
			showHealSelf = "display:none;"
			return;
		}
		else{
			selfID = character.id
		}

 		let btnDivOutStyle= `width: 14em; position: relative; vertical-align: middle; font-family: 'pictos custom'; display: block; background: #f2f5d3; height: 23px;text-align: center;left: -5px;top: -24px; margin-bottom: -31px;`;
 		let btnDivInStyle = `margin: 0px 5px; box-shadow: 0px 0px 3px #7e2d40; border: #7e2d40 1px solid; border-radius:5px; position:relative; top:-13px; right:-5px; text-align: center ; vertical-align: middle ; line-height: 26px ; height: 26px ; width: 26px; background-color: whitesmoke;`;
 		let btnLinkStyle = `background-color: transparent; border: none; padding: 0px; width: 100%; height: 100%; overflow: hidden; white-space: nowrap; font-family: pictos; color: green; font-size: 2rem;`;
		
		let btnHealSelf = `<div class="${scriptIndex.name}SendInner" style="${showHealSelf}${btnDivInStyle}"><a class="${scriptIndex.name}SendLink showtip tipsy-n-right" title="Heal self for ${healAmount}" style="${btnLinkStyle}" href="!healBot reqHealSelf ${selfID} ${healAmount}">U</a></div>`;
		
		let btnHealTarget = `<div class="${scriptIndex.name}SendInner" style="${showHealTarget}${btnDivInStyle}"><a class="${scriptIndex.name}SendLink showtip tipsy-n-right" title="Heal a target for ${healAmount}" style="${btnLinkStyle}" href="!healBot reqHealTarget &#64;{target|token_id} ${healAmount}">&</a></div>`;
		
		let autoHealCont = `<div class="${scriptIndex.name}SendOuter" style="${btnDivOutStyle}">${btnHealSelf}${btnHealTarget}</div>`;

		chatter(null,"w",msg.who,autoHealCont,null,"{noarchive:true}");
	};

	//API CHAT HANDLER
	function Chandler(msg){
		let args = msg.content.split(/\s+/);
		logger(args);
		let req = args[1];
		let ID = args[2];
		let healAmount = args[3];
		healAmount = parseInt(healAmount);

		//MAIN STUFF HERE
		switch(req){
			case "reqHealSelf":
				healCharacter(msg,ID,healAmount);
				break;
			case "reqHealTarget":
				healToken(msg,ID,healAmount);
				break;
		}

	};

	function healCharacter(msg,charID,healAmount){
		var attrHP = findObjs({
			_characterid: charID,
			_type: "attribute",
			name: "hp"
		})[0];


		let hpCur = parseInt(attrHP.get("current"));
		let hpMax = parseInt(attrHP.get("max"));

		hpCur = Math.min(hpCur+healAmount,hpMax);

		attrHP.set("current",hpCur);

		let token = findObjs({
			type: "graphic",
			subtype: "token",
			represents: charID,
			_pageid: Campaign().get("playerpageid"),
		})[0];
		spawnFx(token.get('left'),token.get('top'),'burn-holy');

		let character = getObj('character', charID)

		let msgYouDidHeals = `${character.get("name")} healed for ${healAmount} Hit Points.`
		chatter(null,"w",msg.who,msgYouDidHeals,null,"{noarchive:true}");
	};

	function healToken(msg,tokenID,healAmount){
		let token = findObjs({
			type: "graphic",
			subtype: "token",
			_id: tokenID,
			_pageid: Campaign().get("playerpageid"),
		})[0];
		let hpCur = parseInt(token.get("bar1_value"));
		let hpMax = parseInt(token.get("bar1_max"));

		hpCur = Math.min(hpCur+healAmount,hpMax);

		token.set("bar1_value",hpCur);
		spawnFx(token.get('left'),token.get('top'),'burn-holy') 

		let character = getObj('character', token.get("represents"))

		let msgYouDidHeals = `You healed ${character.get("name")} for ${healAmount} Hit Points.`
		chatter(null,"w",msg.who,msgYouDidHeals,null,"{noarchive:true}");

		let msgYouGotHeals = `${character.get("name")} was healed for ${healAmount} Hit Points.`
		chatter(null,"w",["character",character],msgYouGotHeals,null,"{noarchive:true}");
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

	//DEFAULT FUNCTIONS

	//log stuff
    function logger(logtext){
        log(scriptIndex.name+", "+scriptIndex.version+": "+logtext);
    };

	//chat bullocks
    function chatter(spkAs,slashCom,whisperTo,msgText,options){
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
        options ? options = JSON.parse(options) : false ;
        sendChat(spkAs,msgContents,null,options);
    };

	return scriptIndex;
})();