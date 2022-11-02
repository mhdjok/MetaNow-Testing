
(() => {
    new MeteorEmoji()
})()

var fullname;
var email;
var token;
var MySocketId;
var toUserSocketId;
var myUserId;
var toUserId = null;
var date;
var isGroup = true;
var users = [];
var notifiSound = true;
var toUserName;
let typingTimer;
let doneTypingInterval = 1000;
var url = "http://192.168.12.64:3000";

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


$(document).ready(function() {
    auth();
});

function auth() {
    token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];


    $('#deleteBtn').addClass('hidden');


    if (token == null) {
        window.location.href = 'login.html';
    }
    else{
        $.ajax({
            type: "POST",
            url: url + "/refreshToken",
            data: JSON.stringify({
                token: token,
            }),
            dataType: 'json',
            processData: false,
            contentType: 'application/json',
            success: function (data, status, msg) {
                fullname = data.full_name;
                email = data.email;
                myUserId = data.user_id;
                $('.signedName').html(fullname);
                $('.conv').show();
            },
            error: function (data, jqXhr, textStatus, errorThrown) {
                window.location.href = 'login.html';
            }
        });



        const socket = io("ws://192.168.12.64:3000");
        socket.on("connect", () => {
            socket.emit("user", {id : socket.id, fullname : fullname, email : email, token : token, test : 'testing'});
            MySocketId = socket.id;
            $("#status").text('Connected');
            socket.on('checkToken', function (data){
                // if(!data)
                //     window.location.href = 'login.html';

            })
                socket.emit("getGroupChat", {
                    userId : myUserId,
                    toUserId : 0,

            });
            $('.sendForm').show();

        });

        function testConnection(){
            if (!socket.connected){
                $("#status").text('Disconnected');
            }
            setTimeout(testConnection, 5000);
        }
        testConnection();

        //Get Users
        socket.on("dBusers", function (data) {
            users = data;
            socket.emit('friends',myUserId)
            users.map(el => {
                if (el.socket_id == MySocketId) {
                    $('#signedPicture').attr('src', el.profile_image);
                }
            });
        });
        //Users i have chat with
        socket.on('friends', function (data) {
            $('#users').html('')
            $('#users').append("" + "<li id='groupList' userId='0' city='metaGroup' userName='metaGroup' class='clearfix tablinks' ><img src='assets/images/metagolslogo.svg' alt='avatar'><div class='about'><div class='name'>MetaGols Group</div><div class='status'> <i class='fa fa-circle online'></i> Active </div><div id='numGroup' style='display: none' class='msgs'></div></div></li>");
            $('.tabs').append("" + '<div id="metaGroup" class = "tabcontent" > <div class = "card chat-app" >  <div class = "chat" > <div class = "testingDiv" > <div class = "chat-header clearfix" > <div class = "row" > <div class = "col-lg-6" > <a href = "javascript:void(0);" data-toggle = "modal" data-target = "#view_info" > <img src = "assets/images/metagolslogo.svg" alt = "avatar"/> </a><div class="chat-about"><h6 style="margin-top: 3px" class="m-b-0">MetaGols Group <br><span id="groupStatus" style="font-weight:400;font-size: 12px;"> Online </span> <span id="typingGroup" style="font-weight:400;font-size: 12px;display: none"></span></h6></div></div></div></div><div class="chat-history"><ul class="m-b-0 chatStyle" id="hisTgroup"></ul></div></div></div></div></div>');

            data.map(el => {
                if (el.firstUser.id == myUserId) {
                    if (el.secondUser.last_seen == 'Online') {
                        $('#users').append("" + "<li id='usersList' userName='" + el.secondUser.fullname + "' socketId='" + el.secondUser.socket_id + "' userId='" + el.secondUser.id + "' class='clearfix tablinks' ><img src='"+el.secondUser.profile_image+"' alt='avatar'><div class='about'><div class='name'>" + el.secondUser.fullname + " </div><div class='status'> <i class='fa fa-circle online'></i> Active </div><div style='display: none' id='num" + el.secondUser.id + "' class='msgs'></div></div></li>")
                    } else {
                        $('#users').append("" + "<li id='usersList' city='" + el.secondUser.socket_id + "' userName='" + el.secondUser.fullname + "' socketId='" + el.secondUser.socket_id + "' userId='" + el.secondUser.id + "' class='clearfix tablinks' ><img src='"+el.secondUser.profile_image+"' alt='avatar'><div class='about'><div class='name'>" + el.secondUser.fullname + " </div><div class='status'> <i class='fa fa-circle offline'></i> Last seen "+ moment(el.secondUser.last_seen).fromNow() +" </div><div style='display: none' id='num" + el.secondUser.id + "' class='msgs'></div></div></li>")
                    }
                }
                else {
                    if (el.firstUser.last_seen == 'Online') {
                        $('#users').append("" + "<li id='usersList' userName='" + el.firstUser.fullname + "' socketId='" + el.firstUser.socket_id + "' userId='" + el.firstUser.id + "' class='clearfix tablinks' ><img src='"+el.firstUser.profile_image+"' alt='avatar'><div class='about'><div class='name'>" + el.firstUser.fullname + " </div><div class='status'> <i class='fa fa-circle online'></i> Active </div><div style='display: none' id='num" + el.firstUser.id + "' class='msgs'></div></div></li>")
                    } else {
                        $('#users').append("" + "<li id='usersList' city='" + el.firstUser.socket_id + "' userName='" + el.firstUser.fullname + "' socketId='" + el.firstUser.socket_id + "' userId='" + el.firstUser.id + "' class='clearfix tablinks' ><img src='"+el.firstUser.profile_image+"' alt='avatar'><div class='about'><div class='name'>" + el.firstUser.fullname + " </div><div class='status'> <i class='fa fa-circle offline'></i> Last seen "+ moment(el.firstUser.last_seen).fromNow() +" </div><div style='display: none' id='num" + el.firstUser.id + "' class='msgs'></div></div></li>")
                    }
                }

            });
        })
        //User Disconnected
        socket.on("disconnect", function (){
            socket.emit("disconnect", myUserId);
        });
        //Message Received
        socket.on("message" , function(data) {
            if(data.group == false) {
                if (notifiSound) {
                    var audio = new Audio('assets/sounds/notification_sound.mp3');
                    audio.play();
                }
                if (data.SenderId  != null && data.SenderId  != toUserId) {
                    document.getElementById('num' + data.SenderId).style.display = 'block';
                    $('#num' + data.SenderId).html('NEW');
                }else {
                    socket.emit("seenMsgs", {
                        userId : myUserId.toString(),
                        toUserId : toUserId.toString(),
                    });
                }
                if(data.type == 'TEXT') {
                    $('#hisT' + data.SenderId).append("<li class='clearfix'><div class=\"message-data \"></div><div class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + data.fullname + "</b><span class='msgTime'>" + moment(data.date).format('h:mm:ss') + "</span></div> " + data.message + " </div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");
                } else if(data.type == 'IMAGE'){
                    $("#hisT" + data.SenderId).append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + data.fullname + "</b><span class='msgTime'>" + moment(data.date).format('h:mm:ss') + "</span></div> <img class='chatImage' src=" + data.file + " alt=" + data.message + " /> </div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");

                } else if(data.type == 'FILE'){
                    $("#hisT" + data.SenderId).append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + data.fullname + "</b><span class='msgTime'>" + moment(data.date).format('h:mm:ss') + "</span></div>  <a  href='files/"+data.message+"' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> "+data.message.substring(0,15)+"... </span></a></div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");
                } else {
                    $("#hisT" + data.SenderId).append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + data.fullname + "</><span class='msgTime'>" + moment(data.date._d).format('h:mm:ss') + "</span></div>  <audio class='voiceChat' src='./records/"+data.message+"' controls></audio> </div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");
                }
            }else {
                if (isGroup != true) {
                    document.getElementById('numGroup').style.display = 'block';
                    $('#numGroup').html('NEW');
                    if (notifiSound) {
                        var audio = new Audio('assets/sounds/notification_sound.mp3');
                        audio.play();
                    }
                }

                if(data.type == 'TEXT') {
                    $('#hisTgroup').append("<li class='clearfix'><div class=\"message-data \"></div><div class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + data.fullname + "</b><span class='msgTime'>" + moment(data.date).format('h:mm:ss') + "</span></div> " + data.message + " </div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");
                } else if(data.type == 'IMAGE'){
                    $("#hisTgroup").append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + data.fullname + "</b><span class='msgTime'>" + moment(data.date).format('h:mm:ss') + "</span></div> <img class='chatImage' src=" + data.file + " alt=" + data.message + " /> </div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");

                } else if(data.type == 'FILE'){
                    $("#hisTgroup").append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + data.fullname + "</b><span class='msgTime'>" + moment(data.date).format('h:mm:ss') + "</span></div>  <a href='files/"+data.message+"' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> "+data.message.substring(0,15)+"... </span></a></div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");
                } else {
                    $("#hisTgroup").append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + data.fullname + "</b><span class='msgTime'>" + moment(data.date._d).format('h:mm:ss') + "</span></div><audio class='voiceChat' src='./records/"+data.message+"' controls></audio> </div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");
                }
            }


        });
        //User Is Typing
        socket.on("typing" , function (data){
            if(data.group == true) {
                $('#typingGroup').html(data.fullname+' is Typing...');
                $('#typingGroup').show();
                $('#groupStatus').hide();
            }
            else {
                $('#typing'+data.SenderId).show();
                $('#'+data.SenderId+'Status').hide();

            }
        });
        //User Finished Typing
        socket.on("finish-typing" , function (data){
            if(data.group == true) {
                $('#typingGroup').hide();
                $('#groupStatus').show();
            }
            else {
                $('#typing'+data.SenderId).hide();
                $('#'+data.SenderId+'Status').show();

            }
        });
        //Get Chat Between Users
        socket.on("getChat", function (data) {

            $("#hisT" + toUserId).html('');
            data.map(el => {
                if (el.from_user == myUserId) {
                    if (el.type == 'TEXT') {
                        $("#hisT" + toUserId).append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'><div style='display: flex;justify-content: space-between;'> <b>You</b> <span class='msgTime'>" + moment(el.createdAt).format("h:mm:ss") + "</span> </div><div style='display: flex;align-items: flex-end;justify-content: space-between;'> " + el.msg +  "<span class='seenTick" + el.id + " seenTick" + el.seen + "'> </span> </div></div></li>"
                        )
                    } else if (el.type == 'IMAGE') {
                        $("#hisT" + toUserId).append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'><div style='display: flex;justify-content: space-between;'> <b>You</b> <span class='msgTime'>" + moment(el.createdAt).format("h:mm:ss") + "</span> </div><div style='display: flex;align-items: flex-end;justify-content: space-between;'> <img class='chatImage' src='images/" + el.msg + "' /> <span class='seenTick" + el.id + " seenTick" + el.seen + "'> </span> </div></div></li>"
                        )
                    } else if (el.type == 'FILE') {
                        $("#hisT" + toUserId).append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'><div style='display: flex;justify-content: space-between;'> <b>You</b> <span class='msgTime'>" + moment(el.createdAt).format("h:mm:ss") + "</span> </div><div style='display: flex;align-items: flex-end;justify-content: space-between;'> <a href='files/" + el.msg + "' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> " + el.msg.substring(0, 15) + "... </span></a><span class='seenTick" + el.id + " seenTick" + el.seen + "'> </span></div></div></li>")
                    }
                    else {
                        $("#hisT"+toUserId).append("<li class='clearfix'><div STYLE=\"text-align: right\" class=\"message-data text-right\"></div><div style='text-align: left;' class='message other-message float-right'><div style='display: flex;justify-content: space-between;'> <b>You</b> <span class='msgTime'>"+moment(el.createdAt).format("h:mm:ss")+"</span> </div><div style='display: flex;align-items: flex-end;justify-content: space-between;'>  <audio class='voiceChat' src='./records/"+el.msg+"' controls></audio><span class='seenTick" + el.id + " seenTick" + el.seen + "'> </span></div></div></li>");
                    }
                } else {
                    if (el.type == 'TEXT') {
                        $('#hisT' + toUserId).append("<li class='clearfix'><div class=\"message-data \"></div><div class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + toUserName + " </b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span></div> " + el.msg + " </div></li>")
                    } else if (el.type == 'IMAGE') {
                        $("#hisT" + toUserId).append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + toUserName + "</b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span></div> <img class='chatImage' src='images/" + el.msg + "' /> </div></li>");
                    } else if (el.type == 'FILE') {
                        $("#hisT" + toUserId).append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + toUserName + "</b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span></div><a href='files/" + el.msg + "' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> " + el.msg.substring(0, 15) + "... </span></a></div></li>");
                    }
                    else {
                        $('#hisT' + toUserId).append("<li class='clearfix'><div class=\"message-data \"></div><div class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + toUserName + " </b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span></div> <audio class='voiceChat' src='./records/"+el.msg+"' controls></audio> </div></li>")
                    }
                }
            })
            $('.chat').animate({scrollTop: 20000000}, "fast");
        })
        //Get Group Chat
        socket.on("getGroupChat", function (data) {
            $("#hisTgroup").html('');
            data.map(el => {
                if (el.from_user == myUserId) {
                    if (el.type == 'TEXT') {
                        $("#hisTgroup").append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'><div style='display: flex;justify-content: space-between;'> <b>You</b> <span class='msgTime'>" + moment(el.createdAt).format("h:mm:ss") + "</span> </div> " + el.msg + " </div></li>"
                        )
                    } else if (el.type == 'IMAGE') {
                        $("#hisTgroup").append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'><div style='display: flex;justify-content: space-between;'> <b>You</b> <span class='msgTime'>" + moment(el.createdAt).format("h:mm:ss") + "</span> </div> <img class='chatImage' src='images/" + el.msg + "' /> </div></li>"
                        )
                    } else if (el.type == 'FILE') {
                        $("#hisTgroup").append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'><div style='display: flex;justify-content: space-between;'> <b>You</b> <span class='msgTime'>" + moment(el.createdAt).format("h:mm:ss") + "</span> </div> <a href='files/" + el.msg + "' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> " + el.msg.substring(0, 15) + "... </span></a></div></li>")
                    }
                    else{
                        $("#hisTgroup").append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'><div style='display: flex;justify-content: space-between;'> <b>You</b> <span class='msgTime'>" + moment(el.createdAt).format("h:mm:ss") + "</span> </div> <audio class='voiceChat' src='./records/"+el.msg+"' controls></audio> </div></li>")

                    }
                } else {
                    if (el.type == 'TEXT') {
                        $("#hisTgroup").append("<li class='clearfix'><div class=\"message-data \"></div><div class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + el.fullname + " </b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span></div> " + el.msg + " </div></li>")
                    } else if (el.type == 'IMAGE') {
                        $("#hisTgroup").append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + el.fullname + "</b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span></div> <img class='chatImage' src='images/" + el.msg + "' /> </div></li>");
                    } else if (el.type == 'FILE') {
                        $("#hisTgroup").append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + el.fullname + "</b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span></div><a href='files/" + el.msg + "' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> " + el.msg.substring(0, 15) + "... </span></a></div></li>");
                    }
                    else {
                        $("#hisTgroup").append("<li class='clearfix'><div class=\"message-data \"></div><div style='right: 0' class='message my-message'><div style='display: flex;justify-content: space-between;'><b>" + el.fullname + "</b><span class='msgTime'>" + moment(el.createdAt).format('h:mm:ss') + "</span></div> <audio class='voiceChat' src='./records/"+el.msg+"' controls></audio> </div></li>");

                    }
                }
            })
            $('.chat').animate({scrollTop: 20000000}, "fast");

        })

        socket.on("seenMsgs", function (data){
            if(toUserId == data){
                $('.seenTick'+ data).css("background-image", "url('assets/images/double-check.png')", "width", "20px", "height", "20px", "background-size","contain");
                $('.seenTick'+ data).css("width", "20px");
                $('.seenTick'+ data).css("height", "20px");
                $('.seenTick'+ data).css("background-size","contain");
                $('.seenTick'+ data).html('');
            }
        })
        //On Send msg button press
        $("#sendMessage").submit(function (event) {
            var message1 = $("#messageBox").val();
            var lt = /</g, gt = />/g, ap = /'/g, ic = /"/g;
            var message = message1.toString().replace(lt, "&lt;").replace(gt, "&gt;").replace(ap, "&#39;").replace(ic, "&#34;");
            if(message1.trim() != '') {
                date = new moment();
                if (isGroup) {
                    if (message != '') {
                        socket.emit("message", {
                            message: message,
                            fullname: fullname,
                            date: date,
                            ReceiverUserId: 0,
                            ReceiverSocketId: toUserSocketId,
                            SenderId: myUserId,
                            SenderSocketId: MySocketId,
                            group: true,
                            type: 'TEXT'
                        });
                        $("#hisTgroup").append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'><div style='display: flex;justify-content: space-between;'> <b>You</b> <span class='msgTime'>" + date.format("h:mm:ss") + "</span> </div> " + message + " </div></li>");
                    }
                } else {
                    if (message != '') {
                        socket.emit("message", {
                            message: message,
                            fullname: fullname,
                            date: date,
                            ReceiverUserId: toUserId,
                            ReceiverSocketId: toUserSocketId,
                            SenderId: myUserId,
                            SenderSocketId: MySocketId,
                            group: false,
                            type: 'TEXT'
                        });
                        $("#hisT" + toUserId).append("<li class='clearfix'><div STYLE=\"text-align: right\" class=\"message-data text-right\"></div><div style='text-align: left;' class='message other-message float-right'><div style='display: flex;justify-content: space-between;'> <b>You</b> <span class='msgTime'>" + date.format("h:mm:ss") + "</span> </div><div style='display: flex;align-items: flex-end;justify-content: space-between;'> " + message + " <span class='seenTick0 seenTick" + toUserId + "'> </span> </div></div></li>");
                    }
                }
                $('.chat').animate({scrollTop: 20000000}, "fast");
                document.getElementById("messageBox").value = "";
                event.preventDefault();

            }else {
                event.preventDefault();

            }

        });
        //On send Image button press
        $("#attachBtn").click(function (e) {
            $("#image").click();
        });
        //On send File button press
        $("#attachFile").click(function (e) {
            $("#fileAttach").click();
        });

        $("#signedPicture").click(function (e){
            $("#changeProfile").click();
        });

        $("#changeProfile").change(function (e) {
            var data = e.originalEvent.target.files[0];
            var reader = new FileReader();
            reader.onload = function (evt) {
                socket.emit("changeProfile", {
                    userId : myUserId,
                    image : evt.target.result,
                    imageName : data.name,
                });
            };
            reader.readAsDataURL(data);
            $("#changeProfile").val('');
        });

        $("#fileAttach").change(function (e) {
            var data = e.originalEvent.target.files[0];
            var reader = new FileReader();
            let myFileName = data.name;
            myFileName = myFileName.split('.').join('-' + Date.now() + '-' + MySocketId + '.');
            if (data.size < 5 * 1024 * 1024) {
                reader.onload = function (evt) {
                    var msg = {};
                    date = new moment();
                    if (isGroup == false) {
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
                        $("#hisT" + toUserId).append("<li class='clearfix'><div STYLE=\"text-align: right\" class=\"message-data text-right\"></div><div style='text-align: left;' class='message other-message float-right'><div style='display: flex;justify-content: space-between;'> <b>You</b> <span style='padding-left: 65px;font-size: 12px'>" + date.format("h:mm:ss") + "</span> </div><div style='display: flex;align-items: flex-end;justify-content: space-between;'>  <a href='files/" + myFileName + "' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> " + myFileName.substring(0, 15) + "... </span></a><span class='seenTick0 seenTick" + toUserId + "'> </span></div></li>");
                        $('.chat').animate({scrollTop: 20000000}, "fast");
                    } else {
                        msg.file = evt.target.result;
                        msg.message = myFileName;
                        msg.fullname = fullname;
                        msg.SenderSocketId = MySocketId;
                        msg.date = date;
                        msg.ReceiverSocketId = toUserSocketId;
                        msg.group = true;
                        msg.SenderId = myUserId;
                        msg.ReceiverUserId = 0;
                        msg.type = 'FILE'
                        socket.emit("message", msg);
                        $("#hisTgroup").append("<li class='clearfix'><div STYLE=\"text-align: right\" class=\"message-data text-right\"></div><div style='text-align: left;' class='message other-message float-right'><div style='display: flex;justify-content: space-between;'> <b>You</b> <span style='font-size: 12px;position: relative;left: 65%'>" + date.format("h:mm:ss") + "</span></div>  <a href='files/" + myFileName + "' style=\"border-radius: 0;font-size: 1.17rem;display: revert;cursor: pointer;width: 100%;color: black;text-decoration: none\" id=\"downloadFile\" download><i class=\"fa fa-download\"></i> <span style='font-size: 15px'> " + myFileName.substring(0, 15) + "... </span></a></div></li>");
                        $('.chat').animate({scrollTop: 20000000}, "fast");
                    }
                };
            } else{
                alert('Data size too large')
            }
            reader.readAsDataURL(data);
            $("#fileAttach").val('');
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
                    $("#hisT" + toUserId).append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'><div style='display: flex;justify-content: space-between;'> <b>You</b> <span class='msgTime'>"+ date.format("h:mm:ss") + "</span> </div><div style='display: flex;align-items: flex-end;justify-content: space-between;'> <img class='chatImage' src=" + msg.file + " alt=" + msg.message + " /> <span class='seenTick0 seenTick" + toUserId + "'> </span></div></li>");
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
                    msg.ReceiverUserId = 0;
                    msg.type = 'IMAGE'
                    socket.emit("message", msg);
                    $("#hisTgroup").append("<li class='clearfix'><div style='text-align: left;' class='message other-message float-right'><div style='display: flex;justify-content: space-between;'> <b>You</b> <span class='msgTime'>"+ date.format("h:mm:ss") + "</span></div> <img class='chatImage' src=" + msg.file + " alt=" + msg.message + " /> </div></li>");
                    $('.chat').animate({scrollTop: 20000000}, "fast");
                }
            };
            reader.readAsDataURL(data);
            $("#image").val('');
        });

        //User Typing
        inputs = $('#messageBox').on('keypress', (e) => {
            if (event.keyCode != 13) {
                clearTimeout(typingTimer);
                socket.emit("typing",
                    {
                        fullname: fullname,
                        group: isGroup,
                        SenderId : myUserId,
                        ReceiverId : toUserId,
                    });
                typingTimer = setTimeout(doneTyping, doneTypingInterval);
            }
        });
        //User Finished Typing
        function doneTyping () {
            socket.emit("finish-typing", {
                fullname : fullname,
                group : isGroup,
                SenderId : myUserId,
                ReceiverId : toUserId,
            });
        }
        //On send voice record button press
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
            date = new moment();
            if(isGroup == false) {
                socket.emit("message", {
                    file : blob,
                    message : myFileName,
                    fullname : fullname,
                    SenderSocketId : MySocketId,
                    date : date,
                    ReceiverSocketId : toUserSocketId,
                    group : false,
                    SenderId : myUserId,
                    ReceiverUserId : toUserId,
                    type : 'VOICE',
                });
                $("#hisT"+toUserId).append("<li class='clearfix'><div STYLE=\"text-align: right\" class=\"message-data text-right\"></div><div style='text-align: left;' class='message other-message float-right'><div style='display: flex;justify-content: space-between;'> <b>You</b> <span class='msgTime'>"+date.format("h:mm:ss")+"</span> </div><div style='display: flex;align-items: flex-end;justify-content: space-between;'>  <audio class='voiceChat' src='"+voiceUrl+"' controls></audio><span class='seenTick0 seenTick" + toUserId + "'> </span></div></div></li>");

                // $("#hisT"+toUserId).append("<li class='clearfix'><div STYLE=\"text-align: right\" class=\"message-data text-right\"></div><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>"+date.format("h:mm:ss")+"</span><div style='display: flex;align-items: flex-end;justify-content: space-between;'>  <audio class='voiceChat' src='"+voiceUrl+"' controls></audio><span class='seenTick0 seenTick" + toUserId + "'> </span> </div></li>");
                $('.chat').animate({scrollTop: 20000000}, "fast");
            }
            else {
                socket.emit("message", {
                    file : blob,
                    message : myFileName,
                    fullname : fullname,
                    SenderSocketId : MySocketId,
                    date : date,
                    ReceiverSocketId : toUserSocketId,
                    group : true,
                    SenderId : myUserId,
                    ReceiverUserId : 0,
                    type : 'VOICE',
                });
                $("#hisTgroup").append("<li class='clearfix'><div STYLE=\"text-align: right\" class=\"message-data text-right\"></div><div style='text-align: left;' class='message other-message float-right'> <b>You</b> <span class='msgTime'>"+date.format("h:mm:ss")+"</span> <br>  <audio class='voiceChat' src='"+voiceUrl+"' controls></audio> </div></li>");
                $('.chat').animate({ scrollTop: 20000000 },  "fast");
            }




        });

        $(document).on('click','#usersList',function(){
            document.getElementById('modalClose').click();
            $('#deleteBtn').removeClass('hidden');

            $('.search_value').val('');
            $('.searchResults').html('');
            toUserSocketId = $(this).attr('socketId');
            isGroup = false;
            toUserId = $(this).attr('userId');
            socket.emit("getUser",{ userId: toUserId, myId : myUserId});
            socket.on("getUser", function (data){
                $(".userData").html("");
                $("#userProfileImage").attr("src",data.profile_image);
                if(data.last_seen == 'Online')
                    $(".userData").html(data.fullname + "<br><div style='margin-top: -5px;'><span id=\""+data.id+"Status\" style=\"font-weight:400;font-size: 12px;margin-top: -5px\"> Online </span> <span id=\"typing"+ data.id +"\" style=\"font-weight:400;font-size: 12px;display: none\"> Typing... </span></div>");
                else
                    $(".userData").html(data.fullname + "<br><div style='margin-top: -5px;'><span id=\""+data.id+"Status\" style=\"font-weight:400;font-size: 12px;margin-top: -5px\"> Last seen "+moment(data.last_seen).fromNow()+" </span> <span id=\"typing"+ data.id +"\" style=\"font-weight:400;font-size: 12px;display: none\"> Typing... </span></div>");

                $(".chat-history").html("");
                $(".chat-history").html("<ul class=\"m-b-0 chatStyle\" id=\"hisT" + data.id + "\"></ul>");
            });

            document.getElementById('num'+toUserId).style.display = 'none';
            document.getElementById("messageBox").value = "";
            toUserName = $(this).attr('userName');
            socket.emit("getChat", {
                userId : myUserId.toString(),
                toUserId : toUserId.toString(),
            });

            socket.emit("seenMsgs", {
                userId : myUserId.toString(),
                toUserId : toUserId.toString(),
            });
            $('.sendForm').show();

        });
        $(document).on('click','#groupList',function(){
            isGroup = true;
            toUserId = 0;
            $('#deleteBtn').addClass('hidden');

            document.getElementById('numGroup').style.display = 'none';
            document.getElementById("messageBox").value = "";

            $("#userProfileImage").attr("src","assets/images/metagolslogo.svg");
            $(".userData").html("");
            $(".userData").html("MetaGols Group<br><div style='margin-top: -5px;'><span id='groupStatus' style=\"font-weight:400;font-size: 12px;margin-top: -5px\"> Active </span> <span id=\"typingGroup\" style=\"font-weight:400;font-size: 12px;display: none\"> Typing... </span></div>");
            $(".chat-history").html("");
            $(".chat-history").html("<ul class=\"m-b-0 chatStyle\" id=\"hisTgroup\"></ul>");
            $('.sendForm').show();
            toUserSocketId = null;
            socket.emit("getGroupChat", {
                userId : myUserId,
                toUserId : toUserId,
            });
        });

        $('#deleteChat').click(function (e){
            socket.emit('deleteChat',{
                myUserId : myUserId,
                toUserId : toUserId
            })

            $('#groupList').click();
        })
        $('input[name="search_value"]').on('input', function(){
            // setTimeout to simulate ajax
            setTimeout(function() {
                var search = $('input[name="search_value"]').val().toLowerCase();
                var output = '';

                for (var i = 0; i < users.length; i++) {
                    if (search.trim() !== '' && search.length > 2 && (users[i].fullname).toLowerCase().includes(search)) {
                        if (users[i].id != myUserId) {
                            if (users[i].last_seen == 'Online')
                                output += '<li id="usersList" userName="' + users[i].fullname + '" socketId="' + users[i].socket_id + '" userId="' + users[i].id + '" class="list-group-item user-item text-left"><img class="img-circle img-user img-thumbnail " src="./' + users[i].profile_image + '"><div class="searchName"> ' + users[i].fullname + ' <br><span style="font-size: 12px"> Online </span></div></li>';
                            else
                                output += '<li id="usersList" userName="' + users[i].fullname + '" socketId="' + users[i].socket_id + '" userId="' + users[i].id + '" class="list-group-item user-item text-left"><img class="img-circle img-user img-thumbnail " src="./' + users[i].profile_image + '"><div class="searchName"> ' + users[i].fullname + ' <br><span style="font-size: 12px"> Last seen ' + moment(users[i].last_seen).fromNow() + ' </span></div></li>';
                        }
                    }
                }

                $('.searchResults').html(output);
            });
        });

        $(document).on('click','#logout',function(){
            document.cookie = 'token=; Max-Age=-99999999;';
            window.location.href = "login.html";
        });


    }
}


