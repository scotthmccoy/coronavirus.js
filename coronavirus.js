//Setup Virus stats
let virulence = 3;
let incubationLowbound = 2
let incubationHighbound = 14;
let incubationTypical = (incubationHighbound - incubationLowbound)/2;
let asymptomaticLength = 6
let symptomaticLength = 10;
let killRate = 0.02;


//Setup queues
let incubationQueue = new Array(incubationHighbound).fill(0);
let asymptomaticQueue = new Array(asymptomaticLength).fill(0);
let symptomaticQueue = new Array(symptomaticLength).fill(0);

 //Start with patient zero having a typical incubation period.
incubationQueue[incubationTypical] = 1;

//Choose start date arbitrarily such that first death occurs on March 1st
let dateStart = new Date("2020/01/16");
let endDate = new Date("2021/01/01");

//Set up variables
let currentDate = dateStart;

let totalEverInfected = 1;
let numIncubating = 1;
let numAsymptomatic = 0;
let numSymptomatic = 0;
let totalDead = 0;
let totalRecovered = 0;
let totalPopulation = 331000000;	//US Population
let everyoneInfected = false;



while (numIncubating > 0 || numAsymptomatic > 0 || numSymptomatic > 0) {

	//Move the clock forward 1 day
	currentDate.setDate(currentDate.getDate()+1);

	//Move the incubation queue forward by 1 day and get all people that are done incubating
	incubationQueue.unshift(0);
	let peopleDoneIncubating = incubationQueue.pop();

	//The Virus Spreads
	let numNewInfected = 0;
	if (!everyoneInfected) {
		numNewInfected = peopleDoneIncubating * virulence;

		//Cap the spread of the virus to the total population
		if (totalEverInfected + numNewInfected > totalPopulation) {
			everyoneInfected = true;
			numNewInfected = totalPopulation - totalEverInfected;
		}

		totalEverInfected += numNewInfected;

		//Give the newly infected a "randomly" generated incubation period. 
		let addToEachSlot = Math.floor(numNewInfected / 11);
		if (addToEachSlot >0) {
			for (let i=0; i<11; i++) {
				incubationQueue[i]+= addToEachSlot;
			}
		}

		//Give the remainder a "typical" incubation duration
		incubationQueue[incubationTypical]+=numNewInfected % 11;
	}

	//Add the newly infected to the asymptomatic queue
	asymptomaticQueue.unshift(numNewInfected);
	let peopleDoneWithAsymptomaticPhase = asymptomaticQueue.pop();

	//Add the people exiting the asymptomatic queue to the symptomatic queue
	symptomaticQueue.unshift(peopleDoneWithAsymptomaticPhase);
	let peopleDoneShowingSymptoms = symptomaticQueue.pop();	

	//Split those people into dead and recovered
	totalDead += killRate * peopleDoneShowingSymptoms;
	totalRecovered += (1-killRate) * peopleDoneShowingSymptoms;


	//Generate a report of the day's events
	numIncubating = arraySum(incubationQueue);
	numAsymptomatic = arraySum(asymptomaticQueue);
	numSymptomatic = arraySum(symptomaticQueue);

	var dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
	let strDate = currentDate.toLocaleDateString('en-US', dateOptions);

	let numericColumnWidth = 10;
	let strTotalEverInfected =	formatNumber(totalEverInfected);
	let strIncubating = 		formatNumber(numIncubating);
	let strAsymptomatic = 		formatNumber(numAsymptomatic);
	let strSymptomatic = 		formatNumber(numSymptomatic);
	let strRecovered = 			formatNumber(Math.floor(totalRecovered));
	let strDead = 				formatNumber(Math.floor(totalDead));

	console.log(`${strDate}\tTotal Ever Infected: ${strTotalEverInfected}Incubating: ${strIncubating}Asymptomatic: ${strAsymptomatic}Symptomatic: ${strSymptomatic}Recovered: ${strRecovered}Dead: ${strDead}`);
}



//Utilities
function formatNumber(num) {
	return String(shortenLargeNumber(num,1)).padEnd(10," ");
}

function arraySum(arr) {
	return arr.reduce(function(a, b){
        return a + b;
    }, 0);			
}


/**
 * Shorten number to thousands, millions, billions, etc.
 * http://en.wikipedia.org/wiki/Metric_prefix
 *
 * @param {number} num Number to shorten.
 * @param {number} [digits=0] The number of digits to appear after the decimal point.
 * @returns {string|number}
 *
 * @example
 * // returns '12.5k'
 * shortenLargeNumber(12543, 1)
 *
 * @example
 * // returns '-13k'
 * shortenLargeNumber(-12567)
 *
 * @example
 * // returns '51M'
 * shortenLargeNumber(51000000)
 *
 * @example
 * // returns 651
 * shortenLargeNumber(651)
 *
 * @example
 * // returns 0.12345
 * shortenLargeNumber(0.12345)
 */
function shortenLargeNumber(num, digits) {
    var units = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
        decimal;

    for(var i=units.length-1; i>=0; i--) {
        decimal = Math.pow(1000, i+1);

        if(num <= -decimal || num >= decimal) {
            return +(num / decimal).toFixed(digits) + units[i];
        }
    }

    return num;
}