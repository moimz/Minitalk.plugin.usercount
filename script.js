/**
 * 이 파일은 미니톡 접속자수변경 플러그인의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 접속자수를 조건에 따라 변경할 수 있습니다.
 * 
 * @file /plugins/usercount/script.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 1.0.0
 * @modified 2021. 1. 24.
 */
if (Minitalk === undefined) return;

/**
 * 접속자수 변경을 자연스럽게 하기 위해 유저목록를 비활성화하고 접속자 알림 메시지를 사용하지 않도록 설정한다.
 * 해당 설정이 필요없을 경우 아래줄은 주석처리 하여 주십시오.
 */
if (Minitalk.version < 70000) { // 7.0 버전 이하 인경우
	Minitalk.on("init",function(minitalk) {
		/**
		 * 박스에 참여중인 경우 적용하지 않는다.
		 */
		if (minitalk.box.isBox() == true) {
			return;
		}
		
		/**
		 * 접속자 접속/접속해제 알림메시지를 보이도록 설정되어있다면 제거한다.
		 */
		var types = [];
		for (var type in minitalk.viewUserNotification) {
			if (type == "join" || type == "leave") continue;
			types.push(type);
		}
		minitalk.viewUserNotification = types;
	});
	
	Minitalk.on("initChannel",function(minitalk) {
		// 접속자보기 버튼 숨기기
		var $frame = $("div[data-role=frame]");
		var $header = $("header",$frame);
		var $tabs = $("div[data-role=tabs]",$header);
		if ($("button[data-action=users]",$tabs).length == 1) {
			$("button[data-action=users]",$tabs).hide();
		}
	});
	
	Minitalk.on("connecting",function(minitalk) {
		// 유저목록 사용안하도록 수정
		minitalk.socket.channel.use_users = false;
		
		// 유저목록 숨기기
		minitalk.ui.createUsers(false);
	});
} else { // 7.0 버전 이상인 경우
	Minitalk.on("init",function(minitalk) {
		/**
		 * 박스에 참여중인 경우 적용하지 않는다.
		 */
		if (minitalk.box.isBox() == true) {
			return;
		}
		
		/**
		 * 접속자 접속/접속해제 알림메시지를 보이도록 설정되어있다면 제거한다.
		 */
		var types = [];
		for (var type in minitalk.viewUserNotification) {
			if (type == "join" || type == "leave") continue;
			types.push(type);
		}
		minitalk.viewUserNotification = types;
		
		// 접속자탭 숨기기
		var users = $.inArray("users",minitalk.tabs);
		minitalk.tabs.splice(users,1);
	});
}

/**
 * 시간대별로 접속자수를 증가시킬 범위를 정합니다. [최소, 최대]
 * 해당 시간대에 실제 접속한 인원수보다 설정된 [최소, 최대]인원만큼 더한 숫자가 접속자수에 표시됩니다.
 */
me.count = [
	[50,80], // 0시
	[30,50], // 1시
	[10,20], // 2시
	[10,20], // 3시
	[10,20], // 4시
	[10,20], // 5시
	[10,20], // 6시
	[10,20], // 7시
	[10,20], // 8시
	[20,30], // 9시
	[30,50], // 10시
	[30,50], // 11시
	[30,50], // 12시
	[30,50], // 13시
	[30,50], // 14시
	[30,50], // 15시
	[30,50], // 16시
	[30,50], // 17시
	[30,50], // 18시
	[100,150], // 19시
	[100,150], // 20시
	[100,150], // 21시
	[100,120], // 22시
	[50,100] // 23시
];

/**
 * 주기적으로 접속자수를 갱신할 초 (너무 짧게 설정하면 브라우저에 부하가 생길 수 있습니다.)
 * 0 으로 설정하면 주기적으로 변경하지 않고, 실제 접속자수가 변경될때만 변경됩니다.
 * 실제 접속자가 자주 변하는 경우 0 으로 설정하는 것이 좋습니다.
 */
me.interval = 60; // 60초

// updateUserCount 이벤트가 발생하면 접속자수를 조작한다.
Minitalk.on("updateUserCount",function(minitalk,usercount) {
	/**
	 * 박스에 참여중인 경우 적용하지 않는다.
	 */
	if (minitalk.box.isBox() == true) {
		return;
	}
	
	var time = parseInt(moment().format("H"),10);
	var add = Math.floor(Math.random() * (me.count[time][1] - me.count[time][0])) + me.count[time][0];
	
	minitalk.ui.printUserCount(usercount + add);
});

// 서버접속시 유저수를 조작할 타이머를 시작한다.
me.timer = null;
Minitalk.on("connect",function(minitalk,channel,me,usercount) {
	/**
	 * 박스에 참여중인 경우 적용하지 않는다.
	 */
	if (minitalk.box.isBox() == true) {
		return;
	}
	
	if (me.interval > 0) {
		timer = setInterval(function() {
			var time = parseInt(moment().format("H"),10);
			var add = Math.floor(Math.random() * (me.count[time][1] - me.count[time][0])) + me.count[time][0];
			
			minitalk.ui.printUserCount(minitalk.user.getCount() + add);
		},me.interval * 1000);
	}
});

// 접속종료시 타이머를 종료한다.
Minitalk.on("disconnect",function(minitalk,reconnectable) {
	/**
	 * 박스에 참여중인 경우 적용하지 않는다.
	 */
	if (minitalk.box.isBox() == true) {
		return;
	}
	
	if (me.timer !== null) clearInterval(me.timer);
});