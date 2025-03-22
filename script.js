//HTML Elements
const INPUT_OBJ_VALUE = document.getElementById('objValue');
const INPUT_OBJ_WEIGHT = document.getElementById('objWeight');
const INPUT_OBJ_COLOR = document.getElementById('objColor');
const ADD_OBJ_BTN = document.getElementById('addObjBtn');
const OBJECTS_CANVAS = document.getElementById('objectsCanvas');
const INPUT_BACKPACK_WEIGHT = document.getElementById('backpackWeight');
const FINAL_RESULTS_CONTAINER = document.querySelector('.final-results-container');
const OBJ_CONTAINER = document.querySelector('.obj-container');
const TABLE_INFO_TBODY = document.getElementById('info-tbody');

//const utiles
const OBJECTS = [];
const colors = ['#4F8699', '#EAFF87', '#FF714B', '#C6D6B8', '#F2D694', '#EBF7F8', '#EDEBE6', '#EDEBE6', '#AEB18E', '#fae1dd' , '#c8c7d6',
    '#f0d7df', '#f7e6da', '#cae0e4', '#d4af96', '#b6c0a8', '#fffae5', '#ffdfc8'];
const bestResult = null;

//funcion q añade un obj al array
function addObject() {
    //almacenamos los valores en variables
    let objColor = INPUT_OBJ_COLOR.value;
    let objValue = INPUT_OBJ_VALUE.valueAsNumber;
    let objweight = INPUT_OBJ_WEIGHT.valueAsNumber;

    //creo el obj para almacenar bn los datos con sus props
    let newObj = {
        value: objValue,
        weigth: objweight,
        color: objColor,
        selected: false
    };

    OBJECTS.push(newObj);//se añade al array d objetos

    console.log('OBJECTS: ', OBJECTS);
    showObjects();//actualiza el canvas
}

//funcion chorra para asignarle un color a los obj q se crean inicialmente
function getRandomColor() {
    //devuelve el string con el color almacenado en una posicion random del array
    return colors[Math.floor(Math.random() * colors.length)];
}

//funcion q crea los 4 objetos iniciales con unos valores aleatorios
function createInitialObj() {
    for( let i = 0; i < 4; i ++) {
        let newObj = { //creamos obj con valores random
            value: Math.floor(Math.random() * 50) + 1,
            weigth: Math.floor(Math.random() * 10) + 1,
            color: getRandomColor(),
            selected: false
        }

        OBJECTS.push(newObj);//se añade al array
    }

    showObjects();//actualiza el canvas con los obj
}

//funcion q muestra los objetos en el canvas
function showObjects() {
    //asignamos ancho y alto
    OBJECTS_CANVAS.width = 450;
    OBJECTS_CANVAS.height = 750;

    //obtenemos el contexto para pintar
    let ctx = OBJECTS_CANVAS.getContext('2d');

    //limpia el canvas
    ctx.clearRect(0, 0, OBJECTS_CANVAS.width, OBJECTS_CANVAS.height);

    //para posicionar los objetos
    let x = 0;
    let y = 0;
    const padding = 10;

    OBJECTS.forEach(obj => {
        //pinta el rectángulo
        ctx.fillStyle = obj.color; //color de fondo
        ctx.fillRect(x, y, 450, 120); //dibuja un rectángulo (x, y, width, height)

        //config el texto
        ctx.fillStyle = 'black'; //color del texto
        ctx.font = '30px Arial'; //fuente y tamaño del texto
        ctx.fillText(`Peso: ${obj.weigth}kg \n|\n Valor: ${obj.value}`, x + 60, y + 70); // añade el texto (texto, x, y)

        //actualiza la posición Y para el siguiente objeto
        y += 120 + padding;
    });

    showTableInfo();
}

//funcion q inicializa el algoritmo genético
function start() {
    console.log('Objects.length: ', OBJECTS.length);
    //TODO: afinar valores!!!!!
    const ag = new GA(4, 2, 5, 4, 2, true);

    //creamos la poblacion inicial
    let pop = ag.createPop();
    console.log('Población inicial: ', pop);

    //calculamos fitness de la primera pop
    let fitnessPop = ag.fitness(pop);

    //se ejecutan las generaciones
    for (let i = 0; i < ag.generations; i++) {
        ag.printGeneration(fitnessPop, i+1);

        //se seleccionan los mejores
        let sel = ag.selection(fitnessPop);
        console.log(`--- Selection ${sel} ---`);

        //reproduccion d los seleccionados
        pop = ag.reproduction(pop.length, sel);
        console.log('--> Nueva generación tras reproducción: ', pop);

        //fitness d la nueva generación / pop
        fitnessPop = ag.fitness(pop);
    }

    //ordenamos la ult pop (ascendente)
    fitnessPop.sort((a, b) =>  a.valueTotal - b.valueTotal);
    console.log('Ultimo fitness sort', fitnessPop);

    //No sirve xq solo pilla el array de pop, cuando ya tenemos el fitness calculado
    //console.log('Mejor resultado? ', pop.slice(-1));

    //+ optimo xq siempre necesitaremos la ult posicion del pop ya ordenado
    let bestResult = fitnessPop[fitnessPop.length -1];
    console.log('Mejor resultado: ', bestResult);
    updateSelectedObj(bestResult);
    showTableInfo();
}

createInitialObj();
console.log('Objetos iniciales: ', OBJECTS);

//funcion q muestra la info de los objetos
function showTableInfo() {
    TABLE_INFO_TBODY.innerHTML = ''; //para limpiar el tbody de los tr/td anteriores
    let valueTotal = 0;
    let weightTotal = 0;

    for(let i = 0; i < OBJECTS.length; i ++) {
        let tr = document.createElement('tr');
        //console.log('best[0][i]', best.pop[i]);
        let calcRatio = OBJECTS[i].value / OBJECTS[i].weigth;

        let tdInfo = [
            OBJECTS[i].weigth,
            OBJECTS[i].value,
            calcRatio.toFixed(2),
            OBJECTS[i].color,
            OBJECTS[i].selected === true ? 'Sí' : 'No'
        ];

        tdInfo.forEach( (info, idx) => {
            let td = document.createElement('td');
            if(idx === 3) td.style.backgroundColor = OBJECTS[i].color
            else td.textContent = info;
            tr.appendChild(td);
        });

        if(OBJECTS[i].selected) {
            tr.classList.add('selected');
            valueTotal += OBJECTS[i].value;
            weightTotal += OBJECTS[i].weigth;
        }

        console.log(`showTableInfo: ValueTotal ${valueTotal}, weightTotal: ${weightTotal}`);
        TABLE_INFO_TBODY.appendChild(tr);
    }
    showMaxValues(valueTotal, weightTotal);
}

function showMaxValues(valueTotal, weightTotal) {
    FINAL_RESULTS_CONTAINER.innerHTML = '';

    let p1 = document.createElement('p');
    let p2 = document.createElement('p');

    p1.innerText = `Peso total: ${weightTotal}`;
    p2.innerText = `Valor total: ${valueTotal}`;

    FINAL_RESULTS_CONTAINER.appendChild(p1);
    FINAL_RESULTS_CONTAINER.appendChild(p2);

    FINAL_RESULTS_CONTAINER.classList.remove('hidden');
    OBJ_CONTAINER.appendChild(FINAL_RESULTS_CONTAINER);
}

function updateSelectedObj(best) {
    for (let i = 0; i < OBJECTS.length; i++) {
        // se queda el bool del resultado d si best.pop[i] es 1 --> true = el objeto está seleccionado
        OBJECTS[i].selected = parseInt(best.pop[i]) === 1;
        console.log(`Objeto ${i} seleccionado: ${OBJECTS[i].selected}`);
    }
}

class GA {

    constructor(individuals, nSelection, generations, chrom, crosspoint, max) {
        this.individuals = individuals; //num individuos total en la pob
        this.nSelection = nSelection; //num d individuos seleccionados para repro
        this.generations = generations; // num generaciones
        this.chrom = chrom; //tamaño del cromosoma en bits!!!
        this.crosspoint = crosspoint; // punto d cruce  para la recombinación genética
        this.max = max; //si queremos min / max la funcion d fitness
    }

    createPop() {
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
/*             console.log('i', pop[i]); */
            let tempPop = pop[i];
            for (let j = 0; j < OBJECTS.length; j++ ) {
                /* console.log('j', pop[i][j]);
                console.log('OBJECTS[j]', OBJECTS[j]); */
                if (parseInt(pop[i][j]) === 1) {
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
                    console.log(`resultado fitness pop ${i} : ${JSON.stringify(newResult)}`);
                    results.push(newResult);
                }
            }
        }

        return results;
    }

    selection(pop) {
        pop.sort((a, b) => this.max ? a.valueTotal - b.valueTotal : b.valueTotal - a.valueTotal);
        console.log('Pop sorted: ', pop);

        console.log('pop slice: ',pop.slice(-this.nSelection));
        return pop.slice(-this.nSelection);
    }

    reproduction(numPop, selected) {
        let newPop = [];
        //TODO: Ajustar la tasa d mutación para q sea configurableee
        let idxMuta = Math.floor(Math.random() * numPop); //PRUEBA!!!

        for(let i = 0; i < numPop; i++) {
            //mezclamos los individuos aleatorio
            let shuffled = selected.sort(() => Math.random() - 0.5);
            console.log('Shuffled: ', shuffled);
            let [parent1, parent2] = shuffled;
            console.log(`Parent1 ${parent1.pop}, Parent2: ${parent2.pop}`);


            //TODO: revisar valor d crosspoint
            let children = parent1.pop.slice(0, this.crosspoint) + ',' + parent2.pop.slice(this.crosspoint);
            
            console.log('Hijo: ' + parent1.pop.slice(0, this.crosspoint) + '+' + parent2.pop.slice(this.crosspoint));
            console.log('children: ', children);
            children = Array.from(children.split(','));
            console.log(' children tras Split()', children);

            if(i === idxMuta) {
            //TODO: revisar valor chrom (para q acepte variacion con el num d obj)
            //Si es el individuo seleccionado para mutar, cambiamos uno d sus bits d manera aleatoria
            let bit = Math.floor(Math.random() * this.chrom); //generamos el idx del bit a modificar
            //children = children.split('');
            children[bit] = children[bit] === '0' ? '1' : '0';
            //children = children.join('');
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