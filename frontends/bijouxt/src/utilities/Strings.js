const shorten = (word, limit) => {
    if (word.length > limit)
        return word.toString().substring(0, limit) + "..."
    return word
}

const capitalize = (word) => {
    let firstLetter = word.split("")[0]
    firstLetter = firstLetter.toUpperCase()
    let newWord = firstLetter + word.substring(1, word.length)
    return newWord
}

const String = { shorten,  capitalize}

export default String