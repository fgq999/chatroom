/**
 * Created by lkt on 15-4-17.
 */
var room = require("../modules/entity/Room.js")

function chatSocket(){
    return this;
}
module.exports = chatSocket;
chatSocket.Start = function Start(io){

    var rooms = new Array();
    var userList = new Array();
    var userSocketMap = {};

    io.sockets.on('connection',function(socket){
        //socket.emit('conn',{'value':'hello,welcome!','user':'System'});
        //接收用户修改姓名
        socket.on('setName',function(data){
            var index = userList.indexOf(data.name);
            if(index==-1){
                userList.push(data.name);
                userSocketMap[data.name] = socket;
                socket.emit('setName',{'value':'欢迎您! '+data.name,'user':'System','type':'new'});
            }else{
                socket.emit('setName',{'value':'昵称 '+data.name+' 已经存在！','user':'System','type':'rep'});
            }
        });
        //私聊
        socket.on('pchat',function(data){
            var v = data.value;
            var tname = v.substring(v.indexOf('@')+1,v.indexOf(']'));
            console.log(tname);
            var s = userSocketMap[tname];
            s.emit('pchat',{value:data.value,fname:data.fname});
        });
        //给用户发送房间信息
        socket.emit('rooms',{rooms:rooms});
        //接收用户创建房间的指令
        socket.on('cRoom',function(data){
            var repCreate=false;
            //判断房间是否存在
            rooms.forEach(function(r){
                if(r.name==data.name){
                    repCreate = true;
                }
            });
            if(!repCreate){
                leaveMyInRoom(data,socket,rooms);
                var r = new room(data.name,data.ho);
                rooms.push(r);
                socket.join(data.name);
                socket.emit('rooms',{rooms:rooms,room:data.name,value:'房间 ['+data.name+'] 创建成功!','user':'System'});
                //给除了自己以外的客户端广播消息
                socket.broadcast.emit('refRooms',{rooms:rooms});
            }else{
                socket.emit('rooms',{rooms:rooms,room:data.name,value:'房间 ['+data.name+'] 已经存在!','user':'System'});
            }

            //
        });
        socket.on('say',function(data){
            var rname = data.room;
            var ruser = data.user;
            var rsay = data.value;
            io.in(rname).emit('say',{value:rsay,'user':ruser});
            //socket.emit('say',{value:rsay,'user':ruser});
        });
        socket.on('leaveRoom',function(data){
            console.log(data);
            leaveMyInRoom(data,socket,rooms);
            var index = userList.indexOf(data.user);
            if(index!=-1){
                userList.splice(index,1);
            }
            socket.broadcast.emit('say',{value:' ['+data.user+']离开了房间!','user':'System'});
            io.emit('refRooms',{rooms:rooms});
        });
        socket.on('joinRoom',function(data){
            //是否重复加入
            var repJoin = false;
            leaveMyInRoom(data,socket,rooms);
            rooms.forEach(function(r){
                if(r.name==data.room){
                    //repJoin = r.getUsers().contains(data.name);
                    repJoin= r.userContains(data.user);
                    if(!repJoin)
                        r.addUser(data.user);
                }
            });
            if(!repJoin){
                socket.join(data.room);
                socket.emit('say',{value:'欢迎加入 ['+data.room+'] 房间!','user':'System'});
                socket.broadcast.emit('say',{value:'欢迎 ['+data.user+']加入房间!','user':'System'});
                io.emit('refRooms',{rooms:rooms});
            }else{
                socket.emit('say',{value:'您已经在 ['+data.room+'] 房间!','user':'System'});
            }
        });
        socket.on('disconnect',function(socket){
            //console.log(socket.);
        });
    });
}
function leaveMyInRoom(data,socket,rooms){
    //记录房间用户为0的序号
    var delRoom = -1;
    var index = 0;
    if(data.currRoom!='无'){
        socket.leave(data.currRoom);
        rooms.forEach(function(r){
            if(r.name==data.currRoom){
                r.removeUser(data.user);
                if(r.getUsers().length==0){
                    delRoom = index;
                }
            }
            index++;
        });
    }
    if(delRoom!=-1){
        rooms.splice(delRoom,1);
    }
}
