const CriticalGif = (function() {	
	
	const scriptIndex = {"name":"CriticalGif","version":"v0.02","reqPlay":reqPlay,};

	on("chat:message", function(msg) {

		if (msg.type==="api" && msg.content.toLowerCase().indexOf("!criticalgif")==0){
			legitCrit(msg);
			return;
		}
		
		if(msg.inlinerolls==undefined){
			return;
		}
	
		var character = getChar(msg);
	
		if(character==undefined||character.get("controlledby")==""){
			return;
		}
	
		if( (msg.rolltemplate == "atk" || msg.rolltemplate == "atkdmg" ) && msg.inlinerolls){
			
			var atkData = checkAtkType(msg);
			
			if(atkData==undefined){
				return;
			}
			
			if(atkData.atkType=="attack"){
				checkAtkCrit(msg);
			}
			else if(atkData.atkType=="save"){
				checkSaveCrit(msg,atkData);
			}
		}

	});
	
	//check attack type
	function checkAtkType(msg){
		let atkData;
		if(libInline.getDice(msg.inlinerolls[0],"included").length>0){
			//log("ATTACK ROLL");
			atkData = {
				atkType : "attack",
			}
		}
		else if(libInline.getDice(msg.inlinerolls[2],"included").length>0){ //8d6
			//log("SAVE ATTACK");
			
			let dmgArr = libInline.getDice(msg.inlinerolls[2],"included");
			
			//check for and add upcast damage to the array
			if(libInline.getDice(msg.inlinerolls[7],"included").length>0){
				dmgArr = dmgArr.concat(libInline.getDice(msg.inlinerolls[7],"included"));
			}

			let dmgTotal = dmgArr.reduce((partialSum, vDice) => partialSum + vDice, 0)

			atkData = {
				atkType: "save",
				number: dmgArr.length,
				size: msg.inlinerolls[2].results.rolls[0].sides,
				total:dmgTotal,
			}
		}
		else if(libInline.getDice(msg.inlinerolls[3],"included").length>0){ //8d6
			//log("SAVE ATTACK");
			//CANTRIPS USE [3] for SOME reason???
			
			let dmgArr = libInline.getDice(msg.inlinerolls[3],"included");
			let dmgTotal = dmgArr.reduce((partialSum, vDice) => partialSum + vDice, 0)

			atkData = {
				atkType: "save",
				number: dmgArr.length,
				size: msg.inlinerolls[3].results.rolls[0].sides,
				total:dmgTotal,
			}
		}
		else{
			return;
		}
		return atkData;
	};

	// //check attack type
	// function checkAtkType(msg){
	// 	let atkData;
	// 	//case = attack roll
	// 	if(msg.inlinerolls[0].expression.substring(0,4)=="1d20"){
	// 		atkData = {
	// 			atkType : "attack",
	// 		}
	// 	}
	// 	else if(msg.inlinerolls[2].expression.search(/(\d*)[dD](\d+)/)==0){ //8d6
	// 		let diceForm = msg.inlinerolls[2].expression.match(/(\d*)[dD](\d+)/);
	// 		let diceValue = msg.inlinerolls[2].results.rolls[0].results.map(results => results.v);
	// 		diceValue = diceValue.reduce((partialSum, vDice) => partialSum + vDice, 0)
	// 		let diceX = diceForm[1];
	// 		let diceY = diceForm[2];
	// 		atkData = {
	// 			atkType : "save",
	// 			number : diceX,
	// 			size : diceY,
	// 			total : diceValue,
	// 		}
	// 		// log(diceX);
	// 		// log(diceY);
	// 		//log(msg.inlinerolls[2]);
	// 	}
	// 	return atkData;
	// };
	
	//check if an attack is a crit
	function checkAtkCrit(msg){
		
		let gotDiceData = libInline.getRollData(msg.inlinerolls);
		
		let critArr = []
		gotDiceData.forEach(dice =>{
			if (dice.getDice("crit").length>0){
				critArr.push(true)
			}
			else{
				critArr.push(false)
			};
		});
	
		//critsuccess
		let normal = findRollResult(msg, 'normal');
		let advantage = findRollResult(msg, 'advantage');
		let disadvantage = findRollResult(msg, 'disadvantage');
		//log("N: "+normal+" | Adv: "+advantage+" | DisAdv: "+disadvantage)
		let rollType;
		
		let critReal = false;
		if(normal>0){
			critReal = checkNormalCrit(critArr);
		}
		else if(advantage>0){
			critReal = checkAdvCrit(critArr);
		}
		else if(disadvantage>0){
			critReal = checkDisadvCrit(critArr);
		}
		else{
			return;
		}
		
		critReal ? legitCrit(msg) : false ;
	}
	
	//check save crit against threshold
	function checkSaveCrit(msg,atkData){
		let dmgSD = stdDevDice(parseFloat(atkData.number),parseFloat(atkData.size));
		let dmgAvg = avgD(parseFloat(atkData.size))*parseFloat(atkData.number);
		let dmgCritLimit = dmgAvg+dmgSD*2;
		let dmgTotal = atkData.total;
		log("dmgThreshold: "+dmgCritLimit+" vs "+dmgTotal+" damage done!");
		
		dmgTotal>=dmgCritLimit ? legitCrit(msg) : false ;
		
	};

	//SD formula for dice
	function stdDevDice(n,s){
		//log("stdDevDice | n="+n+" | s="+s);
		let stdD = Math.sqrt(n*(Math.pow(s,2)-1)/12);
		//log(stdD);
		return stdD;
	};

	//Avg formula for dice
	function avgD(s){
		let avgDie = (s+1)/2
		//log(avgDie);
		return avgDie;
	};

	////SD formula for general use
	// function stdDev(n,s){
	// 	let mean = /*???*/;
	// 	let stdD = Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
	// 	return stdD;
	// };

	
	//get character id from msg
	function getChar(msg){
		let msgDupe = _.clone(msg);
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
		//log(charName);
		
		let character = findObjs({
			type: "character",
			name: charName,
		})[0];
		return character;
	};

	//normal,adv,disadv finder
	findRollResult = function(msg, rollname, isString = 0){
		let pattern = new RegExp('{{' + rollname + '=(.+?)}}');
		let result = 0;
		if (isString > 0) {
			msg.content.replace(pattern,(match,rollResult)=>{
				result = rollResult;
			});
		} else {
			msg.content.replace(pattern,(match,rollResult)=>{
			result = parseInt(rollResult);
			});
		}
		return result;
	};
	
	//check for crits on normal roll
	function checkNormalCrit(critArr){
		let critBool;
		critArr[0] ? critBool = true : critBool = false ;
		return critBool;
	};
	
	//check for crits on adv roll
	function checkAdvCrit(critArr){
		let critBool;
		critArr[0] || critArr[1] ? critBool = true : critBool = false ;
		return critBool;
	};
	
	//check for crits on disadv roll
	function checkDisadvCrit(critArr){
		let critBool;
		critArr[0] && critArr[1] ? critBool = true : critBool = false ;
		return critBool;
	};
	
	//play crit
	function playSound(trackname) {
		var track = findObjs({type: 'jukeboxtrack', title: trackname})[0];
		if(track) {
			track.set('playing',false);
			track.set('softstop',false);
			track.set('playing',true);
		}
		else {
			log("No track found "+trackname);
		}
	};
		
	//celebrate on crit
	function legitCrit(msg){
		let gifCrit = "<div class='"+scriptIndex.name+"' style='width:100%;padding-top:59.1%;position:relative;'><img class='"+scriptIndex.name+"' style='position:absolute;top:0;left:0;right:0;bottom:0;max-width: 103.0%;height: auto;margin-left: -1.5%;' src='https://i.imgur.com/agBz1Ql.gif?"+(Math.floor(Math.random()*(Math.floor(1000)-Math.ceil(1))+Math.ceil(1)))+"'></div>"
		sendChat(msg.who, '/direct <div  class="sheet-rolltemplate-atk '+scriptIndex.name+'"><div class="sheet-desc sheet-info '+scriptIndex.name+'"><span><span class="sheet-top '+scriptIndex.name+'"></span><span class="sheet-middle '+scriptIndex.name+'">'+gifCrit+'</span><span class="sheet-bottom '+scriptIndex.name+'"></span></span></div></div>', null, {noarchive:true});
		playSound("CriticalHit");
	};

	//parse request for crit gif
	function reqPlay(msg,charid){
		if(!charid){
			legitCrit(msg);
			return;
		}
		else{
			let character = getObj('character',charid);
			if(!character){
				return;
			}
			else if(character.get("controlledby")!==""){
				legitCrit(msg);
			}
			else{
				//non-player character requested with ID therefore ignore
				return;
			}
		}
	};

	return scriptIndex;
})();