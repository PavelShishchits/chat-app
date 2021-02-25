// Elements
const messageForm = document.querySelector('#chat-form');
const messageField =  messageForm.querySelector('input');
const messageButton = messageForm.querySelector('[type="submit"]');
const messagesContainer = document.querySelector('#messages-container');
const geoLocationBtn = document.querySelector('#geolocation');
const sideBar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


const toggleElementDisableState = (el, disable) => {
    disable ? el.setAttribute('disabled', 'disabled') : el.removeAttribute('disabled');
}

const autoScroll = () => {
    const lastMessage = messagesContainer.lastElementChild;

    const lastMessageHeight = lastMessage.offsetHeight + parseInt(getComputedStyle(lastMessage)['margin-bottom']);

    const visibleHeight = messagesContainer.offsetHeight;

    const contentHeight = messagesContainer.scrollHeight;

    const scrollOffset = messagesContainer.scrollTop + visibleHeight;

    if (contentHeight - lastMessageHeight <= scrollOffset) {
        messagesContainer.scrollTop = contentHeight;
    }
}

const initApp = () => {
    const searchParams = new URLSearchParams(location.search);

    const socket = io();
    socket.on('message', (message) => {
        const html = Mustache.render(messageTemplate, {
            message: message.text,
            username: message.username,
            createdAt: moment(message.createdAt).format('h:mm a'),
        });
        messagesContainer.insertAdjacentHTML('beforeend', html);
        autoScroll();
    });

    socket.on('roomData', ({ room, users }) => {
        const html = Mustache.render(sidebarTemplate, {
            room,
            users,
        })
        sideBar.innerHTML = html;
    });

    socket.on('locationMessage', (message) => {
        const html = Mustache.render(locationTemplate, {
            url: message.url,
            username: message.username,
            createdAt: moment(message.createdAt).format('h:mm a'),
        });
        messagesContainer.insertAdjacentHTML('beforeend', html);
    })

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        toggleElementDisableState(messageButton, true);
        const inputMessage = e.target.elements['message'].value;
        socket.emit('sendMessage', inputMessage, (message) => {
            messageField.value = '';
            messageField.focus();
            toggleElementDisableState(messageButton, false);
            console.log(message);
        });
    });

    geoLocationBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            return alert('Your browser doesn\'t support geolocation');
        }
        toggleElementDisableState(geoLocationBtn, true);
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude: lat, longitude: long } = position.coords;
            socket.emit('sendLocation', { lat, long }, () => {
                toggleElementDisableState(geoLocationBtn, false);
            })
        });
    });

    socket.emit('join', {
        username: searchParams.get('username'),
        room: searchParams.get('room'),
    }, (error) => {
        if (error) {
            alert(error)
            location.href = '/'
        }
    });
}

document.addEventListener('DOMContentLoaded', initApp);