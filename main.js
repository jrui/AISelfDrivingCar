import { Car } from './js/car.js';
import { Road } from './js/road.js';
import { Visualizer } from './js/visualizer.js';
import { NeuralNetwork } from './js/network.js';


window.addEventListener('load', function() {
    canvas.width = 200;
    nnCanvas.width = 300;
    
    const ctx = canvas.getContext("2d");
    const nnCtx = nnCanvas.getContext("2d");
    const LANE_COUNT = 4;
    const road = new Road(canvas.width / 2, canvas.width * 0.9, LANE_COUNT);
    
    const N = 1000;
    const cars = generateCars(N);
    const MUTATION_RATE = 0.15;
    let bestCar = cars[0];
    if (localStorage.getItem("bestBrain")) {
        for (let i = 0; i < cars.length; i++) {
            cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
            if (i !== 0) {
                NeuralNetwork.mutate(cars[i].brain, MUTATION_RATE);
            }
        }
    }

    
    let traffic = [];
    let nextCarY = -400;
    function addNewCars() {
        let carPositions = [...Array(LANE_COUNT).keys()]

        let index = carPositions.indexOf(Math.floor(Math.random() * LANE_COUNT))
        carPositions.splice(index, 1)
        carPositions.forEach(carPosition => {
            traffic.push(new Car(road.getLaneCenter(carPosition), nextCarY, 30, 50, "DUMMY", 2));

            if (traffic.length >= 30) {
                for (let i = 0; i < LANE_COUNT - 1; i++) traffic.pop();
            }
        })
        nextCarY -= 400;

        setTimeout(addNewCars, 800);
        console.log('Score: ' + Math.abs(bestCar.y).toFixed(2))
        console.log('Current rendered dummy cars: ' + traffic.length)
    }
    addNewCars();
    

    saveButton.addEventListener("click", save);    
    function save() {
        localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
    }

    discardButton.addEventListener("click", discard);
    function discard() {
        localStorage.removeItem("bestBrain");
    }

    
    function generateCars(number) {
        const cars = [];
        for (let i = 0; i < number; i++) {
            cars.push(new Car(
                road.getLaneCenter(1),
                100,
                30,
                50,
                "AI"
            ));
        }

        return cars;
    }

    function animate(time){
        for (let i = 0; i < traffic.length; i++){
            traffic[i].update(road.borders, []);
        }
        for (let i = 0; i < cars.length; i++) {
            cars[i].update(road.borders, traffic);
        }
        bestCar = cars.find(c => c.y === Math.min(...cars.map(c => c.y)));
    
        canvas.height = window.innerHeight;
        nnCanvas.height = window.innerHeight;
    
        ctx.save();
        ctx.translate(0, -bestCar.y + canvas.height * 0.75);

        traffic = traffic.filter(c => c.y < bestCar.y + 500);
    
        road.draw(ctx);
        for(let i = 0; i < traffic.length; i++) {
            traffic[i].draw(ctx, "red");
        }

        ctx.globalAlpha = 0.2;
        for (let i = 0; i < cars.length; i++) {
            cars[i].draw(ctx, "blue");
        }

        ctx.globalAlpha = 1;
        bestCar.draw(ctx, "darkblue", true);
    
        ctx.restore();

        nnCtx.lineDashOffset = -time / 100;
        Visualizer.drawNetwork(nnCtx, bestCar.brain);
        requestAnimationFrame(animate);
    }
    animate(0);
});