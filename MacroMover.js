on("ready",function(){    
    on("chat:message",function(msg){
        if(msg.type=="api" && msg.content.indexOf("!exportMacros")==0){
            var existingMacros = findObjs({type:"character",name:"MrMacro"});
            if (existingMacros!==undefined){
                _.each(existingMacros,function(mrMacro){
                    mrMacro.remove();
                })
				sendChat("MrMacro", "/w gm Previous MrMacro removed!",null,{noarchive:true})
            }
            
            var mrMacro = createObj("character", {
                name:"MrMacro",
                controlledby:msg.playerid
            });
            
            var macroList = findObjs({type:"macro"});
            _.each(macroList,function(macro){
                createObj("ability",{
                    characterid:mrMacro.get("id"),
                    name:macro.get("name"),
                    action:macro.get("action"),
                    istokenaction:macro.get("istokenaction"),
                    description:macro.get("visibleto")
                });
            });
			sendChat("MrMacro", "/w gm MrMacro ready!",null,{noarchive:true})
        }
    });
    
    on("chat:message",function(msg){
        if(msg.type=="api" && msg.content.indexOf("!importMacros")==0){
            var mrMacro = findObjs({type:"character",name:"MrMacro"})[0];
            if (mrMacro===undefined){
                sendChat("API","Please import MrMacro");
                return;
            }
            
            var abilityList = findObjs({type:"ability",characterid:mrMacro.get("id")});
            _.each(abilityList,function(ability){
                createObj("macro", {
                    name:ability.get("name"),
                    action:ability.get("action"),
                    istokenaction:ability.get("istokenaction"),
                    visibleto:ability.get("description"),
                    playerid:msg.playerid
                })
            });
           mrMacro.remove();
		   sendChat("MrMacro", "/w gm MrMacro has imported!",null,{noarchive:true})
        }
    });
});