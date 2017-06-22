$(function () {
    var FADE_TIME = 150;
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    var $window = $(window);
    var $usernameInput = $('.usernameInput'); // username
    var $messages = $('.messages'); // Messages
    var $inputMessage = $('.inputMessage'); // message input

    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page

    // $loginPage.fadeOut();
    // $chatPage.show()
    var username;
    var connected = false;
    var $currentInput = $usernameInput.focus();

    var socket = io.connect('http://localhost:8081');

    function setUsername() {
        username = $usernameInput.val().trim();

        if (username) {
            $loginPage.fadeOut();
            $chatPage.show();
            $loginPage.off('click');
            $currentInput = $inputMessage.focus();

            //向服务器广播添加新用户
            socket.emit('add user', username);
        }
    }

    //add message
    function addMessage(data, options) {

        var $usernameDiv = $('<span class="username"/>')
            .text(data.username)
            .css('color', setColor(data.username));
        var $messageBodyDiv = $('<span class="messageBody">')
            .text(data.message);

        var $messageDiv = $('<li class="message"/>')
            .data('username', data.username)
            .append($usernameDiv, $messageBodyDiv);

        addElement($messageDiv, options);
    }

    //add Element
    function addElement(el, options) {
        var $el = $(el);

        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        if (options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    // Send message
    function sendMessage() {
        var message = $inputMessage.val();
        if (message && connected) {
            $inputMessage.val('');
            addMessage({
                username: username,
                message: message
            });

            //往服务器广播新消息时间
            socket.emit('new message', message);
        }
    }

    //print
    function log(message, options) {
        var $el = $('<li>').addClass('log').text(message);
        addElement($el, options)

    }

    // Set color
    function setColor(username) {
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

    $window.keydown(function (event) {
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }

        if (event.which === 13) {
            if (username) {
                sendMessage();
            } else {
                setUsername();
            }
        }
    });

    socket.on('login', function (data) {
        $('#count').text(data.count);
        connected = true;
        log(data.message, {
            prepend: true
        });
    })

    socket.on('user joined', function (data) {
        $('#count').text(data.count);
        if (connected) {
            log(data.username + ' joined');
        }
    })

    socket.on('new message', function (data) {
        if(connected){
            addMessage(data);
        }
    })

    socket.on('user left', function (data) {
        $('#count').text(data.count);
        if (connected) {
            log(data.username + ' left');
        }
    })
})