const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));


http.listen(8081, function () {
    console.log('listening port at 8081');
})

var count = 0;

//监听链接
io.on('connection', function (socket) {
    var addedUser = false;


    //发送消息
    socket.on('new message', function (data) {
        //广播消息
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    //监听新用户
    socket.on('add user', function (username) {
        if (addedUser) return;

        socket.username = username;
        addedUser = true;
        ++count;

        socket.emit('login', {
            message: 'Welcome to chat!',
            count: count
        });

        //广播新用户加入
        socket.broadcast.emit('user joined', {
            username: socket.username,
            count: count
        });
    });

    // 监听并广播用户离线
    socket.on('disconnect', function () {
        if (addedUser) {
            --count;
            socket.broadcast.emit('user left', {
                username: socket.username,
                count: count
            });
        }
    });
});