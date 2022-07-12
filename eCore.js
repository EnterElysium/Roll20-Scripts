const eCore = (function() {	

	const scriptIndex = {
		"name":"eCore",
		"version":"v0.01",
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
		},
		"dice":{
			"extractDice":extractDice,
			"extract":extractDice,
		},
		"chat":chat,
	};

	//API CHAT HANDLER
	function processBasic(msg,api){
		if(msg.type === "api" && msg.content.toLowerCase().startsWith(`!${api}`)){
			let args = argsBasic(msg);
			args.shift();
			return args;
		}
		return false;
	};

	function argsBasic(msg){
		let args = msg.content.split(/\s+/);
		return args;
	};

	function processAdv(msg,api){
		if(msg.type === "api" && msg.content.toLowerCase().startsWith(`!${api}`)){
			let args = argsAdv(msg);
			return args;
		}
		return false;
	};

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
	};

	function argsAdvCompare(args,cmd){
		if(_.indexOf(_.pluck(args,"cmd"),cmd) != -1){
			for (let flag of args) {
				if(flag.cmd === cmd){
					return flag.params;
				}
			}
		}
		return false;
	};

	//error handler
	function logBasic(errorMsg){
		log(errorMsg);
	}

	//log stuff
    function logAdv(logtext,name,version){
        log(name+", "+version+": "+logtext);
    };

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
    };

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
	};

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
		};
		return false;
	};

	return scriptIndex;
})();