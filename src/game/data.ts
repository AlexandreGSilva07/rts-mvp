export type Res="food"|"wood"|"stone"|"iron"|"gold";
export type Cost=Partial<Record<Res,number>>;
export const buildings=[
{id:"castle",name:"Castelo",icon:"🏰",desc:"Núcleo do domínio. Aumenta produção global, população e poder.",cost:{wood:180,stone:220,gold:80},buff:"+5% produção global / nível",baseTime:10},
{id:"farm",name:"Fazenda",icon:"🌾",desc:"Produz comida continuamente.",cost:{wood:90,stone:20},buff:"+2 comida/s / nível",baseTime:5},
{id:"lumber",name:"Serraria",icon:"🪵",desc:"Produz madeira continuamente.",cost:{wood:40,stone:45},buff:"+1.5 madeira/s / nível",baseTime:5},
{id:"quarry",name:"Pedreira",icon:"🪨",desc:"Produz pedra continuamente.",cost:{wood:65,stone:20},buff:"+1.2 pedra/s / nível",baseTime:6},
{id:"mine",name:"Mina",icon:"⛏️",desc:"Extrai ferro e ouro.",cost:{wood:95,stone:95},buff:"+0.7 ferro e +0.25 ouro/s / nível",baseTime:8},
{id:"barracks",name:"Quartel",icon:"⚔️",desc:"Treina infantaria e arqueiros.",cost:{wood:150,stone:90,iron:30},buff:"-2% tempo de infantaria / nível",baseTime:8},
{id:"stable",name:"Estábulo",icon:"🐎",desc:"Treina unidades montadas.",cost:{wood:170,stone:70,iron:45},buff:"-2% tempo de cavalaria / nível",baseTime:9},
{id:"workshop",name:"Oficina",icon:"🛠️",desc:"Constrói máquinas de cerco.",cost:{wood:180,stone:130,iron:90},buff:"-2% tempo de cerco / nível",baseTime:10},
{id:"hospital",name:"Hospital",icon:"🏥",desc:"Abriga e cura soldados feridos.",cost:{wood:120,stone:130,gold:50},buff:"+30 capacidade / nível",baseTime:8},
{id:"academy",name:"Academia",icon:"📜",desc:"Desbloqueia pesquisas econômicas e militares.",cost:{wood:160,stone:150,gold:70},buff:"-2% tempo de pesquisa / nível",baseTime:9}
] as const;
export const troops=[
{id:"swordsman",name:"Espadachim",icon:"🗡️",building:"barracks",cost:{food:35,iron:18,gold:5},time:5,power:22,hp:100,atk:18,def:14},
{id:"spearman",name:"Lanceiro",icon:"🔱",building:"barracks",cost:{food:30,wood:12,iron:12},time:5,power:20,hp:95,atk:16,def:15},
{id:"archer",name:"Arqueiro",icon:"🏹",building:"barracks",cost:{food:28,wood:20,gold:5},time:6,power:24,hp:72,atk:24,def:8},
{id:"lightCav",name:"Cavalaria Leve",icon:"🐴",building:"stable",cost:{food:55,iron:24,gold:12},time:8,power:40,hp:140,atk:28,def:18},
{id:"heavyCav",name:"Cavalaria Pesada",icon:"🐎",building:"stable",cost:{food:70,iron:45,gold:24},time:11,power:60,hp:190,atk:38,def:31},
{id:"ram",name:"Ariete",icon:"🪵",building:"workshop",cost:{wood:90,iron:35,gold:15},time:12,power:72,hp:280,atk:70,def:20},
{id:"catapult",name:"Catapulta",icon:"☄️",building:"workshop",cost:{wood:120,iron:55,gold:28},time:15,power:95,hp:220,atk:95,def:15}
] as const;
export const research=[
{id:"agriculture",name:"Agricultura",icon:"🌱",desc:"+8% produção de comida / nível",cost:{food:90,wood:60,gold:25},time:7},
{id:"extraction",name:"Extração",icon:"⛏️",desc:"+7% pedra e madeira / nível",cost:{wood:75,stone:75,gold:25},time:7},
{id:"metallurgy",name:"Metalurgia",icon:"🔥",desc:"+8% ferro e ouro / nível",cost:{stone:80,iron:45,gold:35},time:8},
{id:"logistics",name:"Logística",icon:"📦",desc:"+4% velocidade de treino / nível",cost:{food:80,wood:90,gold:30},time:8},
{id:"medicine",name:"Medicina",icon:"⚕️",desc:"+12% capacidade e cura do hospital / nível",cost:{food:100,gold:45},time:8},
{id:"engineering",name:"Engenharia",icon:"⚙️",desc:"+7% poder de cerco / nível",cost:{wood:100,stone:110,iron:40},time:9},
{id:"armament",name:"Armamento",icon:"⚔️",desc:"+5% ataque do exército / nível",cost:{iron:65,gold:45},time:9},
{id:"armor",name:"Armadura",icon:"🛡️",desc:"+5% defesa do exército / nível",cost:{iron:70,stone:60,gold:40},time:9},
{id:"administration",name:"Administração",icon:"👑",desc:"+5% produção global e limite populacional / nível",cost:{food:120,wood:90,stone:90,gold:60},time:10}
] as const;