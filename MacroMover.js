const macromover = (function() {	

	const scriptIndex = {"name":"MacroMover","version":"v0.02",};
    const autoUpdate = true;
    const dupeRemoval = true;

	class CSS{
		static container = `position: relative; border:1px solid #333; background-color: #fff; padding:5px 6px 6px 6px;margin: -16px -6px 0px -6px;z-index:11;`;
		static text = `font-size:12px;`;
		static bullet = `font-family: Pictos; padding-right: 0.5em;`
		static btnInvis = `vertical-align: middle;color: #000; background-color: transparent; padding: 0; border: none; overflow: hidden; text-overflow: ellipsis; width:100%; margin: 0px;`;
		static icon(type){
			let char;
			let col = `color: `
			switch(type){
				case `3`:
				case `yes`:
				case `check`:  char = `3`; col += `darkgreen`; break;
				case `R`:
				case `sent`:
				case `unpack`:  char = `R`; col += `darkgreen`; break;
				case `s`:
				case `detected`:
				case `detect`: char = `s`; col += `darkgreen`; break;
				case `alert`:
				default: char = `!`; col += `darkred`; break;
			}
			return `<span style="${CSS.bullet}${col}">${char}</span>`
		}
	}

	class Tasks{
		static check(){

		}
		//EXPORT TO CARRIER
		static export(pid,opt){
			let msgtxt = ``;
			let existingMacros = findObjs({type:"character",name:"MacroMover"});
			if (existingMacros!==undefined && existingMacros.length ){
				_.each(existingMacros,function(m){
					m.remove();
				})
				msgtxt += `previous MacroMover removed and `
				//sendChat("MacroMover", "/w gm Previous MacroMover removed!",null,{noarchive:true})
			}
			
			let macroMover = createObj("character", {
				name:"MacroMover",
				controlledby:pid,
			});
			
            let dupetxt = ``;
            if(opt===`cleanup`){
                let dupes = this.cleanup(pid,true)
                dupes > 0 ? dupetxt += `${eCore.utility.numberToWords(dupes)} macros cleaned up.` : dupetxt += `no duplicates found.` ;
                dupetxt = `. ${eCore.language.capitalise.first(dupetxt)}`
            }

			let macroList = findObjs({type:"macro"});
            if(dupeRemoval){
                macroList = _.uniq(macroList,false,function(m){return `${m.get("name")}${m.get("action")}`;})
                macroList = _.sortBy(macroList, function(m){return m.get("name");})
            }
			_.each(macroList,function(macro){
				createObj("ability",{
					characterid:macroMover.get("id"),
					name:macro.get("name"),
					action:macro.get("action"),
					istokenaction:macro.get("istokenaction"),
					description:macro.get("visibleto")
				});
			});
			msgtxt += `MacroMover constructed${dupetxt}`
			msgtxt = eCore.language.capitalise.first(msgtxt)
			msgtxt = this.msgConstructor(msgtxt,`check`)
			eCore.chat(msgtxt,`w`,`gm`,`noarchive`,scriptIndex.name)
		}
		//IMPORT FROM CARRIER
		static import(pid){
			let msgtxt = ``
			let macroMover = findObjs({type:"character",name:"MacroMover"})[0];
			if (macroMover===undefined){
				msgtxt += `Please import MacroMover`
				msgtxt = this.msgConstructor(msgtxt,`alert`)
				eCore.chat(msgtxt,`w`,`gm`,`noarchive`,scriptIndex.name)
				return;
			}
			
			let abilityList = findObjs({type:"ability",characterid:macroMover.get("id")});
			_.each(abilityList,function(ability){
				createObj("macro", {
					name:ability.get("name"),
					action:ability.get("action"),
					istokenaction:ability.get("istokenaction"),
					visibleto:ability.get("description"),
					playerid:pid
				})
			});
			macroMover.remove();
			msgtxt += `MacroMover has imported`
			msgtxt = this.msgConstructor(msgtxt,`unpack`)
			eCore.chat(msgtxt,`w`,`gm`,`noarchive`,scriptIndex.name)
		}
		//UPDATE TO CARRIER
		static update(pid,name){
			let msgtxt = ``;
			let existingMacros = findObjs({type:"character",name:"MacroMover"});
			if(existingMacros===undefined || existingMacros.length === 0){
				return;
			}
			else{
                if(dupeRemoval){
                    existingMacros = _.uniq(existingMacros,false,function(m){return `${m.get("name")}${m.get("action")}`;})
                    existingMacros = _.sortBy(existingMacros, function(m){return m.get("name");})
                }
				_.each(existingMacros,function(m){m.remove();})
			}
			
			let macroMover = createObj("character", {
				name:"MacroMover",
				controlledby:pid,
			});
			
			let macroList = findObjs({type:"macro"});
			_.each(macroList,function(macro){
				createObj("ability",{
					characterid:macroMover.get("id"),
					name:macro.get("name"),
					action:macro.get("action"),
					istokenaction:macro.get("istokenaction"),
					description:macro.get("visibleto"),
				});
			});
			msgtxt += `MacroMover detected changes. Automatically updated to include ${name}.`
			msgtxt = this.msgConstructor(msgtxt,`detect`)
			eCore.chat(msgtxt,`w`,`gm`,`noarchive`,scriptIndex.name)
		}
        //CLEANUP AND REMOVE DUPLICATE PLAYER MACROS
        static cleanup(id,callback=false){
            let macroList = findObjs({type:"macro",playerid:id});
            let cleanlist = [];
            let removed = 0;
            for(let m of macroList){
                let dupe = cleanlist.some(c => c.get("name") === m.get("name") && c.get("action") === m.get("action"))
                let apiHB;
                m.get("action").startsWith(`!api-heartbeat`) && m.get("name").startsWith(`!`) ? apiHB = true : apiHB = false ;
                let empty;
                m.get("action") ? empty = false : empty = true ;
                if(dupe && !apiHB){
                    removed++
                    m.remove()
                } //remove blank actions
                else if(!apiHB && empty){
                    removed++
                    m.remove()
                }
                else if(!dupe){
                    cleanlist.push(m)
                }
                else{
                    log(`MacroMover Exception on Cleanup: ${m}`)
                }
            }
            if(callback){
                return removed;
            }
            else{
                let msgtxt = `MacroMover cleaned up ${eCore.utility.numberToWords(removed)} macros.`
                msgtxt = this.msgConstructor(msgtxt,`detect`)
                eCore.chat(msgtxt,`w`,`gm`,`noarchive`,scriptIndex.name)
            }
        }
		//CONSTRUCT MESSAGE
		static msgConstructor(txt,icon=`detect`){
			let html = ``
			html += `<div class="whohidder" style="${CSS.container}">`
			html += CSS.icon(icon)
			html += `<span style="${CSS.text}">`
			html += txt
			html += `</span>`
			html += `</div>`
			return html
		}
	}

	on("chat:message",function(msg){
		let cmds = eCore.msgProcess.basic(msg,`macromover`)
        let cmd = cmds[0]
        let opt = cmds[1]
		if(!cmd || !playerIsGM(msg.playerid)){return;}
		
        switch(cmd){
            case `import`: Tasks.import(msg.playerid,opt); break;
            case `export`: Tasks.export(msg.playerid,opt); break;
            case `cleanup`: Tasks.cleanup(msg.playerid); break;
            default: return;
		}
	});

	on("change:macro",function(macro){
        //don't act on API hearbeat
        if(macro.get("action").startsWith(`!api-heartbeat`)){
        }
        else{
            let owner = macro.get("_playerid")
            if(playerIsGM(owner) && autoUpdate){
                Tasks.update(owner,macro.get("name"))
            }
        }
	})

	return scriptIndex;
})();