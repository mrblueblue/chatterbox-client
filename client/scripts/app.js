// YOUR CODE HERE:

var app = function(){
  var app =  {};

  app.settings = {
    chatContainer: '#chats',
    roomSelect: '#roomSelect',
    defaultUser: 'Anon',
    defaultRoom: 'lobby',
    endpoint: 'https://api.parse.com/1/classes/chatterbox'
  };

  app.friends = {
  };

  app.currentMessages = {};

  app.init = function() {
    $(document).ready(function(){
      app.addGlobalListeners();
      app.addMessageListeners();
    });
  };

  app.send = function(message) {
    $.ajax({
      url: app.settings.endpoint,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        message.objectId = data.objectId;
        message.createdAt = data.createdAt;
        app.currentMessages[message.objectId] = message;
        app.addMessage(message);
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message');
      }
    });
  };

  app.fetch = function(url, queryString) {
    queryString = queryString || 'order=-createdAt&limit=5';
    $.ajax({
      url: url,
      type: 'GET',
      contentType: 'application/json',
      data: queryString,
      success: function (data) {
        data.results.forEach(function(message){
          if ( !app.currentMessages[message.objectId] ){
            app.currentMessages[message.objectId] = message;
            app.addMessage(message);
          }
        });
      },
      error: function (data) {
        console.error('chatterbox: Failed to fetch messages');
      }
    });
  };

  app.addMessage = function(message){
    var messageBody = $('<div class="message" data-post-id="' + message.objectId + '"><div class="username"></div><div class="message-body"></div><div class="message-room"></div><div class="time">' + message.createdAt + '</div></div>');
    messageBody.find('.message-body').text(message.text);
    messageBody.find('.username').text(message.username);
    messageBody.find('.message-room').text(message.roomname);
    $(app.settings.chatContainer).append(messageBody);
    this.addMessageListeners();
  };

  app.clearMessages = function(){
    $(app.settings.chatContainer).empty();
  };

  app.addRoom = function(room){
    $(app.settings.roomSelect).append('<button id="' + room + '">' + room + '</button>');
  };

  app.addFriend = function(friend) {
    app.friends[friend] = {};
  };

  app.handleSubmit = function(){
    var message = {};
    message.username = app.settings.defaultUser;
    message.text = $('#message textarea').val();
    message.roomname = app.settings.defaultRoom;
    this.send(message);
  };

  app.addGlobalListeners = function() {

    // submit form by AJAX
    $('#message').submit(function(e){
      e.preventDefault();
      app.handleSubmit();
    });

    $('#fetch').on('click', function(e){
      app.fetch(app.settings.endpoint);
    });

    $('#clear').on('click', function(e){
      app.clearMessages();
    });

  };

  app.addMessageListeners = function(){
    // add a friend!
    $('.username').click(function(){
      var friend = $(this).text();
      app.addFriend(friend);
    });
  }

  app.init();

  return app;
}();

