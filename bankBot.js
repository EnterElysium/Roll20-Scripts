const bankBot = (function() {	

	const scriptIndex = {"name":"bankBot","version":"v0.01",};

//PC pays
//BB whispers to GM and player
//GM gives - PC gets money
//BB whispers to GM and player
//!bankbot personal characterid add/subtract 0pp 0gp 0sp 0cp
//
//!convert up to XX where XX=curency name, covnerts all below
//!buying list
//!external bank account


	on("chat:message", function(msg) {

		if (msg.type==="api" && msg.content.toLowerCase().indexOf("!bankbot")==0){
			Chandler(msg);
			return;
		}
	});

	//API CHAT HANDLER
	function Chandler(msg){
		//check if ppgpspcp exist and creature if not
		let args = msg.content.split(/\s+/);
		let [,typeTransaction, ...transaction] = args;

		//switch this when other options are available
		if(typeTransaction=="personal"){
			personalChandler(msg,transaction)
		}
	};

	function personalChandler(msg,transaction){
		let [charID,addOrSub, ...money] = transaction;
		let transCash = arrayConversion(money);
		let charCash = getCharMoneyCP(charID);
		switch(addOrSub){
			case "add":
				personalAdd(charID,msg,transCash,charCash);
				break;
			case "subtract":
				personalSub(charID,msg,transCash,charCash);
				break;
		}
	};

	function personalAdd(charID,msg,transCash,charCash){
		let newCash = charCash + transCash;
		setCharMoney(charID,newCash);

		let character = getObj('character', charID);
		let newCashString = moneyToString(newCash);
		let transCashString = moneyToString(transCash);
		let charCashString = moneyToString(charCash);
		let msgText = `${character.get("name")} received ${transCashString}<br>`+
		`Previous balance: ${charCashString}<br>`+
		`New balance: ${newCashString}`;
		chatter(null,"w",["character",character],msgText,null,"{noarchive:true}");
		chatter(null,"w","gm",msgText,null,"{noarchive:true}");
	};

	function personalSub(charID,msg,transCash,charCash){
		let newCash = charCash - transCash;
		if(newCash<0){
			chatter(null,"w",msg.who,`You have insufficient money to do this. The transaction has been voided.`,null,"{noarchive:true}");
			return;
		};
		setCharMoney(charID,newCash,transCash,charCash);

		let character = getObj('character', charID);
		let newCashString = moneyToString(newCash);
		let transCashString = moneyToString(transCash);
		let charCashString = moneyToString(charCash);
		let msgText = `${character.get("name")} spent ${transCashString}<br>`+
		`Previous balance: ${charCashString}<br>`+
		`New balance: ${newCashString}`;
		chatter(null,"w",["character",character],msgText,null,"{noarchive:true}");
		chatter(null,"w","gm",msgText,null,"{noarchive:true}");
	};

	function arrayConversion(array){
		//could add decimal handling by adjusting regex
		let pp = parseInt(array.toString().match(/[0-9]+pp/));
		let gp = parseInt(array.toString().match(/[0-9]+gp/));
		let sp = parseInt(array.toString().match(/[0-9]+sp/));
		let cp = parseInt(array.toString().match(/[0-9]+cp/));
		!pp ? pp=0 : false;
		!gp ? gp=0 : false;
		!sp ? sp=0 : false;
		!cp ? cp=0 : false;
		return toCopper(pp,gp,sp,cp);
	};

	function toCopper(pp,gp,sp,cp){
		let cpReturn = cp + 10*sp + 100*gp + 1000*pp;
		return cpReturn;
	};

	function getCharMoneyCP(charID){
		let pp = parseInt(getAttrByName(charID,"pp"));
		let gp = parseInt(getAttrByName(charID,"gp"));
		let sp = parseInt(getAttrByName(charID,"sp"));
		let cp = parseInt(getAttrByName(charID,"cp"));
		!pp ? pp=0 : false;
		!gp ? gp=0 : false;
		!sp ? sp=0 : false;
		!cp ? cp=0 : false;
		return toCopper(pp,gp,sp,cp);
	}

	function fromCopper(cash){
		let pp, gp, sp, cp;
		[pp,gp,sp,cp] = [0,0,0,0];
		pp += Math.floor(cash/1000);
		cash %= 1000;
		gp += Math.floor(cash/100);
		cash %= 100;
		sp += Math.floor(cash/10);
		cash %= 10;
		cp += cash;
		
		//logger(`${pp}pp ${gp}gp ${sp}sp ${cp}cp`)
		
		return [pp,gp,sp,cp];
	};

	function setCharMoney(charID,newCash){
		let [pp,gp,sp,cp] = fromCopper(newCash);
		//pp
		let ppAttr = findObjs({
			_characterid: charID,
			_type: "attribute",
			name: "pp"
		})[0];
		ppAttr.set("current",pp);
		//gp
		let gpAttr = findObjs({
			_characterid: charID,
			_type: "attribute",
			name: "gp"
		})[0];
		gpAttr.set("current",gp);
		//sp
		let spAttr = findObjs({
			_characterid: charID,
			_type: "attribute",
			name: "sp"
		})[0];
		spAttr.set("current",sp);
		//cp
		let cpAttr = findObjs({
			_characterid: charID,
			_type: "attribute",
			name: "cp"
		})[0];
		cpAttr.set("current",cp);

		return;
	};

	function moneyToString(cash){
		let [pp,gp,sp,cp] = fromCopper(cash);
		let moneyString = ` `;
		pp > 0 ? moneyString += `${pp}pp `: false;
		gp > 0 ? moneyString += `${gp}gp `: false;
		sp > 0 ? moneyString += `${sp}sp `: false;
		cp > 0 ? moneyString += `${cp}cp `: false;
		moneyString = moneyString.trim();
		return moneyString;
	};

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