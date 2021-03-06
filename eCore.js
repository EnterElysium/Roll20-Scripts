// eslint-disable-next-line no-unused-vars
const eCore = (function() {	

	const scriptIndex = {
		"name":"eCore",
		"version":"v0.01",
		"msg":{
			"process":processBasic,
			"processAdv":processAdv,
			"args":argsBasic,
			"argsAdv":argsAdv,
			"compareAdv":argsAdvCompare,
		},
		"msgProcess":{
			"basic":processBasic,
			"advanced":processAdv,
			"b":processBasic,
			"adv":processAdv,
		},
		"msgArgs":{
			"basic":argsBasic,
			"advanced":argsAdv,
			"b":argsBasic,
			"adv":argsAdv,
		},
		"msgCompare":{
			"advanced":argsAdvCompare,
			"adv":argsAdvCompare,
		},
		"log":{
			"basic":logBasic,
			"advanced":logAdv,
			"b":logBasic,
			"adv":logAdv,
		},
		"utility":{
			"getRandom":getRandom,
			"rand":getRandom,
			"random":getRandom,
			"encodeHTML":encodeHTML,
			"html":encodeHTML,
			"numbersToWords":numberToEnglish,
			"numberToWords":numberToEnglish,
			"numberToWord":numberToEnglish,
			"numToWord":numberToEnglish,
		},
		"dice":{
			"extractDice":extractDice,
			"extract":extractDice,
		},
		"chat":chat,
		"get":{
			"character":getCharacter,
		},
		"repeating":{
			"sections":sections,
			"byPrefix":getRepeatingSectionAttrs,
			"mapRepeating":mapRepeating,
			"all":allRepeating,
		},
		"language":{
			"capitalise":{
				"firstOfString":capFirstLetterOfString,
				"first":capFirstLetterOfString,
			},
		},
	};

	//Repeating
	/**get specific repeating skill for id and prefix */
	function allRepeating(id){
		let sectionList = sections(id)
		let rObjsAll = []
		_.each(sectionList,function(s){
			let [repRowIDs,repAttrs] = getRepeatingSectionAttrs(id,s)
			let repAttrsArray = objToArray(repAttrs)
			rObjsAll.push(mapRepeating(repRowIDs,repAttrsArray))
		})
		return rObjsAll;
	}
	function objToArray(obj){
		let array = []
		for (const key of Object.keys(obj)) {
			array.push(key, obj[key]);
		}
		return array;
	}
	/**given an array of repeating row ids and an array of repeating attributes will return them as useful objects */
	function mapRepeating(repRowIDs,repAttrs){
		let rObjs = [];
		//for each row id
		_.each(repRowIDs,function(rowID){
			//fitler for the bits of repeats that share the row ids
			log(repAttrs)
			let repAttr = repAttrs.filter(a => a.name.indexOf(rowID) > -1)
			let repNameField = ``
			let repObj = []
			_.each(repAttr,function(r){
				let name = r.get("name")
				//the "name" should be the bit after the id
				name = name.slice(name.indexOf(rowID)+rowID.length+1)
				let cur = r.get("current")
				let max = r.get("max")
				let vals;
				if(cur && cur.length > 0){
					if(max && max.length > 0){
						vals = [cur,max]
					}
					vals = cur
				}
				else if(max && max.length > 0){
					vals = max
				}
				if(name==="name"){
					repNameField = name;
				}
				else{
					repObj.push({
						name : vals
					})
				}
			})
			rObjs.push({
				"id":rowID,
				"name":repNameField,
				"repfields":repObj,
			})
		})
		//all collected now
		return rObjs;
	}
	/**given a charid and a repeating row prefix will give the row ids and all the attributes related to those */
	function getRepeatingSectionAttrs(charid, prefix){
		const repeatingAttrs = {},
			regExp = new RegExp(`^${prefix}_(-[-A-Za-z0-9]+?|\\d+)_`);
		let repOrder;
		// Get attributes
		findObjs({
			_type: 'attribute',
			_characterid: charid
		}).forEach(o => {
			const attrName = o.get('name');
			if (attrName.search(regExp) === 0) repeatingAttrs[attrName] = o;
			else if (attrName === `_reporder_${prefix}`) repOrder = o.get('current').split(',');
		});
		if (!repOrder) repOrder = [];
		// Get list of repeating row ids by prefix from repeatingAttrs
		const unorderedIds = [...new Set(Object.keys(repeatingAttrs)
			.map(n => n.match(regExp))
			.filter(x => !!x)
			.map(a => a[1]))];
		const repRowIds = [...new Set(repOrder.filter(x => unorderedIds.includes(x)).concat(unorderedIds))];
		return [repRowIds, repeatingAttrs];
	}
	/**given a character id will get the prefixes of all uniq repeating sections */
	function sections(id){
		let attrList = findObjs({
			type: "attribute",
			characterid: id,
		});
		let nameList = _.filter(attrList, a => {
			if(a.get('name').indexOf('repeating_') > -1){return true;}
			else{return false;}
		});
		let arraySections = [];
		_.each(nameList,function(a){
			if(a.get("name").search(/(repeating_.+?)_/) > -1){
				a = a.get("name").match(/(repeating_.+?)_/)
				arraySections.push(a[1])
			}
		});
		arraySections = _.uniq(arraySections)
		return arraySections;
	}
	

	//Language
	function capFirstLetterOfString(str){
		return str[0].toUpperCase() + str.substring(1);
	}

	//Roll20 simplifiers
	/** idtype is a string that is either character or token, otherwise leave blank
	@param {string} idtype 
	@param {string|Object} thing 
	@return {object|false}*/
	function getCharacter(thing,idtype=false){
		if(typeof thing === "object"){
			if(typeof thing.get === "function"){
				thing = thing.get("represents")
				idtype = `character`
			}
			else{
				thing = thing["represents"]
				idtype = `character`
			}
		}
		if(idtype !== false && typeof thing === "string"){
			if(idtype === "token"){
				thing = getObj('graphic',thing)
				if(!thing || typeof thing.get !== "function"){
					return false;
				}
				thing = thing.get('represents')
				idtype = `character`
			}
			if(idtype === `character`){
				if(!thing){return false}
				return getObj('character',thing)
			}
		}
	}

	//API CHAT HANDLER
	function processBasic(msg,api){
		if(msg.type === "api" && msg.content.toLowerCase().startsWith(`!${api}`)){
			let args = argsBasic(msg);
			args.shift();
			return args;
		}
		return false;
	}

	function argsBasic(msg){
		let args = msg.content.split(/\s+/);
		return args;
	}

	function processAdv(msg,api){
		if(msg.type === "api" && msg.content.toLowerCase().startsWith(`!${api}`)){
			let args = argsAdv(msg);
			return args;
		}
		return false;
	}

	function argsAdv(msg){
		let args = msg.content.split(/\s+--/).map(arg=>{
			let cmds = arg.split(/\s+/);
			return {
				"cmd": cmds.shift().toLowerCase(),
				"params": cmds
			};
		});
		args.shift();
		return args;
	}

	function argsAdvCompare(args,cmd){
		if(_.indexOf(_.pluck(args,"cmd"),cmd) != -1){
			for (let flag of args) {
				if(flag.cmd === cmd){
					return flag.params;
				}
			}
		}
		return false;
	}

	//error handler
	function logBasic(errorMsg){
		log(errorMsg);
	}

	//log stuff
    function logAdv(logtext,name,version){
        log(name+", "+version+": "+logtext);
    }

	//chat bullocks
    function chat(msgText,slashCom,whisperTo,options,spkAs){
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
					log("whisper target not recognised as string or tagged array object");
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
        msgText ? msgContents = msgContents.concat(` ${msgText}`) : log("chat request but no msgText specified") ;
        options == "noarchive" ? options = {noarchive:true} : false ;
        sendChat(spkAs,msgContents,null,options);
    }

	function getRandom(min=0, max=100,intBool=true,incBool=true) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
	}

	function encodeHTML(string){
		//string = string.replace(/&/g,"&#38;");
		//string = string.replace(/'/g,"&#39;");
		string = string.replace(/@/g,"&#64;");
		string = string.replace(/{/g,"&#123;");
		//string = string.replace(/}/g,"&#125;");
		//string = string.replace(/\|/g,"&#124;");
		//string = string.replace(/\[/g,"&#91;");
		//string = string.replace(/\]/g,"&#93;");
		return string;
	}

	function extractDice(msg){
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
		}
		return false;
	}

	function numberToEnglish(n, custom_join_character) {
		var string = n.toString(), units, tens, scales, start, end, chunks, chunksLen, chunk, ints, i, word, words;
		var and = custom_join_character || 'and';
		/* Is number zero? */
		if (parseInt(string) === 0) {
			return 'zero';
		}
		/* Array of units as words */
		units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
		/* Array of tens as words */
		tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
		/* Array of scales as words */
		scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion'];
		/* Split user arguemnt into 3 digit chunks from right to left */
		start = string.length;
		chunks = [];
		while (start > 0) {
			end = start;
			chunks.push(string.slice((start = Math.max(0, start - 3)), end));
		}
		/* Check if function has enough scale words to be able to stringify the user argument */
		chunksLen = chunks.length;
		if (chunksLen > scales.length) {
			return '';
		}
		/* Stringify each integer in each chunk */
		words = [];
		for (i = 0; i < chunksLen; i++) {
			chunk = parseInt(chunks[i]);
			if (chunk) {
				/* Split chunk into array of individual integers */
				ints = chunks[i].split('').reverse().map(parseFloat);
				/* If tens integer is 1, i.e. 10, then add 10 to units integer */
				if (ints[1] === 1) {
					ints[0] += 10;
				}
				/* Add scale word if chunk is not zero and array item exists */
				if ((word = scales[i])) {
					words.push(word);
				}
				/* Add unit word if array item exists */
				if ((word = units[ints[0]])) {
					words.push(word);
				}
				/* Add tens word if array item exists */
				if ((word = tens[ints[1]])) {
					words.push(word);
				}
				/* Add 'and' string after units or tens integer if: */
				if (ints[0] || ints[1]) {
					/* Chunk has a hundreds integer or chunk is the first of multiple chunks */
					if (ints[2] || !i && chunksLen && chunksLen > 1) {
						words.push(and);
					}
				}
				/* Add hundreds word if array item exists */
				if ((word = units[ints[2]])) {
					words.push(word + ' hundred');
				}
			}
		}
		return words.reverse().join(' ');
	}

	return scriptIndex;
})();