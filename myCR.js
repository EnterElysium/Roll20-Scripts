// eslint-disable-next-line no-unused-vars
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

	class HitDiceFormula{
		_num;
		get num() {
			return this._num;
		}
		set num(value) {
			this._num = value;
		}
		_size;
		get size() {
			return this._size;
		}
		set size(value) {
			this._size = value;
		}
		_hpbonus;
		get hpbonus() {
			return this._hpbonus;
		}
		set hpbonus(value) {
			this._hpbonus = value;
		}
		_conmod;
		get conmod() {
			return this._conmod;
		}
		set conmod(value) {
			this._conmod = value;
		}
		constructor(hpf,conmod){
			log(hpf)
			log(hpf.match(/([0-9]+)(d|D)([0-9]+)\s*(?:(\+|-)\s*([0-9]+))?/))
			let [,num,,size,sign,hpbonus] = hpf.match(/([0-9]+)(d|D)([0-9]+)\s*(?:(\+|-)\s*([0-9]+))?/)
			this._num = this.process(num)
			this._size = this.process(size)
			let s = this.process(sign,false)
			let n = this.process(hpbonus)
			this._hpbonus = s === `-` ? -n : n ;
			this._conmod = this.process(conmod)
		}
		//getters for odds and ends
		get hpCalc(){
			let str = ``;
			let n = 0;
			
			n += this.num*(this.size+1)/2;
			str += `${this.num}d${this.size}`;

			if(this.hpbonus !== false){
				n += this.hpbonus
				str += this.hpbonus < 0 ? this.hpbonus : "+"+this.hpbonus;
			}
			else if(this.conmod !== false){
				n += this.conmod*this.size
				str += this.conmod < 0 ? this.conmod*this.size : "+"+this.conmod*this.size;
			}
			else{
				return false;
			}
			return [Math.floor(n),str];
		}
		process(i,isNum=true){
			if(i === null || null === undefined || null === false){
				return false;
			}
			if(!isNum){return i}
			i = parseInt(i,10)
			return isNaN(i) ? false : i ;
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

	class CR{
		static index = ["0","1/8","1/4","1/2","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30"]
		static hp = [{"cr":"0","start":1,"end":6},
		{"cr":"1/8","start":7,"end":35},
		{"cr":"1/4","start":36,"end":49},
		{"cr":"1/2","start":50,"end":70},
		{"cr":"1","start":71,"end":85},
		{"cr":"2","start":86,"end":100},
		{"cr":"3","start":101,"end":115},
		{"cr":"4","start":116,"end":130},
		{"cr":"5","start":131,"end":145},
		{"cr":"6","start":146,"end":160},
		{"cr":"7","start":161,"end":175},
		{"cr":"8","start":176,"end":190},
		{"cr":"9","start":191,"end":205},
		{"cr":"10","start":206,"end":220},
		{"cr":"11","start":221,"end":235},
		{"cr":"12","start":236,"end":250},
		{"cr":"13","start":251,"end":265},
		{"cr":"14","start":266,"end":280},
		{"cr":"15","start":281,"end":295},
		{"cr":"16","start":296,"end":310},
		{"cr":"17","start":311,"end":325},
		{"cr":"18","start":326,"end":340},
		{"cr":"19","start":341,"end":355},
		{"cr":"20","start":356,"end":400},
		{"cr":"21","start":401,"end":445},
		{"cr":"22","start":446,"end":490},
		{"cr":"23","start":491,"end":535},
		{"cr":"24","start":536,"end":580},
		{"cr":"25","start":581,"end":625},
		{"cr":"26","start":626,"end":670},
		{"cr":"27","start":671,"end":715},
		{"cr":"28","start":716,"end":760},
		{"cr":"29","start":760,"end":805},
		{"cr":"30","start":805,"end":850},]
		static ac = [
			{"cr":"0","value":13},
			{"cr":"1/8","value":13},
			{"cr":"1/4","value":13},
			{"cr":"1/2","value":13},
			{"cr":"1","value":13},
			{"cr":"2","value":13},
			{"cr":"3","value":13},
			{"cr":"4","value":14},
			{"cr":"5","value":15},
			{"cr":"6","value":15},
			{"cr":"7","value":15},
			{"cr":"8","value":16},
			{"cr":"9","value":16},
			{"cr":"10","value":17},
			{"cr":"11","value":17},
			{"cr":"12","value":17},
			{"cr":"13","value":18},
			{"cr":"14","value":18},
			{"cr":"15","value":18},
			{"cr":"16","value":18},
			{"cr":"17","value":19},
			{"cr":"18","value":19},
			{"cr":"19","value":19},
			{"cr":"20","value":19},
			{"cr":"21","value":19},
			{"cr":"22","value":19},
			{"cr":"23","value":19},
			{"cr":"24","value":19},
			{"cr":"25","value":19},
			{"cr":"26","value":19},
			{"cr":"27","value":19},
			{"cr":"28","value":19},
			{"cr":"29","value":19},
			{"cr":"30","value":19},
		]
		static dpr = [
			{"cr":"0","start":0,"end":1},
			{"cr":"1/8","start":2,"end":3},
			{"cr":"1/4","start":4,"end":5},
			{"cr":"1/2","start":6,"end":8},
			{"cr":"1","start":9,"end":14},
			{"cr":"2","start":15,"end":20},
			{"cr":"3","start":21,"end":26},
			{"cr":"4","start":27,"end":32},
			{"cr":"5","start":33,"end":38},
			{"cr":"6","start":39,"end":44},
			{"cr":"7","start":45,"end":50},
			{"cr":"8","start":51,"end":56},
			{"cr":"9","start":57,"end":62},
			{"cr":"10","start":63,"end":68},
			{"cr":"11","start":69,"end":74},
			{"cr":"12","start":75,"end":80},
			{"cr":"13","start":81,"end":86},
			{"cr":"14","start":87,"end":92},
			{"cr":"15","start":93,"end":98},
			{"cr":"16","start":99,"end":104},
			{"cr":"17","start":105,"end":110},
			{"cr":"18","start":111,"end":116},
			{"cr":"19","start":117,"end":122},
			{"cr":"20","start":123,"end":140},
			{"cr":"21","start":141,"end":158},
			{"cr":"22","start":159,"end":176},
			{"cr":"23","start":177,"end":194},
			{"cr":"24","start":195,"end":212},
			{"cr":"25","start":213,"end":230},
			{"cr":"26","start":231,"end":248},
			{"cr":"27","start":249,"end":266},
			{"cr":"28","start":267,"end":284},
			{"cr":"29","start":285,"end":302},
			{"cr":"30","start":303,"end":320},
		]
		static tohit = [
			{"cr":"0","value":3},
			{"cr":"1/8","value":3},
			{"cr":"1/4","value":3},
			{"cr":"1/2","value":3},
			{"cr":"1","value":3},
			{"cr":"2","value":3},
			{"cr":"3","value":4},
			{"cr":"4","value":5},
			{"cr":"5","value":6},
			{"cr":"6","value":6},
			{"cr":"7","value":6},
			{"cr":"8","value":7},
			{"cr":"9","value":7},
			{"cr":"10","value":7},
			{"cr":"11","value":8},
			{"cr":"12","value":8},
			{"cr":"13","value":8},
			{"cr":"14","value":8},
			{"cr":"15","value":8},
			{"cr":"16","value":9},
			{"cr":"17","value":10},
			{"cr":"18","value":10},
			{"cr":"19","value":10},
			{"cr":"20","value":10},
			{"cr":"21","value":11},
			{"cr":"22","value":11},
			{"cr":"23","value":11},
			{"cr":"24","value":11},
			{"cr":"25","value":12},
			{"cr":"26","value":12},
			{"cr":"27","value":13},
			{"cr":"28","value":13},
			{"cr":"29","value":13},
			{"cr":"30","value":14},
		]
		static savedc = [
			{"cr":"0","value":13},
			{"cr":"1/8","value":13},
			{"cr":"1/4","value":13},
			{"cr":"1/2","value":13},
			{"cr":"1","value":13},
			{"cr":"2","value":13},
			{"cr":"3","value":13},
			{"cr":"4","value":14},
			{"cr":"5","value":15},
			{"cr":"6","value":15},
			{"cr":"7","value":15},
			{"cr":"8","value":16},
			{"cr":"9","value":16},
			{"cr":"10","value":16},
			{"cr":"11","value":17},
			{"cr":"12","value":18},
			{"cr":"13","value":18},
			{"cr":"14","value":18},
			{"cr":"15","value":18},
			{"cr":"16","value":18},
			{"cr":"17","value":19},
			{"cr":"18","value":19},
			{"cr":"19","value":19},
			{"cr":"20","value":19},
			{"cr":"21","value":20},
			{"cr":"22","value":20},
			{"cr":"23","value":20},
			{"cr":"24","value":21},
			{"cr":"25","value":21},
			{"cr":"26","value":21},
			{"cr":"27","value":22},
			{"cr":"28","value":22},
			{"cr":"29","value":22},
			{"cr":"30","value":23},			
		]
		static prof = [
			{"cr":"0","value":2},
			{"cr":"1/8","value":2},
			{"cr":"1/4","value":2},
			{"cr":"1/2","value":2},
			{"cr":"1","value":2},
			{"cr":"2","value":2},
			{"cr":"3","value":2},
			{"cr":"4","value":2},
			{"cr":"5","value":3},
			{"cr":"6","value":3},
			{"cr":"7","value":3},
			{"cr":"8","value":3},
			{"cr":"9","value":4},
			{"cr":"10","value":4},
			{"cr":"11","value":4},
			{"cr":"12","value":4},
			{"cr":"13","value":5},
			{"cr":"14","value":5},
			{"cr":"15","value":5},
			{"cr":"16","value":5},
			{"cr":"17","value":6},
			{"cr":"18","value":6},
			{"cr":"19","value":6},
			{"cr":"20","value":6},
			{"cr":"21","value":7},
			{"cr":"22","value":7},
			{"cr":"23","value":7},
			{"cr":"24","value":7},
			{"cr":"25","value":8},
			{"cr":"26","value":8},
			{"cr":"27","value":8},
			{"cr":"28","value":8},
			{"cr":"29","value":9},
			{"cr":"30","value":9},			
		]
	}

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
		_conmod;
		get conmod() {
			return this._conmod;
		}
		set conmod(value) {
			this._conmod = value;
		}
		_hitdice;
		get hitdice() {
			return this._hitdice;
		}
		set hitdice(value) {
			this._hitdice = value;
		}
		_hptotal;
		get hptotal() {
			return this._hptotal;
		}
		set hptotal(value) {
			this._hptotal = value;
		}
		_hpformula;
		get hpformula() {
			return this._hpformula;
		}
		set hpformula(value) {
			this._hpformula = value;
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
			this._ac = this.attr(`npc_ac`)
			this._hp = this.attr(`hp`,true,`max`)
			this._conmod = this.attr(`constitution_mod`)
			this._hitdice = new HitDiceFormula(this.attr(`npc_hpformula`,false),this.conmod)
			this._hptotal = this.hitdice.hpCalc[0]
			this._hpformula = this.hitdice.hpCalc[1]
			//log(eCore.repeating.all(id))
		}
		attr(name,num=true,type=`current`){
			let attr = findObjs({
				_characterid: this.id,
				_type: "attribute",
				name: name,
			})[0];
			if(attr && typeof attr.get === "function" && attr.get(type)){
				if(num){
					return parseInt(attr.get(type),10)
				}
				return attr.get(type)
			}
			return false;
		}
		static calcCR(id,args){
			let npc = new Monster(id)
			let argToHit = eCore.msg.compareAdv(args,`tohit`)
			let argDPR = eCore.msg.compareAdv(args,`dpr`)
			let useManualAttackValues = false;
			if(argToHit && argToHit.length > 0 && argDPR && argDPR.length > 0){
				useManualAttackValues = true;
				argToHit = argToHit[0]
				argDPR = argDPR[0]
			}
			//calc def cr
			let defCR = CR.hp.find(hpRange => hpRange.start <= npc.hptotal && hpRange.end >= npc.hptotal).cr
			let typicalAC = CR.ac.find(acCR => acCR.cr === defCR).value
			if(typicalAC !== npc.ac){
				log(typicalAC)
				log(npc.ac)
				log(Math.floor((npc.ac - typicalAC)/2))
				let iNew = CR.index.indexOf(defCR)
				iNew += Math.floor((npc.ac - typicalAC)/2)
				iNew = Math.min(iNew,30)
				iNew = Math.max(iNew,0)
				defCR = CR.index[iNew]
			}
			let offCR;
			let typicalToHit;
			if(useManualAttackValues){
				offCR = CR.dpr.find(dprRange => dprRange.start <= argDPR && dprRange.end >= argDPR).cr
				typicalToHit = CR.tohit.find(hitCR => hitCR.cr === offCR).value
				if(typicalToHit !== argToHit){
					log(typicalToHit)
					log(argToHit)
					log(Math.floor((argToHit - typicalToHit)/2))
					let iNew = CR.index.indexOf(offCR)
					iNew += Math.floor((argToHit - typicalToHit)/2)
					iNew = Math.min(iNew,30)
					iNew = Math.max(iNew,0)
					offCR = CR.index[iNew]
				}
			}
			//calc avg of CRs
			log(defCR)
			log(offCR)
			let iAvg = Math.ceil((CR.index.indexOf(defCR)+CR.index.indexOf(offCR))/2)
			let trueCR = CR.index[iAvg]
			let results = HTMLbuilder.msgInline(`${npc.name} is calculated as CR${trueCR}.`+
			`<ul><li>${npc.hptotal}hp (${npc.hpformula})</li>`+
			`<li>Def. CR: ${defCR}</li>`+
			`<li>Off. CR: ${offCR}</li>`+
			`</ul>`+
			``,`detect`)
			eCore.chat(results,`w`,`gm`,`noarchive`,scriptIndex.name)
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
			Monster.calcCR(id[0],args)
		}
	});

	return scriptIndex;
})();