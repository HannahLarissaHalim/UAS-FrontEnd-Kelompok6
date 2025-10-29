const { v4: uuidv4 } = require('uuid');

function generateRandomEmail(firstName, lastName) {
    const domain = 'example.com';
    const randomPart = Math.random().toString(36).substring(2, 7);
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${randomPart}@${domain}`;
}

function generateUserId() {
    return uuidv4();
}

module.exports = {
    generateRandomEmail,
    generateUserId,
};