on("ready",function(){  
	
	//DRAGON PUNCH
	on("chat:message",function(msg){
		if(msg.type==="api" && msg.content.indexOf("!dragonpunch")==0 && playerIsGM(msg.playerid)){
			log("DP!");
			// var character = findObjs({type:"character",controlledby:msg.playerid})[0];
			// var playerToken = findObjs({
				// type:"graphic",
				// subtype:"token",
				// represents:character.get("id"),
				// pageid:Campaign().get("playerpageid")
			// })[0];
			// sendPing(playerToken.get("left"),playerToken.get("top"),playerToken.get("pageid"),msg.playerid,true,msg.playerid);
		}
	});
	
	//ON MAP CHANGE
	on("change:campaign:playerpageid",function(){
        setTimeout(function(){
            pingStartToken();
        },1500);
    });
    
	//ON REQUEST PING START
	on("chat:message",function(msg){
		if(msg.type==="api" && msg.content.indexOf("!pingStart")==0 && playerIsGM(msg.playerid)){
			log("pingStart msg seen");
			pingStartToken(msg.playerid);
        }
    });
    
	//PING START TOKEN
    function pingStartToken(GMid){
        var tokens = findObjs({
            _name:"PlayerStart",
            _type:"graphic",
            _pageid:Campaign().get("playerpageid")
        });
        var playerStartToken = tokens[0];
        if (playerStartToken===undefined){
            log("playerStartToken undefined");
            return;
        }
		if (GMid===undefined || GMid ==""){
            log("GMid undefined");
			let GMid = "";
        }
        sendPing(playerStartToken.get("left"),playerStartToken.get("top"),playerStartToken.get("pageid"),GMid,true);
    }
	
	//ON REQUEST DELETE START
	on("chat:message",function(msg){
		if(msg.type==="api" && msg.content.indexOf("!deleteStart")==0 && playerIsGM(msg.playerid)){
			log("pingStart msg seen");
			deleteStartToken(msg.playerid);
        }
    });
		
	//DELETE START TOKEN
	function deleteStartToken(GMid){
		let player = getObj("player", GMid);
		let GMmapID = player.get("_lastpage");
        var tokens = findObjs({
            _name:"PlayerStart",
            _type:"graphic",
            _pageid:GMmapID
        });
        var playerStartToken = tokens[0];
        if (playerStartToken===undefined){
            log("playerStartToken undefined");
            return;
        }
		log("Deleting playerStartToken");
        playerStartToken.remove();
    }
	
	//REQUEST FLIP
	on("chat:message",function(msg){
		if(msg.type==="api" && msg.content.indexOf("!flipside")==0 && playerIsGM(msg.playerid)){
			log("flipside msg seen");
			flipside(msg.playerid);
        }
    });
	
	//DP FIND
    function flipside(GMid){
        var fliptokens = findObjs({
            _name:"PlayerStart",
            _type:"graphic",
            _pageid:Campaign().get("playerpageid")
        });
        var fliptoken = fliptokens[0];
        if (fliptoken===undefined){
            log("fliptoken undefined");
            return;
        }
		// if (GMid===undefined || GMid ==""){
            // log("GMid undefined");
			// let GMid = "";
        // }
        sendPing(fliptoken.get("left"),fliptoken.get("top"),fliptoken.get("pageid"),GMid,true);
		rotateRand(fliptoken);
		spawnFx(fliptoken.get('left'),fliptoken.get('top'),'explode-charm');
		placeOnMap(fliptoken);
		setTimeout(function(){
			flipmultiside(fliptoken);
		},1000);
		setTimeout(function(){
            spawnFx(fliptoken.get('left'),fliptoken.get('top'),'bomb-charm');
        },1100);
		setTimeout(function(){
            placeOnGML(fliptoken);
        },1600);
		setTimeout(function(){
            flipmultiside(fliptoken);
        },2100);
    };
	
	//DP ROTATE
	//rotation
	function rotateRand(fliptoken){
		let randrot = Math.floor(Math.random() * 60)-30;
		fliptoken.set("rotation",randrot);
	};
	
	//DP TO MAP
	function placeOnMap(fliptoken){
		fliptoken.set("layer","map");
	};

	//DP TO GML
	function placeOnGML(fliptoken){
		fliptoken.set("layer","gmlayer");
	};
	
	//DP FLIP
	function flipmultiside(fliptoken){
		let newside = fliptoken.get("currentSide") !== 0 ? 0 : 1;
		const tokenimgs = fliptoken.get("sides").split(/\|/).map(decodeURIComponent).map(getCleanImgsrc);
		fliptoken.set("currentSide",newside);
		fliptoken.set("imgsrc",tokenimgs[newside]);
		//spawnFx(fliptoken.get('left'),fliptoken.get('top'),'explode-charm');
	};
	
	
	//clean img urls
    const getCleanImgsrc = (imgsrc) => {
		let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
		if(parts) {
			return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
		}
		return;
    };
	
});




/*

if(msg.type=="api" && msg.content.indexOf("!pingMe")==0){
	var character = findObjs({type:"character",controlledby:msg.playerid})[0];
	var playerToken = findObjs({
		type:"graphic",
		subtype:"token",
		represents:character.get("id"),
		pageid:Campaign().get("playerpageid")
	})[0];
	sendPing(playerToken.get("left"),playerToken.get("top"),playerToken.get("pageid"),msg.playerid,true,msg.playerid);
}



 // Get list of tokens
      const tokenIDs = opts.ids ? opts.ids.split(",").map(x => x.trim())
        : (msg.selected || []).map(obj => obj._id);

      // Transform tokens into nice data packages
      const rollData = tokenIDs.map(id => getObj("graphic", id))
        .filter(x => !!x)
        .map(token => processTokenRollData(token, checkFormula, checkSpecial, opts))
        .reduce((m, o) => {
          if (o)
            for (let i = 0; i < opts.multi; i++) m.push(Object.assign({}, o));
          return m;
        }, []);

*/
