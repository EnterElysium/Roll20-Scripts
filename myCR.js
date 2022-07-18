const mycr = (function() {	

	const scriptIndex = {"name":"My CR","version":"v0.01",};

	//eCore required
	function eCoreValid(){
		if(typeof eCore == "undefined" || eCore === null){
			log(`${scriptIndex.name} ${scriptIndex.version} failed. Could not find eCore library script (required dependency)`)
			return false;
		}
		else{
			return true;
		}
	}

	class CSS{
		static container = `position: relative; border:1px solid #333; background-color: #fff; padding:5px 6px 6px 6px;margin: -16px -6px 0px -6px;z-index:11;`;
		static text = `font-size:12px;`;
		static bullet = `font-family: Pictos; padding-right: 0.5em;`
		static btnInvis = `vertical-align: middle;color: #000; background-color: transparent; padding: 0; border: none; overflow: hidden; text-overflow: ellipsis; width:100%; margin: 0px;`;
		static icon(type){
			let char;
			let col = `color: `
			switch(type){
				case `3`:
				case `yes`:
				case `check`:  char = `3`; col += `darkgreen`; break;
				case `s`:
				case `detected`:
				case `detect`: char = `s`; col += `darkgreen`; break;
				case `alert`:
				default: char = `!`; col += `darkred`; break;
			}
			return `<span style="${CSS.bullet}${col}">${char}</span>`
		}
	}

	class HTMLbuilder{
		//CONSTRUCT MESSAGE
		static msgInline(txt,icon=`detect`){
			let html = ``
			html += `<div class="whohidder" style="${CSS.container}">`
			html += CSS.icon(icon)
			html += `<span style="${CSS.text}">`
			html += txt
			html += `</span>`
			html += `</div>`
			return html
		}
	}

	/*
	CR Factors
	---
	AC
	HP
	TO HIT
	Save DC
	Dmg per rnd
	---
	Resists
	Immunes
	Flying
	---
	Abilites
	*/

	class Monster{
		_id;
		get id() {
			return this._id;
		}
		set id(value) {
			this._id = value;
		}
		_name;
		get name() {
			return this._name;
		}
		set name(value) {
			this._name = value;
		}
		_ac;
		get ac() {
			return this._ac;
		}
		set ac(value) {
			this._ac = value;
		}
		_hp;
		get hp() {
			return this._hp;
		}
		set hp(value) {
			this._hp = value;
		}
		_hit;
		get hit() {
			return this._hit;
		}
		set hit(value) {
			this._hit = value;
		}
		_dc;
		get dc() {
			return this._dc;
		}
		set dc(value) {
			this._dc = value;
		}
		_dmgR;
		get dmgR() {
			return this._dmgR;
		}
		set dmgR(value) {
			this._dmgR = value;
		}
		constructor(id){
			let character = eCore.get.character(id,`character`)
			this._id = id;
			this._name = character.get("name")
			let npc = this.attr(`npc`)
			if(npc != 1){
				let errormsg = HTMLbuilder.msgInline(`${this.name} is not an NPC. Cannot calulate CR.`,`alert`)
				eCore.chat(errormsg,`w`,`gm`,`noarchive`,scriptIndex.name)
				return;
			}
			log(npc)
			this._ac = this.attr(`npc_ac`)
			log(this.ac)
			this._hp = this.attr(`hp`,`max`)
			log(this.hp)
			log(`end of current myCR`)
			//continue from here
			log(this)
		}
		attr(name,type=`current`){
			let attr = findObjs({
				_characterid: this.id,
				_type: "attribute",
				name: name,
			})[0];
			if(attr && typeof attr.get === "function" && attr.get(type)){
				return attr.get(type)
			}
			return false;
		}
		static calcCR(id){
			let npc = new Monster(id)
		}
	}

	on("chat:message", function(msg){
		if(!eCoreValid()){return}
		if(!playerIsGM(msg.playerid)){
			return;
		}
		let args = eCore.msgProcess.adv(msg,`mycr`);
		if(!args){
			return;
		}
		let id = eCore.msg.compareAdv(args,`charid`)
		if(id && id.length > 0){
			Monster.calcCR(id[0])
		}
	});

	return scriptIndex;
})();