const tipPost = (function() {	

	const scriptIndex = {"name":"tipPost","version":"v0.01",};

	on("chat:message", function(msg) {

		if (msg.type==="api" && msg.content.toLowerCase().indexOf("!tippost")==0){
			Chandler(msg);
			return;
		}
	});

	//API CHAT HANDLER
	function Chandler(msg){
		let args = msg.content.split(/\s+/);

		let tokenid = args[1];
		let token = getObj("graphic",tokenid);

		//msg.who
		let controller = token.get("controlledby");
		let tooltip = token.get("tooltip");
		logger(token.get("name"));
		let tokenName = token.get("name");
		if(tokenName.length === 0){
			tokenName = "Map Tooltip";
		}

		let slashCom = "";
		let whisperTo = "";
		let textInner = tooltip;

		if(token.get("type") == "graphic" && token.get("subtype") == "token"){
			if(tooltip.length === 0){
				slashCom = "w";
				whisperTo = msg.who;
				tokenName = "Map Tooltip";
				textInner = "Sorry the selected token has nothing to share.";
			}
			else if(controller === "all"){
				slashCom = "";
				whisperTo = "";
			}
			else{
				slashCom = "w";
				whisperTo = msg.who;
				tokenName = "Map Tooltip";
				textInner = "Sorry the selected token is not available to all.";
			}


			let msgText = `&{template:npcaction} {{rname=${tokenName}}} {{description=<i>${textInner}</i>}}`;

			chatter(null,slashCom,whisperTo,msgText,null,"{noarchive:true}");
			return;
		}

		logger(token.get("tooltip"));

	};

	//log stuff
    function logger(logtext){
        log(scriptIndex.name+", "+scriptIndex.version+": "+logtext);
    };

	//chat bullocks
    function chatter(spkAs,slashCom,whisperTo,msgText,options){
		if(slashCom && slashCom.toLowerCase() == "w"){
			if(typeof whisperTo === "string"){
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
        options ? options = JSON.parse(options) : false ;
        sendChat(spkAs,msgContents,null,options);
    };

	return scriptIndex;
})();