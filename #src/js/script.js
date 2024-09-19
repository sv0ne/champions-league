$(document).ready(function () {
	var w = $(window).outerWidth();
	var h = $(window).outerHeight();
	var isMobile = ('ontouchstart' in window);
	const $body = $('body');
	const BREAKPOINT_md1 = 1343;
	const BREAKPOINT_1045 = 1044.98;
	const BREAKPOINT_md2 = 992.98;
	const BREAKPOINT_872 = 871.98;
	const BREAKPOINT_md3 = 767.98;
	const BREAKPOINT_552 = 551.98;
	const BREAKPOINT_md4 = 479.98;
	
	let standings, matches;

	$.get("js/standings.json", (response) => {
		standings = response;
		createTable();
	});

	$.get("js/matches.json", function(response){
		matches = response;
		createTable();
	});

	// Для каждой команды создаем массив в котором расположеены ее 8 матчей
	function sortGridData(){
		let result = {};
		let matchesLeagueStage = matches.matches.filter(item => item.stage === "LEAGUE_STAGE");

		console.log(matchesLeagueStage);
		

		for(let i = 0; i < matchesLeagueStage.length; i++){
			let objHome = {
				playTo: "home", 
				opponent: matchesLeagueStage[i].awayTeam,
				score: matchesLeagueStage[i].score,
				status: matchesLeagueStage[i].status,
				utcDate: matchesLeagueStage[i].utcDate
			};

			let objAway = {
				playTo: "away", 
				opponent: matchesLeagueStage[i].homeTeam,
				score: matchesLeagueStage[i].score,
				status: matchesLeagueStage[i].status,
				utcDate: matchesLeagueStage[i].utcDate
			};

			if(!result[matchesLeagueStage[i].homeTeam.id]){
				result[matchesLeagueStage[i].homeTeam.id] = [objHome];
			}else{
				result[matchesLeagueStage[i].homeTeam.id].push(objHome);
			}
			
			if(!result[matchesLeagueStage[i].awayTeam.id]){
				result[matchesLeagueStage[i].awayTeam.id] = [objAway];
			}else{
				result[matchesLeagueStage[i].awayTeam.id].push(objAway)
			}
		}

		return result;
	}

	/** Форматируем дату в нужный формат */
	function formatDate(utcDate) {
		let date = new Date(utcDate);
		let year = date.getFullYear();
		let month = date.getMonth() + 1;
		let day = date.getDate();
		let hours = date.getHours();
		let minutes = date.getMinutes();

		if(month < 10){ month = "0"+month; }
		if(day < 10){ day = "0"+day; }
		if(hours < 10){ hours = "0"+hours; }
		if(minutes < 10){ minutes = "0"+minutes; }

		return {
			date: `${day}.${month}.${year}`, 
			time: `${hours}:${minutes}`
		};
	}

	/** Статус матча. Выигран, проигран, ничья */
	function statusScoreMatch(playTo, winner) {
		return winner === "DRAW" ? "draw" :
			((playTo === "home" && winner === "HOME_TEAM") ||
				(playTo === "away" && winner === "AWAY_TEAM")) ? "win" :
					((playTo === "home" && winner === "AWAY_TEAM") ||
						(playTo === "away" && winner === "HOME_TEAM")) ? "lost" : null;
	}

	// Создаем таблицу с данными
	function createTable() {
		if(!standings || !matches) { return; } // Не выполняем функцию если данных еще нет

		let tableStandings = standings.standings[0].table;
		let teamsGridMatches = sortGridData();

		console.log(tableStandings);
		console.log(teamsGridMatches);

		// Заголовки таблицы
		let trContentTotal = `
			<tr>
				<th> <span class="team__position">P</span> <span class="ml-6">Team name</span></th>
				<td data-description="Played games">G</td>
				<td data-description="Won">W</td>
				<td data-description="Lost">L</td>
				<td data-description="Goal difference">GD</td>
				<td data-description="Points">P</td>
				<td>Round 1</td>
				<td>Round 2</td>
				<td>Round 3</td>
				<td>Round 4</td>
				<td>Round 5</td>
				<td>Round 6</td>
				<td>Round 7</td>
				<td>Round 8</td>
			</tr>
		`;

		// Создаем все строки таблицы
		for (let i = 0; i < tableStandings.length; i++) {
			let arr = teamsGridMatches[tableStandings[i].team.id];
			let tdRounds = "";

			// Проверяем есть ли в текущей строке хотябы один онлайн матч
			let hasLiveMacth = arr.some(item => item.status === "IN_PLAY");
			
			// Создаем все ячейки с противостояниями для текущей строки
			for (let r = 0; r < arr.length; r++) {
				// Форматируем дату в нужный формат
				let formatedDate = formatDate(arr[r].utcDate);
				// Статус матча. Выигран, проигран, ничья
				let scoreStatus = statusScoreMatch(arr[r].playTo, arr[r].score.winner);

				let info = scoreStatus === "draw" ? `${arr[r].score.fullTime.home} : ${arr[r].score.fullTime.away}` :
					scoreStatus === "win" && arr[r].score.winner === "HOME_TEAM" ? `${arr[r].score.fullTime.home} : ${arr[r].score.fullTime.away}` :
					scoreStatus === "win" && arr[r].score.winner === "AWAY_TEAM" ? `${arr[r].score.fullTime.away} : ${arr[r].score.fullTime.home}` :
					scoreStatus === "lost" && arr[r].score.winner === "HOME_TEAM" ? `${arr[r].score.fullTime.away} : ${arr[r].score.fullTime.home}` :
					scoreStatus === "lost" && arr[r].score.winner === "AWAY_TEAM" ? `${arr[r].score.fullTime.home} : ${arr[r].score.fullTime.away}` :
					`${formatedDate.date} ${formatedDate.time}`;
				
				// Ячейка с противостоянием (противником)
				let td = `
					<td class="teamRival play-${arr[r].playTo}${scoreStatus ? " match-"+scoreStatus : ""}${arr[r].status === "IN_PLAY" ? " match-live" : ""}">
						<div class="teamRival__body">
							<div class="teamRival__name">
								<img class="teamRival__logo" src="${arr[r].opponent.crest}" alt="Logo ${arr[r].opponent.shortName}">
								<span class="team__tla">${arr[r].opponent.shortName}</span>
							</div>
							<div class="teamRival__info">
								<div class="teamRival__isLive" data-description="Match online"></div>
								${info}
							</div>
						</div>
						<div class="teamRival__homeMatchIcon" data-description="Home arena"></div>
					</td>
				`;
				tdRounds += td;
			}

			// Дополнительный класс для позиции команды
			let posClass = `team__position_${(i+1) < 9 ? "playOff-1-8" : (i+1) < 25 ? "playOff-1-16" : "eliminated"}`;

			// Строка таблицы
			let tr = `
				<tr class="${hasLiveMacth ? "team_hasLiveMacth" : ""}">
					<th>
						<span class="team__position ${posClass}">${i+1}</span>
						<img class="team__logo" src="${tableStandings[i].team.crest}" alt="Logo ${tableStandings[i].team.shortName}">
						${tableStandings[i].team.shortName}
						${tableStandings[i].team.id}
					</th>
					<td class="team_withLive">${tableStandings[i].playedGames}</td>
					<td class="team_withLive">${tableStandings[i].won}</td>
					<td class="team_withLive">${tableStandings[i].lost}</td>
					<td class="team_withLive">${tableStandings[i].goalDifference}</td>
					<td class="team_withLive team__points">${tableStandings[i].points}</td>
					${tdRounds}
				</tr>
			`;

			// Добавляем строку ко всем остальным строкам
			trContentTotal += tr;
		}

		$('#results').append('<table></table>');
		$('#results table').append(trContentTotal);
	}
});