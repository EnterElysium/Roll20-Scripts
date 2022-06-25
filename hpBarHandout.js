const hpBarHandout = (function() {	

	const scriptIndex = {"name":"hpBarHandout","version":"v0.01",};

	const ids = ["-M7tTaiSvMFgbPpZj1r9","-M7tTUatxOb1X7MlJsJ3","-MZ4y5hOAiTvIxPaR3dl"];

	class CharHP{
		constructor(id,charNew,charOld){
			this._id = id;
			this._name = getObj('character', id).get("name");
			if (id == charNew.get("characterid")){
				this._changed = true;
				this._hpNewMax = CharHP.sanitiseHP(charNew.get("max"));
				this._hpNew = CharHP.capBounds(CharHP.sanitiseHP(charNew.get("current")),this.hpNewMax);
				this._hpOldMax = CharHP.sanitiseHP(charOld["max"]);
				this._hpOld = CharHP.capBounds(CharHP.sanitiseHP(charOld["current"]),this.hpOldMax);
			}
			else{
				this._changed = false;
				let attrHP = findObjs({
					_characterid: id,
					_type: "attribute",
					name: "hp"
				})[0];
				this._hpNewMax = CharHP.sanitiseHP(attrHP.get("max"));
				this._hpNew = CharHP.capBounds(CharHP.sanitiseHP(attrHP.get("current")),this.hpNewMax);
				this._hpOldMax = this.hpNewMax;
				this._hpOld = this.hpNew;
			}
		}
		get id() {
			return this._id;
		}
		get name() {
			return this._name;
		}
		get changed() {
			return this._changed;
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
		get hpDeltaPercent() {
			return this.hpNewPercent-this.hpOldPercent;
		}
		get hpNewPercent(){
			return 100*this.hpNew/this.hpNewMax;
		}
		get hpOldPercent(){
			return 100*this.hpOld/this.hpOldMax;
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
			updateHPs(obj, prev);
		}
	});

	function updateHPs(obj, prev){
		let charHPs = [];
		log(ids);
		for (let id of ids){
			let charHP = new CharHP(id,obj,prev);
			charHPs.push(charHP);
		}
		log(charHPs);
		let handoutContent = "";
		for (let charHP of charHPs){
			let name = `${charHP.name}<br>`;
			let hpBarInner;
			let hpBarDelta = "";
			//if HP has decreaesed
			if(charHP.changed && charHP.hpNew < charHP.hpOld){
				hpBarInner = `<div class="hpBarIn" style="display:inline-block; height: 100%; width: ${toPerCSS(charHP.hpNewPercent)};"></div>`;
				hpBarDelta = `<div class="hpBarDelta hpdec" style="display:inline-block; height: 100%; width: ${toPerCSS(charHP.hpDeltaPercent)};"></div>`;
			} //if HP has increased
			else if(charHP.changed && charHP.hpNew > charHP.hpOld){
				hpBarInner = `<div class="hpBarIn" style="display:inline-block; height: 100%; width: ${toPerCSS(charHP.hpOldPercent)};"></div>`;
				hpBarDelta = `<div class="hpBarDelta hpinc" style="display:inline-block; height: 100%; width: ${toPerCSS(charHP.hpDeltaPercent)};"></div>`;
				
			}
			else{ //if HP the same (or not changed)
				hpBarInner = `<div class="hpBarIn" style="display:inline-block; height: 100%; width: ${toPerCSS(charHP.hpOldPercent)};"></div>`;
			}
			let hpBarCur = `<div class="hpBarCur delta${charHP.changed}" style="font-size: 50px; display:inline; background-color:red;">${hpBarInner}${hpBarDelta}</div>`;
			let hpBarMax = `<div class="hpBarMax" style="height: 50px; width: 100%;">${hpBarCur}</div><br>`;
			handoutContent += `${name}${hpBarMax}<br>`;
		}
		let handout = getHandout();
		handout.set('notes',handoutContent);
	};

	function toPerCSS(num){
		num = Math.abs(num);
		//num = Math.round(num);
		//num = num.toString();
		num += `%`
		return num;
	};

	function content(charHP){
		let content;
		content = `${charHP.hpNew}/${charHP.hpNewMax}`
		return content;
	};

	function makeCharSection(){
		
	};

	function makeBar(){

	};

	function getHandout() {
		let handout = filterObjs(function(o){
			return ('handout' === o.get('type') && scriptIndex.name === o.get('name') && false === o.get('archived'));
		})[0];
		if(handout) {
			return handout;
		} 
        return createHandout();
    };

	function createHandout() {
        let handout = createObj('handout',{name: scriptIndex.name});
		handout.set('notes', '<h3>Log</h3>');
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