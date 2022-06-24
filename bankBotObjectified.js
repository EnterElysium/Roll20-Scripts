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
		constructor(who,isGM){
			this._who = who;
			this._byGM = isGM;
        }
		get who(){
			return this._who;
		}
		get byGM(){
			return this._byGM;
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
			if(this.type == "request"){
				this.type == "receive";
			}
			if(!(this.type == "send" || this.type == "receive")){
				return "error not sure if sending or receiving";
			}
			if(!this.walletExchange){
				return "error no amount sent";
			}
			if(!this.walletsAfterSend){
				return "error no sender";
			}
			if(!this.walletsAfterReceive){
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
		complete(){
			//check if world sender then confirm they are gm
			if(this.walletsAfterSend[0] == "world"){
				if(!this._byGM){
					//error cannot send money from world without being a GM
					return;
				}
			} //else the senders are players and we can take the money from their wallets
			else{
				let payOut = this.walletExchange.getBalance();
				//check if we need to take multiple payments because we aren't spliting it
				if(!this.split){
					payOut *= this.walletsAfterSend.length;
				}
				//take payment from senders
				for (let wallet of this.walletsAfterSend){
					let paid = wallet.adjBalance(-payOut)
					//did the payment FAIl to go through?
					if(!paid){
						//ERROR not enough cash
						errorHandler(this.who,`${getObj('character', wallet.charID).get("name")} does not have enough money to complete this transaction. Transaction voided.`,true,true);
						return;
					}
				}
			}
			//check if world reciever
			if(this.walletsAfterReceive[0] == "world"){
				//do nothing, no auth is needed to send to the world
			} //else the receivers are players and we can send the money to their wallets
			else{
				let payIn = this.walletExchange.getBalance();
				//check if we need to split the payment
				if(this.split){
					payIn = Math.floor(payIn/this.walletsAfterReceive.length);
				}
				//give payment to receivers
				for (let wallet of this.walletsAfterReceive){
					wallet.adjBalance(payIn)
				}
			}
			log(this);
			for (let wallet of this.walletsAfterSend){
				if(wallet != "world"){
					wallet.pushBalance();
				}
			}
			for (let wallet of this.walletsAfterReceive){
				if(wallet != "world"){
					wallet.pushBalance();
				}
			}			
			return;
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
		adjBalance(payment){
			let currentBal = this.getBalance() + payment;
			if(currentBal<0){
				return false;
			}
			this.setBalance(currentBal);
			return true;
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
			this._pp = WalletPC.sanitiseCoin(charID,"pp");
			this._gp = WalletPC.sanitiseCoin(charID,"gp");
			this._sp = WalletPC.sanitiseCoin(charID,"sp");
			this._cp = WalletPC.sanitiseCoin(charID,"cp");
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
				_characterid: this.charID,
				_type: "attribute",
				name: "pp"
			})[0];
			ppAttr.set("current",this.pp);
			//gp
			let gpAttr = findObjs({
				_characterid: this.charID,
				_type: "attribute",
				name: "gp"
			})[0];
			gpAttr.set("current",this.gp);
			//sp
			let spAttr = findObjs({
				_characterid: this.charID,
				_type: "attribute",
				name: "sp"
			})[0];
			spAttr.set("current",this.sp);
			//cp
			let cpAttr = findObjs({
				_characterid: this.charID,
				_type: "attribute",
				name: "cp"
			})[0];
			cpAttr.set("current",this.cp);
		};
		static sanitiseCoin(charID,coin){
			let coinValue = getAttrByName(charID,coin);
			if(coinValue === null){
				createObj("attribute", {
					name: coin,
					current: 0,
					characterid: charID,
				});
				coinValue = 0;
			}
			else{
				coinValue = parseInt(coinValue,10);
				Number.isNaN(coinValue) ? false : coinValue = 0;
			}
			return coinValue;
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
		if(_.indexOf(_.pluck(args,"cmd"),"app") != -1){
			doApp(args,msg);
		}
		else{
			doTransaction(args, msg);
		}
	};

	function doApp(args,msg){
		let from = "world";
		for (let flag of args) {
			if(flag.cmd == "from"){
				from = flag.params[0];
			}
		}
		let appBody = builtBankAppTemplate(from,msg.playerid);
		chatter("w",msg.who,appBody,"noarchive");
	};

	function doTransaction(args, msg) {
		let transaction = parseArgs(args,msg.who.replace(/\(GM\)/, '').trim(),playerIsGM(msg.playerid));
		switch (transaction.validate()) {
			case "complete":
				transactionComplete(msg, transaction);
				break;
			case "request":
				//fill in me later
				transactionRequest(msg, transaction);
				break;
			default:
				//parse return as an error message and log
				log(transaction.validate());
				log("OI I'M AN ERROR in doTransaction - you got to the default case.");
		}
		return;
	};

	function transactionComplete(msg,transaction){
		transaction.complete();
		//adjust this for more than one-to-one
		let sender;
		if(transaction.walletsAfterSend[0] == "world"){
			sender = "gm";
		}
		else{
			sender = ["character",getObj('character', transaction.walletsAfterSend[0].charID)];
		}
		let receiver;
		if(transaction.walletsAfterReceive[0] == "world"){
			receiver = "gm";
		}
		else{
			receiver = ["character",getObj('character', transaction.walletsAfterReceive[0].charID)];
		}
		chatter("w",sender,bankReceipt("send",transaction));
		chatter("w",receiver,bankReceipt("receive",transaction));
	};

	function parseArgs(args,who,isGM) {
		let transaction = new Transaction(who,isGM);
		for (let flag of args) {
			log(flag);
			switch (flag.cmd) {
				case "type":
					transaction.type = flag.params[0].toLowerCase();
					break;
				case "name":
					//provided we were actually given a name use that as the name
					if(flag.params.length > 0){
						transaction.name = flag.params.join(" ");
					}
					break;
				case "split":
					//option flag for spliting money rather than each
					transaction.split = flag.params[0];
					break;
				case "from":
					for (let id of flag.params) {
						if (id == "world") {
							transaction.walletsBeforeSend.push("world");
							transaction.walletsAfterSend.push("world");
						}
						else {
							transaction.walletsBeforeSend.push(new WalletPC(id));
							transaction.walletsAfterSend.push(new WalletPC(id));
						}
					};
					break;
				case "to":
					for (let id of flag.params) {
						if (id == "world") {
							transaction.walletsBeforeReceive.push("world");
							transaction.walletsAfterReceive.push("world");
						}
						else {
							transaction.walletsBeforeReceive.push(new WalletPC(id));
							transaction.walletsAfterReceive.push(new WalletPC(id));
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
		return transaction;
	};

	function bankReceipt(sentOrReceive,transaction){
		let you;
		let them = "";
		let desc = "";
		let amount = transaction.walletExchange.readBalance();
		let newBal;
		let prevBal;
		log(transaction);
		log(transaction.walletsAfterSend[0]);
		log(transaction.walletsAfterReceive[0]);
		if(sentOrReceive == "send"){
			transaction.walletsAfterReceive[0] === "world" ? false : them = ` to ${transaction.walletsAfterReceive[0].charName}`
			//from world
			if(transaction.walletsAfterSend[0] === "world"){
				you = "World Bank";
				log(`${!scriptIndex || !scriptIndex.name ? "Unknown script" : scriptIndex.name} reports in at line ${522/*LL*/}`);
				desc += `You sent ${amount} to ${transaction.walletsAfterReceive[0].charName}.<hr>Their new balance: ${transaction.walletsAfterReceive[0].readBalance()}<br>Their previous balance: ${transaction.walletsBeforeReceive[0].readBalance()}`
			} //from PC
			else{
				log(`${!scriptIndex || !scriptIndex.name ? "Unknown script" : scriptIndex.name} reports in at line ${526/*LL*/}`);
				you = transaction.walletsAfterSend[0].charName;
				newBal = transaction.walletsAfterSend[0].readBalance();
				prevBal = transaction.walletsBeforeSend[0].readBalance();
				desc += `${you} sent ${amount}${them}.<hr>New balance: ${newBal}<br>Previous balance: ${prevBal}`
			}
		}
		else if(sentOrReceive == "receive"){
			transaction.walletsAfterSend[0] === "world" ? false : them = ` from ${transaction.walletsAfterReceive[0].charName}`
			//from world
			log(transaction);
			if(transaction.walletsAfterReceive[0] === "world"){
				you = "World Bank";
				log(`${!scriptIndex || !scriptIndex.name ? "Unknown script" : scriptIndex.name} reports in at line ${537/*LL*/}`);
				desc += `${transaction.walletsAfterSend[0].charName} sent you ${amount}.<hr>Their new balance: ${transaction.walletsAfterSend[0].readBalance()}<br>Their previous balance: ${transaction.walletsBeforeSend[0].readBalance()}`
			} //from PC
			else{
				log(`${!scriptIndex || !scriptIndex.name ? "Unknown script" : scriptIndex.name} reports in at line ${541/*LL*/}`);
				you = transaction.walletsAfterReceive[0].charName;
				newBal = transaction.walletsAfterReceive[0].readBalance();
				prevBal = transaction.walletsBeforeReceive[0].readBalance();
				desc += `${you} received ${amount}${them}.<hr>New balance: ${newBal}<br>Previous balance: ${prevBal}`
			}
		}
		return `&{template:npcaction} {{name=${transaction.name}}} {{rname=${you}}} {{description=${desc}}}`;
	};

	function builtBankAppTemplate(charID,playerid){
		let isGM = playerIsGM(playerid);
		let from;
		charID ? from = charID : from = "world";
		let header = "";
		let subHeader = "";
		if(isGM && (!from || from == "world")){
			header = "World Bank"
		}
		else if(from && from != "world"){
			header = getObj('character', from).get("name");
			subHeader = `Current Balance: ${getCharBalString(from)}`;
		}
		let desc = buildBankAppBtns(from,isGM);
		return `&{template:npcaction} {{name=${subHeader}}} {{rname=${header}}} {{description=${desc}}}`;
	};

	function buildBankAppBtns(from,isGM){
		let btnSection = "";
		if(from && from != "world"){
			btnSection += btnContainer(from,false);
		}
		//if GM then btnContainer("world",true);
		if(isGM){
			btnSection ? btnSection += `<hr>` : false;
			btnSection += btnContainer("world",true)
		}
		//warning about Platinum upscale
		if(btnSection){
			btnSection ? btnSection += `<hr>Please note that using the banking system will convert all money in your account into the most efficient form of currency, minimising total number of coins and overall weight.` : false;
		}
		return btnSection;
	};

	function getCharBalString(charID){
		let pp = parseInt(getAttrByName(charID,"pp"));
		let gp = parseInt(getAttrByName(charID,"gp"));
		let sp = parseInt(getAttrByName(charID,"sp"));
		let cp = parseInt(getAttrByName(charID,"cp"));
		let moneyString = ` `;
		pp > 0 ? moneyString += `${pp}pp `: false;
		gp > 0 ? moneyString += `${gp}gp `: false;
		sp > 0 ? moneyString += `${sp}sp `: false;
		cp > 0 ? moneyString += `${cp}cp `: false;
		moneyString = moneyString.trim();
		moneyString.length = 0 ? moneyString = "None" : false;
		return moneyString;
	};

	function btnContainer(from,isGM) {
		let btns = "";
		if(!isGM){
			btns += buildSelButton(`to PC`,buildBtnLink("send",from,null,null,null,null));
			//btns += buildSelButton(`to PC (Split)`,buildBtnLink("send",from,null,null,null,"split"));
			btns += buildSelButton(`to GM`,buildBtnLink("send",from,"world",null,null,null));
			btns += buildSelButton(`to GM (Split)`,buildBtnLink("send",from,"world",null,null,"split"));
		}
		else if(isGM){
			btns += buildSelButton(`GM to PC`,buildBtnLink("send","world",null,null,null,null));
			btns += buildSelButton(`GM to PC (Split)`,buildBtnLink("send","world",null,null,null,"split"));
		}
		let btnContainerCSS = `display: block; box-sizing: border-box; width: 100%; text-align: center;`;
		let btnContainer = `<div style="${btnContainerCSS}">${btns}</div>`;
		return btnContainer;
	};

	function buildBtnLink(type,from,to,value,name,split){
		let link = "!bankbot";
		type ? link += ` --type ${type}` : link += ` --type ?{Send or request money|Send,send|Request,receive}`;
		from ? link += ` --from ${from}` : link += ` --from @{selected|character_id}`;
		to ? link += ` --to ${to}` : link += ` --to @{target|character_id}`;
		value ? link += ` --value ${value}` : link += ` --value ?{Money involved (in the form '50pp 5cp' using pp, gp, sp, and cp)|0pp 0gp 0sp 0cp}`;
		name ? link += ` --name ${name}` : link += ` --name ?{Transaction reason/name|}`;
		split ? link += ` --split` : false;
		return encodeHTML(link);
	};

	function encodeHTML(string){
		//string = string.replace(/&/g,"&#38;");
		//string = string.replace(/'/g,"&#39;");
		string = string.replace(/@/g,"&#64;");
		string = string.replace(/{/g,"&#123;");
		//string = string.replace(/}/g,"&#125;");
		//string = string.replace(/\|/g,"&#124;");
		//string = string.replace(/\[/g,"&#91;");
		//string = string.replace(/\]/g,"&#93;");
		log(string);
		return string;
	};

	function buildSelButton(btnName,btnCmd){
		let span = `<span>${btnName}</span>`;
		let linkCSS = `background-color: transparent; border: 0px; box-sizing: border-box; `;
		let link = `<a style="${linkCSS}" href="${btnCmd}">${span}</a>`;
		let btnCSS = `display: inline-block; width: 85%; aspect-ratio: 2 / 1; margin-left:auto; margin-right:auto; margin-bottom:5px; margin-top:5px; box-sizing: border-box; background-color: green; border: 1px solid #a0a0a0; padding: 10px; font-size: 1em; text-align: center;`;
		let btn = `<div style="${btnCSS}">${link}</div>`;
		return btn;
	};

	//error handler
	function errorHandler(who,errorMsg,useChat,useLog){
		useLog === false ? log(errorMsg) : false;
		useChat === false ? sendChat("bankBot Error",errorMsg,null,{noarchive:true}) : false;
		useLog === true ? logger(errorMsg) : false;
		useChat === true ? chatter("w",who,errorMsg,"noarchive") : false;
		return;
	}

	//log stuff
    function logger(logtext){
        log(scriptIndex.name+", "+scriptIndex.version+": "+logtext);
    };

	//chat bullocks
    function chatter(slashCom,whisperTo,msgText,options,spkAs){
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