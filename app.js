try {




	/* Modules */
	const express = require('express');
	const Discord = require('discord.js');
	const fs = require('fs');
	const fetch = require('node-fetch');

	/* Data Storage */
	let whitelist = require('./whitelist.json');
	let blacklist = require('./blacklist.json');

	/* Whitelist */
	async function whitelist_user(ID, IP, HWID) {
		return new Promise(res=>{
			if(!whitelist.find(v=>v.ID===ID)){
				whitelist.push({
					ID: ID,
					IP: IP,
					HWID: HWID,
				});
				res(whitelist.find(v=>v.ID===ID));
			}else{
				res();
			}
		})
	}

	/* Blacklist */
	async function blacklist_user(_type, data) {
		switch (_type) {
			case 'IP':
				blacklist.push({
					IP: data.IP,
					ID: '',
					HWID: '',
				})
				break;
			case 'HWID':
				blacklist.push({
					IP: '',
					ID: '',
					HWID: data.HWID,
				})
				break;
			case 'ID':
				blacklist.push({
					IP: '',
					ID: data.ID,
					HWID: '',
				})
				break;
			case 'ALL':
				blacklist.push(data);
				break;

			default:
				break;
		}
	}

	/* Logs */
	const logChannels = {
		'auth-success': '928770966618787850',
		'auth-failed': '928770987829387284'
	}
	async function log(action,discordID, IP, HWID, otherFields=[]) {
		let emb1 = new Discord.MessageEmbed({
			"title": action.split('-').join(' ').toUpperCase(),
			"color": 16733525,
			"fields": [
				{
					"name": "Discord User:",
					"value": `<@${discordID}>`
				},
				{
					"name": "IP Address",
					"value": IP,
					"inline": true
				},
				/* {
					"name": "VPN",
					"value": (IPdata.vpn || IPdata.proxy || IPdata.tor) ? 'Yes' : 'No',
					"inline": true
				}, */
				{
					"name": "IP Fraud Report",
					"value": `https://www.ipqualityscore.com/free-ip-lookup-proxy-vpn-test/lookup/${IP}`,
					"inline": true
				},
				{
					"name": "HWID",
					"value": `${HWID}\n\n‎`
				}
			],
			"timestamp": new Date()
		})
		otherFields.forEach(v=>{
			emb1.fields.push(v)
		})
		bot.channels.cache.get(logChannels[action]).send(emb1);
	}

	/* Whitelist Keys */
	function generateWhitelistKey(id){
		return [id.substr(0,id.length/2),id.substr(id.length/2)].map((v)=>Number(v).toString(16).split('').reverse().join('')).reverse().join('').split('').map(v=>(~~(Math.random()*36)).toString(36)+v).join('')
	}

	/* Updating Files */
	setInterval(() => {
		fs.writeFileSync('whitelist.json', JSON.stringify(whitelist), { encoding: 'utf-8' })
		fs.writeFileSync('blacklist.json', JSON.stringify(blacklist), { encoding: 'utf-8' })
	}, 1000);

	/* Rate Limiter */
	const rateLimit = require("express-rate-limit");
	const limiter = rateLimit({
		windowMs: 5 * 60 * 1000,
		max: 50, // limit each IP to 100 requests per windowMs,
		message: 'Too many request'
	});

	/* Express */
	const PORT = process.env.PORT || 2020;
	const app = express();
	app.listen(PORT, () => console.log(`Listening at ${PORT}`));
	// app.use(express.static('public'));
	app.use(express.json());

	let bot;
	let BOT_READY;

	/* Request Logs */
	app.use(async(req,res,next)=>{
		next();
		/* while (!BOT_READY) await new Promise(r=>setTimeout(r,100));
		console.log('Request Received! Logging...')
		let IP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || (req.socket ? req.socket.remoteAddress : null);
		next();
		bot.channels.cache.get('883526174670741524').send(new Discord.MessageEmbed({
			title: "Request Received!",
			description: "A request was received.",
			color: 16733525,
			fields: [
				{
					name: "IP Address",
					value: IP||'N/A'
				},
				{
					name: "Origin",
					value: `aim-ware.herokuapp.com`
				},
				{
					name: 'Path',
					value: req.originalUrl ? JSON.parse(JSON.stringify([req.originalUrl]))[0] : 'N/A'
				},
				{
					name: 'Method',
					value: String(req.method)
				},
				{
					name: 'Headers',
					value: `\`\`\`json\n${JSON.stringify(req.headers,null,'\t')}\n\`\`\``
				},
				{
					name: 'Body',
					value: `\`\`\`json\n${JSON.stringify(req.body,null,'\t')}\n\`\`\``
				}
			],
			timestamp: new Date()
		})) */
	})

	app.use(limiter);
	app.use('/script',rateLimit({
		windowMs: 1 * 60 * 1000,
		max: 1 // limit each IP to [max] requests per [windowMs]
	}))
	app.use('/getscript',rateLimit({
		windowMs: 1 * 60 * 1000,
		max: 1 // limit each IP to [max] requests per [windowMs]
	}))

	app.get('/script',(req,res)=>{
		let key = req.query.key;
		res.send(key ? `Key='${key}'\n${fs.readFileSync(`${__dirname}/scripts/obfuscated_loader.lua`)}` : fs.readFileSync(`${__dirname}/scripts/kickscript.lua`))
	})

	/* app.get('/get-whitelist',(req,res)=>{
		let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
		if((IP==='135.84.196.163'||IP==='::1')&&req.query.zLKRrdfyoOwZicsYLGGt == 'czvr0wwbftl9pqup5gglarl3tzzizi9em1dz3zq23y02y7jzu4u8d8vwoh9hsjc9pqqivgkv9z804o61wuzazh4jpf5864fhpq3oh36e62dbege8ztukcs9cedc6sdguyixi2thgjswjelnv4phaarify0yjt70md1ok8j7ugu7iv0lgievvc629r7vppkj8nyh0v6cptpoiq0m58zd2lnrp26jadwdp0fpavs80teybb9rq9hri4limbfbc926grh1v7rlwzbu2vw1f5bz9amg141d5q71y19anxajs9beo9tsmmmnys04t3xuxtbmhgmc760z5s599poqq9016jx9d5d35qunsgaucsyz7hnvezae3755utpfnvztxoxduzqppq6mm1yi6le4jtmwudcoywk2pzb6kxqqwf4phaktd8ukn84cdusafvp483hczmshb9ipxcctvct2my1c9sz7pr0jdgb2ya1peq7878zeua3ou0qqfymd5v7hpjbxz0qtu4eeiih8q96hdv0mu9m6aocepo8oms00wvudu9ngk04rd9cclxkmb1991py4c03qdd7u4okbmoyo9l23ndfmn0ah9seepklyk6p5fdh1bfew17lvfdln0hnv7h6i6ukihaltilpkrttzv8f47ld5f85et70g5nv75ytny03xqkg9ni8nxn6yxdxa6rkupj43osxnh9g16nym6anao7zyz04rqygik0g4r8at9ze9o3g4zrtzy5tm6i7t2xapepb5vm593cblwbxnz9eoojvb0oun7vnf0l1kyo0xvi5v6z3mpfsk045gqtyicmqha62ujf8evpxvtxm9jkrhlvzx7pw4qntkz5st4k1s7jbth74bck0pcdufdzxfa92q8z4mqdypspqbn39bmxztlltdugx1xxah7usi4qbe6c5l2zrz1zgqq37bm9wbc7bmr93e2ah5x6bxmzugjvpixtta5betj2hc3x7hnjv5o'){
			res.sendFile(`${__dirname}/whitelist.json`);
		}else{
			res.sendStatus(404);
			// res.send([]);
		}
	}) */

	app.get('/getscript', async (req, res) => {
		let q = req.query;
		let placeID = q.placeid ? String(q.placeid) : null;
		let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
		let headers = req.headers;
		let hwid_identifiers = ["syn-fingerprint", "exploit-guid", "proto-user-identifier", "Krnl-Hwid", "sentinel-fingerprint"];
		let hwid;
		hwid_identifiers.forEach((v, i) => {
			if (headers[v]) {
				hwid = headers[v];
			}
		});
		if (!hwid || !IP) {
			return res.status(404).send('Invalid Request Headers');
		}
		let isWhitelisted = false;
		let blacklisted = false;
		let userWhitelist = whitelist.find(v=>v.Key===q.key);
		console.log(userWhitelist)
		if(!userWhitelist){
			isWhitelisted = false;
			log(`auth-failed`,'',IP,hwid,[
				{
					name: 'Username',
					value: q.username||'unknown',
				},
				{
					name: 'Profile',
					value: q.userid ? `https://www.roblox.com/users/${q.userid}/profile` : 'unknown',
				},
				{
					name: 'PlaceID',
					value: placeID||'unknown',
				},
				{
					name: 'JobID (Server Instance ID)',
					value: q.jobid||'unknown',
				}
			]);
			if(!whitelist.find(v=>v.HWID===hwid)){
				return res.send(fs.readFileSync(`${__dirname}/scripts/ban.lua`,{encoding:'utf-8'}));
			}
			// res.send(`game:GetService('Players').LocalPlayer:Kick('You are not whitelisted!')`);
		}
		let ID = userWhitelist.ID;
		if(!userWhitelist.HWID){
			userWhitelist.HWID = hwid
			await new Promise(r=>setTimeout(r,1000))
		}else if(userWhitelist.HWID!==hwid){
			return res.send(`game:GetService('Players').LocalPlayer:Kick('\\nHWID Mismatch.\\n\\nYour HWID is different than it was the last time you used the script.\\n\\nIf you would like to reset your HWID, please DM silent.')`);
		}
		isWhitelisted = userWhitelist !== null
		if(blacklist.find(v=>v.IP==IP||v.HWID==hwid||v.ID==ID||v.Key==userWhitelist.Key)){blacklisted=true}
		/* blacklist.forEach(bl=>{
			if(bl.Headers){
				bl.Headers.forEach(v=>{
					if(req.headers)
				})
			}
		}) */
		console.log(isWhitelisted)
		if (isWhitelisted && !blacklisted) {
			let fileName = `${__dirname}/scripts/games/${String(placeID)}.lua`;
			let fileExists = fs.readdirSync(`${__dirname}/scripts/games/`,{encoding:'utf-8'}).includes(`${String(placeID)}.lua`)
			if (fileExists) {
				res.sendFile(fileName);
			} else {
				res.send(`local h=Instance.new('Message',workspace)h.Text='This game was not recognized.'`);
			}
		} else {
			if (blacklisted) {
				res.send(`game:GetService('Players').LocalPlayer:Kick('You are blacklisted!')`);
			} else {
				res.send(`game:GetService('Players').LocalPlayer:Kick('You are not whitelisted!')`);
			}
		}
		// console.log(hwid, IP)
		log(`auth-${isWhitelisted ? 'success' : 'failed'}`,ID||'Not Found',IP,hwid,[
			{
				name: 'Username',
				value: q.username||'unknown',
			},
			{
				name: 'Profile',
				value: q.userid ? `https://www.roblox.com/users/${q.userid}/profile` : 'unknown',
			},
			{
				name: 'PlaceID',
				value: placeID||'unknown',
			},
			{
				name: 'JobID (Server Instance ID)',
				value: q.jobid||'unknown',
			}
		]);
	})

	/* Discord */
	bot = new Discord.Client();
	const config = require('./config.json');
	const token = config.bot.token || '';
	bot.login(token);

	let guild;

	bot.on('ready', async () => {
		BOT_READY = true;
		await new Promise(r=>setTimeout(r,1000));
		guild = bot.guilds.cache.get(config.guildId);
		console.log(`Bot is online!`);
		console.log(`Guild: ${guild.id}`);
	});

	bot.on('message', async (msg) => {
		if (msg.channel.type==='text'&&msg.member&&msg.member.roles.cache.find(r => r.id == config.roles.adminRoleID)) { // check if user has "admin" role
			if (msg.content.startsWith('.')) {
				let cmd = msg.content.split(' ')[0].substr(1)
				let args = msg.content.split(' ');
				args.splice(0, 1);
				console.log(args)
				switch (cmd) {
					case 'reset-hwid':
						var user = args[0].match(/[0-9]+/g) !== null ? args[0].match(/[0-9]+/g)[0] : null;
						if(!msg.guild.members.cache.find(v=>v.id===user)){
							return msg.reply('User not found.')
						}
						let WL_obj = whitelist.find(v=>v.ID===user);
						if (WL_obj) {
							WL_obj.HWID = null;
						}
						msg.reply(`<@${user}>'s HWID was reset.`);
					case 'blacklist':
						var type = args[1].toUpperCase();
						if (type == 'USER') {
							type = 'ID';
						}
						var data = msg.content.split(type + ' ')[1];
						if (type == 'ID' && data.startsWith('<@')) {
							data = data.split('<@')[1].split('>')[0];
						}
						var d1 = {};
						d1[type] = data;
						blacklist_user(type, d1);
						setTimeout(() => {
							let success = (blacklist.find(v => v[type] == data) != undefined);
							if (success) {
								msg.reply(`Successfully blacklist user!`)
							} else {
								msg.reply('Failed to blacklist user.')
							}
						}, 500);
						break;
					default:
						break;
				}
			}
		}
		let buyerRole = guild.roles.cache.get(config.roles.buyerRoleID)
		if (buyerRole.members.get(msg.author.id)) {
			if (msg.content == '!script') {
				let script = fs.readFileSync(`${__dirname}/scripts/PUBLIC_LOADSTRING.lua`,{encoding:'utf-8'});
				if(!whitelist.find(v=>v.ID===msg.author.ID)){
					await whitelist_user(msg.author.id);
				}
				let userWhitelist = whitelist.find(v=>v.ID===msg.author.id);
				if(!userWhitelist.Key){
					userWhitelist.Key = generateWhitelistKey(msg.author.id);
				}
				let embed = new Discord.MessageEmbed({
					title: "**Here is your script**\n\n:point_down:",
					description: ``,
					color: 16733525,
					/* timestamp: new Date() */
				});
				msg.author.send(embed);
				msg.author.send(`\`\`\`lua\n${script.split('KEY_HERE').join(userWhitelist.Key)}\n\`\`\``)
			}
		}
	})



	// 404 Route //
	app.use('*',(_,res)=>{
		res.sendStatus(404);
	})


} catch (error) {
	const shell = require('shelljs');
	shell.exec('npm start');
}