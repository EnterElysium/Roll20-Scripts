const StreamInfo = (function() {	
	/*
	High

	Medium
	healBot healing doesn't cause bar to change (no api causing api) need to make actual call

	Low
	Max hp inc causes a 0hp floaty
	Max hp dec doesn't call anything - bar stays incorrect
	*/

	const scriptIndex = {"name":"StreamInfo","version":"v0.01","apiHP":apiHP,"apiHPandTemp":apiHPandTemp,"apiIDs":apiIDs,};

	const ids = ["-M7tTaiSvMFgbPpZj1r9","-M7tTUatxOb1X7MlJsJ3","-MZ4y5hOAiTvIxPaR3dl"];
	const playerIDs = ["-M7rzq7dnxtvqatHo_a4","-M7rzsfu4FtWQIDkj01K","-MZ4y9Vys9_ZQofWB4o9"];
	// playersStored = ["-M7rzq7dnxtvqatHo_a4","-M7rzsfu4FtWQIDkj01K","-MZ4y9Vys9_ZQofWB4o9"];
	// const testplayer = ["-MTq8lHfzjgUC_8GLekj"];
	// const gmID = ["-M7raV5XUzZQgU9bPw7A"];
	const ignoreMusic = [`CriticalHit`];

	class Changed{
		constructor(obj=false, prev=false, msg=false){
			this._chars = [];
			this._what = false;
			if(obj && typeof obj.get === "function" && obj.get("turnorder")){
				this._what = "init";
				this._initHistory = [0,0];
				//get whose turn it is
				if(obj && obj.get("turnorder") && JSON.parse(obj.get("turnorder")).length > 0){
					let tokID = JSON.parse(obj.get("turnorder"))[0].id;
					let token = getObj('graphic', tokID);Max
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
				if(obj && typeof obj.get === "function" && obj.get("type") === "jukeboxtrack" && obj.get("playing") === true){
					this._music = obj.get("title");
					this._what = `music`;
				}
				else{
					this._music = false;
				}
				//set individual characters
				for (let id of ids) {
					let char = new Char(id, obj, prev, msg);
					if(char.hasChanged){
						this._who = id;
						//this is legacy code
						char.changedHP ? this._what = "hp" : false;
						char.changedDS ? this._what = "ds" : false;
						char.changedDice ? this._what = "dice" : false;
						char.changedTempHP ? this._what = "temphp" : false;
						//this is new code
						this._whatArray = [];
						char.changedHP ? this._whatArray.push("hp") : false;
						char.changedDS ? this._whatArray.push("ds") : false;
						char.changedDice ? this._whatArray.push("dice") : false;
						char.changedTempHP ? this._whatArray.push("hp_temp") : false;
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
		get whatArray(){
			return this._whatArray;
		}
		get music(){
			return this._music;
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
		checkChanged(arg){
			if(!Array.isArray(this.whatArray) || this.whatArray.length === 0){
				logger(`checkedChanged had an error that was avoided due to ${this.whatArray} being incorrectly formed`);
				return false;
			}
			else if(Array.isArray(arg) && arg.length > 0){ //OR check
				return arg.some(e => this.whatArray.includes(e))
			}
			else{
				return this.whatArray.includes(arg);
			}
		}
	}

	class Char{
		constructor(id=false,charNew=false,charOld=false,msg=false){
			let fromArray = Array.isArray(charNew) && Array.isArray(charOld) ? true : false;
			if(playerIsGM(msg && msg.playerid)){
				this._id = "gm";
				this._pid = "gm";
				this._rank = [0,ids.length];
				this._name = "GM";
				//hp construction
				this._changedHP = false;
				this._hpDeltaTrue = 0;
				this._hpNewMax = 1;
				this._hpNew = 1;
				this._hpOldMax = 1;
				this._hpOld = 1;
				/*default to conscious*/
				this._ko = Char.koState(this.hpNew,this.hpOld);
				//deathsave construction
				this._changedDS = false;
				this._dsNewSucc = 0;
				this._dsNewFail = 0;
				this._dsOldSucc = 0;
				this._dsOldFail = 0;
				//dice construction
				this._changedDice = false;
				this._dice = [];
				if (msg && (msg.inlinerolls || msg.type === "rollresult") && (msg.playerid == this.pid || playerIsGM(msg.playerid))){
					let d = Char.extractDice(msg);
					if(d && Array.isArray(d) && d.length > 0){
						this._dice = d;
						if(msg.type == "whisper"){
							this.obfuscateDice();
						}
						this._changedDice = true;
					}
				}
			}
			else{
				this._id = id;
				this._pid = playerIDs[ids.indexOf(id)];
				this._rank = [ids.indexOf(id)+1,ids.length];
				this._name = getObj('character', id).get("name");
				//hp construction
				if (charNew && typeof charNew.get === "function" && charNew.get("name") === "hp" && id == charNew.get("characterid")){
					this._changedHP = true;
					this._hpDeltaTrue = Char.sanitiseHP(charNew.get("current")) - Math.max(Char.sanitiseHP(charOld["current"]),0);
					//bound reset ignore
					if(Char.sanitiseHP(charNew.get("current")) <= 0 && Char.sanitiseHP(charOld["current"]) <= 0){
						this._changedHP = false;
					}
					else if(Char.sanitiseHP(charNew.get("current")) >= Char.sanitiseHP(charNew.get("max")) && Char.sanitiseHP(charOld["current"]) >= Char.sanitiseHP(charNew.get("max"))){
						this._changedHP = false;
					}
					this._hpNewMax = Char.sanitiseHP(charNew.get("max"));
					this._hpNew = Char.capBounds(Char.sanitiseHP(charNew.get("current")),this.hpNewMax);
					this._hpOldMax = Char.sanitiseHP(charOld["max"]);
					this._hpOld = Char.capBounds(Char.sanitiseHP(charOld["current"]),this.hpOldMax);
				}
				else if(charNew && typeof charNew.get === "undefined" && !fromArray && charNew._characterid === id && charNew.name === `hp`){
					logger(`firing a pass from external script`);
					this._changedHP = true;
					this._hpDeltaTrue = Char.sanitiseHP(charNew.current) - Char.sanitiseHP(charOld.current);
					//bound reset ignore
					if(Char.sanitiseHP(charNew.current) <= 0 && Char.sanitiseHP(charOld.current) <= 0){
						this._changedHP = false;
					}
					else if(Char.sanitiseHP(charNew.current) >= Char.sanitiseHP(charNew.max) && Char.sanitiseHP(charOld.current) >= Char.sanitiseHP(charNew.max)){
						this._changedHP = false;
					}
					else if(this._hpDeltaTrue == 0){
						this._changedHP = false;
					}
					this._hpNewMax = Char.sanitiseHP(charNew.max);
					this._hpNew = Char.capBounds(Char.sanitiseHP(charNew.current),this.hpNewMax);
					this._hpOldMax = Char.sanitiseHP(charOld.max);
					this._hpOld = Char.capBounds(Char.sanitiseHP(charOld.current),this.hpOldMax);
				}
				else if(charNew && typeof charNew.get === "undefined" && fromArray && charNew.some(e => e._characterid === id) && charNew.some(e => e.name === `hp`)){
					let charNewE = charNew.find(e => e.name === `hp`);
					let charOldE = charOld.find(e => e.name === `hp`);
					logger(`firing a pass from external script passing an array`);
					this._changedHP = true;
					this._hpDeltaTrue = Char.sanitiseHP(charNewE.current) - Char.sanitiseHP(charOldE.current);
					//bound reset ignore
					if(Char.sanitiseHP(charNewE.current) <= 0 && Char.sanitiseHP(charOldE.current) <= 0){
						this._changedHP = false;
					}
					else if(Char.sanitiseHP(charNewE.current) >= Char.sanitiseHP(charNewE.max) && Char.sanitiseHP(charOldE.current) >= Char.sanitiseHP(charNewE.max)){
						this._changedHP = false;
					}
					this._hpNewMax = Char.sanitiseHP(charNewE.max);
					this._hpNew = Char.capBounds(Char.sanitiseHP(charNewE.current),this.hpNewMax);
					this._hpOldMax = Char.sanitiseHP(charOldE.max);
					this._hpOld = Char.capBounds(Char.sanitiseHP(charOldE.current),this.hpOldMax);
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
				/*Temp HP*/
				if (charNew && typeof charNew.get === "function" && charNew.get("name") === "hp_temp" && id == charNew.get("characterid")){
					this._changedTempHP = true;
					this._tempHPDeltaTrue = Char.sanitiseHP(charNew.get("current")) - Math.max(Char.sanitiseHP(charOld["current"]),0);
					//bound reset ignore
					if(Char.sanitiseHP(charNew.get("current")) <= 0 && Char.sanitiseHP(charOld["current"]) <= 0){
						this._changedTempHP = false;
					}
					this._tempHPNew = Char.sanitiseHP(charNew.get("current"))
					this._tempHPOld = Char.sanitiseHP(charOld["current"])
				}
				else if(charNew && typeof charNew.get === "undefined" && !fromArray && charNew._characterid === id && charNew.name === `hp_temp`){
					logger(`firing a pass from external script`);
					this._changedTempHP = true;
					this._tempHPDeltaTrue = Char.sanitiseHP(charNew.current) - Char.sanitiseHP(charOld.current);
					//bound reset ignore
					if(Char.sanitiseHP(charNew.current) <= 0 && Char.sanitiseHP(charOld.current) <= 0){
						this._changedTempHP = false;
					}
					else if(this._tempHPDeltaTrue == 0){
						this._changedTempHP = false;
					}
					this._tempHPNew = Char.sanitiseHP(charNew.current);
					this._tempHPOld = Char.sanitiseHP(charOld.current);
				}
				else if(charNew && typeof charNew.get === "undefined" && fromArray && charNew.some(e => e._characterid === id) && charNew.some(e => e.name === `hp_temp`)){
					let charNewE = charNew.find(e => e.name === `hp_temp`);
					let charOldE = charOld.find(e => e.name === `hp_temp`);
					logger(`firing a pass from external script passing an array`);
					this._changedTempHP = true;
					this._tempHPDeltaTrue = Char.sanitiseHP(charNewE.current) - Char.sanitiseHP(charOldE.current);
					//bound reset ignore
					if(Char.sanitiseHP(charNewE.current) <= 0 && Char.sanitiseHP(charOldE.current) <= 0){
						this._changedTempHP = false;
					}
					this._tempHPNew = Char.sanitiseHP(charNewE.current);
					this._tempHPOld = Char.sanitiseHP(charOldE.current);
				}
				else{
					this._changedTempHP = false;
					this._tempHPDeltaTrue = 0;
					let attrTempHP = findObjs({
						_characterid: id,
						_type: "attribute",
						name: "hp_temp"
					});
					if(attrTempHP[0] && attrTempHP.length > 0){
						attrTempHP = attrTempHP[0];
						this._tempHPNew = Char.sanitiseHP(attrTempHP.get("current"));
						this._tempHPOld = this.tempHPNew;
					}
					else{
						this._tempHPNew = 0;
						this._tempHPOld = 0;
					}
				}
				/*Unconsciousness*/
				this._ko = Char.koState(this.hpNew,this.hpOld);
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
					if(charNew && typeof charNew.get === "function" && id == charNew.get("characterid") && charNew.get("name") === `deathsave_succ${i}`){
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
					if(charNew && typeof charNew.get === "function" && id == charNew.get("characterid") && charNew.get("name") === `deathsave_fail${i}`){
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
				//dice construction
				this._changedDice = false;
				this._dice = [];
				if (msg && (Char.extractChar(msg) == this.id || msg.playerid == this.pid )){ //this currently only gets rolls with the character name in them, need to sort non-sheet rolls
					let d = Char.extractDice(msg);
					if(d && Array.isArray(d) && d.length > 0){
						this._dice = d;
						if(msg.type == "whisper"){
							this.obfuscateDice();
						}
						this._changedDice = true;
					}
				}
			}
		}
		get id() {
			return this._id;
		}
		get pid() {
			return this._pid;
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
		get changedTempHP() {
			return this._changedTempHP;
		}
		get tempHPNew() {
			return this._tempHPNew;
		}
		get tempHPOld() {
			return this._tempHPOld;
		}
		get tempHPDelta() {
			return this.tempHPNew-this.tempHPOld;
		}
		get tempHPDeltaTrue() {
			return this._tempHPDeltaTrue;
		}
		get tempHPDeltaPercent() {
			return this.tempHPNewPercent-this.tempHPOldPercent;
		}
		get tempHPNewPercent(){
			return 100*this.tempHPNew/this.hpNewMax;
		}
		get tempHPOldPercent(){
			return 100*this.tempHPOld/this.hpOldMax;
		}
		get ko(){
			return this._ko;
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
		get dice() {
			return this._dice;
		}
		get changedDice() {
			return this._changedDice;
		}
		get hasChanged() {
			if(this.changedHP || this.changedDS || this.changedInit || this.changedDice || this.changedTempHP){
				return true;
			}
			return false;
		}
		get dmgTaken(){
			return this.hpDeltaTrue+this.tempHPDeltaTrue;
		}
		obfuscateDice(){
			let diceObfuscated = [];
			let max = Math.ceil(this.dice.length*1.3);
			let min = Math.ceil(this.dice.length/3);
			let lenObfuscated = Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
			for(let d = 1;d<=lenObfuscated;d++){
				diceObfuscated.push("?");
			};
			this._dice = diceObfuscated;
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
		static extractDice(msg){
			if(msg.inlinerolls){
				let rollData = libInline.getRollData(msg.inlinerolls);
				let diceList = [];
				for (let d of rollData){
					if(d.dice){
						let i = d.getDice("included");
						diceList.push(i);
					}
				}
				diceList = _.flatten(diceList);
				return diceList;
			}
			else if(msg.type === "rollresult"){
				let rollData = JSON.parse(msg.content).rolls[0].results;
				let diceList = [];
				for (let d of rollData){
					if(!d.d){
						diceList.push(d.v);
					}
				}
				return diceList;
			};
			return false;
		};
		//get character id from msg
		static extractChar(msg,returnType){
			if(!msg || !msg.content){
				return false;
			}
			let msgDupe = _.clone(msg);
			let charName;
			msgDupe.content.replace(/charname=(.+?)$/,(match,charname)=>{
				charName = charname;
			});
			if(!charName){
				return false;
			}
			charName = charName.replace("}}","");
			let character = findObjs({
				type: "character",
				name: charName,
			})[0];
			if(character){
				switch(returnType){
					case "character": return character;
					case "name": return character.get("name");
					case "id": return character.id;
					default: return character.id;
				};
			};
			return false;
		};
		static koState(hpNew=1,hpOld=1){
			if(hpNew <= 0 && hpOld > 0){
				return "godown";
			}
			else if(hpNew > 0 && hpOld <= 0){
				return "getup";
			}
			else if(hpNew <= 0){
				return "unconscious";
			}
			else{
				return "conscious";
			};
		}
	};

    on('chat:message', function(msg) {
		if(msg && (msg.inlinerolls || msg.type === "rollresult")){
			parseChanges(createChange(false, false, msg));
			return;
		}
    });

	on("change:attribute", function(obj, prev) {
		if(!obj || !prev){
			return;
		}
		if(obj.get("name") === "hp" && prev["name"] === "hp"){
			parseChanges(createChange(obj, prev));
			return;
		}
		if(obj.get("name") === "hp_temp" && prev["name"] === "hp_temp"){
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
		else if(obj.get("turnorder")){
			parseChanges(createChange(obj, prev));
			return;
		}
	});

	//turning on or off the tracker make sure the border fade nicely
	on("change:campaign:initiativepage",function(c){
		c.get('initiativepage') ? turnorderOn(c) : turnorderOff();
	});

	//playing new track
	on("change:jukeboxtrack:playing", function(obj) { 
        if(obj && obj.get("playing") === true){
			if(ignoreMusic.indexOf(obj.get("title")) >= 0){
				return;
			}  
			else{
				parseChanges(createChange(obj, null));
			}
		}
    });

	function createChange(obj=false, prev=false, msg=false){
		return new Changed(obj,prev,msg);
	}

	function parseChanges(changed){
		//change the Character handouts
		if(changed.checkChanged([`hp`,`ds`,`dice`,`hp_temp`])){
			let charChanged = changed.chars.find(char => char.hasChanged === true); 
			if(!charChanged){
				return;
			}
			let handoutSuffix = `PC${charChanged.myRank}`;
			let handoutContent = charContent(charChanged);
			rewriteHandout(handoutContent,handoutSuffix);
			if(charChanged.ko){
				handoutContent = ``;
				handoutContent += deathFilter(changed);
				let handoutSuffix = `Dead`;
				rewriteHandout(handoutContent,handoutSuffix);
			}
		}

		//change the death overlays and music track
		if(changed.what === "ds" || changed.what === "music"){
			handoutContent = ``;
			handoutContent += deathFilter(changed);
			let handoutSuffix = `Dead`;
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

	function deathFilter(changed){
		//set characters that are dead to dead
		handoutContent = ``;
		let i = 0;
		for (let char of changed.chars){
			//death filter
			let trigger = false;
			let classes = `deathContainer player${char.myRank}`;
			if(char.dsNewFail === 3 && char.hasChanged === false){
				classes += ` dead`;
				trigger = true;
			}
			else if(char.dsNewFail === 3 && char.dsOldFail === 2 && char.hasChanged === true){
				classes += ` die`;
				trigger = true;
			}
			else if(char.dsNewFail < char.dsOldFail && char.dsNewSucc === char.dsOldSucc && char.hasChanged === true){ //undie from deathsaves
				classes += ` undie`;
				trigger = true;
				if(char.dsOldFail === 3 && char.hpNew === 0 || char.dsOldFail === char.dsNewFail && char.hpNew > 0){
					classes += ` undieFirst`;
				}
				else{
					classes += ` undieContinue`;
				}
			}
			else if(char.hpNew > char.hpOld && char.hpOld <= 0 && char.dsNewFail === 3 && char.hasChanged === true){ //undie from healing with dsf still at 3
				classes += ` undie`;
				trigger = true;
				if(char.dsOldFail === 3){
					classes += ` undieFirst`;
				}
			}
			else if(char.dsNewSucc === 3 && char.dsOldSucc === 2 && char.hasChanged === true && char.dsOldFail !== 3){
				classes += ` getup`;
				classes += ` dsfOld${char.dsOldFail}`;
				trigger = true;
			}
			else if(char.ko){
				classes += ` ${char.ko}`;
				trigger = true;
				if(char.ko === "unconscious"){
					classes += ` dsfOld${char.dsOldFail} dsfNew${char.dsNewFail}`;
				}
				else if(char.ko === "getup"){
					classes += ` dsfOld${char.dsOldFail}`;
				}
			}
			
			if(trigger){
				handoutContent += `<div class="${classes}"><div class="deathFilter" style="width: 100%; height: 100%;"></div></div>`;
			}
		}
		//now playing music
		if(changed.what === "music"){
			let musicTitle = changed.music
			if(musicTitle.match(/^ES_/)){
				musicTitle = musicTitle.replace(/^ES_|\s-\s.+$/g,"");
			};
			musicTitle = musicTitle.replace(/^[0-9]+|_/g," ").trim();
			musicTitle = musicTitle.replace(/\sby\s.+$/,"");
			handoutContent += `<div class="dicebox"><div class="jukeboxlayer" style="position: absolute; width: 100%; height: 100%;"><div class="nowplaying" style="opacity: 0;"><span class="musictitle">${musicTitle}</span></div></div></div>`
		}

		return handoutContent;
	}

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
	};

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
	};

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
					if(storedInits[0] != "player0"){
						let i=0;
						handoutContent = handoutContent.replace(/player[0-9]/g, match => ++i === 1 ? `player0` : match);
						i=0;
						handoutContent = handoutContent.replace(/player[0-9]/g, match => ++i === 2 ? storedInits[0] : match);
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
		let hpState = "";
		let charContent = ``;
		let dmgfloat = ``;

		//HP BARS
		//are we inc or dec (or none)?
		if (char.changedHP && char.hpNew < char.hpOld) {
			hpState = "dec";
		}
		else if (char.changedHP && char.hpNew > char.hpOld) {
			hpState = "inc";
		}
		else {
			hpState = "none";
		}
		//dmg floaties
		if ((char.changedHP || char.changedTempHP) && Math.abs(char.dmgTaken) > 0) {
			if(hpState === `none`){
				if (char.changedTempHP && char.tempHPNew < char.tempHPOld) {
					hpState += " tempdec";
				}
				else if (char.changedTempHP && char.tempHPNew > char.tempHPOld) {
					hpState += " tempinc";
				}
			}
			dmgfloat = char.dmgTaken < 0 ? `-` : `+`;
			dmgfloat += Math.abs(char.dmgTaken).toString();
			dmgfloat = `<div class="player${char.myRank} dmgpos ${hpState}" style="height:0px; text-align:right; width: ${toPerCSS(char.hpOldPercent)}"><p class="player${char.myRank} dmgfloat ${hpState}" style="opacity:0; font-family: 'Times New Roman', Times, serif; font-size:${Math.min(Math.abs(char.dmgTaken) / 3, 50) + 25}px;">${dmgfloat}</p></div>`;
		}
		//HP CONSTRUCTION
		//if HP has decreased
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
		let hpBarPush = `<div class="player${char.myRank} hpBarPush ${hpState}" style="${pushCSS}"></div>`;
		let hpBarFlex = `<div class="player${char.myRank} hpBarFlex ${hpState}" style="${flexCSS}">${hpBarPush}</div>`;

		//TEMPHP CONSTRUCTION
		let pushCSStempHP = `height:100%;`;
		let flexCSStempHP = `position:absolute;left:0px;top:70%;height:30%; display:inline-block; background-color: goldenrod;`;
		let tempHPState = "";
		if (char.changedTempHP && char.tempHPNew < char.tempHPOld) {
			tempHPState = "dec";
		}
		else if (char.changedTempHP && char.tempHPNew > char.tempHPOld) {
			tempHPState = "inc";
		}
		else {
			tempHPState = "none";
		}
		//if TempHP has decreaesed
		if (char.changedTempHP && char.tempHPNew < char.tempHPOld) {
			pushCSStempHP += ` display:inline-block; width:0px;`;
			flexCSStempHP += ` min-width: ${toPerCSS(char.tempHPNewPercent)}; max-width: ${toPerCSS(char.tempHPOldPercent)};`;
		} //if TempHP has increased
		else if (char.changedTempHP && char.tempHPNew > char.tempHPOld) {
			pushCSStempHP += ` display:inline-block; width:500px;`;
			flexCSStempHP += ` min-width: ${toPerCSS(char.tempHPOldPercent)}; max-width: ${toPerCSS(char.tempHPNewPercent)};`;
		}
		else { //if TempHP the same (or not changed)
			pushCSStempHP += ` display:none;`;
			flexCSStempHP += ` width: ${toPerCSS(char.tempHPNewPercent)};`;
		}
		let tempHPBarPush = `<div class="player${char.myRank} tempHPBarPush ${tempHPState}" style="${pushCSStempHP}"></div>`;
		let tempHPBarFlex = `<div class="player${char.myRank} tempHPBarFlex ${tempHPState}" style="${flexCSStempHP}">${tempHPBarPush}</div>`;

		//create the deathsaves
		let dsArea = dsConstructor(char);
		//create the dice area
		let diceArea = diceConstructor(char);findObjs

		//make the full hpbar container
		let hpBarMax = `<div class="player${char.myRank} hpBarMax ${hpState}${char.changedHP && char.changedTempHP ? ` delayHP` : ``}" style="position: relative; width:500px; height:50px; background-color:#f1f1f1;">${dmgfloat}${diceArea}${hpBarFlex}${tempHPBarFlex}${dsArea}</div>`;
		charContent += `${name}${hpBarMax}<br>`;
		return charContent;
	}

	function dsConstructor(char){
		//DS AREA
		if(char.changedDS || char.changedHP){
			let dss = ``;
			let dssDec = false;
			for (let i = 1;i<=char.dsNewSucc;i++){
				let dsState = ``;
				char.dsNewSucc > char.dsOldSucc ? dsState = `inc` : false;
				char.dsNewSucc < char.dsOldSucc ? (dsState = `none`,dssDec = true) : false;
				char.dsNewSucc === char.dsOldSucc || i != char.dsNewSucc ? dsState = `none` : false;
				dss += `<div class="player${char.myRank} succ${i} ${dsState}" style="display: inline-block;"></div>`
			}
			if(dssDec === true || (char.dsNewSucc === 0 && char.dsOldSucc === 1)){
				dss += `<div class="player${char.myRank} succ${char.dsOldSucc} dec" style="display: inline-block; opacity:0;"></div>`;
			}
						
			let dsf = ``;
			let dsfDec = false;
			for (let i = 1;i<=char.dsNewFail;i++){
				let dsState = ``;
				char.dsNewFail > char.dsOldFail ? dsState = `inc` : false;
				char.dsNewFail < char.dsOldFail ? (dsState = `none`,dsfDec = true) : false;
				char.dsNewFail === char.dsOldFail || i != char.dsNewFail ? dsState = `none` : false;
				dsf += `<div class="player${char.myRank} fail${i} ${dsState}" style="display: inline-block;"></div>`
			}
			if(dsfDec === true || (char.dsNewFail === 0 && char.dsOldFail === 1)){
				dsf += `<div class="player${char.myRank} fail${char.dsOldFail} dec" style="display: inline-block; opacity:0;"></div>`;
			}
			
			let dsLeft = `<div class="player${char.myRank} successes" style="display: inline-block; width:50%; text-align: left;">${dss}</div>`;
			let dsRight = `<div class="player${char.myRank} fails" style="direction: rtl; display: inline-block; width:50%; text-align: right;">${dsf}</div>`;
			let dsArea = `<div class="player${char.myRank} deathsaves" style="width:500px; white-space:nowrap;">${dsLeft}${dsRight}</div>`;
			
			return `${dsArea}`;
		}
		else{
			return ``;
		}
	};

	function diceConstructor(char){
		//DS AREA
		if(char.changedDice && char.dice && Array.isArray(char.dice) && char.dice.length > 0){
			let diceList = char.dice;
			let dice = ``;
			let index = 0;
			let fontsize = 60/Math.pow((char.dice.length+2),1)+20;
			let dicepool;
			if(char.dice.length <= 2){dicepool = `small`}
			else if(char.dice.length <= 5){dicepool = `med`}
			else if(char.dice.length <= 8){dicepool = `large`}
			else{dicepool = `vlarge`};
			for (let d of char.dice){
				if(d){
					index++;
					let max = 18;
					let min = -18;
					let offsetTop = Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
					let offsetLeft = Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
					let dicenum = `<div class="player${char.myRank} dice dice${index}" style="opacity: 0;">${d}</div>`;
					dice += `<div class="player${char.myRank} dicenumorigin dice${index}" style="text-align: center; position: absolute; top: ${Math.floor(offsetTop/2)}px; left: ${offsetLeft}px">${dicenum}</div>`;
				}
			}			
			let diceOrigin = `<div class="player${char.myRank} diceareaorigin ${dicepool}" style="font-size: ${fontsize}px; position: absolute;">${dice}</div>`;
			let diceArea = `<div class="player${char.myRank} dicearea" style="width:500px; white-space:nowrap;">${diceOrigin}</div>`;
			return `${diceArea}`;
		}
		else{
			return ``;
		}
	};

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
	};

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

	function apiHP(obj,prev){
		parseChanges(createChange(obj,prev));
	};
	function apiHPandTemp(obj,prev,obj2,prev2){
		parseChanges(createChange([obj,obj2],[prev,prev2]));
	};

	function apiIDs(){
		return ids;
	};

	return scriptIndex;
})();