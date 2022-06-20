extractRoll = function(msg){
    return _.chain(msg.inlinerolls)
        .reduce(function(m,v,k){
            m['$[['+k+']]']=v.results.total || 0;
            return m;
        },{})
        .reduce(function(m,v,k){
            return m.replace(k,v);
        },msg.content)
        .value();
}
findRollResult = function(msg, rollname, isString = 0){
	let pattern = new RegExp('{{' + rollname + '=(.+?)}}');
	let result = 0;
	if (isString > 0) {
		msg.content.replace(pattern,(match,rollResult)=>{
			result = rollResult;
		});
	} else {
		msg.content.replace(pattern,(match,rollResult)=>{
		result = parseInt(rollResult);
		});
	}
	return result;
}

// builds a comparison function for all the crit rules
  var getCritComparitor = function(roll){
    let comp=[];

    // handle explicit custom rules
    if(_.has(roll,'mods') && _.has(roll.mods,'customCrit')){
      _.each(roll.mods.customCrit,function(cc){
        switch(cc.comp){
          case '<=':comp.push((o)=>o<=cc.point);break;
          case '==':comp.push((o)=>o==cc.point);break;
          case '>=':comp.push((o)=>o>=cc.point);break;
        }
      });
    } else {
      // default "max value" rule
      comp.push((o)=>o==roll.sides);
    } 
    // return a comparison function that checks each rule on a value 
    return function(v){
      let crit=false;
      _.find(comp,(f)=>crit=crit||f(v));
            return crit;
    };
  };

  var isCrit = function(roll){
	var crits = 0;  
    // builds a comparison function for crits in this roll type
    if (roll.sides == 20) {
        let comp=getCritComparitor(roll);
        _.each(roll.results,(r)=>{
          // check each value with the comparison function
          if(comp(r.v)){
            // If it was a crit, report it to chat 
            // (replace with what you want or return true here and false outside the if for an inspection function)           
            // sendChat('isCrit',`The ${r.v} is a critical!`);
			crits += 1;
          }
		  
        });
    }
	return crits;
  };

on("chat:message", function(orig_msg) {
    if (orig_msg.rolltemplate && orig_msg.inlinerolls) {
        if(/{{dmg\d=/.test(orig_msg.content)){
			let msg = _.clone(orig_msg),
				damageType, damageBase, damageCrit, atk1, atk2, critTarget, charName;
			damageBase = damageCrit = atk1 = atk2 = crits = 0;
			damageType = charName = advantage = normal = disadvantage = '';
			
			msg.content = extractRoll(msg);
			msg.content.replace(/charname=(.+?)$/,(match,charname)=>{
				charName = charname;
			});
			damageType = findRollResult(msg, 'dmg1type', 1);
			damageBase = findRollResult(msg, 'dmg1') + findRollResult(msg, 'dmg2') + findRollResult(msg, 'hldmg') + findRollResult(msg, 'globaldamage'); 
			damageCrit = damageBase + findRollResult(msg, 'crit1') + findRollResult(msg, 'crit2') + findRollResult(msg, 'hldmgcrit') + findRollResult(msg, 'globaldamagecrit');
			
			advantage = findRollResult(msg, 'advantage');
			normal = findRollResult(msg, 'normal');
			disadvantage = findRollResult(msg, 'disadvantage');
			
			_.each(msg.inlinerolls,(ir)=>_.each(ir.results.rolls,(irrr)=>{
				if (irrr.sides == 20) crits +=isCrit(irrr);
			}));
			
			if (damageType == 'Healing') {				
				//whispers the button to the GM	
				sendChat('Healing','/w gm [Healing](!token-mod --ids &#64;{target|1|token_id} --set bar1_value|&#91;&#91;{&#64;{target|1|bar1}+'+damageBase+'+ 0d0,&#64;{target|1|bar1|max}+0d0}kl1&#93;&#93;)');
				
				//Also adds it up for the players
				sendChat('','Total: '+damageBase);
			}	
			else {
				
				// if it's normal or advantage, and 1 crit roll is detected, it's a crit
				// if it's disadvantage 2 crits are needed for it to be a crit.
				if ( ((normal || advantage) && (crits >= 1)) || (disadvantage && (crits >= 2)) ) {
					//whispers the button to the GM	
					sendChat('Damage','/w gm [Critical](!token-mod --ids &#64;{target|token_id} --set bar1_value|-&#91;&#91;floor('+damageCrit+'/&#63;{Resistance|No,1|Yes,2}&#41;&#93;&#93;)');
								
					//Also adds it up for the players
					sendChat('',' Total Crit: ' + damageCrit);
				}
				else {
					//whispers the button to the GM	
					sendChat('Damage','/w gm [Normal](!token-mod --ids &#64;{target|token_id} --set bar1_value|-&#91;&#91;floor('+damageBase+'/&#63;{Resistance|No,1|Yes,2}&#41;&#93;&#93;)');
					//Also adds it up for the players
					sendChat('','Total: ' + damageBase);
				}
			}
		}
	}
});