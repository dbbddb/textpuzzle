const fs = require('fs')

let stationNames = []

fs.readFile('stations.csv', 'utf8', (err, data) => {
	if(err){
		return console.log(err)
	}

	rowData = data.toLowerCase().split('\n').slice(1)
   
	stationNames = rowData.map( (element)=> {
        return element.split(',')[0]
	})

    const letters = 'abcdefghijklmnopqrstuvwxyz'

	let fewestStations = findFewestStationsForCharacterSet(stationNames, letters)

	console.log(fewestStations)
})


function findFewestStationsForCharacterSet(stationNames, characters){
    let result = { success: true, selectedStations: []}

    let stations = []

    // Scoring variable
    let highestOccurencesOfADistinctCharacter = 0

    // Create a map of the unique characters in our set
    let frequencyMap = new Map()

    for(let i = 0; i < characters.length; i++){
        if (!frequencyMap.get(characters[i])) {
            frequencyMap.set(characters[i], 0)    	
        }
    }

    // Iterate over the station names, update our frequency map, and build our station array containing the distinct characters of the name
    for(station in stationNames){
        let stationName = stationNames[station]
        let distinct = ''

    	for(let i = 0; i < stationName.length; i++){
            
    		let char = stationName.charAt(i) 
            
    		let currentCharacterCount = frequencyMap.get(char)
    		
            if (currentCharacterCount >= 0) {

             	frequencyMap.set(char, currentCharacterCount+1)

                if(currentCharacterCount+1 > highestOccurencesOfADistinctCharacter){
                	highestOccurencesOfADistinctCharacter = currentCharacterCount+1
                }                
                //Add to this stations distinct character list
                if(distinct.indexOf(char) == -1){
                	distinct+=char
                }
            }
        }
        
        if(distinct.length){
            stations.push({name: stationName, distinct: distinct, score: 0})
        }
    }

    // Create an array of letter scores based on frequency
    let characterSetScored = {}
    for(let i = 0; i < characters.length; i++){
        characterSetScored[characters[i]] = Math.abs(Math.log((frequencyMap.get(characters[i]) / (1+highestOccurencesOfADistinctCharacter) )) )
    }

    // Scoring method
    const applyScore = (lettersRemaining) => {
	    for(station in stations){
	    	stations[station].score = 0

	        for(let i = 0; i < stations[station].distinct.length; i++){
	        	let charInPosition = stations[station].distinct.charAt(i)
	        	if(lettersRemaining.indexOf(charInPosition) >= 0){
	    	        stations[station].score += characterSetScored[charInPosition]
	    	    }
	        }
	    }
	    // Sort the scored stations
		stations.sort(function(s1, s2) {
		  return s2.score - s1.score
		}) 
    }
        
    let lettersRemaining = characters.split('')
    
    // Apply initial score    
    applyScore(lettersRemaining)

    while( lettersRemaining.length > 0){
        //If the top item has no score, we have no hope of finding anymore
    	if(stations[0].score === 0){
            result.success = false
    		break
    	}

        // Remove the distinct letters from our remaining letters
        for(let i = 0; i < stations[0].distinct.length; i++ ){
            let charIndex = lettersRemaining.indexOf(stations[0].distinct.charAt(i));
        	if(charIndex >= 0){
        	    lettersRemaining.splice(charIndex, 1)
            }
        }
        
        // Add to result
        result.selectedStations.push(stations[0].name)

        // Reapply scoring
        applyScore(lettersRemaining)
    }
    
    return result
}



