const setupNPC = (function() {	

	const scriptIndex = {"name":"setupNPC","version":"v0.01",};

	on("chat:message", function(msg) {

		if (msg.type==="api" && msg.content.toLowerCase().indexOf("!setupnpc")==0){
			Chandler(msg);
			return;
		}
	});

	//API CHAT HANDLER
	function Chandler(msg){
		let args = msg.content.split(/\s+/);

		let charid = args[1];

		if(getAttrByName(charid,"npc")!==1){
			chatter(scriptIndex.name,"w",msg.who,"character is not using an NPC sheet.",null,"{noarchive:true}");
			return;
		}
		else{
			let rtype = findObjs({
				_characterid: charid,
				_type: "attribute",
				name: "rtype"
			})[0];
			if(rtype){
				rtype.set("current","{{always=1}} {{r2=[[@{d20}");
			}
			else{
				createObj("attribute", {
					name: "rtype",
					current: "{{always=1}} {{r2=[[@{d20}",
					max: "",
					characterid: charid
				});
				log("New rtype created on "+charid+" for value of : {{always=1}} {{r2=[[@{d20}");
			}

			let init_tiebreaker = findObjs({
				_characterid: charid,
				_type: "attribute",
				name: "init_tiebreaker"
			})[0];
			if(init_tiebreaker){
				init_tiebreaker.set("current","@{dexterity}/100");
			}
			else{
				createObj("attribute", {
					name: "init_tiebreaker",
					current: "@{dexterity}/100",
					max: "",
					characterid: charid
				});
				log("New init_tiebreaker created on "+charid+" for value of : @{dexterity}/100");
			}

			let npc_name_flag = findObjs({
				_characterid: charid,
				_type: "attribute",
				name: "npc_name_flag"
			})[0];
			if(npc_name_flag){
				npc_name_flag.set("current","0");
			}
			else{
				createObj("attribute", {
					name: "npc_name_flag",
					current: "0",
					max: "",
					characterid: charid
				});
				log("New npc_name_flag created on "+charid+" for value of : 0");
			}

			let wtype = findObjs({
				_characterid: charid,
				_type: "attribute",
				name: "wtype"
			})[0];
			if(wtype){
				wtype.set("current","/w gm");
			}
			else{
				createObj("attribute", {
					name: "wtype",
					current: "/w gm",
					max: "",
					characterid: charid
				});
				log("New wtype created on "+charid+" for value of : /w gm");
			}

			let dtype = findObjs({
				_characterid: charid,
				_type: "attribute",
				name: "dtype"
			})[0];
			if(dtype){
				dtype.set("current","full");;
			}
			else{
				createObj("attribute", {
					name: "dtype",
					current: "full",
					max: "",
					characterid: charid
				});
				log("New dtype created on "+charid+" for value of : full");
			}

			chatter(scriptIndex.name,"w",msg.who,`${charid} given default NPC settings.`,null,"{noarchive:true}");
		}
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