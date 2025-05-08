function cleanUpPhone(phone) {
    if (phone.includes("+"))
        return phone.toString().substring(1, phone.length)
    else
        return phone
}

module.exports = { cleanUpPhone }