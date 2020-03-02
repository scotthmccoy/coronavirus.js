//Setup Virus stats
let virulence = 3;
let incubationLowbound = 2
let incubationHighbound = 14;
let incubationRange = incubationHighbound - incubationLowbound;
let incubationTypical = incubationRange/2;
let asymptomaticLength = 6
let symptomaticLength = 10;
let killRate = 0.02;

//Set up government stats

//Maximum amount the government can reduce virulence by. Higher = more powerful government
//I chose 0.65 because I am optimistic about our ability to do what it takes to quarentine once the seriousness of the situation is understood.
let maxGovernmentImpactOnVirulence = 0.65;	

//Number of deaths for containment measures to reach max power. Lower = more responsive government. 
//I chose 800 as a starting value as that was the total number of deaths from SARS before deaths leveled off: 
//https://lh3.googleusercontent.com/proxy/gfxTB186nkF5-A7aEG6iFabktSvjQo9-IPjEkKq7RfSw8V0QzinAj8jirEAkaPCrro-3w9jyiqZXrWXDv_aI5w
//Then multiplied by 20 because:
//1) Unlike SARS, it is virulent while it is asymptomatic meaning many people will spread it unknowingly
//2) The virus is mild in 85% of cases
//2) Requiring 3 weeks of quarentine is basically asking poor people to kill themselves
let deathThresholdForMaxGovernmentImpact = 16000;	




//Setup queues
let incubationQueue = new Array(incubationHighbound).fill(0);
let asymptomaticQueue = new Array(asymptomaticLength).fill(0);
let symptomaticQueue = new Array(symptomaticLength).fill(0);

 //Start with patient zero having a typical incubation period.
incubationQueue[incubationTypical] = 1;

//Choose start date arbitrarily such that first death occurs on March 1st
let dateStart = new Date("2020/01/16");
let endDate = new Date("2020/12/31");

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




while (currentDate < endDate && (numIncubating > 0 || numAsymptomatic > 0 || numSymptomatic > 0)) {

	//Move the clock forward 1 day
	currentDate.setDate(currentDate.getDate()+1);

	//Move the incubation queue forward by 1 day and get all people that are done incubating
	incubationQueue.unshift(0);
	let peopleDoneIncubating = incubationQueue.pop();

	//The Virus Spreads
	let numNewInfected = 0;
	if (!everyoneInfected) {

		//Virulence drops based on government responses to deaths. Note: this part is entirely speculative. 
		let modifiedVirulence = virulence;
		if (totalDead < deathThresholdForMaxGovernmentImpact) {
			modifiedVirulence *= (1-maxGovernmentImpactOnVirulence * totalDead / deathThresholdForMaxGovernmentImpact);
		} else {
			modifiedVirulence *= (1-maxGovernmentImpactOnVirulence);
		}

		//Virulence drops further as people who have been infected can't get the virus again
		modifiedVirulence = modifiedVirulence * (1 - totalEverInfected/totalPopulation);

		//Cap the spread of the virus to the total population
		numNewInfected = Math.ceil(peopleDoneIncubating * modifiedVirulence);
		if (totalEverInfected + numNewInfected > totalPopulation) {
			everyoneInfected = true;
			numNewInfected = totalPopulation - totalEverInfected;
		}

		totalEverInfected += numNewInfected;

		//Give the newly infected a "randomly" generated incubation period. 
		let addToEachSlot = Math.floor(numNewInfected / incubationRange);
		if (addToEachSlot >0) {
			for (let i=0; i<incubationRange; i++) {
				incubationQueue[i]+= addToEachSlot;
			}
		}

		//Give the remainder a "typical" incubation duration
		incubationQueue[incubationTypical]+=numNewInfected % incubationRange;
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