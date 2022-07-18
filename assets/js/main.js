
(() => {
    new MeteorEmoji()
})()

var fullname;
var email;
var MySocketId;
var toUserSocketId;
var myUserId;
var toUserId;
var date;
var isGroup = false;
var users = [];
var notifiSound = true;
var toUserName;
if(notifiSound){
    $('#soundOption').html('<button id="soundOff" class="btn btn-danger" style="font-size: 12px">Turn Off Notification</button>');
}
else {
    $('#soundOption').html('<button id="soundOn" class="btn btn-success" style="font-size: 12px">Turn On Notification</button>');
}


$(document).on('click','#soundOff',function() {
    notifiSound = false;
    $('#soundOption').html('<button id="soundOn" class="btn btn-success" style="font-size: 12px">Turn On Notification</button>');
});

$(document).on('click','#soundOn',function() {
    notifiSound = true;
    $('#soundOption').html('<button id="soundOff" class="btn btn-danger" style="font-size: 12px">Turn Off Notification</button>');
});


$("#enterForm").submit(function (){
    var fullname = $('#fullname').val();
    var email = $('#email').val();
    if(fullname != null && email != null) {
        document.cookie = "fullname=" + fullname;
        document.cookie = "email=" + email;
        auth();
    }
});

$(document).ready(function() {
    auth();
});

function auth() {
    fullname = document.cookie
        .split('; ')
        .find(row => row.startsWith('fullname='))
        ?.split('=')[1];

    email = document.cookie
        .split('; ')
        .find(row => row.startsWith('email='))
        ?.split('=')[1];

    if (fullname == null || email == null) {
        $('.conv').hide();
        $('.enterName').show();
    }
    else{
        $('.conv').show();
        $('.enterName').hide();


        const socket = io("ws://192.168.10.121:3000");

        socket.on("connect", () => {
            MySocketId = socket.id;
            socket.emit("user", {id : MySocketId, fullname : fullname, email : email});
            $("#status").text('Connected');
        });

        function testConnection(){
            if (!socket.connected){
                $("#status").text('Disconnected');
            }
            setTimeout(testConnection, 5000);
        }

        testConnection();

        socket.on("dBusers", function (data) {
            console.log(data);
            users = data;
            $('#users').html('')
            $('#users').append("" + "<li id='groupList' userId='0' city='metaGroup' userName='metaGroup' class='clearfix tablinks' ><img src='assets/images/metagolslogo.svg' alt='avatar'><div class='about'><div class='name'>MetaGols Group</div><div class='status'> <i class='fa fa-circle online'></i> Active </div><div id='numGroup' style='display: none' class='msgs'></div></div></li>");
            $('.tabs').append("" + '<div id="metaGroup" class = "tabcontent" > <div class = "card chat-app" >  <div class = "chat" > <div class = "testingDiv" > <div class = "chat-header clearfix" > <div class = "row" > <div class = "col-lg-6" > <a href = "javascript:void(0);" data-toggle = "modal" data-target = "#view_info" > <img src = "assets/images/metagolslogo.svg" alt = "avatar"/> </a><div class="chat-about"><h6 style="margin-top: 3px" class="m-b-0">MetaGols Group <br><span id="groupStatus" style="font-weight:400;font-size: 12px;"> Online </span> <span id="typingGroup" style="font-weight:400;font-size: 12px;display: none"></span></h6></div></div></div></div><div class="chat-history"><ul class="m-b-0 chatStyle" id="hisTgroup"></ul></div></div></div></div></div>');


            users.map(el => {
                if (el.socket_id != MySocketId) {
                    if (el.last_seen == 'Online') {
                        $('#users').append("" + "<li id='usersList' city='" + el.socket_id + "' userName='" + el.fullname + "' socketId='" + el.socket_id + "' userId='" + el.id + "' class='clearfix tablinks' ><img src='"+el.profile_image+"' alt='avatar'><div class='about'><div class='name'>" + el.fullname + " </div><div class='status'> <i class='fa fa-circle online'></i> Active </div><div style='display: none' id='num" + el.socket_id + "' class='msgs'></div></div></li>")
                    } else {
                        $('#users').append("" + "<li id='usersList' city='" + el.socket_id + "' userName='" + el.fullname + "' socketId='" + el.socket_id + "' userId='" + el.id + "' class='clearfix tablinks' ><img src='"+el.profile_image+"' alt='avatar'><div class='about'><div class='name'>" + el.fullname + " </div><div class='status'> <i class='fa fa-circle offline'></i> Last <seen></seen> "+ moment(el.last_seen).fromNow() +" </div><div style='display: none' id='num" + el.socket_id + "' class='msgs'></div></div></li>")
                    }
                }
            });

            users.map(el => {
                if(el.socket_id != MySocketId) {
                    if (el.last_seen == 'Online') {
                        $('.tabs').append("" + '<div id = "' + el.socket_id + '" class = "tabcontent" > <div class = "card chat-app" >  <div class = "chat" > <div class = "testingDiv" > <div class = "chat-header clearfix" > <div class = "row" > <div class = "col-lg-6" > <a href = "javascript:void(0);" data-toggle = "modal" data-target = "#view_info" > <img src = "assets/images/metagolslogo.svg" alt = "avatar"/> </a><div class="chat-about"><h6 style="margin-top: 3px" class="m-b-0">' + el.fullname + ' <br> <span id="' + el.socket_id + 'Status" style="font-weight:400;font-size: 12px;"> Online </span><span id="typing' + el.socket_id + '" style="font-weight:400;font-size: 12px;display: none"> Typing... </span></h6></div></div></div></div><div class="chat-history"><ul class="m-b-0 chatStyle" id="hisT' + el.socket_id + '"></ul></div></div></div></div></div>')
                    }
                    else {
                        $('.tabs').append("" + '<div id = "' + el.socket_id + '" class = "tabcontent" > <div class = "card chat-app" >  <div class = "chat" > <div class = "testingDiv" > <div class = "chat-header clearfix" > <div class = "row" > <div class = "col-lg-6" > <a href = "javascript:void(0);" data-toggle = "modal" data-target = "#view_info" > <img src = "assets/images/metagolslogo.svg" alt = "avatar"/> </a><div class="chat-about"><h6 style="margin-top: 3px" class="m-b-0">' + el.fullname + ' <br> <span id="' + el.socket_id + 'Status" style="font-weight:400;font-size: 12px;"> Last seen at '+el.last_seen+' </span><span id="typing' + el.socket_id + '" style="font-weight:400;font-size: 12px;display: none"> Typing... </span></h6></div></div></div></div><div class="chat-history"><ul class="m-b-0 chatStyle" id="hisT' + el.socket_id + '"></ul></div></div></div></div></div>')

                    }
                }
            })


        });

        socket.on("userId", function (data) {
            myUserId = data;
        });

        $("#sendMessage").submit(function (event) {
            var message1 = $("#messageBox").val();
            var lt = /</g, gt = />/g, ap = /'/g, ic = /"/g;
            var message = message1.toString().replace(lt, "&lt;").replace(gt, "&gt;").replace(ap, "&#39;").replace(ic, "&#34;");

            date = new moment();
            if(isGroup) {
                if(message != '') {
                    socket.emit("message", {
                        message: message,
                        fullname: fullname,
                        date: date,
                        ReceiverUserId: 0,
                        ReceiverSocketId: toUserSocketId,
                        SenderId: myUserId,
                        SenderSocketId: MySocketId,
                        group: true,
                        type : 'TEXT'
                    });
                    $("#hisTgroup").append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>" + date.format("h:mm:ss") + "</span> <br> "+message+" </div></li>");
                }
            }
            else {
                if(message != '') {
                    socket.emit("message", {
                        message: message,
                        fullname: fullname,
                        date: date,
                        ReceiverUserId: toUserId,
                        ReceiverSocketId: toUserSocketId,
                        SenderId: myUserId,
                        SenderSocketId: MySocketId,
                        group: false,
                        type : 'TEXT'
                    });
                    $("#hisT"+toUserSocketId).append("<li class='clearfix'><div STYLE=\"text-align: right\" class=\"message-data text-right\"></div><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>"+date.format("h:mm:ss")+"</span> <br> "+message+" </div></li>");
                }
            }
            $('.chat').animate({ scrollTop: 20000000 },  "fast");
            document.getElementById("messageBox").value = "";
            event.preventDefault();



        });

        $("#attachBtn").click(function (e) {
            $("#image").click();
        });

        $("#attachFile").click(function (e) {
            $("#fileAttach").click();
        });

        $("#fileAttach").change(function (e) {
            var data = e.originalEvent.target.files[0];
            var reader = new FileReader();
            let myFileName = data.name;
            myFileName = myFileName.split('.').join('-' + Date.now() + '-' + MySocketId + '.');
            reader.onload = function (evt) {
                var msg = {};
                date = new moment();
                if(isGroup == false) {
                    msg.file = evt.target.result;
                    msg.message = myFileName;
                    msg.fullname = fullname;
                    msg.SenderSocketId = MySocketId;
                    msg.date = date;
                    msg.ReceiverSocketId = toUserSocketId;
                    msg.group = false;
                    msg.SenderId = myUserId;
                    msg.ReceiverUserId = toUserId;
                    msg.type = 'FILE'
                    socket.emit("message", msg);
                    $("#hisT" + toUserSocketId).append("<li class='clearfix'><div STYLE=\"text-align: right\" class=\"message-data text-right\"></div><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span style='padding-left: 65px;font-size: 12px'>" + date.format("h:mm:ss") + "</span> <br>  <a target='_blank' href='images/"+myFileName+"' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> "+myFileName.substring(0,15)+"... </span></a></div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");
                }
                else {
                    msg.file = evt.target.result;
                    msg.message = myFileName;
                    msg.fullname = fullname;
                    msg.SenderSocketId = MySocketId;
                    msg.date = date;
                    msg.ReceiverSocketId = toUserSocketId;
                    msg.group = true;
                    msg.SenderId = myUserId;
                    msg.ReceiverUserId = toUserId;
                    msg.type = 'FILE'
                    socket.emit("message", msg);
                    $("#hisTgroup").append("<li class='clearfix'><div STYLE=\"text-align: right\" class=\"message-data text-right\"></div><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span style='font-size: 12px;position: relative;left: 65%'>" + date.format("h:mm:ss") + "</span><br>  <a target='_blank' href='images/"+myFileName+"' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> "+myFileName.substring(0,15)+"... </span></a></div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");
                }
            };
            reader.readAsDataURL(data);
            $("#file").val('');
        });

        $("#image").change(function (e) {
            var data = e.originalEvent.target.files[0];
            var reader = new FileReader();
            let myFileName = data.name;
            reader.onload = function (evt) {
                var msg = {};
                date = new moment();
                if(isGroup == false) {
                    msg.file = evt.target.result;
                    msg.message = myFileName;
                    msg.fullname = fullname;
                    msg.SenderSocketId = MySocketId;
                    msg.date = date;
                    msg.ReceiverSocketId = toUserSocketId;
                    msg.group = false;
                    msg.SenderId = myUserId;
                    msg.ReceiverUserId = toUserId;
                    msg.type = 'IMAGE'
                    socket.emit("message", msg);
                    $("#hisT" + toUserSocketId).append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>"+ date.format("h:mm:ss") + "</span> <br> <img class='chatImage' src=" + msg.file + " alt=" + msg.message + " /> </div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");
                }
                else {
                    msg.file = evt.target.result;
                    msg.message = myFileName;
                    msg.fullname = fullname;
                    msg.SenderSocketId = MySocketId;
                    msg.date = date;
                    msg.ReceiverSocketId = toUserSocketId;
                    msg.group = false;
                    msg.SenderId = myUserId;
                    msg.ReceiverUserId = toUserId;
                    msg.type = 'IMAGE'
                    socket.emit("message", msg);
                    $("#hisTgroup").append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>"+ date.format("h:mm:ss") + "</span><br> <img class='chatImage' src=" + msg.file + " alt=" + msg.message + " /> </div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");
                }
            };
            reader.readAsDataURL(data);
            $("#file").val('');
        });


        //User Typing
        inputs = $('#messageBox').on('keypress', (e) => {
            if (event.keyCode != 13) {
                clearTimeout(typingTimer);
                socket.emit("typing",
                    {
                        fullname: fullname,
                        group: isGroup,
                        SenderSocketId: MySocketId,
                        ReceiverSocketId: toUserSocketId,
                    });
                typingTimer = setTimeout(doneTyping, doneTypingInterval);
            }
        });

        //User Finished Typing
        function doneTyping () {
            socket.emit("finish-typing", {
                fullname : fullname,
                group : isGroup,
                SenderSocketId: MySocketId,
                ReceiverSocketId: toUserSocketId,
            });
        }


        socket.on("disconnect", function (){
            socket.emit("disconnect", myUserId);
        });



        let typingTimer;
        let doneTypingInterval = 1000;

        //Message Received
        socket.on("message" , function(data) {
            if(data.group == false) {
                if (notifiSound) {
                    var audio = new Audio('assets/sounds/notification_sound.mp3');
                    audio.play();
                }
                if (data.SenderSocketId  != null && data.SenderSocketId  !== toUserSocketId) {
                    document.getElementById('num' + data.SenderSocketId).style.display = 'block';
                    $('#num' + data.SenderSocketId).html('NEW');
                }
                if(data.type == 'TEXT') {
                    $('#hisT' + data.SenderSocketId).append("<li class='clearfix'><div class=\"message-data \"></div><div class='message my-message'><b>" + data.fullname + "</b><span class='msgTime'>" + moment(data.date).format('h:mm:ss') + "</span><br> " + data.message + " </div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");
                } else if(data.type == 'IMAGE'){
                    $("#hisT" + data.SenderSocketId).append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><b>" + data.fullname + "</b><span class='msgTime'>" + moment(data.date).format('h:mm:ss') + "</span><br> <img class='chatImage' src=" + data.file + " alt=" + data.message + " /> </div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");

                } else if(data.type == 'FILE'){
                    $("#hisT" + data.SenderSocketId).append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><b>" + data.fullname + "</b><span class='msgTime'>" + moment(data.date).format('h:mm:ss') + "</span><br>  <a target=\"_blank\" href='images/"+data.message+"' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> "+data.message.substring(0,15)+"... </span></a></div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");
                } else {
                    $("#hisT" + data.SenderSocketId).append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><b>" + data.fullname + "</b><span class='msgTime'>" + moment(data.date).format('h:mm:ss') + "</span><br>  <audio class='voiceChat' src='./records/"+data.message+"' controls></audio> </div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");
                }
            }else {
                if (isGroup != true) {
                    document.getElementById('numGroup').style.display = 'block';
                    $('#numGroup').html('NEW');
                    if(notifiSound) {
                        var audio = new Audio('assets/sounds/notification_sound.mp3');
                        audio.play();
                    }

                    if(data.type == 'TEXT') {
                        $('#hisTgroup').append("<li class='clearfix'><div class=\"message-data \"></div><div class='message my-message'><b>" + data.fullname + "</b><span class='msgTime'>" + moment(data.date).format('h:mm:ss') + "</span><br> " + data.message + " </div></li>");
                        $('.chat').animate({scrollTop: 20000000}, "fast");
                    } else if(data.type == 'IMAGE'){
                        $("#hisTgroup").append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><b>" + data.fullname + "</b><span class='msgTime'>" + moment(data.date).format('h:mm:ss') + "</span><br> <img class='chatImage' src=" + data.file + " alt=" + data.message + " /> </div></li>");
                        $('.chat').animate({scrollTop: 20000000}, "fast");

                    } else if(data.type == 'FILE'){
                        $("#hisTgroup").append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><b>" + data.fullname + "</b><span class='msgTime'>" + moment(data.date).format('h:mm:ss') + "</span><br>  <a target=\"_blank\" href='images/"+data.message+"' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> "+data.message.substring(0,15)+"... </span></a></div></li>");
                        $('.chat').animate({scrollTop: 20000000}, "fast");
                    } else {
                        $("#hisTgroup").append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><b>" + data.fullname + "</b><span class='msgTime'>" + moment(data.date).format('h:mm:ss') + "</span><br><audio class='voiceChat' src='./records/"+data.message+"' controls></audio> </div></li>");
                        $('.chat').animate({scrollTop: 20000000}, "fast");
                    }
                }

            }
        });

        socket.on("typing" , function (data){
            if(data.group == true) {
                $('#typingGroup').html(data.fullname+' is Typing...');
                $('#typingGroup').show();
                $('#groupStatus').hide();
            }
            else {
                $('#typing'+data.user).show();
                $('#'+data.user+'Status').hide();

            }
        });

        socket.on("finish-typing" , function (data){
            if(data.group == true) {
                $('#typingGroup').hide();
                $('#groupStatus').show();
            }
            else {
                $('#typing'+data.user).hide();
                $('#'+data.user+'Status').show();

            }
        });


        sendVoice.addEventListener("click", function () {
            if (!$("#audio-playback").hasClass("hidden")) {
                $("#audio-playback").addClass("hidden")
            };

            if (!$("#deleteRecord").hasClass("hidden")) {
                $("#deleteRecord").addClass("hidden")
            };

            if (!$("#sendVoice").hasClass("hidden")) {
                $("#sendVoice").addClass("hidden")
            };

            if ($("#playback").hasClass("whiteBG")) {
                $("#playback").removeClass("whiteBG")
            };

            if (!$("#downloadContainer").hasClass("hidden")) {
                $("#downloadContainer").addClass("hidden")
            };
            var msg = {};
            myFileName = Date.now() + '-' + MySocketId + '.mp3';
            var dateNow = new moment();
            if(isGroup == false) {
                msg.file = blob;
                msg.message = myFileName;
                msg.fullname = fullname;
                msg.SenderSocketId = MySocketId;
                msg.date = dateNow;
                msg.ReceiverSocketId = toUserSocketId;
                msg.group = false;
                msg.SenderId = myUserId;
                msg.ReceiverUserId = toUserId;
                msg.type = 'VOICE'
                socket.emit("message", msg);
                $("#hisT"+toUserSocketId).append("<li class='clearfix'><div STYLE=\"text-align: right\" class=\"message-data text-right\"></div><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>"+dateNow.format("h:mm:ss")+"</span> <br>  <audio class='voiceChat' src='"+voiceUrl+"' controls></audio> </div></li>");
                $('.chat').animate({scrollTop: 20000000}, "fast");
            }
            else {
                msg.file = blob;
                msg.message = myFileName;
                msg.fullname = fullname;
                msg.SenderSocketId = MySocketId;
                msg.date = dateNow;
                msg.ReceiverSocketId = toUserSocketId;
                msg.group = false;
                msg.SenderId = myUserId;
                msg.ReceiverUserId = 0;
                msg.type = 'VOICE'
                socket.emit("message", msg);
                $("#hisTgroup").append("<li class='clearfix'><div STYLE=\"text-align: right\" class=\"message-data text-right\"></div><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>"+dateNow.format("h:mm:ss")+"</span> <br>  <audio class='voiceChat' src='"+voiceUrl+"' controls></audio> </div></li>");
                $('.chat').animate({ scrollTop: 20000000 },  "fast");
            }




        });

        $(document).on('click','#usersList',function(){
            toUserSocketId = $(this).attr('socketId');
            isGroup = false;
            toUserId = $(this).attr('userId');
            document.getElementById('num'+toUserSocketId).style.display = 'none';
            openCity(event, $(this).attr('city'));
            document.getElementById("messageBox").value = "";
            toUserName = $(this).attr('userName');
            $('.sendForm').show();
            socket.emit("getChat", {
                userId : myUserId.toString(),
                toUserId : toUserId.toString(),
                socket : MySocketId,
            });
        });


        $(document).on('click','#groupList',function(){
            isGroup = true;
            toUserId = $(this).attr('userId');
            document.getElementById('numGroup').style.display = 'none';
            openCity(event, $(this).attr('city'));
            document.getElementById("messageBox").value = "";
            $('.sendForm').show();
            toUserSocketId = null;
            socket.emit("getGroupChat", {
                toUserId : toUserId,
                socket : MySocketId,
            });
        });


        socket.on("getChat", function (data) {

            $("#hisT" + toUserSocketId).html('');
            data.map(el => {
                if (el.from_user == myUserId) {
                    if (el.type == 'TEXT') {
                        $("#hisT" + toUserSocketId).append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>" + moment(el.createdAt).format("h:mm:ss") + "</span> <br> " + el.msg + " </div></li>"
                        )
                    } else if (el.type == 'IMAGE') {
                        $("#hisT" + toUserSocketId).append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>" + moment(el.createdAt).format("h:mm:ss") + "</span> <br> <img class='chatImage' src='images/" + el.msg + "' /> </div></li>"
                        )
                    } else if (el.type == 'FILE') {
                        $("#hisT" + toUserSocketId).append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>" + moment(el.createdAt).format("h:mm:ss") + "</span> <br> <a target=\"_blank\" href='images/" + el.msg + "' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> " + el.msg.substring(0, 15) + "... </span></a></div></li>")
                    }
                    else {
                        $("#hisT"+toUserSocketId).append("<li class='clearfix'><div STYLE=\"text-align: right\" class=\"message-data text-right\"></div><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>"+moment(el.createdAt).format("h:mm:ss")+"</span> <br>  <audio class='voiceChat' src='./records/"+el.msg+"' controls></audio> </div></li>");
                    }
                } else {
                    if (el.type == 'TEXT') {
                        $('#hisT' + toUserSocketId).append("<li class='clearfix'><div class=\"message-data \"></div><div class='message my-message'><b>" + toUserName + " </b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span><br> " + el.msg + " </div></li>")
                    } else if (el.type == 'IMAGE') {
                        $("#hisT" + toUserSocketId).append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><b>" + toUserName + "</b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span><br> <img class='chatImage' src='images/" + el.msg + "' /> </div></li>");
                    } else if (el.type == 'FILE') {
                        $("#hisT" + toUserSocketId).append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><b>" + toUserName + "</b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span><br><a target=\"_blank\" href='images/" + el.msg + "' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> " + el.msg.substring(0, 15) + "... </span></a></div></li>");
                    }
                    else {
                        $('#hisT' + toUserSocketId).append("<li class='clearfix'><div class=\"message-data \"></div><div class='message my-message'><b>" + toUserName + " </b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span><br> <audio class='voiceChat' src='./records/"+el.msg+"' controls></audio> </div></li>")
                    }
                }
            })
            $('.chat').animate({scrollTop: 20000000}, "fast");
        })

        socket.on("getGroupChat", function (data) {
            $("#hisTgroup").html('');
            data.map(el => {
                if (el.from_user == myUserId) {
                    if (el.type == 'TEXT') {
                        $("#hisTgroup").append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>" + moment(el.createdAt).format("h:mm:ss") + "</span> <br> " + el.msg + " </div></li>"
                        )
                    } else if (el.type == 'IMAGE') {
                        $("#hisTgroup").append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>" + moment(el.createdAt).format("h:mm:ss") + "</span> <br> <img class='chatImage' src='images/" + el.msg + "' /> </div></li>"
                        )
                    } else if (el.type == 'FILE') {
                        $("#hisTgroup").append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>" + moment(el.createdAt).format("h:mm:ss") + "</span> <br> <a target=\"_blank\" href='images/" + el.msg + "' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> " + el.msg.substring(0, 15) + "... </span></a></div></li>")
                    }
                    else{
                        $("#hisTgroup").append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>" + moment(el.createdAt).format("h:mm:ss") + "</span> <br> <audio class='voiceChat' src='./records/"+el.msg+"' controls></audio> </div></li>")

                    }
                } else {
                    if (el.type == 'TEXT') {
                        $("#hisTgroup").append("<li class='clearfix'><div class=\"message-data \"></div><div class='message my-message'><b>" + el.fullname + " </b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span><br> " + el.msg + " </div></li>")
                    } else if (el.type == 'IMAGE') {
                        $("#hisTgroup").append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><b>" + el.fullname + "</b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span><br> <img class='chatImage' src='images/" + el.msg + "' /> </div></li>");
                    } else if (el.type == 'FILE') {
                        $("#hisTgroup").append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><b>" + el.fullname + "</b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span><br><a target=\"_blank\" href='images/" + el.msg + "' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> " + el.msg.substring(0, 15) + "... </span></a></div></li>");
                    }
                    else {
                        $("#hisTgroup").append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><b>" + el.fullname + "</b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span><br> <audio class='voiceChat' src='./records/"+el.msg+"' controls></audio> </div></li>");

                    }
                }
            })
            $('.chat').animate({scrollTop: 20000000}, "fast");

        })
    }
}


function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

