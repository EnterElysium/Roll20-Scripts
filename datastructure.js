{{mod=DC17}} {{rname=Lightning Bolt}} {{r1=$[[0]]}} {{r2=$[[1]]}} 0 {{range=Self (100-foot line)}} {{damage=1}} {{dmg1flag=1}} {{dmg1=$[[2]]}} {{dmg1type=Lightning}} 0 {{dmg2=$[[3]]}} {{dmg2type=}} {{crit1=$[[4]]}} {{crit2=$[[5]]}} {{save=1}} {{saveattr=Dexterity}} {{savedesc=}} {{savedc=$[[11]]}} {{desc=}} {{hldmg=$[[7]]}} {{hldmgcrit=$[[8]]}} {{spelllevel=3}} {{innate=}} {{globalattack=}} {{globaldamage=$[[9]]}} {{globaldamagecrit=$[[10]]}} {{globaldamagetype=}} ammo= {{spelldesc_link=[Show Spell Description](~-MZ4y5hOAiTvIxPaR3dl|repeating_attack_-N2IG6aPue95vt9lF2pL_spelldesc_link)}} charname=Sk’ith Lightning-Scale"

//skith lashbolt
[{\"expression\":\"0d20cs>20\",\"results\":{\"resultType\":\"sum\",\"rolls\":[{\"dice\":0,\"mods\":{\"customCrit\":[{\"comp\":\">=\",\"point\":20}]},\"rollid\":\"-N2IUr6ExN2PiT-Ats2Y\",\"sides\":20,\"type\":\"R\"}],\"total\":0,\"type\":\"V\"},\"rollid\":\"-N2IUr6ExN2PiT-Ats2Y\",\"signature\":\"aea245c4c0fe9330b9204834b55b611b6ec874ad018ff6e2fafb4f7327edb65e8db3931a0e538cc117f8857194fcf88abb51aa23ecb5dde5948e3fbd3fd9d613\",\"tdseed\":4997626624502471000},{\"expression\":\"0d20cs>20\",\"results\":{\"resultType\":\"sum\",\"rolls\":[{\"dice\":0,\"mods\":{\"customCrit\":[{\"comp\":\">=\",\"point\":20}]},\"rollid\":\"-N2IUr6ExN2PiT-Ats2Z\",\"sides\":20,\"type\":\"R\"}],\"total\":0,\"type\":\"V\"},\"rollid\":\"-N2IUr6ExN2PiT-Ats2Z\",\"signature\":\"5845e9dc4a7ff0ea0990d8b0e73d720b1ff6ca4146cb2dd6fe241fefd1dae0ce754d3080259024f97b979bc06b84e1a237800322f4923bf4a5a57c2737c62e89\",\"tdseed\":878108979565203100},{\"expression\":\"8d6\",\"results\":{\"resultType\":\"sum\",\"rolls\":[{\"dice\":8,\"results\":[{\"v\":5},{\"v\":2},{\"v\":5},{\"v\":5},{\"v\":2},{\"v\":3},{\"v\":6},{\"v\":4}],\"rollid\":\"-N2IUr6ExN2PiT-Ats2_\",\"sides\":6,\"type\":\"R\"}],\"total\":32,\"type\":\"V\"},\"rollid\":\"-N2IUr6ExN2PiT-Ats2_\",\"signature\":\"4b2dd06a3ab3ac7c402701f6e840de7c8d23f3062db3094e0c23babde153b570f6deaaa5b27fc1b486c14d2fbca77cefbf6f8d78fe0178eb5fc0fa955ab3b441\",\"tdseed\":3848658528561031000},{\"expression\":\"0\",\"results\":{\"resultType\":\"M\",\"rolls\":[{\"expr\":0,\"type\":\"M\"}],\"total\":0,\"type\":\"V\"},\"signature\":false},{\"expression\":\"8d6[CRIT]\",\"results\":{\"resultType\":\"sum\",\"rolls\":[{\"dice\":8,\"results\":[{\"v\":2},{\"v\":2},{\"v\":6},{\"v\":2},{\"v\":1},{\"v\":6},{\"v\":3},{\"v\":1}],\"rollid\":\"-N2IUr6FvgZ1oZb_Xd6J\",\"sides\":6,\"type\":\"R\"},{\"text\":\"CRIT\",\"type\":\"L\"}],\"total\":23,\"type\":\"V\"},\"rollid\":\"-N2IUr6FvgZ1oZb_Xd6J\",\"signature\":\"37e610828c272200298957f25548535ca3fe714953397f463c8d64c169f16aa48885a7ad72e437997ba987e60a5df10753b49fbde3762f77bab83fafcc8aa5dc\",\"tdseed\":7046497628178639000},{\"expression\":\"0[CRIT]\",\"results\":{\"resultType\":\"M\",\"rolls\":[{\"expr\":0,\"type\":\"M\"},{\"text\":\"CRIT\",\"type\":\"L\"}],\"total\":0,\"type\":\"V\"},\"signature\":false},{\"expression\":\"(17)\",\"results\":{\"resultType\":\"M\",\"rolls\":[{\"expr\":\"(17)\",\"type\":\"M\"}],\"total\":17,\"type\":\"V\"},\"signature\":false},{\"expression\":\"0\",\"results\":{\"resultType\":\"M\",\"rolls\":[{\"expr\":0,\"type\":\"M\"}],\"total\":0,\"type\":\"V\"},\"signature\":false},{\"expression\":\"0\",\"results\":{\"resultType\":\"M\",\"rolls\":[{\"expr\":0,\"type\":\"M\"}],\"total\":0,\"type\":\"V\"},\"signature\":false},{\"expression\":\"17[SAVE]\",\"results\":{\"resultType\":\"M\",\"rolls\":[{\"expr\":17,\"type\":\"M\"},{\"text\":\"SAVE\",\"type\":\"L\"}],\"total\":17,\"type\":\"V\"},\"signature\":false}]"

{"expression":"8d6 + 3[INT]","results":{"resultType":"sum","rolls":[{"dice":8,"results":[{"v":5},{"v":1},{"v":3},{"v":3},{"v":4},{"v":5},{"v":4},{"v":1}],"rollid":"-N2IklsHqja8ql9Zv9fx","sides":6,"type":"R"},{"expr":"+3","type":"M"},{"text":"INT","type":"L"}],"total":29,"type":"V"},"rollid":"-N2IklsHqja8ql9Zv9fx","signature":"23750b3678ba3a454d010d1f9a655d6644090ef167b361473d049d833e53deb898d90f5616a659e2f9e16175ce134960f4adcc6a5ca45fa7bd143f8671f0c397","tdseed":3257059143878880000}






[
	{
		"expression":"1d20cs&gt;10 + 5&#91;INT&#93; + 4&#91;PROF&#93; + 1&#91;MAGIC&#93;",
		"parsed":"(1)+5+4+1",
		"resultType":"sum",
		"total":11,
		"value":11,
		"labels":
		[
			{
				"label":"INT",
				"value":"1d20cs>10 + 5"},
			{
				"label":"PROF",
				"value":"4"},
			{
				"label":"MAGIC",
				"value":"1"
			}
		],
		"tableReturns":[],
		"display":"(<span class=\"basicdiceroll critfail \">1</span>)+5+4+1",
		"dice":
		[
			{
				"v":1,
				"type":"fail",
				"display":"<span class=\"basicdiceroll critfail \">1</span>"
			}
		]
	},
	{
		"expression":"0d20cs&gt;10 + 5&#91;INT&#93; + 4&#91;PROF&#93; + 1&#91;MAGIC&#93;",
		"parsed":"{}+5+4+1",
		"resultType":"sum",
		"total":10,
		"value":10,
		"labels":
		[
			{
				"label":"INT",
				"value":"0d20cs>10 + 5"
			},
			{
				"label":"PROF",
				"value":"4"
			},
			{
				"label":"MAGIC",
				"value":"1"
			}
		],
		"tableReturns":[],
		"display":"()+5+4+1",
		"dice":[]
	}
]