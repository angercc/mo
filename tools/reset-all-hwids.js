const fs = require('fs');

let whitelist = require('../whitelist.json');

whitelist.forEach(v=>{
	v.HWID = ''
})

fs.writeFileSync(`${__dirname}/../whitelist.json`,JSON.stringify(whitelist),{encoding:'utf-8'});