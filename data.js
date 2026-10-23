const drivers = [
 {id:1,first:"Max",last:"Verstappen",code:"VER",number:3,team:"Red Bull Racing",country:"NED",points:312,color:"#3671c6"},
 {id:2,first:"Lando",last:"Norris",code:"NOR",number:4,team:"McLaren",country:"GBR",points:289,color:"#ff8700"},
 {id:3,first:"Charles",last:"Leclerc",code:"LEC",number:16,team:"Ferrari",country:"MON",points:247,color:"#e8002d"},
 {id:4,first:"Oscar",last:"Piastri",code:"PIA",number:81,team:"McLaren",country:"AUS",points:221,color:"#ff8700"},
 {id:5,first:"Carlos",last:"Sainz",code:"SAI",number:55,team:"Williams",country:"ESP",points:184,color:"#64c4ff"},
 {id:6,first:"Lewis",last:"Hamilton",code:"HAM",number:44,team:"Ferrari",country:"GBR",points:173,color:"#e8002d"},
 {id:7,first:"George",last:"Russell",code:"RUS",number:63,team:"Mercedes",country:"GBR",points:159,color:"#27f4d2"},
 {id:8,first:"Fernando",last:"Alonso",code:"ALO",number:14,team:"Aston Martin",country:"ESP",points:91,color:"#229971"},
 {id:9,first:"Pierre",last:"Gasly",code:"GAS",number:10,team:"Alpine",country:"FRA",points:64,color:"#0093cc"},
 {id:10,first:"Yuki",last:"Tsunoda",code:"TSU",number:22,team:"RB",country:"JPN",points:48,color:"#6692ff"},
 {id:11,first:"Nico",last:"Hulkenberg",code:"HUL",number:27,team:"Haas",country:"GER",points:36,color:"#b6babd"},
 {id:12,first:"Sergio",last:"Perez",code:"PER",number:11,team:"Red Bull Racing",country:"MEX",points:32,color:"#3671c6"}
];
const teams = [
 {name:"McLaren",short:"MCL",color:"#ff8700",points:510,drivers:["Lando Norris","Oscar Piastri"]},
 {name:"Red Bull Racing",short:"RBR",color:"#3671c6",points:344,drivers:["Max Verstappen","Sergio Perez"]},
 {name:"Ferrari",short:"FER",color:"#e8002d",points:420,drivers:["Charles Leclerc","Lewis Hamilton"]},
 {name:"Mercedes",short:"MER",color:"#27f4d2",points:260,drivers:["George Russell","Andrea Kimi Antonelli"]},
 {name:"Aston Martin",short:"AMR",color:"#229971",points:112,drivers:["Fernando Alonso","Lance Stroll"]},
 {name:"Williams",short:"WIL",color:"#64c4ff",points:95,drivers:["Carlos Sainz","Alexander Albon"]},
 {name:"RB",short:"RB",color:"#6692ff",points:72,drivers:["Yuki Tsunoda","Liam Lawson"]},
 {name:"Haas",short:"HAA",color:"#b6babd",points:58,drivers:["Nico Hulkenberg","Oliver Bearman"]},
 {name:"Alpine",short:"ALP",color:"#0093cc",points:51,drivers:["Pierre Gasly","Franco Colapinto"]},
 {name:"Sauber",short:"SAU",color:"#52e252",points:12,drivers:["Gabriel Bortoleto","Nico Hulkenberg"]}
];
const races = [
 {round:1,name:"Australian Grand Prix",country:"Melbourne, Australia",date:"06–08 MAR",status:"completed",sprint:false},
 {round:2,name:"Chinese Grand Prix",country:"Shanghai, China",date:"13–15 MAR",status:"completed",sprint:true},
 {round:3,name:"Japanese Grand Prix",country:"Suzuka, Japan",date:"27–29 MAR",status:"completed",sprint:false},
 {round:4,name:"Bahrain Grand Prix",country:"Sakhir, Bahrain",date:"10–12 APR",status:"upcoming",sprint:false},
 {round:5,name:"Saudi Arabian Grand Prix",country:"Jeddah, Saudi Arabia",date:"17–19 APR",status:"upcoming",sprint:false},
 {round:6,name:"Miami Grand Prix",country:"Miami, United States",date:"01–03 MAY",status:"upcoming",sprint:true},
 {round:7,name:"Monaco Grand Prix",country:"Monte Carlo, Monaco",date:"22–24 MAY",status:"upcoming",sprint:false},
 {round:8,name:"Spanish Grand Prix",country:"Barcelona, Spain",date:"12–14 JUN",status:"upcoming",sprint:false},
 {round:9,name:"British Grand Prix",country:"Silverstone, United Kingdom",date:"03–05 JUL",status:"upcoming",sprint:false}
];
