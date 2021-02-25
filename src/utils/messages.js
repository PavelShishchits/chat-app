const generateMessage = (messageData = {}) => ({
    ...messageData,
    createdAt: new Date().getTime(),
});

module.exports = {
    generateMessage,
}