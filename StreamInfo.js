const hpBarHandout = (function() {	

	const scriptIndex = {"name":"StreamInfo","version":"v0.01",};

	const ids = ["-M7tTaiSvMFgbPpZj1r9","-M7tTUatxOb1X7MlJsJ3","-MZ4y5hOAiTvIxPaR3dl"];

	class Changed{
		constructor(obj, prev){
			this._chars = [];
			this._what = false;
			if(obj && obj.get("turnorder")){
				this._what = "init";
				this._initHistory = [0,0];
				//get whose turn it is
				if(obj && obj.get("turnorder") && JSON.parse(obj.get("turnorder")).length > 0){
					let tokID = JSON.parse(obj.get("turnorder"))[0].id;
					let token = getObj('graphic', tokID);
					let init = ids.indexOf(token.get("represents"))+1;
					this._initHistory[0] = init;
				}
				else{
					this._initHistory[0] = 0;
				}
				//get whose turn it was
				if(prev && prev["turnorder"] && JSON.parse(prev["turnorder"]).length > 0){
					let tokOldID = JSON.parse(prev["turnorder"])[0].id;
					let tokenOld = getObj('graphic', tokOldID);
					let oldInit = ids.indexOf(tokenOld.get("represents"))+1;
					this._initHistory[1] = oldInit;
				}
				else{
					this._initHistory[1] = 0;
				}
			}
			else{
				for (let id of ids) {
					let char = new Char(id, obj, prev);
					if(char.hasChanged){
						this._who = id;
						char.changedHP ? this._what = "hp" : false;
						char.changedDS ? this._what = "ds" : false;
						//char.changedInit ? this._what = "init" : false;
					}
					this._chars.push(char);
				}
			}
		}
		get chars(){
			return this._chars;
		}
		get who(){
			return this._who;
		}
		get what(){
			return this._what;
		}
		get initHistory(){
			return this._initHistory;
		}
		set initHistoryNow(now){
			this._initHistory[0] = now;
		}
		set initHistoryNow(old){
			this._initHistory[1] = old;
		}
	}

	class Char{
		constructor(id,charNew,charOld){
			this._id = id;
			this._rank = [ids.indexOf(id)+1,ids.length];
			this._name = getObj('character', id).get("name");
			//hp construction
			if (charNew && charNew.get("name") === "hp" && id == charNew.get("characterid")){
				this._changedHP = true;
				this._hpDeltaTrue = Char.sanitiseHP(charNew.get("current")) - Char.sanitiseHP(charOld["current"]);
				//bound reset ignore
				if(Char.sanitiseHP(charNew.get("current")) == 0 && Char.sanitiseHP(charOld["current"]) <= 0){
					this._changedHP = false;
				}
				else if(Char.sanitiseHP(charNew.get("current")) == Char.sanitiseHP(charNew.get("max")) && Char.sanitiseHP(charOld["current"]) >= Char.sanitiseHP(charNew.get("max"))){
					this._changedHP = false;
				}
				this._hpNewMax = Char.sanitiseHP(charNew.get("max"));
				this._hpNew = Char.capBounds(Char.sanitiseHP(charNew.get("current")),this.hpNewMax);
				this._hpOldMax = Char.sanitiseHP(charOld["max"]);
				this._hpOld = Char.capBounds(Char.sanitiseHP(charOld["current"]),this.hpOldMax);
			}
			else{
				this._changedHP = false;
				this._hpDeltaTrue = 0;
				let attrHP = findObjs({
					_characterid: id,
					_type: "attribute",
					name: "hp"
				})[0];
				this._hpNewMax = Char.sanitiseHP(attrHP.get("max"));
				this._hpNew = Char.capBounds(Char.sanitiseHP(attrHP.get("current")),this.hpNewMax);
				this._hpOldMax = this.hpNewMax;
				this._hpOld = this.hpNew;
			}
			//deathsave construction
			this._changedDS = false;
			this._dsNewSucc = 0;
			this._dsNewFail = 0;
			this._dsOldSucc = 0;
			this._dsOldFail = 0;
			for(let i = 1;i<=3;i++){
				//successes
				let dss = findObjs({
					_characterid: id,
					_type:"attribute",
					name:`deathsave_succ${i}`
				})[0]
				if(charNew && id == charNew.get("characterid") && charNew.get("name") === `deathsave_succ${i}`){
					dss = [charNew.get(`current`),charOld[`current`]];
					this._dsNewSucc += dss[0] === "on" ? 1 : 0;
					this._dsOldSucc += dss[1] === "on" ? 1 : 0;
					this._changedDS = true;
				}
				else{
					dss = dss.get("current")
					this._dsNewSucc += dss === "on" ? 1 : 0;
					this._dsOldSucc += dss === "on" ? 1 : 0;
				}
				//fails
				let dsf = findObjs({
					_characterid: id,
					_type:"attribute",
					name:`deathsave_fail${i}`
				})[0]
				if(charNew && id == charNew.get("characterid") && charNew.get("name") === `deathsave_fail${i}`){
					dsf = [charNew.get(`current`),charOld[`current`]];
					this._dsNewFail += dsf[0] === "on" ? 1 : 0;
					this._dsOldFail += dsf[1] === "on" ? 1 : 0;
					this._changedDS = true;
				}
				else{
					dsf = dsf.get("current")
					this._dsNewFail += dsf === "on" ? 1 : 0;
					this._dsOldFail += dsf === "on" ? 1 : 0;
				}
			}
			log(`${this._name}: DSNewSvF=${this._dsNewSucc}v${this._dsNewFail}  DSNewSvF=${this._dsOldSucc}v${this._dsOldFail}`);
		}
		get id() {
			return this._id;
		}
		get rank() {
			return this._rank;
		}
		get myRank() {
			return this._rank[0];
		}
		get name() {
			return this._name;
		}
		get changedHP() {
			return this._changedHP;
		}
		get hpNew() {
			return this._hpNew;
		}
		get hpNewMax() {
			return this._hpNewMax;
		}
		get hpOld() {
			return this._hpOld;
		}
		get hpOldMax() {
			return this._hpOldMax;
		}
		get hpDelta() {
			return this.hpNew-this.hpOld;
		}
		get hpDeltaTrue() {
			return this._hpDeltaTrue;
		}
		get hpDeltaPercent() {
			return this.hpNewPercent-this.hpOldPercent;
		}
		get hpNewPercent(){
			return 100*this.hpNew/this.hpNewMax;
		}
		get hpOldPercent(){
			return 100*this.hpOld/this.hpOldMax;
		}
		get changedDS() {
			return this._changedDS;
		}
		get dsNewSucc() {
			return this._dsNewSucc;
		}
		get dsNewFail() {
			return this._dsNewFail;
		}
		get dsOldSucc() {
			return this._dsOldSucc;
		}
		get dsOldFail() {
			return this._dsOldFail;
		}
		get changedInit() {
			return this._changedInit;
		}
		get hasChanged() {
			if(this.changedHP || this.changedDS || this.changedInit){
				return true;
			}
			return false;
		}
		static capBounds(num,max){
			num < 0 ? num = 0 : false ;
			num > max ? num = max : false ;
			return num;
		}
		static sanitiseHP(hp){
			hp = parseInt(hp,10);
			Number.isNaN(hp) ? hp = 0 : false;
			return hp;
		}
	};

	on("change:attribute", function(obj, prev) {
		if(!obj || !prev){
			return;
		}
		if(obj.get("name") === "hp" && prev["name"] === "hp"){
			parseChanges(createChange(obj, prev));
			return;
		}
		if(obj.get("name").toLowerCase().includes("deathsave") && prev["name"].toLowerCase().includes("deathsave")){
			parseChanges(createChange(obj, prev));
			return;
		}
	});

	on("change:campaign:turnorder", function(obj, prev) {
		if(!obj.get('initiativepage')){
			return;
		}
		if(obj.get("turnorder")){
			parseChanges(createChange(obj, prev));
			return;
		}
		// if(!obj || !prev){
		// 	return;
		// }
		// if(){
		// 	updateHandout(obj, prev);
		// 	return;
		// }
	});

	//turning on or off the tracker make sure the border fade nicely
	on("change:campaign:initiativepage",function(c){
		c.get('initiativepage') ? turnorderOn(c) : turnorderOff();
	});

	function createChange(obj=false, prev=false){
		return new Changed(obj,prev);
	}

	function parseChanges(changed){
		//change the Character handouts
		if(changed.what === "hp" || changed.what === "ds"){
			let charChanged = changed.chars.find(char => char.hasChanged === true); 
			let handoutSuffix = `PC${charChanged.myRank}`;
			let handoutContent = charContent(charChanged);
			rewriteHandout(handoutContent,handoutSuffix);
		}

		//change the main overlay handout
		if(changed.what === "init"){
			let handoutSuffix = `Init`
			let handoutContent = initContent(changed.initHistory);
			let handout;
			[handoutContent,handoutSuffix,handout] = rewriteHandout(handoutContent,handoutSuffix,true);
			initCheck(changed.initHistory,handoutContent,handout);
		}
	};

	function rewriteHandout(handoutContent,handoutSuffix,callback){
		handoutContent = handoutWrap(`start`) + handoutContent + handoutWrap(`end`);
		if(!handoutSuffix || !handoutContent){
			return;
		}
		let handout = getHandout(handoutSuffix);
		if(callback === true){
			return [handoutContent,handoutSuffix,handout];
		}
		else{
			handout.set('notes',handoutContent);
		}
	}

	function initCheck(inits,handoutContNew,handout){
		handout.get('notes', function(handoutContOld){
			if(!_.isNull(handoutContOld)){
				setTimeout(function(){
					let storedInits = handoutContOld.match(/player[0-9]/g);
					if(inits[0] === inits[1]){
						return;
					}
					if(storedInits[0] != `player${inits[1]}`){
						let i=0;
						handoutContNew = handoutContNew.replace(/player[0-9]/g, match => ++i === 2 ? `${storedInits[0]}` : match);
						handout.set('notes',handoutContNew);   
						return; 
					}                    
				},0);
			}
		});
		handout.set('notes',handoutContNew);
	}

	function turnorderOn(c){
		let changed = createChange(c)
		let handout = getHandout(`Init`);
		handout.get('notes', function(handoutContent){
			if(!_.isNull(handoutContent)){
				setTimeout(function(){
					let storedInits = handoutContent.match(/player[0-9]/g);
					if(storedInits[0] != `player${changed.initHistory[0]}`){
						let i=0;
						handoutContent = handoutContent.replace(/player[0-9]/g, match => ++i === 1 ? `player${changed.initHistory[0]}` : match);
						i=0;
						handoutContent = handoutContent.replace(/player[0-9]/g, match => ++i === 2 ? `player0` : match);
						handout.set('notes',handoutContent);    
					}                    
				},0);
			}
		});
	};

	function turnorderOff(){
		log("turn order hidden")
		let handout = getHandout(`Init`);
		handout.get('notes', function(handoutContent){
			if(!_.isNull(handoutContent)){
				setTimeout(function(){
					let storedInits = handoutContent.match(/player[0-9]/g);
					log(storedInits);
					if(storedInits[0] != "player0"){
						let i=0;
						handoutContent = handoutContent.replace(/player[0-9]/g, match => ++i === 1 ? `player0` : match);
						log(handoutContent);
						i=0;
						handoutContent = handoutContent.replace(/player[0-9]/g, match => ++i === 2 ? storedInits[0] : match);
						log(handoutContent);
						handout.set('notes',handoutContent);    
					}                    
				},0);
			}
		});
	};

	function handoutWrap(side){
		if(side === `start`){
			return `<div class="infoHandout cast${ids.length+1}" style="height:1080px; width:1920px;">`;
		}
		if(side === `end`){
			return `</div>`;
		}
		return ``;
	}

	function initContent([now,old]){
		let initContent = ``;
		initContent += `<div class="initBorder initNew player${now}"></div>`
		initContent += `<div class="initBorder initOld player${old}" style="opacity:0;"></div>`
		return initContent;
	}

	function charContent(char) {

		let name = `<p class="name player${char.myRank}" style="display:block">${char.name}</p>`;
		let pushCSS = `height:100%;`;
		let flexCSS = `height:100%; display:inline-block; background-color: rgb(200,0,0);`;
		let stateClass = "";
		let hpContent = ``;
		let dmgfloat = ``;
		//are we inc or dec (or none)?
		if (char.changedHP && char.hpNew < char.hpOld) {
			stateClass = "dec";
		}
		else if (char.changedHP && char.hpNew > char.hpOld) {
			stateClass = "inc";
		}
		else {
			stateClass = "none";
		}
		//dmg floaties
		if (char.changedHP) {
			dmgfloat = char.hpDeltaTrue < 0 ? `-` : `+`;
			dmgfloat += Math.abs(char.hpDeltaTrue).toString();
			dmgfloat = `<div class="player${char.myRank} dmgpos ${stateClass}" style="height:0px; text-align:right; width: ${toPerCSS(char.hpOldPercent)}"><p class="player${char.myRank} dmgfloat ${stateClass}" style="opacity:0; font-family: 'Times New Roman', Times, serif; font-size:${Math.min(Math.abs(char.hpDeltaTrue) / 3, 50) + 25}px;">${dmgfloat}</p></div>`;
		}
		//if HP has decreaesed
		if (char.changedHP && char.hpNew < char.hpOld) {
			pushCSS += ` display:inline-block; width:0px;`;
			flexCSS += ` min-width: ${toPerCSS(char.hpNewPercent)}; max-width: ${toPerCSS(char.hpOldPercent)};`;
		} //if HP has increased
		else if (char.changedHP && char.hpNew > char.hpOld) {
			pushCSS += ` display:inline-block; width:500px;`;
			flexCSS += ` min-width: ${toPerCSS(char.hpOldPercent)}; max-width: ${toPerCSS(char.hpNewPercent)};`;
		}
		else { //if HP the same (or not changed)
			pushCSS += ` display:none;`;
			flexCSS += ` width: ${toPerCSS(char.hpNewPercent)};`;
		}
		let hpBarPush = `<div class="player${char.myRank} hpBarPush ${stateClass}" style="${pushCSS}"></div>`;
		let hpBarFlex = `<div class="player${char.myRank} hpBarFlex ${stateClass}" style="${flexCSS}">${hpBarPush}</div>`;
		let hpBarMax = `<div class="player${char.myRank} hpBarMax ${stateClass}" style="width:500px; height:50px; background-color:#f1f1f1;">${dmgfloat}${hpBarFlex}</div>`;
		hpContent += `${name}${hpBarMax}<br>`;

		return hpContent;
	}

	function toPerCSS(num){
		num = Math.abs(num);
		num = Math.round(num);
		num = num.toString();
		num += `%`
		return num;
	};

	function getHandout(suffix) {
		let handout = filterObjs(function(o){
			return ('handout' === o.get('type') && `${scriptIndex.name}${suffix}` === o.get('name') && false === o.get('archived'));
		})[0];
		if(handout) {
			return handout;
		} 
        return createHandout(suffix);
    };

	function createHandout(suffix) {
        let handout = createObj('handout',{name: `${scriptIndex.name}${suffix}`});
		handout.set('notes', '');
        return handout;
	};

	// on("chat:message", function(msg) {

	// 	if (msg.type==="api" && msg.content.toLowerCase().indexOf("!tipPost")==0){
	// 		Chandler(msg);
	// 		return;
	// 	}
	// });

	// //API CHAT HANDLER
	// function Chandler(msg){
	// 	let args = msg.content.split(/\s+/);

	// 	let charid = args[1];

	// 	//MAIN STUFF HERE

	// };

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