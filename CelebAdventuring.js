const celebrity = (function() {	

	const scriptIndex = {"name":"CelebrityAdventuring","version":"v0.01",};

	class CSS{
		static _bold = `font-weight: bold;`;
		static get bold() {
			return CSS._bold;
		}
		static _btnDefault = `color: #000; background-color: transparent; padding: 0;`;
		static get btnDefault() {
			return CSS._btnDefault;
		}
		static _table = `font-size:12px; width: 100%; list-style: none; margin:0px; white-space: nowrap;`;
		static get table() {
			return CSS._table;
		}
		static _li = `text-align: right; margin-bottom:-0.2px;`;
		static get li() {
			return CSS._li;
		}
		static _rowHeader = `font-size:1.2em; font-family: 'Times New Roman', Times, serif; font-variant: small-caps; color: #7e2d40;`;
		static get rowHeader() {
			return CSS._rowHeader;
		}
		static _row = `border-top: 1px solid #a0a0a0;`;
		static get row() {
			return CSS._row;
		}
		static _nameHeader = `text-align:right; padding:2px 0px; display: inline-block; width: 60%; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;`;
		static get nameHeader() {
			return CSS._nameHeader;
		}
		static _name = `text-align:right; padding:2px 0px; display: inline-block; width: 60%; overflow: hidden; text-overflow: ellipsis; vertical-align: middle; margin-top:0px; font-style: italic;`;
		static get name() {
			return CSS._name;
		}
		static _stat = `text-align:center; padding:2px 0px; display: inline-block; width: 10%; vertical-align: middle; margin-top:-0.7px;`;
		static get stat() {
			return CSS._stat;
		}
		static _container = `border:1px solid #333; background-color: #fff; padding:4px 6px;`;
		static get container() {
			return CSS._container;
		}
		static _spacerbarNoTop = `display: block; margin-bottom: 8px; border-bottom: 1px solid #7e2d40;`;
		static get spacerbarNoTop() {
			return CSS._spacerbarNoTop;
		}
		static _spacerbarNoBottom = `display: block; margin-top: 8px; border-top: 1px solid #7e2d40;`;
		static get spacerbarNoBottom() {
			return CSS._spacerbarNoBottom;
		}
		static _head = `text-align: center; display: block; font-family: 'Times New Roman', Times, serif; font-variant: small-caps; color: #7e2d40;`;
		static get head() {
			return CSS._head;
		}
		static _subhead = `text-align: center; display: block; font-style: italic; color: #a0a0a0; font-size: 0.7em; line-height: 1.1em;`;
		static get subhead() {
			return CSS._subhead;
		}
		static _elaBlockHolder = `text-align: center; display: block; font-size: 12px;`;
		static get elaBlockHolder() {
			return CSS._elaBlockHolder;
		}
		static _elaBlock = `text-align: center; display: inline-block; vertical-align: middle; border: 1px solid #f1f1f1; padding: 4px;`;
		static get elaBlock() {
			return CSS._elaBlock;
		}
		static _elaSubBlock = `text-align: center; vertical-align: middle;`;
		static get elaSubBlock() {
			return CSS._elaSubBlock;
		}
		static _elaSmallText = `font-size: 0.8em; line-height: 1em;`;
		static get elaSmallText() {
			return CSS._elaSmallText;
		}
		static _liSub = `text-align: right; margin-bottom:-0.2px; background-color: #f1f1f1; padding: 0px 3px; text-align: left;`;
		static get liSub() {
			return CSS._liSub;
		}
		static _resultDice = `width: 8%; display: inline-block; text-align: right; vertical-align: middle; font-weight: bold; margin-top: -0.1em;`;
		static get resultDice() {
			return CSS._resultDice;
		}
		static _resultMsg = `width: 92%; display: inline-block; text-align: left; white-space: normal; vertical-align: middle; font-size: 0.9em; line-height: 1em; vertical-align: middle; padding: 0.3em 0px;`;
		static get resultMsg() {
			return CSS._resultMsg;
		}
		static _diceSuccess = `color: goldenrod;`;
		static get diceSuccess() {
			return CSS._diceSuccess;
		}
		static _diceFail = `color: darkred;`;
		static get diceFail() {
			return CSS._diceFail;
		}
		static _diceNothing = ``;
		static get diceNothing() {
			return CSS._diceNothing;
		}
		static thresholds(c,m){
			if(c === m){
				return ` color: #970; background-color: gold; font-weight: bold;`;
			}
			else if(c >= m/2){
				return ` color: #555; background-color: #d7d7d7; font-weight: bold;`;
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

	class MarketsMenu extends Markets{
		constructor(){
			super()
		}
		menu(ela=false){
			let table = `<ul style="${CSS.table}">`;
			table += `<li style="${CSS.li}"><div style="${CSS.rowHeader}">`;
			table += `<div style="${CSS.nameHeader}">Market&nbsp;</div>`;
			table += `<div style="${CSS.stat}">Size</div>`;
			table += `<div style="${CSS.stat}">E.</div>`;
			table += `<div style="${CSS.stat}">L.</div>`;
			table += `<div style="${CSS.stat}">F.</div>`;
			table += `</div></li>`;
			for(let m of this.list){
				log(`Market: ${m.name} | Size: ${m.size} | E:${m.e} L:${m.l} F:${m.f}`);
				table += `<li style="${CSS.li}"><div style="${CSS.row}">`;
				table += `<div style="${CSS.name}">${m.name}</div>`;
				table += `<div style="${CSS.stat}">${m.size}</div>`;
				table += `<div style="${CSS.stat}${CSS.thresholds(m.e,m.em)}">${m.e}</div>`;
				table += `<div style="${CSS.stat}${CSS.thresholds(m.l,m.lm)}">${m.l}</div>`;
				table += `<div style="${CSS.stat}${CSS.thresholds(m.f,m.fm)}">${m.f}</div>`;
				table += `</div></li>`;
			}
			table += `</ul>`;
	
			let container = `<div style="${CSS.container}">${table}${this.menuFooterELD(ela)}</div>`

			return container;
		}
		menuFooterELD(ela){
			if(!ela){
				return ``;
			}
			let container = `<div style="${CSS.spacerbarNoTop}"></div>`;
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
			blocks += `<a style="${CSS.btnDefault}" href="${growthCmd}"><div style="${CSS.elaBlock}">${growthTitle}${growthBtn}</div></a>`;
			container += `<div style="${CSS.elaBlockHolder}">${blocks}</div>`;

			return container;
		}
		static view(who,options){
			//generate market
			let markets = new MarketsMenu();
			//list options
			let showELD = options.includes(`ela`);
			let silent = options.includes(`silent`);
			//construct menu
			let container = markets.menu(showELD);
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
		results(){
			let table = `<ul style="${CSS.table}">`;
			table += `<li style="${CSS.li}"><div style="${CSS.rowHeader}">`;
			table += `<div style="${CSS.nameHeader}">Market&nbsp;</div>`;
			table += `<div style="${CSS.stat}">Size</div>`;
			table += `<div style="${CSS.stat}">E.</div>`;
			table += `<div style="${CSS.stat}">L.</div>`;
			table += `<div style="${CSS.stat}">F.</div>`;
			table += `</div></li>`;
			for(let i = 0;i<this.num;i++){
				let m = this.list[i];
				let resultMsg = this.roll(i);
				log(`Market: ${m.name} | Size: ${m.size} | E:${m.e} L:${m.l} F:${m.f}`);
				table += `<li style="${CSS.li}"><div style="${CSS.row}">`;
				table += `<div style="${CSS.name}">${m.name}</div>`;
				table += `<div style="${CSS.stat}">${m.size}</div>`;
				table += `<div style="${CSS.stat}${CSS.thresholds(m.e,m.em)}">${m.e}</div>`;
				table += `<div style="${CSS.stat}${CSS.thresholds(m.l,m.lm)}">${m.l}</div>`;
				table += `<div style="${CSS.stat}${CSS.thresholds(m.f,m.fm)}">${m.f}</div>`;
				table += `</div></li>`;
				table += `<li style="${CSS.liSub}"><div style="${CSS.resultDice} ${CSS.roll(m)}">${m.dice}&nbsp;&nbsp;</div>`;
				table += `<div style="${CSS.resultMsg}">${resultMsg}</div></li>`
			}
			table += `</ul>`;
	
			let container = `<div style="${CSS.container}">${table}</div>`

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
		_halfEndorsement = false;
		get halfEndorsement() {
			return this._halfEndorsement;
		}
		_fullEndorsement = false;
		get fullEndorsement() {
			return this._fullEndorsement;
		}
		_halfLicencing = false;
		get halfLicencing() {
			return this._halfLicencing;
		}
		_fullLicencing = false;
		get fullLicencing() {
			return this._fullLicencing;
		}
		_halfFame = false;
		get halfFame() {
			return this._halfFame;
		}
		_fullFame = false;
		get fullFame() {
			return this._fullFame;
		}
		constructor(m){
			super(m);
			if(this.e >= this.em/2){
				this._halfEndorsement = true;
				if(this.e === this.em){
					this._fullEndorsement = true;
				}
			}
			if(this.l >= this.lm/2){
				this._halfLicencing = true;
				if(this.l === this.lm){
					this._fullLicencing = true;
				}
			}
			if(this.l >= this.lm/2){
				this._halfFame = true;
				if(this.l === this.lm){
					this._fullFame = true;
				}
			}
		}
		thresholds(){ //continue from here
			let html = ``;
			html += `<div style="${CSS.nameHeader}">Market: ${this.name}</div>`;
			//add endorsement
			if(this.fullEndorsement || this.halfEndorsement){
				html += `<div>Endorsement (${this.e}/${this.em})</div>`;
				if(this.fullEndorsement){
					html += `<div>Due to being at maximum</div>`
					for(let info of this.infoFullEndorsement){
						html += MarketInfo.infoConstructor(info);
					}
				}
				if(this.halfEndorsement){
					html += `<div>Due to being above half</div>`
					for(let info of this.infoHalfEndorsement){
						html += MarketInfo.infoConstructor(info);
					}
				}
			}
			//add licencing
			html += `<div style="${CSS.spacerbarNoTop}"></div>`
			if(this.fullLicencing || this.halfLicencing){
				html += `<div>Licencing (${this.l}/${this.lm})</div>`;
				if(this.fullLicencing){
					html += `<div>Due to being at maximum</div>`
					for(let info of this.infoFullLicencing){
						html += MarketInfo.infoConstructor(info);
					}
				}
				if(this.halfLicencing){
					html += `<div>Due to being above half</div>`
					for(let info of this.infoHalfLicencing){
						html += MarketInfo.infoConstructor(info);
					}
				}
			}
			//add fame
			html += `<div style="${CSS.spacerbarNoTop}"></div>`
			if(this.fullFame || this.halfFame){
				html += `<div>Fame (${this.f}/${this.fm})</div>`;
				if(this.fullFame){
					html += `<div>Due to being at maximum</div>`
					for(let info of this.infoFullFame){
						html += MarketInfo.infoConstructor(info);
					}
				}
				if(this.halfFame){
					html += `<div>Due to being above half</div>`
					for(let info of this.infoHalfFame){
						html += MarketInfo.infoConstructor(info);
					}
				}
			}
			
			let container = `<div style="${CSS.container}">${html}</div>`

			return container;
		}
		static infoConstructor(info){
			let html = ``;
			html += `<ul>`;
			info.name ? html += `<li>${info.name}</li>`: false ;
			info.benefit ? html += `<li>${info.benefit}</li>`: false ;
			info.detriment ? html += `<li>${info.detriment}</li>`: false ;
			html += `</ul>`;
			return html;
		}
		static view(id){
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
			eCore.chat(container,null,null,`noarchive`);
		}
		_infoHalfEndorsement = [{
			"name": `Don't You Know Who I Am?`,
			"benefit": `It is not in the interests of your benefactors for you to languish in jail. You no longer get arrested for trivial offenses. For more serious offences you can expect any sentence you receive to be halved.`,
			"detriment": `Roll a d20, on a 1 you lose 1 Licencing and 1 Endorsement, and on a 2 you lose 1 Endorsement as word gets out about covering for your antics.`,
		}, {
			"name": `You Come Recommended`,
			"benefit": `While not guaranteed that all factions will welcome you all the time, being this well connected means your can get your foot in the door with the majority of businesses, institutions, and people of power and they are at least likely to grant you an audience and hear you out.`,
			"detriment": `Word travels, any discourtesy you show someone at a meeting gained on others recommendation results in a loss of Endorsement (dependant on the exact discourtesy, insulting them vs attacking them for example).`,
		}, {
			"name": `Borrow the Coach`,
			"benefit": `Routine mundane travel within the Market costs you nothing.`,
			"detriment": `While travelling in such a fashion you will be expected to defend other travellers.`,
		},];
		get infoHalfEndorsement() {
			return this._infoHalfEndorsement;
		}
		_infoFullEndorsement = [{
			"name": `House in the Famptons`,
			"benefit": ` You may spend a week of downtime in Luxury lifestyle being pampered at the expense of your benefactors. You gain the benefits of the Relaxation downtime activity or you may Prepare for a downtime action immediately following this one, with a duration of no more than two workweeks.<br><br>If you prepare, in the following downtime action you may reroll one d20 rolled as part of one ability check.`,
			"detriment": `Roll a d6, on a 1 you have to spend the week doing the Side-Quest downtime activity instead.`,
		}, {
			"name": `Arcane Support`,
			"benefit": `Once per day, you may request the casting of a spell of any level up to half the Market Size +1 (rounded up) from a contact, provided you provide half the cost of any material components.`,
			"detriment": `They will only do so while it remains in their interest, and they know the reasons for doing so.`,
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
			"benefit": `All business you own in the region may add the Market Size to their profit roll.`,
			"detriment": ``,
		},];
		get infoHalfLicencing() {
			return this._infoHalfLicencing;
		}
		_infoFullLicencing = [{
			"name": `Free Swag`,
			"benefit": `You gain a 50% discount on all personal non-magical equipment and gear.`,
			"detriment": ``,
		},];
		get infoFullLicencing() {
			return this._infoFullLicencing;
		}
		_infoHalfFame = [{
			"name": `On the House`,
			"benefit": `You no longer need to pay for basic Ale (or similar) in taverns and inns as long as there are people to buy them for you.`,
			"detriment": `While benefiting in this manner, fans will hang on your every word, not much you say will stay private.`,
		}, {
			"name": `Spare Room`,
			"benefit": `You can find lodging and food of Poor standard for your band for free at short notice, as you lodge at a fans house.`,
			"detriment": `You may be expected to regale them with a tale, defend them from attack, or perhaps have awkward conversations about personal space.`,
		}, {
			"name": `A Fan Gave Me This`,
			"benefit": `Once per day, you may produce a non-magical item worth up to 1 GP that a fan could have conceivable given to you previously.`,
			"detriment": `When you use the item, roll a d20. On a 1 it was actually sent from a Rival or detractor and fails turning into an annoying but harmless prank.`,
		},];
		get infoHalfFame() {
			return this._infoHalfFame;
		}
		_infoFullFame = [{
			"name": `Would You Kindly`,
			"benefit": `Once per day, whenever travelling in a suitable area you may summon up to your Charisma modifier + d4 Commoners from a suitable gathering of fans to carry out basic tasks for you.`,
			"detriment": `Your fans are relentless in looking for you. Attempts to hide your identity or evade them are at disadvantage as they relentless track you down.`,
		}, {
			"name": `Fan Mob`,
			"benefit": `You may rally a group of diehard supporters. The number of fans is proportionate to the population of the location you are in, in a city this might be several hundred, in a small village it might be two.`,
			"detriment": `Spend 1 Fame from your local Market to use.`,
		}, {
			"name": `Shelter`,
			"benefit": `A group of diehard, devoted fans, take you in and shelter you. They will shield you from the law or anyone else searching for you, risking their lives as necessary. While there you gain the benefit of a Poor lifestyle.`,
			"detriment": `Spend 1 Fame per day from your local Market to use.`,
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
			MarketInfo.view(options[0]);
		}
	});

	return scriptIndex;
})();