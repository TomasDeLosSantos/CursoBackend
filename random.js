

process.on('message', msg => {
    let responseObject = {};
    for(let i = 0; i < msg; i++){
        let num = Math.floor(Math.random * 1000);
        if(responseObject.hasOwnProperty(num)){
            responseObject[num]++;
        } else{
            responseObject[num] = 1;
        }
    }
    process.send(responseObject);
})