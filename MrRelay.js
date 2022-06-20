on('ready', function() {
	
    on('chat:message', function(msg) {
       if (msg.type == "api" && msg.content.toLowerCase().indexOf("!mrrelay") !== -1) {
			var macroReq = msg.content.split(/\s+/)[1];
			var macroMatches = findObjs({type:"macro",name:macroReq});
			if (macroMatches == undefined || macroMatches.length == 0){
				sendChat("MrRelay", "/w "+msg.who+" "+macroReq+" not recognised.",null,{noarchive:true})
				return;
			}
			var macroMatch = macroMatches[0];
			sendChat(msg.who, macroMatch.get("action"),null)
        }
    });
	
    on('chat:message', function(msg) {
       if (msg.type == "api" && msg.content.toLowerCase().indexOf("!mrsrelay") !== -1) {
			var macroMatches = findObjs({type:"macro",name:"Pies"});
			if (acroMatches == undefined || macroMatches.length == 0){
				sendChat("MrRelay", "/w "+msg.who+" "+macroReq+" not recognised.",null,{noarchive:true})
				return;
			}
			var macroMatch = macroMatches[0];
			sendChat(msg.who, macroMatch.get("action"),null,{noarchive:true})
        }
    });
	
});