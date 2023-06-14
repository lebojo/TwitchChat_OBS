const tw = new tmi.Client({ channels: [ 'legoyave' ]});
const max_votes = 30;

const cam_scene = "Blabla";
const cam_source = "CAMERA";
const this_source = "TEST_GOYAVE";

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
	obs.send('GetSceneItemProperties', {'scene-name': "Blabla", 'item': cam_source})
		.then(data => {
		cam.x = data.position.x;
		cam.y = data.position.y;
	});
	create_filters();
	setTimeout(function(){
		reset_filters();
	}, 500);
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
			wiggle("Blabla", cam_source, time);
			break;
		case 'party':
			confet(time);
			break;
		case 'goyave':
			goyave(time);
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
	obs.send('SetSourceFilterVisibility', {
		'sourceName': cam_source,
		'filterName': "love",
		'filterEnabled': true
	})
	const tt = setInterval(function(){
		if (document.getElementById("heart").style.opacity == 0.5)
			document.getElementById("heart").style.opacity = 0.1;
		else
			document.getElementById("heart").style.opacity = 0.5;
	}, 500);
	setTimeout(function(){
		clearInterval(tt);
		document.getElementById("heart").style.opacity = 0;
		reset_filters();
	}, time);
}

function confet(time)
{
	let vid = document.createElement("video");

	obs.send('SetSourceFilterVisibility', {
		'sourceName': this_source,
		'filterName': "lumi",
		'filterEnabled': true
	});
	vid.src = "assets/confet.mp4";
	document.body.appendChild(vid);
	vid.play();
	setTimeout(function(){
		document.body.removeChild(vid);
	}, time);
}

function goyave(time)
{
	obs.send('SetSourceFilterVisibility', {
		'sourceName': cam_source,
		'filterName': "goyave",
		'filterEnabled': true
	});
	const tt = setInterval(function(){
		obs.send('SetSceneItemProperties', {
			'scene-name': "Blabla",
			'item': cam_source,
			'rot': 60.0
		})
	}, 500);
	setTimeout(function(){
		clearInterval(tt);
		reset_filters();
	}, time);
}

function ri(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function create_filters(){
	obs.send('AddFilterToSource', {
		'sourceName': cam_source,
		'filterName': "nigga",
		'filterType': "color_filter",
		'filterSettings': {
			'contrast': -2
		}
	});
	obs.send('AddFilterToSource', {
		'sourceName': cam_source,
		'filterName': "love",
		'filterType': "color_filter",
		'filterSettings': {
			'gamma': 0.30,
			'contrast': -0.40,
			'brightness': 0.32,
			'saturation': 2.15,
			'color': 16623103
		}
	});
	obs.send('AddFilterToSource', {
		'sourceName': cam_source,
		'filterName': "goyave",
		'filterType': "color_filter",
		'filterSettings': {
			'saturation': 0.6,
			'color': 8388607
		}
	});
	obs.send('AddFilterToSource', {
		'sourceName': this_source,
		'filterName': "lumi",
		'filterType': "luma_key_filter",
		'filterSettings': {
			"luma_max": 1.0,
			"luma_max_smooth": 0.0,
			"luma_min": 0.4
		}
	});
}

function reset_filters()
{
	obs.send('SetSourceFilterVisibility', {
		'sourceName': cam_source,
		'filterName': "nigga",
		'filterEnabled': false
	});
	obs.send('SetSourceFilterVisibility', {
		'sourceName': cam_source,
		'filterName': "love",
		'filterEnabled': false
	});
	obs.send('SetSourceFilterVisibility', {
		'sourceName': cam_source,
		'filterName': "goyave",
		'filterEnabled': false
	});
	obs.send('SetSourceFilterVisibility', {
		'sourceName': this_source,
		'filterName': "lumi",
		'filterEnabled': false
	});
}
