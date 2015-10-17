(function () {
  var socket = io.connect('', {'sync disconnect on unload' : true}),
      room = window.location.pathname,
      term,
      currentSize = {};

  Terminal.bindKeys = function() {
    // FIXME: Ugly monkey patch to avoid term.js capturing the key presses,
    // as we're just using term.js as read-only. There should be a better way
    // to do this, but I couldn't find it.
  }

  socket.emit('join', room);
  socket.on('usersCount', function (onlineUsers) {
    document.getElementById('online-counter').innerHTML = onlineUsers;
  });
  socket.on('message', function (message) {
    if (term) {
      decoded_message = decodeURIComponent(atob(message));
      term.write(decoded_message);
    }
  });
  socket.on('size', function (size) {
    var sizeChanged;
    size = JSON.parse(size)
    sizeChanged = (currentSize.cols != size.cols ||
                   currentSize.rows != size.rows);

    if (term && sizeChanged) {
      term.destroy();
    }

    if (!term || sizeChanged) {
      term = new Terminal({
        cols: size.cols,
        rows: size.rows,
      });
      term.open();
    }

    currentSize = size;
  });
})();
