$(function(){
	$('audio[controls]').before(function () {
		var song = this;
		song.controls=false;
		var playerbox = $('<div class="well span4">');
		var playerdataholder = $('<div class="accordian" id="dataholder">');
		var playerdatagroup = $('<div class="accordian-group">');
		var playerdatatoggle = $('<div class="accordian-heading">');
		playerdatatoggle.html('<a class="accoridan-toggle" data-toggle="collapse" data-parent="#dataholder" href="#playerdatawrapper">Details</a>');
		var playerdatabody = $('<div id="playerdatawrapper" class="accordian-body collapse">');
		var playerdatainner = $('<div class="accordian-inner">');
		playerdatabody.append(playerdatainner);
		playerdatagroup.append(playerdatatoggle);
		playerdatagroup.append(playerdatabody);
		playerdataholder.append(playerdatagroup);
		var playerdata = $('<table class="table table-condensed" id="playerdata" data-toggel="collapse" data-toggle="#playerdata">');
		var player = $('<section class="btn-group row-fluid clearfix playa">');

		if ($(song).data('play') != 'off') {
			var play = $('<button class="btn disabled span2">');
			play.pauseButton = function () {
				play.html('<i class="icon-pause"></i>');
				play.click(function () {
					song.pause();
				});
			};
			play.playButton = function () {
				play.html('<i class="icon-play"></i>');
				play.click(function () {
					song.play();
				});
				if (song.readyState > 3){
					play.removeClass('disabled');
				}

			};

			play.enable = function(){
				play.removeClass('disabled');
			};
			
			play.playButton();
			player.append(play);

			$(song).on('playing', play.pauseButton);
			$(song).on('play', play.pauseButton);
			$(song).on('canplay', play.playButton);
			$(song).on('canplay', play.enable);
			$(song).on('pause', play.playButton);

		}

		if ($(song).data('seek') != 'off') {
			var seek = $('<input type="range">');
			seek.attr({
				'min': 0,
				'value': 0,
				'class': 'seek'
			});
			
			seek.progress = function () {
				var bg = 'rgba(223, 240, 216, 1) 0%';
				bg += ', rgba(223, 240, 216, 1) ' + ((song.currentTime/song.duration) * 100) + '%';
				bg += ', rgba(223, 240, 216, 0) ' + ((song.currentTime/song.duration) * 100) + '%';
				for (i=0; i<song.buffered.length; i++){
					//console.log(song.buffered.length + ' : ' + i + ' : ' + song.buffered.start(i) + ' : ' + song.buffered.end(i) + ' : ' + song.duration);
					if (song.buffered.end(i) > song.currentTime && isNaN(song.buffered.end(i)) == false && isNaN(song.buffered.start(i)) == false){
						var bufferedstart;
						var bufferedend;
						if (song.buffered.end(i) < song.duration) {
							bufferedend = ((song.buffered.end(i)/song.duration) * 100);
						}
						else {
							bufferedend = 100;
						}
						if (song.buffered.start(i) > song.currentTime){
							bufferedstart = ((song.buffered.start(i)/song.duration) * 100);
						}
						else {
							bufferedstart = ((song.currentTime/song.duration) * 100);
						}
						bg += ', rgba(217, 237, 247, 0) ' + bufferedstart + '%';
						bg += ', rgba(217, 237, 247, 1) ' + bufferedstart + '%';
						bg += ', rgba(217, 237, 247, 1) ' + bufferedend + '%';
						bg += ', rgba(217, 237, 247, 0) ' + bufferedend + '%';
					}						
				}
				//console.log(bg);
				seek.css('background', '-webkit-linear-gradient(left, ' + bg + ')');
				seek.css('background','-o-linear-gradient(left,  ' + bg + ')');
				//seek.css('background','-moz-linear-gradient(left,  ' + bg + ')');
				seek.css('background','-ms-linear-gradient(left,  ' + bg + ')');
				//seek.css('background','linear-gradient(to right,  ' + bg + ')');
				seek.css('background-color', '#ddd');
			};
			
			seek.set = function () {
				seek.val(song.currentTime);
				seek.progress();
			};
			seek.slide = function () {
				song.currentTime = seek.val();
				seek.progress();
			};
			seek.init = function () {
				seek.attr({
					'max': song.duration,
					'step': song.duration / 100
				});
				seek.progress();
			};
			
			seek.reset = function () {
				seek.val(0);
				song.currentTime = seek.val();
			};

			seekWrapper = $('<div class="btn disabled span3">');
			seekWrapper.append(seek);
			player.append(seekWrapper);

			seek.on('change', seek.slide);
			$(song).on('timeupdate', seek.set);
			$(song).on('loadedmetadata', seek.init);
			$(song).on('loadeddata', seek.init);
			$(song).on('progress', seek.init);
			$(song).on('canplay', seek.init);
			$(song).on('canplaythrough', seek.init);
			$(song).on('ended', seek.reset);
			if(song.readyState > 0){
				seek.init();
			}
		}

		
		if ($(song).data('time') != 'off') {
			var time = $('<a class="btn span3">');
			time.tooltip({'container': 'body', 'placement': 'right', 'html': true});
			twodigit = function (myNum) {
				return ("0" + myNum).slice(-2);
			};
			timesplit = function (a) {
				if (isNaN(a)){return '<i class="icon-spinner icon-spin"></i>';}
				var hours = Math.floor(a / 3600);
				var minutes = Math.floor(a / 60) - (hours * 60);
				var seconds = Math.floor(a) - (hours * 3600) - (minutes * 60);
				var timeStr = twodigit(minutes) + ':' + twodigit(seconds);
				if (hours > 0) {
					timeStr = hours + ':' + timeStr;
				}
				return timeStr;
			};
			time.showtime = function () {
				time.html(timesplit(song.duration));
				time.attr({'title': 'Click to Reset<hr style="padding:0; margin:0;" />Position: ' + (timesplit(song.currentTime))});
				if (!song.paused){
					time.html(timesplit(song.currentTime));
					time.attr({'title': 'Click to Reset<hr style="padding:0; margin:0;" />Length: ' + (timesplit(song.duration))});
				}
				time.tooltip('fixTitle');
			};
			time.click(function () {
				song.pause();
				song.currentTime = 0;
				time.showtime();
				time.tooltip('fixTitle');
				time.tooltip('show');
			});
			time.tooltip('show');
			player.append(time);

			$(song).on('loadedmetadata', time.showtime);
			$(song).on('loadeddata', time.showtime);
			$(song).on('progress', time.showtime);
			$(song).on('canplay', time.showtime);
			$(song).on('canplaythrough', time.showtime);
			$(song).on('timeupdate', time.showtime);
			if(song.readyState > 0){
				time.showtime();
			}
			else {
				time.html('<i class="icon-spinner icon-spin"></i>');
			}
		}

		if ($(song).data('mute') != 'off') {
			var mute = $('<button class="btn span2">');
			mute.checkVolume = function () {
				if (song.volume > 0.5 && !song.muted) {
					mute.html('<i class="icon-volume-up"></i>');
				} else if (song.volume < 0.5 && song.volume > 0 && !song.muted) {
					mute.html('<i class="icon-volume-down"></i>');
				} else {
					mute.html('<i class="icon-volume-off"></i>');
				}
			};
			mute.click(function () {
				if (song.muted) {
					song.muted = false;
					song.volume = song.oldvolume;
				} else {
					song.muted = true;
					song.oldvolume = song.volume;
					song.volume = 0;
				}
				mute.checkVolume();
			});

			mute.checkVolume();
			player.append(mute);

			$(song).on('volumechange', mute.checkVolume);
		}

		if ($(song).data('volume') != 'off') {
			var volume = $('<input type="range" class="vol">');
			volume.attr({
				'min': 0,
				'max': 1,
				'step': 1 / 100,
				'value': 1,
				'class': 'vol'
			});
			volume.slide = function () {
				song.muted = false;
				song.volume = volume.val();
			};
			volume.set = function () {
				volume.val(song.volume);
			};

			volWrapper = $('<div class="btn disabled span3">');
			volWrapper.append(volume);
			player.append(volWrapper);

			volume.on("change", volume.slide);
			$(song).on('volumechange', volume.set);
		}

		if (typeof($(song).data('infoAlbumArt')) != 'undefined'){
			var albumArt = $('<img class="thumbnail" src="'+ $(song).data('infoAlbumArt') + '">');
			playerdatainner.append(albumArt);
		}
		if (typeof($(song).data('infoArtist')) != 'undefined'){
			var artist = $('<tr>');
			artist.title = $('<th>');
			artist.title.html('Artist');
			var infoArtist = $('<td>');
			infoArtist.html($(song).data('infoArtist'));
			artist.append(artist.title);
			artist.append(infoArtist);
			playerdata.append(artist);
		}
		if (typeof($(song).data('infoTitle')) != 'undefined'){
			songTitle = $('<tr>');
			songTitle.title = $('<th>');
			songTitle.title.html('Title');
			var infoTitle = $('<td>');
			infoTitle.html($(song).data('infoTitle'));
			songTitle.append(songTitle.title);
			songTitle.append(infoTitle);
			playerdata.find('tbody').append(songTitle);
		}
		if (typeof($(song).data('infoAlbumTitle')) != 'undefined'){
			album = $('<tr>');
			album.title = $('<th>');
			album.title.html('Album');
			var infoAlbumTitle = $('<td>');
			infoAlbumTitle.html($(song).data('infoAlbumTitle'));
			album.append(album.title);
			album.append(infoAlbumTitle);
			playerdata.find('tbody').append(album);
		}
		if (typeof($(song).data('infoLabel')) != 'undefined'){
			label = $('<tr>');
			label.title = $('<th>');
			label.title.html('Label');
			var infoLabel = $('<td>');
			infoLabel.html($(song).data('infoLabel'));
			label.append(label.title);
			label.append(infoLabel);
			playerdata.find('tbody').append(label);
		}
		if (typeof($(song).data('infoYear')) != 'undefined'){
			year = $('<tr>');
			year.title = $('<th>');
			year.title.html('Year');
			var infoYear = $('<td>');
			infoYear.html($(song).data('infoYear'));
			year.append(year.title);
			year.append(infoYear);
			playerdata.find('tbody').append(year);
		}
		
		if (playerdata.html() !== ""){
			playerdatainner.append(playerdata);
			playerbox.append(playerdataholder);
		}
		
		playerbox.append(player);

		if (typeof($(song).data('infoAtt')) != 'undefined'){
			var infoAtt = $('<small class="pull-right muted">');
			if (typeof($(song).data('infoAttLink')) != 'undefined'){
				var infoAttLink = $('<a class="muted">');
				infoAttLink.attr('href', $(song).data('infoAttLink'));
				infoAttLink.html($(song).data('infoAtt'));
				infoAtt.append(infoAttLink);
			}
			else {
				infoAtt.html($(song).data('infoAtt'));
			}
			playerbox.append(infoAtt);
		}
		$(song).on('error', function(){
			$('btn').addClass('btn-danger');
		});
		return playerbox;
	});
});