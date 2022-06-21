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

//new plan
/*
!bankbot --app
makes the app appear
app has 6 options, 2 by 2 by 2, with either param being
send/request
mass true/false
pc/npc

all require your character to be selected
then they either:
pc - app you to request a character
request - app the controller to request
therefore
----COMBINATIONS----
PC send PC (PC)
PC send NPC (PC)
NPC send PC (GM only)
//NPC send NPC
PC request PC (PC)
PC request NPC (PC)
NPC request PC  (GM only)
//NPC request NPC
----mass----
PC mass send PC (PC)
//PC mass send NPC (PC)
NPC mass send PC (GM only)
//NPC send NPC
PC mass request PC (PC)
//PC mass request NPC (PC)
NPC mass request PC  (GM only)
//NPC request NPC
----RESULT----
PC send PC (PC)
PC send NPC (PC)
PC request PC (PC)
PC request NPC (PC)
NPC send PC (GM only)
NPC request PC  (GM only)
----mass----
PC mass send PC (PC)
PC mass request PC (PC)
NPC mass send PC (GM only)
NPC mass request PC  (GM only)

!bankbot --type send/request/sendmass/requestmass --from charid --to charid --value xxpp xxcp xxsp xxgp 

*/

	class Transaction{
		_id = crypto.randomUUID();
		_time = new Date();
		_walletsAfterSend;
		_walletsAfterReceive;
		constructor(type,subtype,name,split=false,walletExchange,walletsSend,walletsReceive){
            this._type = type;
            this._subType = subtype;
            this._name = name;
			this._split = split;
			this._walletExchange = walletExchange;
            this._walletsBeforeSend = new Map();                                                     //creates an empty map of wallets before the transaction
            if (walletsSend.typeof == "object" && walletsSend instanceof WalletPC) {                 //checks if walletsSend is a singular wallet
                _walletsBeforeSend.set(walletsSend.charID, JSON.parse(JSON.stringify(walletsSend))); //deepcopies the wallet to the before map using the character ID as the key (wallet can be retrieved like in an array but using charID instead of a number)
            } 
			else if (Object.prototype.toString.call(walletsSend) === '[object Array]') {         //checks to see if walletsSend is an array
                for (wallet in walletsSend) {                                                     //iterates over all elements in the array
                    if (walletsSend.typeof == "object" && walletsSend instanceof WalletPC) {        //checks to see if there are objects in the array and if these are wallets
                        _walletsBeforeSend.set(wallet.charID, JSON.parse(JSON.stringify(wallet)));     //deepcopies the wallet to the before map using the character ID as the key
                    }
                }
            }
			this._walletsBeforeReceive = new Map();  
			if (walletsReceive.typeof == "object" && walletsReceive instanceof WalletPC) {         //repeats the same steps as above for walletsReceive
                _walletsBeforeReceive.set(walletsReceive.charID, JSON.parse(JSON.stringify(walletsReceive)));
            } 
			else if (Object.prototype.toString.call(walletsReceive) === '[object Array]') {
                for (wallet in walletsReceive) {
                    if (wallet.typeof == "object" && wallet instanceof WalletPC) { 
                        _walletsBeforeReceive.set(wallet.charID, JSON.parse(JSON.stringify(wallet)));
                    }
                }
            }
            //at this point you have all before wallets in _walletsBefore keyed by charID
        }
		get id(){
			return this._id;
		}
		get time(){
			return this._time;
		}
		get type(){
			return this._type;
		}
		set type(type){
			this._type = type;
		}
		get subtype(){
			return this._subtype;
		}
		set subtype(subtype){
			this._subtype = subtype;
		}
		get name(){
			return this._name;
		}
		set name(name){
			this._name = name;
		}
		get split(){
			return this._split;
		}
	};

	class Wallet{
		_isChar = false;
		_pp = 0;
		_gp = 0;
		_sp = 0;
		_cp = 0;
		constructor(){
		}
		get isChar() {
			return this._isChar;
		}
		set isChar(value) {
			this._isChar = value;
		}
		get pp() {
			return this._pp;
		}
		set pp(value) {
			this._pp = parseInt(value);
		}
		get gp() {
			return this._gp;
		}
		set gp(value) {
			this._gp = parseInt(value);
		}
		get sp() {
			return this._sp;
		}
		set sp(value) {
			this._sp = parseInt(value);
		}
		get cp() {
			return this._cp;
		}
		set cp(value) {
			this._cp = parseInt(value);
		}
		getBalance(){
			return 1000*this._pp + 100*this._gp + 10*this._sp + this._cp;
		}
		setBalance(cp){
			this._pp = Math.floor(cp/1000);
			cp %= 1000;
			this._gp = Math.floor(cp/100);
			cp %= 100;
			this._sp = Math.floor(cp/10);
			cp %= 10;
			this._cp = Math.floor(cp);
		}
		readBalance(){
			let moneyTxt;
			this._pp > 0 ? moneyTxt += `${this._pp}pp `: false;
			this._gp > 0 ? moneyTxt += `${this._gp}gp `: false;
			this._sp > 0 ? moneyTxt += `${this._sp}sp `: false;
			this._cp > 0 ? moneyTxt += `${this._cp}cp `: false;
			return moneyTxt.trim();
		}
	};

	class WalletNPC extends Wallet{
		constructor(pp=0,gp=0,sp=0,cp=0){
			if(pp.typeof == "array"){
				this._pp = parseInt(pp[0]);
				this._gp = parseInt(pp[1]);
				this._sp = parseInt(pp[2]);
				this._cp = parseInt(pp[3]);
			}
			else{
				this._pp = parseInt(pp);
				this._gp = parseInt(gp);
				this._sp = parseInt(sp);
				this._cp = parseInt(cp);
			}
		}
	};

	class WalletPC extends Wallet{
		constructor(charID){
			this._pp = parseInt(getAttrByName(charID,"pp"));
			this._gp = parseInt(getAttrByName(charID,"gp"));
			this._sp = parseInt(getAttrByName(charID,"sp"));
			this._cp = parseInt(getAttrByName(charID,"cp"));
			this._isChar = true;
			this._charID = charID;
			this._charName = getObj('character', charID).get("name");
		}
		get charID(){
			return this._charID;
		}
		get charName(){
			return this._charName;
		}
		pushBalance(){
			//pp
			let ppAttr = findObjs({
				_characterid: charID,
				_type: "attribute",
				name: "pp"
			})[0];
			ppAttr.set("current",this._pp);
			//gp
			let gpAttr = findObjs({
				_characterid: charID,
				_type: "attribute",
				name: "gp"
			})[0];
			gpAttr.set("current",this._gp);
			//sp
			let spAttr = findObjs({
				_characterid: charID,
				_type: "attribute",
				name: "sp"
			})[0];
			spAttr.set("current",this._sp);
			//cp
			let cpAttr = findObjs({
				_characterid: charID,
				_type: "attribute",
				name: "cp"
			})[0];
			cpAttr.set("current",this._cp);
		};
	};

	//BEGIN THE ACTUAL FUNCTIONS

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

	function toCopper(pp=0,gp=0,sp=0,cp0=0){
		return cp + 10*sp + 100*gp + 1000*pp;
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