/* global TokenMod */
on('ready',()=>{

    // CONFIGURE
    const bar  = 1;
    const bloodied = "bleed::1953453";
    const dead = "dead";


    // no edit below here //
    const unpackSM = (stats) => stats.split(/,/).reduce((m,v) => {
        let p = v.split(/@/);
        p[0]=p[0].toLowerCase();
        let n = parseInt(p[1] || '0', 10);
        if(p[0].length) {
            m[p[0]] = Math.max(n, m[p[0]] || 0);
        }
        return m;
    },{});

    const packSM = (o) =>  Object.keys(o)
        .map(k => ('dead' === k || true === o[k] || o[k]<1 || o[k]>9) ? k : `${k}@${parseInt(o[k])}` ).join(',');


    const handleBarChange = (obj) => {
        const  bv = parseFloat(obj.get(`bar${bar}_value`));
        const  bm = parseFloat(obj.get(`bar${bar}_max`));

        if(Number.isNaN(bm)){
            return;
        }

        let sm = unpackSM(obj.get('statusmarkers'));
        let PC = (getObj('character', obj.get('represents')) || obj).get('controlledby');
        let anyC;
        if (getObj('character', obj.get('represents'))) {
           anyC = true
        }


        let fxh = obj.get('left')
        let fxv = obj.get('top')
        let fxl = (obj.get('height')+obj.get('width'))/2
        let fxa = Math.random()*Math.PI*2;
       
        if(bv <= (bm / 2) && bv > 0 && anyC ) {
            sm[bloodied] = true;
            spawnFxBetweenPoints(
                {x:fxh,y:fxv},
                {x:fxh+Math.cos(fxa)*fxl,y:fxv+Math.sin(fxa)*fxl},
                'splatter-blood');
        }
        else{
            delete sm[bloodied];
            //sendChat("BloodiedBot", "PCb is "PCb, null, {noarchive:true});
        }

        if(bv <= 0 && !PC) {
            sm[dead] = true;
            spawnFx(fxh,fxv,'bubbling-blood');
        }
        else {
            delete sm[dead];
        }
        obj.set({
            statusmarkers: packSM(sm)
        });
    };

    on(`change:graphic:bar${bar}_value`, handleBarChange);

    if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
        TokenMod.ObserveTokenChange(handleBarChange);
    }
});