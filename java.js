const tw = new tmi.Client({ channels: [ 'legoyave' ]});
const max_votes = 1;

var votes ={
	goaled: false,
	love: 0,
	hype: 0,
	party: 0,
	goyave: 0
}

var cam = {
	x: 0,
	y: 0
}

const obs = new OBSWebSocket();

obs.connect({address: 'localhost:4444'});

obs.on('ConnectionOpened', () => {

	obs.send('GetSceneItemProperties', {'scene-name': "Blabla", 'item': "CAMERA"})
		.then(data => {
		cam.x = data.position.x;
		cam.y = data.position.y;
	});
});

tw.connect().catch(console.error);

tw.on('message', (channel, tags, message, self) => {
	if(message.charAt(0) != '!' || votes.goaled) return;
	switch(message.toLowerCase()){
		case '!love':
		 	if(votes.love < max_votes)
		 		votes.love++;
			break;
		case '!hype':
			if(votes.hype < max_votes)
				votes.hype++;
			break;
		case '!party':
			if(votes.party < max_votes)
				votes.party++;
			break;
		case '!goyave':
			if(votes.goyave < max_votes)
				votes.goyave++;
			break;
	}
	check_completion();
	display_votes();
});

function display_votes(){
	document.getElementById("love").style.width = (votes.love * 100 / max_votes) + "%";
	document.getElementById("hype").style.width = (votes.hype * 100 / max_votes) + "%";
	document.getElementById("party").style.width = (votes.party * 100 / max_votes) + "%";
	document.getElementById("goyave").style.width = (votes.goyave * 100 / max_votes) + "%";
}

function check_completion(){
	for (const type in votes)
	{
		if(votes[type] == max_votes)
		{
			votes.goaled = true;
			animation(type, 10000);
			break;
		}
	}
}

function animation(type, time)
{
	document.getElementById("all_bars").style.opacity = 0;
	change_img(type);
	document.getElementById("corners_emotes").style.opacity = 1;

	switch(type){
		case 'love':
			hearts(time);
			break;
		case 'hype':
			wiggle("Blabla", "CAMERA", time);
			break;
		case 'party':
			wiggle("Blabla", "CAMERA", time);
			break;
		case 'goyave':
			wiggle("Blabla", "CAMERA", time);
			break;
	}

	setTimeout(function(){
		document.getElementById("corners_emotes").style.opacity = 0;
		document.getElementById("all_bars").style.opacity = 1;
		votes.goaled = false;
		for (const type in votes)
			votes[type] = 0;
		display_votes();
	}, time);
}

function change_img(type)
{
	document.getElementById("emote1").src = "assets/" + type + ".gif";
	document.getElementById("emote2").src = "assets/" + type + ".gif";
	document.getElementById("emote3").src = "assets/" + type + ".gif";
	document.getElementById("emote4").src = "assets/" + type + ".gif";
}

/*OBS WEBSOCKET		*/

function wiggle(scene, source, time)
{
	var amplifier = 20;
	const tt = setInterval(function(){
			obs.send('SetSceneItemProperties', {
				'scene-name': scene,
				'item': source,
				'position': {
					'x': ri(cam.x - amplifier, cam.x + amplifier),
					'y': ri(cam.y - amplifier, cam.y + amplifier)
				}
			});
			}, 10);
	setTimeout(function(){
		clearInterval(tt);
		obs.send('SetSceneItemProperties', {
			'scene-name': scene,
			'item': source,
			'position': {
				'x': cam.x,
				'y': cam.y
			}
		});
	}, time);
}

function hearts(time)
{
	const tt = setInterval(function(){
		if (document.getElementById("heart").style.opacity == 0.5)
			document.getElementById("heart").style.opacity = 0.1;
		else
			document.getElementById("heart").style.opacity = 0.5;
	}, 500);
	setTimeout(function(){
		clearInterval(tt);
		document.getElementById("heart").style.opacity = 0;
	}, time);
}

function ri(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
