const tempHPmanager = (function() {	

	const scriptIndex = {"name":"tempHPmanager","version":"v0.01",};

	const barNumHP = 1;
	const barNumTHP = 3;
	const useBarTHP = true;
	const attrNameTHP = 'hp_temp';
	const bar = `bar${barNumHP}_value`;
	const lnk = `bar${barNumHP}_link`;
	const max = `bar${barNumHP}_max`;
	const thp = `bar${barNumTHP}_value`;

	class THPmanager{
		static check(obj,prev){
			let diff = parseInt(obj.get(bar),10) - parseInt(prev[bar],10)
			if(diff >= 0 || parseInt(obj.get(thp),10) !== parseInt(prev[thp],10) || !parseInt(obj.get(thp),10)){
				return;
			}
			this.changeTHP(obj,prev,parseInt(obj.get(bar),10),diff,parseInt(obj.get(thp),10))
		}

		static changeTHP(obj,prev,hp,diff,temp){
			let newtemp = Math.max(temp+diff,0)
			let refund = temp - newtemp;
			let newhp = hp + refund;
			//streaminfo interval//
			if(useStreamInfo() && StreamInfo.apiIDs().includes(obj.get('represents'))){
				//set the old and new hps
				let cloneNewHP = findObjs({
					_characterid: obj.get('represents'),
					_type: "attribute",
					name: "hp",
				})[0];
				cloneNewHP = JSON.parse(JSON.stringify(cloneNewHP));
				let cloneOldHP = JSON.parse(JSON.stringify(cloneNewHP));
				cloneOldHP.current = parseInt(prev[bar],10);
				cloneNewHP.current = newhp;
				//set the old and new temps
				let temp_hp = findObjs({
					_characterid: obj.get('represents'),
					_type: "attribute",
					name: attrNameTHP,
				})[0];
				let cloneNewTempHP = JSON.parse(JSON.stringify(temp_hp));
				let cloneOldTempHP = JSON.parse(JSON.stringify(temp_hp));
				cloneNewTempHP.current = newtemp;
				toStreamInfo(cloneNewHP,cloneOldHP,cloneNewTempHP,cloneOldTempHP);
			}
			//cont//
			obj.set(bar,newhp)
			obj.set(thp,newtemp)
			log(`${obj.get("name")} had damage reduced by ${refund} due to temp hp.`)
		}
	}

	on(`change:token:${bar}`,function(obj,prev){
		THPmanager.check(obj,prev);
	});

	//StreamInfo compatibility check
	function useStreamInfo(){
		if(typeof StreamInfo == "undefined" || StreamInfo === null){
			return false;
		}
		else{
			return true;
		}
	}
    function toStreamInfo(cloneNewHP=0,cloneOldHP=0,cloneNewTempHP=0,cloneOldTempHP=0){
		if (useStreamInfo()){
			StreamInfo.apiHPandTemp(cloneNewHP,cloneOldHP,cloneNewTempHP,cloneOldTempHP);
		}
	};

	return scriptIndex;
})();