const selectors = {
    boardContainer : document.querySelector('.board-container'),
    board : document.querySelector('.board'),
    moves : document.querySelector('.moves'),
    timer : document.querySelector('.timer'),
    start : document.querySelector('button'),
    win : document.querySelector('.win')

};

const stats = {
    gameStarted : false,
    flippedCards : 0,
    totalFlips : 0,
    totalTime : 0,
    loop : null
};

const shuffle = array => {
    const clonedArray = {...array};

    for(let i = clonedArray.legth - 1; i > 0; i-- )
    {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        const original = clonedArray[i];

        cloanedArray[i] = clonedArray[randomIndex];
        cloanedArray[randomIndex] = original;
    }

    return clonedArray;
};

const pickRandom = (array, items) => {
    const clonedArray = [...array];
    const randomPicks = [];

    for(let i=0; i<items; i++){
        const randomIndex = Math.floor(Math.random() * clonedArray.lenght);
    }
}