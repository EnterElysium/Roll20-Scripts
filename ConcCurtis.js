on('ready', () => {
const TOKEN_CONCENTRATING_STATUS_MARKER = "status_" + "Concentrating::35390";
on("change:graphic:bar1_value", function(obj, prev) {
    if (obj.get(TOKEN_CONCENTRATING_STATUS_MARKER)) {
        log ("status marker is " + obj.get(TOKEN_CONCENTRATING_STATUS_MARKER));
        //let playerPage = Campaign().get("playerpageid");
        //let tokenPage = obj.get("_pageid");
        if (prev["bar1_value"] > obj.get("bar1_value")) {
            let final_conc_DC = 10;
            let calc_conc_DC = (prev["bar1_value"] - obj.get("bar1_value")) / 2;
            if (calc_conc_DC > final_conc_DC) {
                final_conc_DC = Math.floor(calc_conc_DC);
            }
            
            let tokenName = obj.get("name");
            
            let theMessage = "/w gm &{template:npcaction} {{rname=Concentration Check "+tokenName+"}} {{name="+tokenName+"}} {{description=[DC " +final_conc_DC + " Constitution](~selected|constitution_save)"+ "&#10;" +"*[Toggle Concentration Marker](!token-mod --sel --set statusmarkers|!Concentrating)*}}";
sendChat("Concentration",theMessage );        
        }
    }
});
});