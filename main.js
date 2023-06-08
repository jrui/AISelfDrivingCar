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
    
    const N = 800;
    const cars = generateCars(N);
    const MUTATION_RATE = 0.1;
    let bestCar = cars[0];
    if (localStorage.getItem("bestBrain")) {
        for (let i = 0; i < cars.length; i++) {
            cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
            if (i !== 0) {
                NeuralNetwork.mutate(cars[i].brain, MUTATION_RATE);
            }
        }
    }

    
    let traffic = [
        new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -900, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -900, 30, 50, "DUMMY", 2),
    ];
    let nextCarY = -1100;
    function addNewCars() {
        let carsToAdd = LANE_COUNT - 1;
        let carPositions = []

        while (carsToAdd > 0) {
            let carPosition = Math.floor(Math.random() * LANE_COUNT);
            if (!carPositions.includes(carPosition)) {
                carPositions.push(carPosition);
                traffic.push(new Car(road.getLaneCenter(carPosition), nextCarY, 30, 50, "DUMMY", 2));
                carsToAdd--;
            }
        }
        nextCarY -= 400;

        setTimeout(addNewCars, 3800);
        console.log('Score: ' + Math.abs(bestCar.y).toFixed(2))
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
        bestCar.draw(ctx, "blue", true);
    
        ctx.restore();

        nnCtx.lineDashOffset = -time / 100;
        Visualizer.drawNetwork(nnCtx, bestCar.brain);
        requestAnimationFrame(animate);
    }
    animate(0);
});