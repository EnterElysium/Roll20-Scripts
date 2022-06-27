const hpBarHandout = (function() {	

	const scriptIndex = {"name":"StreamInfo","version":"v0.01",};

	const ids = ["-M7tTaiSvMFgbPpZj1r9","-M7tTUatxOb1X7MlJsJ3","-MZ4y5hOAiTvIxPaR3dl"];

	class Changed{
		constructor(obj, prev){
			this._chars = [];
			this._what = false;
			for (let id of ids) {
				let char = new Char(id, obj, prev);
				if(char.changed){
					this._who = id;
					char.changedHP ? this._what = "hp" : false;
					char.changedDS ? this._what = "ds" : false;
					char.changedInit ? this._what = "init" : false;
				}
				this._chars.push(char);
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
				let dss =findObjs({
					_characterid: id,
					_type:"attribute",
					name:`deathsave_succ${i}`
				})[0]
				let dsf =findObjs({
					_characterid: id,
					_type:"attribute",
					name:`deathsave_fail${i}`
				})[0]
				if(charNew && id == charNew.get("characterid") && charNew.get("name") === `deathsave_succ${i}`){
					dss = [charNew.get(`current`),charOld[`current`]];
					this._dsNewSucc += !!dss[0] ? 1 : 0;
					this._dsOldSucc += !!dss[1] ? 1 : 0;
					this._changedDS = true;
				}
				else{
					dss.get("current")
					this._dsNewSucc += !!dss ? 1 : 0;
					this._dsOldSucc += !!dss ? 1 : 0;
				}
				if(charNew && id == charNew.get("characterid") && charNew.get("name") === `deathsave_fail${i}`){
					dsf = [charNew.get(`current`),charOld[`current`]];
					this._dsNewFail += !!dsf[0] ? 1 : 0;
					this._dsOldFail += !!dsf[1] ? 1 : 0;
					this._changedDS = true;
				}
				else{
					dsf.get("current")
					this._dsNewFail += !!dsf ? 1 : 0;
					this._dsOldFail += !!dsf ? 1 : 0;
				}
			}
			//initiative construction
			this._changedInit = false;
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
		get changed() {
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
			updateHandout(obj, prev);
			return;
		}
		if(obj.get("name").toLowerCase().includes("deathsave") && prev["name"].toLowerCase().includes("deathsave")){
			updateHandout(obj, prev);
			return;
		}
	});

	on("change:campaign:turnorder", function(obj, prev) {
		if(!obj.get('initiativepage')){
			return;
		}
		else{

		}
		log(obj);
		log(prev);
		// if(!obj || !prev){
		// 	return;
		// }
		// if(){
		// 	updateHandout(obj, prev);
		// 	return;
		// }
	});

	function updateHandout(obj, prev){
		let changed= new Changed(obj,prev);
		let chars = changed.chars;
		log(changed);
		let handoutContent = `<div class="hpHandout cast${chars.length+1}" style="height:1080px;	width:1920px;">`;
		handoutContent += hpContent(chars);
		handoutContent += turnOutlineContent(chars);
		handoutContent += `</div>`;
		let handout = getHandout();
		handout.set('notes',handoutContent);
	};

	function hpContent(chars) {
		let hpContent = ``;
		for (let char of chars) {
			let charNum = `pc${chars.indexOf(char) + 1}`;
			let name = `<p class="name ${charNum}" style="display:block">${char.name}</p>`;
			let pushCSS = `height:100%;`;
			let flexCSS = `height:100%; display:inline-block; background-color: rgb(200,0,0);`;
			let stateClass = "";
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
				dmgfloat = `<div class="${charNum} dmgpos ${stateClass}" style="height:0px; text-align:right; width: ${toPerCSS(char.hpOldPercent)}"><p class="${charNum} dmgfloat ${stateClass}" style="opacity:0; font-family: 'Times New Roman', Times, serif; font-size:${Math.min(Math.abs(char.hpDeltaTrue) / 3, 50) + 25}px;">${dmgfloat}</p></div>`;
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
			let hpBarPush = `<div class="${charNum} hpBarPush ${stateClass}" style="${pushCSS}"></div>`;
			let hpBarFlex = `<div class="${charNum} hpBarFlex ${stateClass}" style="${flexCSS}">${hpBarPush}</div>`;
			let hpBarMax = `<div class="${charNum} hpBarMax ${stateClass}" style="width:500px; height:50px; background-color:#f1f1f1;">${dmgfloat}${hpBarFlex}</div>`;
			hpContent += `${name}${hpBarMax}<br>`;
		}
		return hpContent;
	}

	function turnOutlineContent(chars){
		return `<div class=""`;
		//background-image:url(https://s3.amazonaws.com/files.d20.io/images/291777366/3YbIbemHbFxh1z9EC5J6zA/max.png);
		//width:448px;
		//height:249px;
	}

	function toPerCSS(num){
		num = Math.abs(num);
		num = Math.round(num);
		num = num.toString();
		num += `%`
		return num;
	};

	function getHandout() {
		let handout = filterObjs(function(o){
			return ('handout' === o.get('type') && `${scriptIndex.name}` === o.get('name') && false === o.get('archived'));
		})[0];
		if(handout) {
			return handout;
		} 
        return createHandout();
    };

	function createHandout() {
        let handout = createObj('handout',{name: `${scriptIndex.name}`});
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