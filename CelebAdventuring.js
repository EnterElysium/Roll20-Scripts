const celebrity = (function() {	

	const scriptIndex = {"name":"CelebrityAdventuring","version":"v0.01",};

	class CSS{
		static bold = `font-weight: bold;`;
		static title = `font-size: 1.25em; text-align: center; display: block; font-family: 'Times New Roman', Times, serif; font-variant: small-caps; color: #7e2d40; margin: 0.1em 0em;`;
		static btnInvis = `color: #000; background-color: transparent; padding: 0; border: none;`;
		static btnLiInvis = `vertical-align: middle;color: #000; background-color: transparent; padding: 0; border: none; overflow: hidden; text-overflow: ellipsis; width:100%; margin-bottom: 1px;`;
		static table = `font-size:12px; width: 100%; list-style: none; margin:0px; white-space: nowrap;`;
		static li = `text-align: right;`;
		static rowHeader = `font-size:1.2em; font-family: 'Times New Roman', Times, serif; font-variant: small-caps; color: #7e2d40;`;
		static row = `border-top: 1px solid #a0a0a0;`;
		static nameHeader = `text-align:right; padding:2px 0px; display: inline-block; width: 60%; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;`;
		static name = `text-align:right; padding:2px 0px; display: inline-block; width: 62%; overflow: hidden; text-overflow: ellipsis; vertical-align: middle; margin-top:0px; font-style: italic;`;
		static stat = `text-align:center; padding:2px 0px; display: inline-block; width: 9%; vertical-align: middle;`;
		static statnarrow = ` width: 9%;`
		static statwide = ` width: 11%;`
		static container = `border:1px solid #333; background-color: #fff; padding:4px 6px 6px 6px;`;
		static spacerbar = `display: block; margin: 4px 8px; border-bottom: 1px solid #7e2d40;`;
		static spacerbarNoTop = `display: block; margin: 0px 8px 8px 8px; border-bottom: 1px solid #7e2d40;`;
		static spacerbarNoBottom = `display: block; margin: 8px 8px 0px 8px; border-top: 1px solid #7e2d40;`;
		static head = `text-align: center; display: block; font-family: 'Times New Roman', Times, serif; font-variant: small-caps; color: #7e2d40;`;
		static subhead = `text-align: center; display: block; font-style: italic; color: #a0a0a0; font-size: 0.7em; line-height: 1.15em;`;
		static elaBlockHolder = `text-align: center; display: block; font-size: 12px; margin-top:4px;`;
		static elaBlock = `text-align: center; display: inline-block; vertical-align: middle; padding: 4px;`;
		static elaSubBlock = `text-align: center; vertical-align: middle;`;
		static elaSmallText = `font-size: 0.8em; line-height: 1em;`;
		static liSub = `text-align: right; background-color: #f1f1f1; padding: 0px 3px; text-align: left;`;
		static resultDice = `width: 8%; display: inline-block; text-align: right; vertical-align: middle; font-weight: bold;`;
		static resultMsg = `width: 92%; display: inline-block; text-align: left; white-space: normal; vertical-align: middle; font-size: 0.9em; line-height: 1em; vertical-align: middle; padding: 0.3em 0px;`;
		static diceSuccess = `color: goldenrod;`;
		static diceFail = `color: darkred;`;
		static diceNothing = ``;
		static headleft2 = `display: block; font-family: 'Times New Roman', Times, serif; font-variant: small-caps; color: #7e2d40;`;
		static subheadleft2 = `display: block; font-style: italic; color: #a0a0a0; font-size: 0.7em; line-height: 1.1em;`;
		static ulinfo = `font-size:11px; list-style: none; margin: 0;`;
		static liinfo = `line-height: 1.15em;`;
		static liname = `font-weight: bold; font-style: italic; margin: 6px 0px 0px 0px; padding: 1px 4px; border-bottom: 1px solid #a0a0a0;`;
		static libenefit = `text-align: justify; text-justify: inter-word; padding: 6px 3px 0px 3px;`;
		static lidetriment = `text-align: justify; text-justify: inter-word; padding: 6px 3px 0px 3px;`;
		static liarrowright = `<span style="color: #009900;">›</span>`;
		static liarrowright2 = `<span style="color: #009900;">»</span>`;
		static liarrowleft = `<span style="color: #aa0000;">‹</span>`;
		static liarrowleft2 = `<span style="color: #aa0000;">«</span>`;
		static arrows = `font-weight: bold; font-size: 1.25em; line-height: 0.8em; padding-right: 0.5em;`
		static litext = ``;
		static liarrow(type){
			let html = ``;
			switch (type){
				case `benefitmax`: html = CSS.liarrowright2; break;
				case `benefithalf`: html = CSS.liarrowright; break;
				case `detrimentmax`: html = CSS.liarrowleft2; break;
				case `detrimenthalf`: html = CSS.liarrowleft; break;
				default: return;
			}
			return html.slice(0,html.indexOf(`style="`)+(`style="`).length) + CSS.arrows + html.slice(html.indexOf(`style="`)+(`style="`).length);
		}
		static thresholds(c,m){
			if(c === m){
				return ` color: #ffc737; font-weight: bold;`;
			}
			else if(c >= m/2){
				return ` color: #939EA7; font-weight: bold;`;
			}
			else if(c > 0){
				return ` color: #000;`;
			}
			else{
				return ` color: #a0a0a0;`;
			}
		}
		static roll(m){
			if(m.dice >= 7 && m.f > m.l && m.e > m.l){
				return CSS.diceSuccess;
			}
			else if(m.dice >= 8 && (m.f > m.l || m.e > m.l)){
				return CSS.diceSuccess;
			}
			else if(m.dice >= 8){
				return CSS.diceSuccess;
			}
			else if(m.dice <= 1){
				return CSS.diceFail;
			}
			else{
				return CSS.diceNothing;
			}
		}
	}

	class Markets{
		_list = [];
		_dice;
		get dice() {
			return this._dice;
		}
		set dice(value) {
			this._dice = value;
		}
		constructor(){
			let markets = findObjs({
				_type:"graphic",
				_subtype: "token",
				layer: "objects",
				represents: "",
				_pageid: Campaign().get("playerpageid"),
			});
			markets = markets.filter(t => t.get("name") && t.get("name").startsWith(`Market: `));
			if(markets.length === 0){
				return;
			};
			markets = _.sortBy(markets,function(m){return m.get("name"); }).reverse();
			markets = _.sortBy(markets,function(m){return parseInt(m.get("bar1_max"))/10; }).reverse();

			this._list = markets.map((market) => new Market(market));
		}

		get list(){
			return this._list;
		}

		get num(){
			return this._list.length;
		}
	}

	class Market{
		_market;
		get market() {
			return this._market;
		}
		_id;
		get id() {
			return this._id;
		}
		_name;
		get name() {
			return this._name;
		}
		_size;
		get size() {
			return this._size;
		}
		_endorsement;
		get endorsement() {
			return this._endorsement;
		}
		_licencing;
		get licencing() {
			return this._licencing;
		}
		_fame;
		get fame() {
			return this._fame;
		}
		constructor(m){
			this._market = m;
			this._id = m.id;
			this._name = m.get("name").replace(/^Market: /g,"");
			this._size = parseInt(m.get("bar1_max"))/10;
			this._endorsement = [parseInt(m.get("bar1_value")),parseInt(m.get("bar1_max"))];
			this._licencing = [parseInt(m.get("bar2_value")),parseInt(m.get("bar2_max"))];
			this._fame = [parseInt(m.get("bar3_value")),parseInt(m.get("bar3_max"))];
		}
		get endorsementValue() {
			return this._endorsement[0];
		}
		get licencingValue() {
			return this._licencing[0];
		}
		get fameValue() {
			return this._fame[0];
		}
		get e() {
			return this._endorsement[0];
		}
		get l() {
			return this._licencing[0];
		}
		get f() {
			return this._fame[0];
		}
		get endorsementMax() {
			return this._endorsement[1];
		}
		get licencingMax() {
			return this._licencing[1];
		}
		get fameMax() {
			return this._fame[1];
		}
		get em() {
			return this._endorsement[1];
		}
		get lm() {
			return this._licencing[1];
		}
		get fm() {
			return this._fame[1];
		}
		set endorsementValue(v){
			this._endorsement[0] = v;
		}
		set licencingValue(v){
			this._licencing[0] = v;
		}
		set fameValue(v){
			this._fame[0] = v;
		}
		set e(v){
			this._endorsement[0] = v;
		}
		set l(v){
			this._licencing[0] = v;
		}
		set f(v){
			this._fame[0] = v;
		}
		get halfEndorsement() {
			return this.e >= this.em/2 ? true : false;
		}
		get fullEndorsement() {
			return this.e === this.em ? true : false;
		}
		get halfLicencing() {
			return this.l >= this.lm/2 ? true : false;
		}
		get fullLicencing() {
			return this.l === this.lm ? true : false;
		}
		get halfFame() {
			return this.f >= this.fm/2 ? true : false;
		}
		get fullFame() {
			return this.f === this.fm ? true : false;
		}
		changeValue(change,stat){
			if(change === 0){
				return `No Change`; //no change
			}
			let statCap = stat[0].toUpperCase() + stat.substring(1);
			let cur;
			let max;
			let bar;
			let msg = ``;

			switch(stat){
				case `endorsement`:
					cur = this.endorsementValue;
					max = this.endorsementMax;
					bar = `1`;
					break;
				case `licencing`:
					cur = this.licencingValue;
					max = this.licencingMax;
					bar = `2`;
					break;
				case `fame`:
					cur = this.fameValue;
					max = this.fameMax;
					bar = `3`;
					break;
				default:
					return `Error`;
			}

			let newCur = cur + change;
			let minThreshold = 0 - newCur;
			let maxThreshold = newCur - max;

			if(change === 0){
				msg = `No Change`; //no change
			}
			else if(change > 0){
				if(cur === max){
					msg = `${statCap} cannot be increased (already at maximum of ${max})`; //already at maximum
					newCur = max;
				}
				else if(maxThreshold > 0){
					msg = `${statCap} increased by ${Math.abs(change) - maxThreshold} (limited to maximum of ${max})`; //increase takes the value above max
					newCur = max;
				}
				else{
					msg = `${statCap} increased by ${change}`; //normal change
				}
			}
			else if(change < 0){
				if(cur === 0){
					msg = `${statCap} cannot be decreased (already at minimum)`; //already at minimum
					newCur = 0;
				}
				else if(minThreshold > 0){
					msg = `${statCap} decreased by ${Math.abs(change) - minThreshold} (limited to minimum)`; //reduction takes the value below 0
					newCur = 0;
				}
				else{
					msg = `${statCap} decreased by ${Math.abs(change)}`; //normal change
				}
			}
			else{
				msg = `Error`
			}
			eCore.log.basic(`CA-ELD-Growth: ${this.name}'s ${stat} by ${change} from ${cur} to ${newCur}`);
			switch(stat){
				case `endorsement`:
					this.endorsementValue = newCur;
					break;
				case `licencing`:
					this.licencingValue = newCur;;
					break;
				case `fame`:
					this.fameValue = newCur;;
					break;
				default:
					return `Error`;
			}
			this._market.set(`bar${bar}_value`,newCur);
			return msg;
		}
		get highestStat(){
			let values = [{
				"name":`endorsement`,
				"value":this.endorsementValue,
			},
			{
				"name":`licencing`,
				"value":this.licencingValue,
			},
			{
				"name":`fame`,
				"value":this.fameValue,
			},];
			let max = Math.max(this.endorsementValue,this.licencingValue,this.fameValue)
			values = values.filter(stat => stat.value === max);
			let highest;
			if(values.length > 1){
				let rand = eCore.utility.random(0,values.length-1);
				highest = values[rand];
			}
			else{
				highest = values[0];
			}
			return highest.name;
		}
	}

	class Titles{
		static none = "Unknown Quantities";
		static low = {
			"endorsement":`Influential Adventurers`,
			"licencing":`Entrepreneurs`,
			"fame":`Celebrity Adventurers`,
			"tie":`Renowned Adventurers`,
		}
		static med = {
			"endorsement":`Power Brokers`,
			"licencing":`Executive Adventurers`,
			"fame":`Famed Adventurers`,
			"tie":`Exalted Adventurers`,
		}
		static high = {
			"endorsement":`Grey Eminences`,
			"licencing":`Adventuring Tycoons`,
			"fame":`Adventuring Icons`,
			"tie":`Legends`,
		}
		static analyseStatus(markets){
			let ptfull = 4;
			let pthalf = 3;
			let ptone = 2;
			let ptMax = 0;
			let ptE = 0;
			let ptL = 0;
			let ptF = 0;
			for(let m of markets){
				ptMax += m.size*10*ptfull;
				if(m.e === m.em){
					ptE += m.e*ptfull;
				}
				else if(m.e >= m.em/2){
					ptE += m.e*pthalf;
				}
				else if(m.e > 0){
					ptE += m.e*ptone;
				}
				else{
					ptE += 0;
				}
				if(m.l === m.lm){
					ptL += m.l*ptfull;
				}
				else if(m.l >= m.lm/2){
					ptL += m.l*pthalf;
				}
				else if(m.l > 0){
					ptL += m.l*ptone;
				}
				else{
					ptL += 0;
				}
				if(m.f === m.fm){
					ptF += m.f*ptfull;
				}
				else if(m.f >= m.fm/2){
					ptF += m.f*pthalf;
				}
				else if(m.f > 0){
					ptF += m.f*ptone;
				}
				else{
					ptF += 0;
				}
			}
			return Titles.assignStatus(ptMax,ptE,ptL,ptF);
			//return `<br>${Titles.assignStatus(ptMax,ptE,ptL,ptF)}<br>Max${ptMax}pts E${ptE}pts L${ptL}pts F${ptF}pts`;
		}
		static assignStatus(max,e,l,f){
			let eHalf = false;
			e >= max/2 ? eHalf = true : false;
			let lHalf = false;
			l >= max/2 ? lHalf = true : false;
			let fHalf = false;
			f >= max/2 ? fHalf = true : false;
			let arrayHalfs = [eHalf,lHalf,fHalf].filter(v => v === true).length;
			let eQuarter = false;
			e >= max/4 ? eQuarter = true : false;
			let lQuarter = false;
			l >= max/4 ? lQuarter = true : false;
			let fQuarter = false;
			f >= max/4 ? fQuarter = true : false;
			let arrayQuarters = [eQuarter,lQuarter,fQuarter].filter(v => v === true).length;
			let eEighth = false;
			e >= max/8 ? eEighth = true : false;
			let lEighth = false;
			l >= max/8 ? lEighth = true : false;
			let fEighth = false;
			f >= max/8 ? fEighth = true : false;
			let arrayEighths = [eEighth,lEighth,fEighth].filter(v => v === true).length;
			if(arrayHalfs > 1){
				return this.high.tie;
			}
			else if(arrayHalfs > 0){
				switch(true){
					case eHalf: return this.high.endorsement;
					case lHalf: return this.high.licencing;
					case fHalf: return this.high.fame;
				}
			}
			else if(arrayQuarters > 1){
				return this.med.tie;
			}
			else if(arrayQuarters > 0){
				switch(true){
					case eQuarter: return this.med.endorsement;
					case lQuarter: return this.med.licencing;
					case fQuarter: return this.med.fame;
				}
			}
			else if(arrayEighths > 1){
				return this.low.tie;
			}
			else if(arrayEighths > 0){
				switch(true){
					case eEighth: return this.low.endorsement;
					case lEighth: return this.low.licencing;
					case fEighth: return this.low.fame;
				}
			}
			else{
				return this.none;
			}
		}
	};

	class MarketsMenu extends Markets{
		constructor(){
			super()
		}
		menu(ela=false,silent){
			let html = ``;
			html += `<div style="${CSS.title}">Market Analysis</div>`;
			html += `<div style="${CSS.subhead}">Current Status: ${Titles.analyseStatus(this.list)}</div>`;
			//table += `<div style="${CSS.subhead}">Known Markets: ${this.num}</div>`;
			html += `<div style="${CSS.spacerbar}"></div>`;
			html += `<ul style="${CSS.table}">`;
			html += `<li style="${CSS.li}"><div style="${CSS.rowHeader}">`;
			html += `<div style="${CSS.nameHeader}">Market&nbsp;</div>`;
			html += `<div style="${CSS.stat}${CSS.statwide}">Size</div>`;
			html += `<div style="${CSS.stat}${CSS.statnarrow}">E.</div>`;
			html += `<div style="${CSS.stat}${CSS.statnarrow}">L.</div>`;
			html += `<div style="${CSS.stat}${CSS.statnarrow}">F.</div>`;
			html += `</div></li>`;
			for(let m of this.list){
				log(`Market: ${m.name} | Size: ${m.size} | E:${m.e} L:${m.l} F:${m.f}`);
				html += `<li style="${CSS.li}"><div style="${CSS.row}">`;
				let url = `!celebrity --marketinfo ${m.id}${silent ? ` silent`:` `}`;
				url = eCore.utility.encodeHTML(url);
				html += `<div style="${CSS.name}"><a style="${CSS.btnLiInvis}" href="${url}">${m.name}</a></div>`;
				html += `<div style="${CSS.stat}${CSS.statwide}">${m.size}</div>`;
				html += `<div style="${CSS.stat}${CSS.statnarrow}${CSS.thresholds(m.e,m.em)}">${m.e}</div>`;
				html += `<div style="${CSS.stat}${CSS.statnarrow}${CSS.thresholds(m.l,m.lm)}">${m.l}</div>`;
				html += `<div style="${CSS.stat}${CSS.statnarrow}${CSS.thresholds(m.f,m.fm)}">${m.f}</div>`;
				html += `</div></li>`;
			}
			html += `</ul>`;
	
			let container = `<div style="${CSS.container}">${html}${this.menuFooterELD(ela)}</div>`

			return container;
		}
		menuFooterELD(ela){
			if(!ela){
				return ``;
			}
			let container = `<div style="${CSS.spacerbar}"></div>`;
			container += `<div style="${CSS.head}">Extended Licencing Agreement</div>`;
			container += `<div style="${CSS.subhead}">Choose one at the end of each week</div>`;
			//constructor Small Royal Payment
			let moneyTitle = `<div style="${CSS.elaSmallText}${CSS.elaSubBlock}">Small Royalty Payment</div>`;
			let moneyNum = _.reduce(this.list, function(memo,num){return memo + num.endorsementValue + num.fameValue;}, 0);
			moneyNum = `<div style="${CSS.bold}${CSS.elaSubBlock}">${moneyNum}gp</div>`
			let blocks = `<div style="${CSS.elaBlock}">${moneyTitle}${moneyNum}</div>`;
			//or
			blocks += `<div style="text-align: center; display: inline-block; vertical-align: middle; font-style: italic; color: #a0a0a0; padding: 0px 6px;">or</div>`;
			//constructor Stimulate Growth
			let growthTitle = `<div style="${CSS.elaSmallText}${CSS.elaSubBlock}">Stimulate Growth</div>`;
			let growthBtn = `<div style="${CSS.bold}${CSS.elaSubBlock}">d8 &#215;${this.num}</div>`;
			let growthCmd = `!celebrity --xlicencing [[${this.num}d8]&#93; ?{Have you hired Seban?|No, |Yes,seban}`;
			growthCmd = eCore.utility.encodeHTML(growthCmd);
			blocks += `<a style="${CSS.btnInvis}" href="${growthCmd}"><div style="${CSS.elaBlock}">${growthTitle}${growthBtn}</div></a>`;
			container += `<div style="${CSS.elaBlockHolder}">${blocks}</div>`;

			return container;
		}
		static view(who,options){
			//generate market
			let markets = new MarketsMenu();
			//list options
			let showELD = options.includes(`ela`);
			if(!showELD){
				showELD = options.includes(`xla`);
			}
			let silent = options.includes(`silent`);
			//construct menu
			let container = markets.menu(showELD,silent);
			//send chat
			eCore.chat(container,silent ? `w` : null,silent ? who : null,`noarchive`);
		}
	}

	class MarketsXLA extends Markets{
		_elaDoubler = false;
		constructor(diceArray,seban=false){
			super();
			if(diceArray.length < this.num){
				return;
			}
			for(let i = 0;i<this.num;i++){
				this.list[i].dice = diceArray[i];
			};
			this._elaDoubler = seban;
		}
		get elaDoubler(){
			return this._elaDoubler ? 2 : 1;
		}
		get change(){
			let change = 1;
			change *= this.elaDoubler;
			return change;
		}
		roll(i){
			let m = this.list[i];
			if(m.dice >= 7 && m.f > m.l && m.e > m.l){
				return m.changeValue(this.change,`licencing`);
			}
			else if(m.dice >= 8 && (m.f > m.l || m.e > m.l)){
				return m.changeValue(this.change,`licencing`);
			}
			else if(m.dice >= 8){
				return m.changeValue(this.change,`endorsement`);
			}
			else if(m.dice <= 1){
				return m.changeValue(this.change * -1,m.highestStat);
			}
			else{
				return `No Change`;
			}
		}
		get xlaSummary(){
			let grow = 0;
			let con = 0;
			for(let i = 0;i<this.num;i++){
				let m = this.list[i];
				if(m.dice >= 7 && m.f > m.l && m.e > m.l){
					grow += 1;
				}
				else if(m.dice >= 8){
					grow += 1;
				}
				else if(m.dice <= 1){
					con += 1;
				}
			}
			return [grow,con];
		}
		results(){
			let html = ``;
			html += `<div style="${CSS.title}">Market Growth</div>`;
			let subhead = ``;
			if(this.xlaSummary[0] > 0){
				subhead += `${eCore.utility.numberToWords(this.xlaSummary[0])} ${this.xlaSummary[0] > 1 ? `markets`: `market`} grew`;
				if(this.xlaSummary[1] > 0){
					subhead += ` and ${eCore.utility.numberToWords(this.xlaSummary[1])} contracted`;
				}
			}
			else if(this.xlaSummary[1] > 0){
				subhead += `${eCore.utility.numberToWords(this.xlaSummary[1])} ${this.xlaSummary[1] > 1 ? `markets`: `market`} contracted`;
			}
			else{
				subhead = `No markets changed`;
			}
			subhead = subhead[0].toUpperCase() + subhead.substring(1);
			log(this.xlaSummary)
			log(eCore.utility.numberToWords(this.xlaSummary[0]))
			log(eCore.utility.numberToWords(this.xlaSummary[1]))
			log(subhead)
			html += `<div style="${CSS.subhead}">${subhead}</div>`;
			html += `<div style="${CSS.spacerbar}"></div>`;
			html += `<ul style="${CSS.table}">`;
			html += `<li style="${CSS.li}"><div style="${CSS.rowHeader}">`;
			html += `<div style="${CSS.nameHeader}">Market&nbsp;</div>`;
			html += `<div style="${CSS.stat}${CSS.statwide}">Size</div>`;
			html += `<div style="${CSS.stat}${CSS.statnarrow}">E.</div>`;
			html += `<div style="${CSS.stat}${CSS.statnarrow}">L.</div>`;
			html += `<div style="${CSS.stat}${CSS.statnarrow}">F.</div>`;
			html += `</div></li>`;
			for(let i = 0;i<this.num;i++){
				let m = this.list[i];
				let resultMsg = this.roll(i);
				log(`Market: ${m.name} | Size: ${m.size} | E:${m.e} L:${m.l} F:${m.f}`);
				html += `<li style="${CSS.li}"><div style="${CSS.row}">`;
				let url = `!celebrity --marketinfo ${m.id}`;
				url = eCore.utility.encodeHTML(url);
				html += `<div style="${CSS.name}"><a style="${CSS.btnLiInvis}" href="${url}">${m.name}</a></div>`;
				html += `<div style="${CSS.stat}${CSS.statwide}">${m.size}</div>`;
				html += `<div style="${CSS.stat}${CSS.statnarrow}${CSS.thresholds(m.e,m.em)}">${m.e}</div>`;
				html += `<div style="${CSS.stat}${CSS.statnarrow}${CSS.thresholds(m.l,m.lm)}">${m.l}</div>`;
				html += `<div style="${CSS.stat}${CSS.statnarrow}${CSS.thresholds(m.f,m.fm)}">${m.f}</div>`;
				html += `</div></li>`;
				html += `<li style="${CSS.liSub}"><div style="${CSS.resultDice} ${CSS.roll(m)}">${m.dice}&nbsp;&nbsp;</div>`;
				html += `<div style="${CSS.resultMsg}">${resultMsg}</div></li>`
			}
			html += `</ul>`;
	
			let container = `<div style="${CSS.container}">${html}</div>`

			return container;
		}
	}

	class xLicencing{
		static growth(options,dice){
			//list options
			let seban = options.includes(`seban`);
			//generate market
			let markets = new MarketsXLA(dice,seban);
			//construct menu
			let container = markets.results();
			//send chat
			eCore.chat(container,null,null,`noarchive`);
		}
	}

	class MarketInfo extends Market{
		constructor(m){
			super(m);
		}
		thresholds(){
			let html = ``;
			html += `<div style="${CSS.title}">Market: ${this.name}</div>`;
			let title = Titles.analyseStatus([this]);
			/^.+ed|^.+ial/g.test(title) ? title = `Locally ${title}` : title = `Local ${title}`;
			html += `<div style="${CSS.subhead}">Current Status: ${title}</div>`;
			//html += `<div style="${CSS.subhead}">Size: ${this.size}; Endorsement: ${this.e}; Licencing: ${this.l}; Fame: ${this.f}</div>`;
			//add endorsement
			if(this.fullEndorsement || this.halfEndorsement){
				html += `<div style="${CSS.spacerbar}"></div>`
				html += `<div style="${CSS.headleft2}">Endorsement (${this.e}/${this.em})</div>`;
				if(this.fullEndorsement){
					html += `<div style="${CSS.subheadleft2}">Due to being at maximum endorsement you gain the following:</div>`
					for(let info of this.infoFullEndorsement){
						html += MarketInfo.infoConstructor(info,`max`);
					}
				}
				if(this.halfEndorsement){
					!this.fullEndorsement ? html += `<div style="${CSS.subheadleft2}">Due to being at or above half endorsement you gain the following:</div>` : false;
					for(let info of this.infoHalfEndorsement){
						html += MarketInfo.infoConstructor(info,`half`);
					}
				}
			}
			//add licencing
			if(this.fullLicencing || this.halfLicencing){
				html += `<div style="${CSS.spacerbar}"></div>`
				html += `<div style="${CSS.headleft2}">Licencing (${this.l}/${this.lm})</div>`;
				if(this.fullLicencing){
					html += `<div style="${CSS.subheadleft2}">Due to being at maximum licencing you gain the following:</div>`
					for(let info of this.infoFullLicencing){
						html += MarketInfo.infoConstructor(info,`max`);
					}
				}
				if(this.halfLicencing){
					!this.fullLicencing ? html += `<div style="${CSS.subheadleft2}">Due to being at or above half licencing you gain the following:</div>` : false;
					for(let info of this.infoHalfLicencing){
						html += MarketInfo.infoConstructor(info,`half`);
					}
				}
			}
			//add fame
			if(this.fullFame || this.halfFame){
				html += `<div style="${CSS.spacerbar}"></div>`
				html += `<div style="${CSS.headleft2}">Fame (${this.f}/${this.fm})</div>`;
				if(this.fullFame){
					html += `<div style="${CSS.subheadleft2}">Due to being at maximum fame you gain the following:</div>`
					for(let info of this.infoFullFame){
						html += MarketInfo.infoConstructor(info,`max`);
					}
				}
				if(this.halfFame){
					!this.fullFame ? html += `<div style="${CSS.subheadleft2}">Due to being at or above half fame you gain the following:</div>` : false;
					for(let info of this.infoHalfFame){
						html += MarketInfo.infoConstructor(info,`half`);
					}
				}
			}
			
			let container = `<div style="${CSS.container}">${html}</div>`

			return container;
		}
		static infoConstructor(info,type){
			let html = ``;
			html += `<ul style="${CSS.ulinfo}">`;
			let nametitle = info.name;
			if(!info.name.endsWith(`.`) && !info.name.endsWith(`!`) && !info.name.endsWith(`?`)){
				nametitle += `.`;
			}
			info.name ? html += `<li style="${CSS.liinfo}${CSS.liname}">${nametitle}</li>`: false ;
			info.benefit ? html += `<li style="${CSS.liinfo}${CSS.libenefit}">${CSS.liarrow(`benefit${type}`)}<span style="${CSS.litext}">${info.benefit}</span></li>`: false ;
			info.detriment ? html += `<li style="${CSS.liinfo}${CSS.lidetriment}">${CSS.liarrow(`detriment${type}`)}<span style="${CSS.litext}">${info.detriment}</span></li>`: false ;
			html += `</ul>`;
			return html;
		}
		static view(options,who){
			let id = options[0];
			let silent = options.includes(`silent`);
			//token/market from id
			let token = findObjs({
				_id: id,
				_type:"graphic",
				_subtype: "token",
				layer: "objects",
				represents: "",
				_pageid: Campaign().get("playerpageid"),
			})[0];
			//generate market
			let market = new MarketInfo(token);
			//construct menu
			let container = market.thresholds();
			//send chat
			eCore.chat(container,silent ? `w` : null,silent ? who : null,`noarchive`);
		}
		_infoHalfEndorsement = [{
			"name": `Don't You Know Who I Am?`,
			"benefit": `Your benefactors don’t want you in jail. You no longer get arrested for trivial offenses. For more serious offences any sentence you receive is reduced by two weeks (to a minimum of half the original duration).`,
			"detriment": `Lose 1 Endorsement, Licencing, and Fame if you are jailed. Lose 1 Endorsement for trivial offences if they become overly frequent.`,
		}, {
			"name": `You Come Recommended`,
			"benefit": `You can get your foot in the door with the majority of businesses, institutions, and people of power and they are at least likely to grant you an audience and hear you out. Although it is not guaranteed.`,
			"detriment": `Any discourtesy you show someone at a meeting gained on another's recommendation results in a loss of Endorsement.`,
		}, {
			"name": `Borrow the Coach`,
			"benefit": `Routine mundane travel within and to the Market costs you nothing.`,
			"detriment": `While travelling in such a fashion you will be expected to defend other travellers.`,
		},];
		get infoHalfEndorsement() {
			return this._infoHalfEndorsement;
		}
		_infoFullEndorsement = [{
			"name": `House in the Famptons`,
			"benefit": `You may spend a week of downtime in Luxury lifestyle being pampered at the expense of your benefactors. You gain the benefits of the Relaxation downtime activity, or you may Prepare for a downtime action of no more than two workweeks immediately following this one. If you prepare, you may reroll one d20 rolled as part of one ability check during the following downtime action.`,
			"detriment": `Roll a d6. On a 1 you have to spend this week doing the Side-Quest downtime activity instead and do not benefit from House in the Famptons.`,
		}, {
			"name": `Arcane Support`,
			"benefit": `Once per day, you may request the casting of a spell of any level up to half the Market Size +1 (rounded up, to a maximum of level 5) from a contact, provided you provide half the cost of any material components.`,
			"detriment": `They will only do so while it remains in their interest, and they are aware of the reasons for doing so.`,
		}, {
			"name": `Call in Markers`,
			"benefit": `You gain either d8 Fame or Licencing in the Market (your choice).`,
			"detriment": `You lose the same amount plus two Endorsement. Overuse may result in diminishing returns.`,
		},];
		get infoFullEndorsement() {
			return this._infoFullEndorsement;
		}
		_infoHalfLicencing = [{
			"name": `Brand Recognition`,
			"benefit": `Business you own may add the Market Size to their profit roll.`,
			"detriment": ``,
		},{
			"name": `Tributary of Trade`,
			"benefit": `Neighbouring regions will not prevent your passage through their lands without good reason.`,
			"detriment": ``,
		},];
		get infoHalfLicencing() {
			return this._infoHalfLicencing;
		}
		_infoFullLicencing = [{
			"name": `Swag`,
			"benefit": `You gain a 50% discount on all personal non-magical equipment and gear.`,
			"detriment": ``,
		},{
			"name": `Penthouse Suite`,
			"benefit": `Gain a 50% discount on maintaining a luxury lifestyle.`,
			"detriment": `Paying for a lifestyle of comfortable or below may result in a loss of status.`,
		},];
		get infoFullLicencing() {
			return this._infoFullLicencing;
		}
		_infoHalfFame = [{
			"name": `On the House`,
			"benefit": `You no longer need to pay for basic drinks in taverns and inns if there are people to buy them for you.`,
			"detriment": `While benefiting like this, fans will hang on your every word, not much will stay private.`,
		}, {
			"name": `Spare Room`,
			"benefit": `You can find lodging and food of Poor standard for your band for free at short notice, by lodging with fans.`,
			"detriment": `Your hosts are certain to not give you much space.`,
		},];
		get infoHalfFame() {
			return this._infoHalfFame;
		}
		_infoFullFame = [{
			"name": `Fan Mob`,
			"benefit": `You may rally a group of diehard supporters. The number of fans is proportionate to the population of the location you are in, in a city this might be several hundred, in a small village it might be two.`,
			"detriment": `Spend 1 Fame from your local Market to use.`,
		}, {
			"name": `Shelter`,
			"benefit": `A group of diehard, devoted fans, take you in and shelter you. They will shield you from the law or anyone else searching for you, risking their lives as necessary. While there you gain the benefit of a Poor lifestyle.`,
			"detriment": `Spend 1 Fame per day from your local Market to use.`,
		},{
			"name": `There they are!`,
			"benefit": ``,
			"detriment": `Attempts to hide your identity or evade detection in public are at disadvantage as fans track you down relentless.`,
		},];
		get infoFullFame() {
			return this._infoFullFame;
		}
	}

	on("chat:message", function(msg) {
		let args = eCore.msgProcess.adv(msg,`celebrity`);
		if(!args){
			return;
		}
		if(eCore.msgCompare.adv(args,`menu`)){
			let options = [];
			options = options.concat(eCore.msgCompare.advanced(args,`menu`));
			MarketsMenu.view(msg.who,options)
		}
		if(eCore.msgCompare.adv(args,`xlicencing`)){
			let options = [];
			options = options.concat(eCore.msgCompare.advanced(args,`xlicencing`));
			let dice = eCore.dice.extract(msg);
			xLicencing.growth(options,dice);
		}
		if(eCore.msgCompare.adv(args,`marketinfo`)){
			let options = [];
			options = options.concat(eCore.msgCompare.advanced(args,`marketinfo`));
			MarketInfo.view(options,msg.who);
		}
	});

	return scriptIndex;
})();