const ObjInspector = (function() {	
	
	const scriptIndex = {"name":"ObjInspector","version":"v0.01",};
	
    on('chat:message', function(msg) {
       if (msg.type == "api" && msg.content.toLowerCase().indexOf("!objinspect") !== -1) {
            let args = msg.content.split(/\s+/);
            log(args);
            switch(args[1]){
                //send crit override to player
                case "represents":
                    log("HELLO")
                    represents(...args.slice(2));
                    break;
                case "repAttr":
                    repAttr(...args.slice(2));
                    break;
                case "test":
                    repTest();
                    break;
                case "test2":
                    repCharTest(...args.slice(2));
                    break;
                case "inpj": log(getObj('character', args[2]).get("inplayerjournals")); return;
                default:
                    misc(...args.slice(1));
                    break;
            }
        }
    });

    function represents(id){
        let token = getObj('graphic', id);
        log(token.get("represents"));
        getObj('character',obj.get('represents')).get('controlledby')

    }
	
    function misc(type,id){
        let objToInspect = getObj(type,id);
        if(!objToInspect){
            log("ObjInspec: no valid argument found");
            return;
        }
        log(typeof objToInspect);
        log(objToInspect);
        return;
    };

    function repAttr(id,idRep){
        //!objinspect repAttr -M7tTaiSvMFgbPpZj1r9 repeating_attack_-MOmu1DMcICZf83c7nrK_atkname
        let objToInspect = getAttrByName(id,idRep); //this gets the name of the repeating section
        log(typeof objToInspect);
        log(objToInspect);
        return;
    };

    function repTest(){
        let repid = "-MOmu1DMcICZf83c7nrK";
        let charid = "-M7tTaiSvMFgbPpZj1r9";
        let objToInspect = findObjs({type:'attribute',characterid:charid,name:`repeating_attack_${repid}`});
        findObjs({
            _characterid: charid,
            _type: "attribute",
            name: "hp"
        })[0]
        if(!objToInspect){
            log("ObjInspec: no valid obj found");
            return;
        }
        log(typeof objToInspect);
        log(objToInspect);
        log(JSON.stringify(objToInspect));
        return;
    };

    function repCharTest(charid,name){
        name = "-MOmu1DMcICZf83c7nrK";
        charid = "-M7tTaiSvMFgbPpZj1r9";
        //let character = getObj('character',charid);
        log(68);
        let objToInspect = attrLookup(charid,name);
        log(typeof objToInspect);
        log(objToInspect);
        log(JSON.stringify(objToInspect));        
    };

    function attrLookup(character,name,caseSensitive){
        let match=name.match(/^(repeating_.*)_\$(\d+)_.*$/);
        if(match){
            let index=match[2],
                attrMatcher=new RegExp(`^${name.replace(/_\$\d+_/,'_([-\\da-zA-Z]+)_')}$`,(caseSensitive?'i':'')),
                createOrderKeys=[],
                attrs=_.chain(findObjs({type:'attribute', characterid:character.id}))
                    .map((a)=>{
                        return {attr:a,match:a.get('name').match(attrMatcher)};
                    })
                    .filter((o)=>o.match)
                    .each((o)=>createOrderKeys.push(o.match[1]))
                    .reduce((m,o)=>{ m[o.match[1]]=o.attr; return m;},{})
                    .value(),
                sortOrderKeys = _.chain( ((findObjs({
                        type:'attribute',
                        characterid:character.id,
                        name: `_reporder_${match[1]}`
                    })[0]||{get:_.noop}).get('current') || '' ).split(/\s*,\s*/))
                    .intersection(createOrderKeys)
                    .union(createOrderKeys)
                    .value();
            if(index<sortOrderKeys.length && _.has(attrs,sortOrderKeys[index])){
                return attrs[sortOrderKeys[index]];
            }
            return;
        } 
        return findObjs({ type:'attribute', characterid:character.id, name: name}, {caseInsensitive: !caseSensitive})[0];
    };


	return scriptIndex;
})();