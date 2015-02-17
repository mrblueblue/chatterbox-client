// YOUR CODE HERE:

var app = function(){
  var app =  {};

  app.settings = {
    chatContainer: '#chats',
    roomSelect: '#roomSelect',
    defaultUser: 'Anon',
    defaultRoom: 'lobby',
    currentUser: undefined,
    currentRoom: 'lobby',
    endpoint: 'https://api.parse.com/1/classes/chatterbox'
  };

  app.friends = {
  };

  app.rooms = {
    lobby: true
  };

  app.currentMessages = {};

  app.init = function() {
    $(document).ready(function(){
      $('#userselect').addClass('show');
      app.addGlobalListeners();
      app.addMessageListeners();
      app.getRooms();
    });
  };

  app.getRooms = function() {
    this.fetch(app.settings.endpoint, 'order=-createdAt', function(messages) {
      for ( var i = messages.length - 1; i >= 0; i-- ) {
        app.rooms[messages[i].roomname] = true;
      }
      var selector = $('#roomSelect select');
      selector.empty();
      for ( var k in app.rooms ) {
        var name = Array.prototype.slice.call(k, 0, 20).join('');
        var option = $('<option></option>');
        option.text(name).val(name)
        if ( app.settings.currentRoom === k ) {
          option.prop('selected', true)
        }
        selector.append(option);
      }
      selector.append('<option disabled>-----</option><option value="create">Create a Room</option>');
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

  app.fetch = function(url, queryString, callback) {
    queryString = queryString || 'where={ "roomname": "' + app.settings.currentRoom + '"}&order=-createdAt';
    $.ajax({
      url: url,
      type: 'GET',
      contentType: 'application/json',
      data: queryString,
      success: function (data) {
        callback(data.results);
      },
      error: function (data) {
        console.error('chatterbox: Failed to fetch messages');
      }
    });
  };

  app.addMessage = function(message){
    var messageBody = $('<div class="message" data-post-id="' + message.objectId + '"><div><div class="username"></div><div class="message-room"></div></div><div class="message-body"></div><div class="time">' + moment(message.createdAt).startOf('hour').fromNow() + '</div></div>');
    messageBody.find('.message-body').text(message.text);
    messageBody.find('.username').text(message.username);
    messageBody.find('.message-room').text('posted in ' + message.roomname);
    $(app.settings.chatContainer).prepend(messageBody);
    this.addMessageListeners();
  };

  app.clearMessages = function(){
    $(app.settings.chatContainer).empty();
  };

  app.getNewMessages = function(room){
    room = room || app.settings.currentRoom;
    var queryString = 'where={ "roomname": "' + room + '"}&order=-createdAt&limit=20';
    app.fetch(app.settings.endpoint, queryString, function(messages){
      for (var i = messages.length - 1; i >= 0; i--){
        if ( !app.currentMessages[messages[i].objectId] ){
            app.currentMessages[messages[i].objectId] = messages[i];
            app.addMessage(messages[i]);
          }
      }
    });
  };

  app.addRoom = function(room){
    $(app.settings.roomSelect).append('<button id="' + room + '">' + room + '</button>');
  };

  app.addFriend = function(friend) {
    app.friends[friend] = {};
  };

  app.handleSubmit = function(){
    var message = {};
    message.username = app.settings.currentUser || app.settings.defaultUser;
    message.text = $('#message textarea').val();
    message.roomname = app.settings.currentRoom;
    this.send(message);
    $('#message textarea').val("");
  };

  app.addGlobalListeners = function() {

    // submit form by AJAX
    $('#message').submit(function(e){
      e.preventDefault();
      app.handleSubmit();
    });

    $('#fetch').on('click', function(e){
      app.getNewMessages();
    });

    $('#clear').on('click', function(e){
      app.clearMessages();
    });

    $('#userselect form').on('submit', function(e) {
      e.preventDefault();
      app.settings.currentUser = $(this).find('input').val();
      $('#userselect.modal-container').removeClass('show');
    });

    $('#userselect .modal-close').click(function(e){
      e.preventDefault();
      $('#userselect.modal-container').removeClass('show');
    });

    $('#roomSelect select').change(function(){
      if ( $(this).val() === 'create' ) {
        $('#roomcreate').addClass('show');
      } else {
        var newRoom = $(this).val();
        app.settings.currentRoom = newRoom;
      }
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

