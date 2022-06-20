on('ready', function() {
    on('chat:message', function(msg) {
		if( (msg.rolltemplate == "atk" || msg.rolltemplate == "atkdmg" ) && msg.inlinerolls){
			if(msg.inlinerolls[0]==undefined){
					return;
			}
			log("rT: "+msg.rolltemplate);
			log("who: "+msg.who);
			log("pid: "+msg.playerid);
			log("type: "+msg.type);
			log("cont: "+msg.content);
			log("oRoll: "+msg.origRoll);
			log(msg.inlinerolls[0]);
			let gRD = libInline.getRollData([msg.inlinerolls[0]]);
			log(gRD);
			let gD = libInline.getDice(msg.inlinerolls[0],"included");
			log("gD: "+gD);
		}
    });
});