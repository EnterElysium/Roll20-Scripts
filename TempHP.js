/* global TokenMod, ChatSetAttr */
on('ready', () => {

    // Configuration parameters
    const HPBarNum = 1;
    const THPBarNum = 3;
    const TempHPMarker = 'chained-heart';
    //const DeadMarker = 'dead';
    const TempHPAttributeName = 'hp_temp';
    /////////////////////////////////////////////

    const clearURL = /images\/4277467\/iQYjFOsYC5JsuOPUCI9RGA\/.*.png/;
    const bar = `bar${HPBarNum}_value`;
    const lnk = `bar${HPBarNum}_link`;
    const max = `bar${HPBarNum}_max`;
    //const barthp = `bar${THPBarNum}_value`;


    const unpackSM = (stats) => stats.split(/,/).reduce((m,v) => {
        let p = v.split(/@/);
        let n = parseInt(p[1] || '0', 10);
        if(p[0].length) {
            m[p[0]] = Math.max(n, m[p[0]] || 0);
        }
        return m;
    },{});

    const packSM = (o) =>  Object.keys(o)
        .map(k => ('dead' === k || true === o[k] || o[k]<1 || o[k]>9) ? k : `${k}@${parseInt(o[k])}` ).join(',');


    const checkTempHP = (obj) => {
        let v = parseFloat(obj.get('current'));

        findObjs({
            type: 'graphic',
            represents: obj.get('characterid')
        })
            .filter( (t) => t.get(lnk) !== '')
            .filter( (t) => !clearURL.test(t.get('imgsrc') ) )
            .forEach((g)=>{
                let sm = unpackSM(g.get('statusmarkers'));
                if(v>0){
                    //sm[TempHPMarker]=v;
                    //sm[TempHPMarker]=true;
                } else {
                    //delete sm[TempHPMarker];
                }

                g.set({
                    statusmarkers: packSM(sm)
                });

            });
    };

    const assureTempHPMarkers = () => {
        let queue = findObjs({
            type: 'attribute',
            name: TempHPAttributeName
        });
        const burndownQueue = ()=>{
            if(queue.length){
                let attr = queue.shift();
                checkTempHP(attr);
                setTimeout(burndownQueue,0);
            }
        };
        burndownQueue();
    };


    const temporalTempHPCache = {};

    const accountForHPBarChange = (obj,prev) => {
        // 1. did hp change and is it a scale
        const hpMax = parseInt(obj.get(max),10);
        let hp = parseInt(obj.get(bar),10);
        const diff = hp-parseFloat(prev[bar]);
        //log("Stage 0, hp is currently: "+hp+" out of "+hpMax);
        if( !isNaN(hpMax) && diff !== 0 ) {
            //log("Stage 1");
            let changes = {};

            // 2. does it represent a character
            // 3. does the hp bar represent an attribute
            const character = getObj('character',obj.get('represents'));
            if( diff < 0 && character && obj.get(lnk)!=='' ){
                //log("Stage 2 and 3");

                // 4. is there temp hp
                const temp_hp = findObjs({
                    type: 'attribute',
                    characterid: character.id,
                    name: TempHPAttributeName
                })[0];
                if( temp_hp ) {
                    const now = Date.now();
                    // 5. have we accounted for it.
                    if( !temporalTempHPCache.hasOwnProperty(character.id) || (now-temporalTempHPCache[character.id].when)>300 ) {
                        // calculate necessary change
                        const tempHP = parseFloat(temp_hp.get('current'))||0;
                        const newTmpHP = Math.max((tempHP+diff),0);
                        const toHeal = tempHP - newTmpHP;

                        temporalTempHPCache[character.id]={
                            when: now,
                            toHeal: toHeal
                        };
                        temp_hp.set('current', newTmpHP);
                        checkTempHP(temp_hp);
                    }

                    hp += temporalTempHPCache[character.id].toHeal;
                    changes[bar] = hp;
                }
            }
            let sm = unpackSM(obj.get('statusmarkers'));
/*
            if(hp > hpMax) {
                hp = hpMax;
                changes[bar] = hp;
                delete sm[DeadMarker];
            } else if(hp <= 0) {
                hp=0;
                changes[bar] = hp;
                sm[DeadMarker] = true;
            } else {
                delete sm[DeadMarker];
            }*/
            changes.statusmarkers = packSM(sm);
            obj.set(changes);
        }
    };

    const onAttributeChange = (obj) => {
        if(obj.get('name') === TempHPAttributeName){
            log("Attribute Changed, checking tempHP");
            checkTempHP(obj);
        }
    };


    on("change:attribute", onAttributeChange);

    on("change:token", accountForHPBarChange);

    if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
        TokenMod.ObserveTokenChange(accountForHPBarChange);
        log("TokenMod Obs Change");
    }
    if('undefined' !== typeof ChatSetAttr && ChatSetAttr.registerObserver){
        ChatSetAttr.registerObserver('change',onAttributeChange);
        log("ChatSetAttr Reg Obs");
    }

    assureTempHPMarkers();
});