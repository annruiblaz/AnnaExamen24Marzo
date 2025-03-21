//HTML Elements
const INPUT_OBJ_VALUE = document.getElementById('objValue');
const INPUT_OBJ_WEIGHT = document.getElementById('objWeight');
const INPUT_OBJ_COLOR = document.getElementById('objColor');
const ADD_OBJ_BTN = document.getElementById('addObjBtn');
const OBJECTS_CANVAS = document.getElementById('objectsCanvas');
const INPUT_BACKPACK_WEIGHT = document.getElementById('backpackWeight');

//const utiles
const OBJECTS = [];
const colors = ['#4F8699', '#EAFF87', '#FF714B', '#C6D6B8', '#F2D694', '#EBF7F8', '#EDEBE6', '#EDEBE6', '#AEB18E', '#fae1dd' , '#c8c7d6',
    '#f0d7df', '#f7e6da', '#cae0e4', '#d4af96', '#b6c0a8', '#fffae5', '#ffdfc8'];


//funcion q añade un obj al array
function addObject() {
    console.log('color: ', INPUT_OBJ_COLOR);
    console.log('Valor + peso: ', INPUT_OBJ_VALUE, INPUT_OBJ_WEIGHT);
    let objColor = INPUT_OBJ_COLOR.value;
    let objValue = INPUT_OBJ_VALUE.valueAsNumber;
    let objweight = INPUT_OBJ_WEIGHT.valueAsNumber;

    let newObj = {
        value: objValue,
        weigth: objweight,
        color: objColor
    };

    OBJECTS.push(newObj);

    console.log('OBJECTS: ', OBJECTS);
    showObjects();
}

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function createInitialObj() {
    for( let i = 0; i < 4; i ++) {
        let newObj = {
            value: Math.floor(Math.random() * 50) + 1,
            weigth: Math.floor(Math.random() * 10) + 1,
            color: getRandomColor()
        }

        OBJECTS.push(newObj);
    }

    showObjects();
}


function showObjects() {
    OBJECTS_CANVAS.width = 450;
    OBJECTS_CANVAS.height = 750;

    let ctx = OBJECTS_CANVAS.getContext('2d');
    // Limpia el canvas
    ctx.clearRect(0, 0, OBJECTS_CANVAS.width, OBJECTS_CANVAS.height);

    // Variables para posicionar los objetos
    let x = 10; // Posición inicial en X
    let y = 10; // Posición inicial en Y
    const padding = 10; // Espacio entre objetos

    OBJECTS.forEach(obj => {
        // Dibuja el rectángulo
        ctx.fillStyle = obj.color; // Color de fondo
        ctx.fillRect(x, y, 450, 120); // Dibuja un rectángulo (x, y, width, height)

        // Dibuja el texto
        ctx.fillStyle = 'black'; // Color del texto
        ctx.font = '30px Arial'; // Fuente y tamaño del texto
        ctx.fillText(`Peso: ${obj.weigth}kg \n|\n Valor: ${obj.value}`, x + 60, y + 70); // Dibuja el texto (texto, x, y)

        // Actualiza la posición Y para el siguiente objeto
        y += 120 + padding;
    });
}

function start() {
    console.log('Objects.length: ', OBJECTS.length);
    //TODO: afinar valores!!!!!
    const ag = new GA(4, 2, 10, 4, 2, false);
    
    let pop = ag.createPop();
    console.log('Población inicial: ', pop);

    let fitnessPop = ag.fitness(pop);
    console.log('Resultado fitness: ', fitnessPop);

    let sel = ag.selection(fitnessPop, 2);
    console.log(`--- Selection ${sel} ---`);

    console.log('PRUEBA:', fitnessPop[2]);

}

createInitialObj();
console.log('Objetos iniciales: ', OBJECTS);



class GA {

    constructor(individuals, nSelection, generations, chrom, crosspoint, minimize) {
        this.individuals = individuals; //num individuos total en la pob
        this.nSelection = nSelection; //num d individuos seleccionados para repro
        this.generations = generations; // num generaciones
        this.chrom = chrom; //tamaño del cromosoma en bits!!!
        this.crosspoint = crosspoint; // punto d cruce  para la recombinación genética
        this.minimize = minimize; //si queremos min / max la funcion d fitness
    }

    createPop() {
        console.log('Prueba de aleatorio: ', Math.floor(Math.random() * this.chrom));
        return Array.from({length: this.individuals}, () =>
            Array.from( {length: OBJECTS.length}, () => 
                Math.floor(Math.random() * 2))
        );
    }

    fitness(pop) {
        //TODO: evaluar fitness para mochila:
        // valor total obj seleccionados + penalizar si pasa la capacidad d la mochila
        let maxWeight = INPUT_BACKPACK_WEIGHT.value;

        let results = [];

        for(let i = 0; i < pop.length; i++) {
            let valueTotal = 0;
            let weightTotal = 0;
/*             console.log('i', pop[i]);
 */            let tempPop = pop[i];
            for (let j = 0; j < OBJECTS.length; j++ ) {
/*                 console.log('j', pop[i][j]);
                console.log('OBJECTS[j]', OBJECTS[j]); */
                if (pop[i][j] === 1) {
                    valueTotal += OBJECTS[j].value;
                    weightTotal += OBJECTS[j].weigth;
                }

                if(j === OBJECTS.length-1) {
                    if (weightTotal > maxWeight) valueTotal = 0;

                    let newResult = {
                        pop: tempPop,
                        valueTotal: valueTotal,
                        weightTotal: weightTotal
                    }
                    console.log('resultado: ', newResult);
                    results.push(newResult);
                }
            }
        }

        return results;
    }

    selection(pop, position) {
        pop.sort((a, b) => this.minimize ? a.valueTotal - b.valueTotal : b.valueTotal - a.valueTotal);
        console.log('Pop sorted: ', pop);

        console.log('pop slice: ',pop.slice(-this.nSelection));
        return pop.slice(-this.nSelection);
    }

    reproduction(numPop, selected, pos) {
        let newPop = [];
        //TODO: Ajustar la tasa d mutación para q sea configurableee
        let idxMuta = Math.floor(Math.random() * numPop); //PRUEBA!!!

        for(let i = 0; i < numPop; i++) {
            //mezclamos los individuos aleatorio
            let shuffled = selected.sort(() => Math.random() - 0.5);
            console.log('Shuffled: ', shuffled);
            let [parent1, parent2] = shuffled;

            //TODO: revisar valor d crosspoint
            let children = parent1[pos].slice(0, this.crosspoint) + parent2[pos].slice(this.crosspoint);

            if(i === idxMuta) {
            //TODO: revisar valor chrom (para q acepte variacion con el num d obj)
            //Si es el individuo seleccionado para mutar, cambiamos uno d sus bits d manera aleatoria
            let bit = Math.floor(Math.random() * this.chrom); //generamos el idx del bit a modificar
            children = children.split('');
            children[bit] = children[bit] === '0' ? '1' : '0';
            children = children.join('');
            }
            //s añade el nuevo individuo a la pop
            newPop.push(children);
        }
        return newPop;
    }

    printGeneration(pop, i) {
        // Imprime en consola información sobre la generación actual
        console.log("=============================");
        console.log("Generación", i);
        console.log("=============================");
        console.log("Población:", pop);
    }
}