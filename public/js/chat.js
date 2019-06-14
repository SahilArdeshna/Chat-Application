const socket = io(); 

// server (emit) ---> client (receive) ---> acknowledgement ---> server
// client (emit) ---> server (receive) ---> acknowledgement ---> client

// Elements
const $messageForm = document.querySelector('#form-data');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#location');
const $messages  = document.querySelector('#messages');

// Templates 
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const roomDataTemplate = document.querySelector('#room-data-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // New message Element
    const $newMessage = $messages.lastElementChild;

    // Height of the New message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of message container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffSet = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffSet) { 
        $messages.scrollTop = $messages.scrollHeight;
    }

};

socket.on('message', (message) => {    
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
}); 

socket.on('locationMessage', (message) => {    
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(roomDataTemplate, {
        room,
        users
    });

    document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Disable Button
    $messageFormButton.setAttribute('disabled', 'disabled');
    
    const inputMessage = e.target.elements.message.value;
    
    socket.emit('sendMessage', inputMessage, (error) => {
        
        // Enable button
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if(error) { 
           return console.log(error);
        }

        console.log('Message Deliverd!');
    });
});

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    // Disable location button
    $locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {        

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,            
            longitude: position.coords.longitude
        }, () => {

            // Enable location button
            $locationButton.removeAttribute('disabled');    
            console.log('Location Shared!');
        });      
    });
}); 

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
}); 