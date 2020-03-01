//Setup Virus stats
let virulence = 3;
let incubationLowbound = 2
let incubationHighbound = 14;
let incubationTypical = (incubationHighbound - incubationLowbound)/2;
let killRate = 0.02;

//Setup incubation queue with patient zero having a typical incubation period
let incubationQueue = [];
for (let i=0; i<incubationHighbound; i++) {
	incubationQueue.push(0);
}
incubationQueue[incubationTypical] = 1;

//Set start date chosen arbitrarily so that first death occurs on March 1st
let dateStart = new Date("2020/01/24");
let dateEnd   = new Date("2020/11/03");


//Set up variables
let currentDate = dateStart;
let currentlyInfected = 1;
let totalEverInfected = 1;
let totalDead = 0;
let totalRecovered = 0;
let totalPopulation = 331000000;
let everyoneInfected = false;

while (currentlyInfected > 0) {

	//Move the clock forward 1 day
	currentDate.setDate(currentDate.getDate()+1);

	//Move the incubation queue forward by 1 day and get all people that are done incubating
	incubationQueue.unshift(0);
	let peopleDoneIncubating = incubationQueue.pop();

	//Tracking symptom progression is currently beyond the scope of this simulation.
	//For convenience's sake each person who finishes incubating immediately splits into partially recovered and partially dead.
	//In reality symptoms start 5-7 days after incubation begins and weeks to result in death or recovery.
	totalDead += killRate * peopleDoneIncubating;
	totalRecovered += (1-killRate) * peopleDoneIncubating;

	//The Virus Spreads
	if (!everyoneInfected) {
		let numNewInfected = peopleDoneIncubating * virulence;

		//Cap the spread of the virus to the total population
		if (totalEverInfected + numNewInfected > totalPopulation) {
			everyoneInfected = true;
			numNewInfected = totalPopulation - totalEverInfected;
			console.log("Everyone has been infected");
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

	currentlyInfected = incubationQueue.reduce(function(a, b){
        return a + b;
    }, 0);	

	//Generate a report of the day's events
	console.log(`${currentDate} Total Ever Infected: ${totalEverInfected}, Currently Infected: ${currentlyInfected}, Total Recovered: ${Math.floor(totalRecovered)}, Total Dead:${Math.floor(totalDead)}`);
}