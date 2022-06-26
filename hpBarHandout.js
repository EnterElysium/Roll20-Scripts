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
		let handoutContent = `<div class="hpHandout cast${charHPs.length+1}" style="height:1080px;	width:1920px;">`;
		for (let charHP of charHPs){
			let charNum = `pc${charHPs.indexOf(charHP)+1}`;
			let name = `<p class="name ${charNum}" style="display:block">${charHP.name}</p>`;
			let pushCSS = `height:100%;`;
			let flexCSS = `height:100%; display:inline-block; background-color: rgb(200,0,0);`;
			let stateClass = "";
			let dmgfloat = ``;
			//are we inc or dec (or none)?
			if(charHP.changed && charHP.hpNew < charHP.hpOld){
				stateClass = "dec";
			}
			else if(charHP.changed && charHP.hpNew > charHP.hpOld){
				stateClass = "inc";
			}
			else{
				stateClass = "none";
			}
			//dmg floaties
			if (charHP.changed){
				dmgfloat = charHP.hpDelta < 0 ? `-` : `+`;
				dmgfloat += Math.abs(charHP.hpDelta).toString();
				dmgfloat = `<div class="${charNum} dmgpos ${stateClass}" style="height:0px; text-align:right; width: ${toPerCSS(charHP.hpOldPercent)}"><p class="${charNum} dmgfloat ${stateClass}">${dmgfloat}</p></div>`
			}
			//if HP has decreaesed
			if(charHP.changed && charHP.hpNew < charHP.hpOld){
				pushCSS += ` display:inline-block; width:0px;`;
				flexCSS += ` min-width: ${toPerCSS(charHP.hpNewPercent)}; max-width: ${toPerCSS(charHP.hpOldPercent)};`;
			} //if HP has increased
			else if(charHP.changed && charHP.hpNew > charHP.hpOld){
				pushCSS += ` display:inline-block; width:500px;`;
				flexCSS += ` min-width: ${toPerCSS(charHP.hpOldPercent)}; max-width: ${toPerCSS(charHP.hpNewPercent)};`;
			}
			else{ //if HP the same (or not changed)
				pushCSS += ` display:none;`;
				flexCSS += ` width: ${toPerCSS(charHP.hpNewPercent)};`;
			}
			let hpBarPush = `<div class="${charNum} hpBarPush ${stateClass}" style="${pushCSS}"></div>`;
			let hpBarFlex = `<div class="${charNum} hpBarFlex ${stateClass}" style="${flexCSS}">${hpBarPush}</div>`;
			let hpBarMax = `<div class="${charNum} hpBarMax ${stateClass}" style="width:500px; height:50px; background-color:#f1f1f1;">${dmgfloat}${hpBarFlex}</div>`;
			handoutContent += `${name}${hpBarMax}<br>`;
		}
		handoutContent += `</div>`;
		let handout = getHandout();
		handout.set('notes',handoutContent);
	};

	function toPerCSS(num){
		num = Math.abs(num);
		num = Math.round(num);
		num = num.toString();
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