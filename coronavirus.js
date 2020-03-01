//Coronavirus! It incubates for 2-14 days. Symptoms start after 5-7, and you typically pass it on to 2-4 people.

// let data = [
// 	{generation:"Gen Z", 		ageLowbound:0,	ageHighbound:5,		populationMale:10.13,	populationFemale:9.68,	killRatePercent:0},
// 	{generation:"Gen Z", 		ageLowbound:5,	ageHighbound:9,		populationMale:10.32,	populationFemale:9.88,	killRatePercent:0},
// 	{generation:"Gen Z", 		ageLowbound:10,	ageHighbound:14,	populationMale:10.66,	populationFemale:10.22,	killRatePercent:0.2},
// 	{generation:"Millenial",	ageLowbound:15,	ageHighbound:19,	populationMale:10.77,	populationFemale:10.32,	killRatePercent:0.2},
// 	{generation:"Millenial",	ageLowbound:20,	ageHighbound:24,	populationMale:11.20,	populationFemale:10.67,	killRatePercent:0.2},
// 	{generation:"Millenial",	ageLowbound:25,	ageHighbound:29,	populationMale:12.02,	populationFemale:11.54,	killRatePercent:0.2},
// 	{generation:"Millenial",	ageLowbound:30,	ageHighbound:34,	populationMale:11.19,	populationFemale:10.94,	killRatePercent:0.2},
// 	{generation:"Gen X",		ageLowbound:35,	ageHighbound:39,	populationMale:10.79,	populationFemale:10.77,	killRatePercent:0.2},
// 	{generation:"Gen X",		ageLowbound:40,	ageHighbound:44,	populationMale:9.8,		populationFemale:9.92,	killRatePercent:0.4},
// 	{generation:"Gen X",		ageLowbound:45,	ageHighbound:49,	populationMale:10.26,	populationFemale:10.48,	killRatePercent:0.4},
// 	{generation:"Gen X",		ageLowbound:50,	ageHighbound:54,	populationMale:10.28,	populationFemale:10.61,	killRatePercent:1.3},
// 	{generation:"Boomer",		ageLowbound:55,	ageHighbound:59,	populationMale:10.67,	populationFemale:11.27,	killRatePercent:1.3},
// 	{generation:"Boomer",		ageLowbound:60,	ageHighbound:64,	populationMale:9.73,	populationFemale:10.6,	killRatePercent:3.6},
// 	{generation:"Boomer",		ageLowbound:65,	ageHighbound:69,	populationMale:8.03,	populationFemale:9.05,	killRatePercent:3.6},
// 	{generation:"Boomer",		ageLowbound:70,	ageHighbound:74,	populationMale:6.21,	populationFemale:7.19,	killRatePercent:8},
// 	{generation:"Silent",		ageLowbound:75,	ageHighbound:79,	populationMale:4.14,	populationFemale:5.12,	killRatePercent:8},
// 	{generation:"Silent",		ageLowbound:80,	ageHighbound:84,	populationMale:2.59,	populationFemale:3.54,	killRatePercent:14.8},
// 	{generation:"Silent",		ageLowbound:85,	ageHighbound:90,	populationMale:2.33,	populationFemale:4.22,	killRatePercent:14.8}
// ];



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
	
	//Move the incubation queue forward by 1 day and get all viruses that are done incubating
	incubationQueue.unshift(0);
	let virusesDoneIncubating = incubationQueue.pop();

	//Kill some hosts who finished incubating. The rest recover.
	totalDead += killRate * virusesDoneIncubating;
	totalRecovered += (1-killRate) * virusesDoneIncubating;


	//The Virus Spreads!
	if (!everyoneInfected) {
		let numNewInfected = virusesDoneIncubating * 3;

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