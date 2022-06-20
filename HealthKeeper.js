on("ready",function(){  
	
	//hpkeeper @{selected|character_id}/@{target|character_id} cur/max/both/restore 000
	
	//Declare constant variables
	const hp_kmax = "hp_default";
	const cur = "current";
	const max = "max";
	const both = "both";
	const restore = "restore";
	const fxOptionV = [cur,max,both];
	const fxOptionC = [restore];
	
	//CHAT HANDLER
	on("chat:message",function(msg){
		if (msg.type==="api" && msg.content.toLowerCase().indexOf("!hpkeeper")==0){
			
			let args = msg.content.split(/\s+/);
			
			var chatReturnHPKcont = `/w ${msg.who}`;
			
			if (args.length<3){
				chatReturnHPKcont = chatReturnHPKcont.concat(" Not enough parameters supplied.")
				chatReturnHPK(chatReturnHPKcont);
				return;
			}
			
			var charid = args[1].trim();
			var effect = args[2].toLowerCase().trim();
		
			effect.toLowerCase() == "cur" ? effect = cur : false ;
			
			if (args[3] && fxOptionV.includes(effect)){
				var amount = args[3].trim();
			}
			else {
				var amount = 0;
			}
		
			//Find the character sheet
			var character = getObj('character',charid);
			
			// If character is NPC then fail gracefully
			if (getAttrByName(charid,"npc")==1){
				chatReturnHPKcont = chatReturnHPKcont.concat(" Only PC sheet compatible currently. Selected sheet is flagged as 'NPC'.")
				chatReturnHPK(chatReturnHPKcont);
				return;
			}
			
			var attrHP = findObjs({
				_characterid: charid,
				_type: "attribute",
				name: "hp"
			})[0];
			if (attrHP == undefined || attrHP == null){
				chatReturnHPKcont = chatReturnHPKcont.concat(" No HP detected on character. Unable to comply.")
				chatReturnHPK(chatReturnHPKcont);
				return;
			}

			var hp_default = findDefaultHP(charid,hp_kmax);
			
			if(hp_default == undefined || null){
				
				if (effect!==restore){
					chatReturnHPKcont = chatReturnHPKcont.concat(` Storing max HP of ${attrHP.get(max)}.`)
					newDefaultHP(attrHP.get(max),charid);
					hp_default = findDefaultHP(charid,hp_kmax);
				}
				else if(effect==restore){
					chatReturnHPKcont = chatReturnHPKcont.concat(` No kept HP previously stored for ${character.get('name')}. Unable to restore HP as hp_default not found.`)
					chatReturnHPK(chatReturnHPKcont);
					return;
				}
				else{
					chatReturnHPKcont = chatReturnHPKcont.concat(` No kept HP previously stored for ${character.get('name')}. Unable to restore HP due to unknown error retrieving kept HP.`)
					chatReturnHPK(chatReturnHPKcont);
					return;
				}
			}
			
			if (effect == max || both){
				let tokensOnMap = findObjs({
					type: "graphic",
					subtype: "token",
					represents: charid,
					_pageid: Campaign().get("playerpageid"),
				});
				tokensOnMap.forEach(t => {
					amount > 0 ? spawnFx(t.get('left'),t.get('top'),'burn-holy') : false ;
					amount < 0 ? spawnFx(t.get('left'),t.get('top'),'burn-death') : false ;
				})
			}
			
			let chatReturnHPKcontMax;
			let chatReturnHPKcontCur;
			
			switch(effect){
				case restore:
					let chatReturnHPKcontRes = restoreHP(attrHP,character,msg,hp_default);
					let chatReturnHPKcontRem = removeDefaultHP(character,msg,hp_default);
					chatReturnHPKcont = chatReturnHPKcont.concat(chatReturnHPKcontRes," ",chatReturnHPKcontRem);
					break;
				case max:
					chatReturnHPKcontMax = alterHP(max,attrHP,amount,character,msg,hp_default);
					chatReturnHPKcont = chatReturnHPKcont.concat(" ",character.get('name'),"'s ",chatReturnHPKcontMax);
					break;
				case both:
					chatReturnHPKcontMax = alterHP(max,attrHP,amount,character,msg,hp_default);
					chatReturnHPKcontCur = alterHP(cur,attrHP,amount,character,msg,hp_default);
					chatReturnHPKcont = chatReturnHPKcont.concat(" ",character.get('name'),"'s ",chatReturnHPKcontCur," and ",chatReturnHPKcontMax);
					break;
				case cur:
					chatReturnHPKcontCur = alterHP(cur,attrHP,amount,character,msg,hp_default);
					chatReturnHPKcont = chatReturnHPKcont.concat(" ",character.get('name'),"'s ",chatReturnHPKcontCur,".");
					break;
				default:
					return;
			}

			chatReturnHPK(chatReturnHPKcont);
		
		}
	});
	
	//chatReturnHPK
	function chatReturnHPK(chatReturnHPKcont){
		sendChat("HealthKeeper", chatReturnHPKcont,null,{noarchive:true});
	}
	
	//Find HP
	function findDefaultHP(charid,hp_kmax){
		var hp_default = findObjs({
			_type: "attribute",
			_characterid: charid,
			name: hp_kmax
		})[0];
		return hp_default;
	}

	//Create new HPkeeper attribute
	function newDefaultHP(HPmax,charid) {
		
		createObj("attribute", {
			name: hp_kmax,
			max: HPmax,
			characterid: charid
		});
		log("New hp_default created on "+charid+" for value of :"+HPmax);
	}

	//Alter max HP values
	function alterHP(curOrMax,attrHP,amount,character,msg,hp_default) {
		
		let newHP = parseInt(attrHP.get(curOrMax))+parseInt(amount);
		
		newHP < 0 ? newHP = 0 : false ;
		
		attrHP.set(curOrMax,newHP);
		
		let returnText;
		
		 if (curOrMax == max){
			returnText = `maximum HP changed to ${newHP} (compared to their normal value of ${hp_default.get(max)}).`
		 }
		 else if(curOrMax = cur){
			returnText = `current HP changed by ${parseInt(amount)}`
		 }

		return returnText;
	}

	//Restore HP default values to normal attribute
	function restoreHP(attrHP,character,msg,hp_default) {
		
		let resHP = parseInt(hp_default.get(max));
		attrHP.set(max,resHP);
		let returnText = ` Maximum HP of ${resHP} restored to ${character.get('name')}.`

		return returnText;
	}
	
	//Remove HP default attribute
	function removeDefaultHP(character,msg,hp_default) {

		hp_default.remove();
		let returnText = ` Previously kept value removed.`
		
		return returnText;
	}
	
});