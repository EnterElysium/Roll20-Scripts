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
PC mass request PC (PC) --issues?
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

!bankbot --type send/request[/sendmass/requestmass] ([--split]) (--time) --from charid --to charid --value xxpp xxcp xxsp xxgp 
!bankbot --type send --split --from @{selected|character_id} --to @{target|character_id} --value ?{value to send "50pp 3sp"|1gp}

*/
	class Transaction{
		_id = Transaction.generateUUID();
		_time = new Date();
		_type;
		_split=false;
		_name="Unnamed Transaction";
		_walletExchange;
		_walletsBeforeSend = [];
		_walletsBeforeReceive = [];
		_walletsAfterSend = [];
		_walletsAfterReceive = [];
		constructor(){
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
		get name(){
			return this._name;
		}
		set name(name){
			this._name = name;
		}
		get split(){
			return this._split;
		}
		set split(split){
			this._split = !!split;
		}
		get walletExchange(){
			return this._walletExchange;
		}
		get walletsBeforeSend(){
			return this._walletsBeforeSend;
		}
		get walletsBeforeReceive(){
			return this._walletsBeforeReceive;
		}
		set walletExchange(wallet){
			this._walletExchange = wallet;
		}
		set walletsBeforeSend(wallet){
			this._walletsBeforeSend = wallet;
		}
		set walletsBeforeReceive(wallet){
			this._walletsBeforeReceive = wallet;
		}
		get walletsAfterSend() {
			return this._walletsAfterSend;
		}
		set walletsAfterSend(value) {
			this._walletsAfterSend = value;
		}
		get walletsAfterReceive() {
			return this._walletsAfterReceive;
		}
		set walletsAfterReceive(value) {
			this._walletsAfterReceive = value;
		}
		validate(){
			if(!(this.type == "send" || this.type == "receive")){
				return "error not sure if sending or receiving";
			}
			if(!this.walletExchange){
				return "error no amount sent";
			}
			if(!this.walletsBeforeSend){
				return "error no sender";
			}
			if(!this.walletsBeforeReceive){
				return "error no receiver";
			}
			if(this.type == "send"){
				return "complete";
			}
			else if(this.type == "receive"){
				return "request";
			}
			return "unknown error";
		}
		static generateUUID() { // Public Domain/MIT
			var d = new Date().getTime();//Timestamp
			var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16;//random number between 0 and 16
				if(d > 0){//Use timestamp until depleted
					r = (d + r)%16 | 0;
					d = Math.floor(d/16);
				} else {//Use microseconds since page-load if supported
					r = (d2 + r)%16 | 0;
					d2 = Math.floor(d2/16);
				}
				return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
			});
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
			this.pp = Math.floor(cp/1000);
			cp %= 1000;
			this.gp = Math.floor(cp/100);
			cp %= 100;
			this.sp = Math.floor(cp/10);
			cp %= 10;
			this.cp = Math.floor(cp);
		}
		readBalance(){
			let moneyTxt = "";
			this.pp > 0 ? moneyTxt += `${this.pp}pp `: false;
			this.gp > 0 ? moneyTxt += `${this.gp}gp `: false;
			this.sp > 0 ? moneyTxt += `${this.sp}sp `: false;
			this.cp > 0 ? moneyTxt += `${this.cp}cp `: false;
			return moneyTxt.trim();
		}
	};

	class WalletWorld extends Wallet{
		constructor(pp=0,gp=0,sp=0,cp=0){
			super();
			if(Array.isArray(pp)){
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
			super();
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
			ppAttr.set("current",this.pp);
			//gp
			let gpAttr = findObjs({
				_characterid: charID,
				_type: "attribute",
				name: "gp"
			})[0];
			gpAttr.set("current",this.gp);
			//sp
			let spAttr = findObjs({
				_characterid: charID,
				_type: "attribute",
				name: "sp"
			})[0];
			spAttr.set("current",this.sp);
			//cp
			let cpAttr = findObjs({
				_characterid: charID,
				_type: "attribute",
				name: "cp"
			})[0];
			cpAttr.set("current",this.cp);
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
		// parse arguments into a hierarchy of objects
		let args = msg.content.split(/\s+--/).map(arg=>{
			let cmds = arg.split(/\s+/);
			return {
			  "cmd": cmds.shift().toLowerCase(),
			  "params": cmds
			};
		});
		args.shift();
		
		//[{"cmd":"!sniff","params":[]},{"cmd":"hats","params":["tophat","beanie","cap"]},{"cmd":"shorts","params":["jeanshorts"]}]
		//not handling mass selection for now
		//send 1p-w
		//send w-1p
		//send 1p-1p
		//req 1p-1p
		//req 1p-w
		//req w-1p
		doTransaction(args, msg);
	};

	function doTransaction(args, msg) {
		let transaction = parseArgs(args);
		switch (transaction.validate()) {
			case "complete":
				sendTransaction(msg, transaction);
				break;
			case "request":
				//fill in me later
				receiveTransaction(msg, transaction);
				break;
			default:
				//parse return as an error message and log
				log(transaction.validate());
		}
	};

	function sendTransaction(msg,transaction){
		let valid = transaction.validate();
	};

	function parseArgs(args) {
		let transaction = new Transaction();
		for (let flag of args) {
			log(flag);
			switch (flag.cmd) {
				case "type":
					transaction.type = flag.params[0].toLowerCase();
					break;
				case "name":
					transaction.name = flag.params.join(" ");
					break;
				case "split":
					//option flag for spliting money rather than each
					transaction.split = flag.params[0];
					break;
				case "from":
					for (let id of flag.params) {
						if (id == "world") {
							transaction.walletsBeforeSend.push("world");
						}
						else {
							transaction.walletsBeforeSend.push(new WalletPC(id));
						}
					};
					break;
				case "to":
					for (let id of flag.params) {
						if (id == "world") {
							transaction.walletsBeforeReceive.push("world");
						}
						else {
							transaction.walletsBeforeReceive.push(new WalletPC(id));
						}
					};
					break;
				case "value":
					//[50pp,5sp,1cp]
					let pp = parseInt(flag.params.toString().match(/[0-9]+pp/));
					let gp = parseInt(flag.params.toString().match(/[0-9]+gp/));
					let sp = parseInt(flag.params.toString().match(/[0-9]+sp/));
					let cp = parseInt(flag.params.toString().match(/[0-9]+cp/));
					!pp ? pp = 0 : false;
					!gp ? gp = 0 : false;
					!sp ? sp = 0 : false;
					!cp ? cp = 0 : false;
					transaction.walletExchange = new WalletWorld([pp, gp, sp, cp]);
					break;
				case "time":
					//if time doesn't exist make one
					//if time does exist check if it is still valid
					//TIMEOUT FUNCTION HERE
					break;
					return transaction;
			}
		}
		log(transaction);
		log(transaction.name);
		log(transaction.walletExchange.readBalance());
		return transaction;
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