/*
PicMe
v0.03
now can accept token_id to give token imgs back
*/

on('ready', function() {
    on('chat:message', function(msg) {
       if (msg.type == "api" && msg.content.toLowerCase().indexOf("!picme") !== -1) {
           var charid =msg.content.split(/\s+/)[1];
           var character = getObj('character',charid);
		   var imgGetter = "avatar"
		   
		   	if (!character){
				character = getTokImg(charid);
				imgGetter = "imgsrc";
			}

           if(character) {
               var imghtml = "<div style='width:100%;padding-top:100%;position:relative;'><img style='display:inline-block;position:absolute;top:0;left:0;right:0;bottom:0;text-align:center;width:100%;' src='" + character.get(imgGetter) + "'></div>";
               sendChat(msg.who, "/direct "+imghtml, null, {noarchive:true});
            }
       };
    });

	function getTokImg(charid){
		let token = getObj('graphic',charid);
		if(token && token.get("_subtype")=="token"){
			return token;
		}
		return;
	}

});