on('ready', function() {
    on('chat:message', function(msg) {
       if (msg.type == "api" && msg.content.indexOf("!char-pic") !== -1) {
           var charid =msg.content.split(' ')[1];
           var c = getObj('character',charid);

           if(c) {
//               var fPart = "<div style='box-shadow: 3px 3px 2px #888888; font-family: Verdana; text-shadow: 2px 2px #000; text-align: center; vertical-align: middle; padding: 1px 1px; margin-top: 0.1em; border: 1px solid #000; border-radius: 8px 8px 8px 8px; color: #FFFFFF;"
//               var tPic = fPart + "background-color:#666666;'>● " + c.get('name') + " ●</div>";
//               var Pic = fPart + "background-color:#AAAAAA;'><img src='" + c.get('avatar') + "'></div>";
               var Pic = fPart + "<div style=''><img src='" + c.get('avatar') + "'></div>";
               sendChat('', "/direct " Pic);
            }
       };
    });
});