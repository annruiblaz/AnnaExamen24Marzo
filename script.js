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
const BACKPACK_INFO = document.getElementById('backpack-info');
const SELECTED_CANVAS_CONTAINER = document.querySelector('.selected-canvas-container');
const SELECTED_OBJECTS_CANVAS = document.getElementById('selectedObjectsCanvas');

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
        weight: objweight,
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
            weight: Math.floor(Math.random() * 10) + 1,
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
        ctx.fillText(`Peso: ${obj.weight}kg \n|\n Valor: ${obj.value}`, x + 60, y + 70); // añade el texto (texto, x, y)

        //actualiza la posición Y para el siguiente objeto
        y += 120 + padding;
    });

    showTableInfo(false);
}

//funcion q inicializa el algoritmo genético
function start() {
    console.log('Objects.length: ', OBJECTS.length);

    let crosspoint = Math.round(OBJECTS.length / 2);
    console.log('CROSSPOINT', crosspoint);

    //TODO: afinar valores!!!!!
    const ag = new GA(10, 4, 15, OBJECTS.length, crosspoint, true);

    //creamos la poblacion inicial
    let pop = ag.createPop();
    console.log('Población inicial: ', pop);

    //calculamos fitness de la primera pop
    pop = ag.fitness(pop);

    //se ejecutan las generaciones
    for (let i = 0; i < ag.generations; i++) {
        ag.printGeneration(pop, i+1);

        //se seleccionan los mejores
        let sel = ag.selection(pop);
        console.log(`--- Selection ${JSON.stringify(sel)} ---`);

        //reproduccion d los seleccionados
        pop = ag.reproduction(pop.length, sel);
        console.log('--> Nueva generación tras reproducción: ', pop);

        //fitness d la nueva generación / pop
        pop = ag.fitness(pop);
    }

    //ordenamos la ult pop x mejor valorTotal
    pop.sort((a, b) =>  a.valueTotal - b.valueTotal);
    console.log('Ultimo fitness sort', pop);

    //+ optimo xq siempre necesitaremos la ult posicion del pop ya ordenado
    let bestResult = pop[pop.length -1];
    console.info('Mejor resultado: ', bestResult);
    updateSelectedObj(bestResult);
    showTableInfo(true);
    showSelectedObjects();
}

//funcion q muestra la info de los objetos
function showTableInfo(finalValues) {
    TABLE_INFO_TBODY.innerHTML = ''; //para limpiar el tbody de los tr/td anteriores
    let valueTotal = 0;
    let weightTotal = 0;

    for(let i = 0; i < OBJECTS.length; i ++) {
        let tr = document.createElement('tr'); //creamos la nueva fila para la tabla
        let calcRatio = OBJECTS[i].value / OBJECTS[i].weight;//calcula el ratio valor / peso

        //creamos array con los datos de esa fila
        let tdInfo = [
            OBJECTS[i].weight,
            OBJECTS[i].value,
            calcRatio.toFixed(2),
            OBJECTS[i].color,
            OBJECTS[i].selected === true ? 'Sí' : 'No'
        ];

        //itera sobre el array d los datos
        tdInfo.forEach( (info, idx) => {
            let td = document.createElement('td');//crea una celda para cada uno
            if(idx === 3) td.style.backgroundColor = OBJECTS[i].color //si es el index del color, cambia el color d fondo
            else td.textContent = info; //para el resto añade su info
            tr.appendChild(td);//se añade a la fila
        });

        //si el bool q controla si vamos a mostrar el resultado es true
        if(finalValues) {
            //itera el array d objetos x si esta seleccionado en el resultado
            if(OBJECTS[i].selected) {
                tr.classList.add('selected'); //añade la clase d css para q quede cute
                //sumamos peso y valor al total
                valueTotal += OBJECTS[i].value;
                weightTotal += OBJECTS[i].weight;
            }
            //funcion q muestra el valor y peso total del resultado
            showMaxValues(valueTotal, weightTotal);
        }

        TABLE_INFO_TBODY.appendChild(tr);//se añade la fila al tbody
    }
}

//funcion q muestra en el front los resultados d valor y peso total
function showMaxValues(valueTotal, weightTotal) {
    //limpio el contenido ya existente
    FINAL_RESULTS_CONTAINER.innerHTML = '';

    //añado el nuevo html con los valores + mochila
    FINAL_RESULTS_CONTAINER.innerHTML = `
        <div>
            <span>Capacidad de la mochila: </span>
            ${INPUT_BACKPACK_WEIGHT.value}kg
        </div>
        <div>
            <span>Peso total: </span>
            ${weightTotal}kg
        </div>

        <div>
            <span>Valor total: </span>
            ${valueTotal}
        </div>
    `;

    FINAL_RESULTS_CONTAINER.classList.remove('hidden');//para mostrarlo
}

//funcion q itera el array bin del resultado
function updateSelectedObj(best) {
    for (let i = 0; i < OBJECTS.length; i++) {
        // actualiza el bool de cada obj en base a
        // si en esa posicion de la pop esta seleccionado (1)
        OBJECTS[i].selected = best.pop[i] === 1;
    }
}

function showSelectedObjects() {
    // Asignamos ancho y alto
    SELECTED_OBJECTS_CANVAS.width = 450;
    SELECTED_OBJECTS_CANVAS.height = 750;

    // Obtenemos el contexto para pintar
    let ctx = SELECTED_OBJECTS_CANVAS.getContext('2d');

    // Limpiar el canvas
    ctx.clearRect(0, 0, SELECTED_OBJECTS_CANVAS.width, SELECTED_OBJECTS_CANVAS.height);

    // Para posicionar los objetos seleccionados
    let x = 0;
    let y = 0;
    const padding = 10;

    OBJECTS.forEach(obj => {
        if (obj.selected) {
            // Pinta el rectángulo para los objetos seleccionados
            ctx.fillStyle = obj.color; // Color de fondo
            ctx.fillRect(x, y, 450, 120); // Dibuja un rectángulo (x, y, width, height)

            // Configura el texto
            ctx.fillStyle = 'black'; // Color del texto
            ctx.font = '30px Arial'; // Fuente y tamaño del texto
            ctx.fillText(`Peso: ${obj.weight}kg \n|\n Valor: ${obj.value}`, x + 60, y + 70); // Añade el texto

            // Actualiza la posición Y para el siguiente objeto
            y += 120 + padding;
        }
    });

    SELECTED_CANVAS_CONTAINER.classList.remove('hidden');
}

createInitialObj();
console.log('Objetos iniciales: ', OBJECTS);

class GA {
    constructor(individuals, nSelection, generations, chrom, crosspoint, max) {
        this.individuals = individuals; //num individuos total en la pob
        this.nSelection = nSelection; //num d individuos seleccionados para repro
        this.generations = generations; // num generaciones
        this.chrom = chrom; //tamaño del cromosoma en bits!!!
        this.crosspoint = crosspoint; // punto d cruce  para la recombinación genética
        this.max = max; //si queremos min / max la funcion d fitness
    }

    //creamos la poblacion inicial con arrays bin aleatorios
    createPop() {
        //devuelve un array del tamaño del num d individuos 
        return Array.from({length: this.individuals}, () =>
            //y cada 1 contiene un array con los num binarios, del tamaño de obj existentes
            Array.from( {length: OBJECTS.length}, () => 
                Math.floor(Math.random() * 2))
        );
    }

    fitness(pop) {
        // evalua valor total obj seleccionados + penaliza si pasa la capacidad d la mochila
        let maxWeight = INPUT_BACKPACK_WEIGHT.value;
        let results = [];

        //iteramos sobre la pop
        for(let i = 0; i < pop.length; i++) {
            let valueTotal = 0;
            let weightTotal = 0;
            let tempPop = pop[i]; //almacenamos el array bin de este individuo

            //iteramos sobre cada posiciondel bin = el num d obj
            for (let j = 0; j < OBJECTS.length; j++ ) {
                //comprobamos si esta seleccionado
                if (parseInt(pop[i][j]) === 1) {
                    //para sumar su valor y peso al total
                    valueTotal += OBJECTS[j].value;
                    weightTotal += OBJECTS[j].weight;
                }

                //si es el ult obj del array bin d predicciones
                if(j === OBJECTS.length-1) {
                    //penalizamos poniendo a 0 el valor total si el peso excede la capacidad d la mochila
                    if (weightTotal > maxWeight) valueTotal = 0;

                    //creamos el obj newResult para dps devolver el resultado del fitness (junto con la pop)
                    let newResult = {
                        pop: tempPop,
                        valueTotal: valueTotal,
                        weightTotal: weightTotal
                    }
                    results.push(newResult); //lo añadimos al array
                }
            }
        }
        //devolvemos el array con las predicciones
        return results;
    }

    //funcion q selecciona los mejores individuos (segun el valorTotal de su fitness) de la pop
    selection(pop) {
        //se ordenan en base a si debe maximizar o no
        pop.sort((a, b) => this.max ? a.valueTotal - b.valueTotal : b.valueTotal - a.valueTotal);
        //para evitar problemas si es impar
        if (this.nSelection % 2 !== 0) this.nSelection += 1;
        //devolvemos los n ult en el array
        return pop.slice(-this.nSelection);
    }

    //funcion q genera nuevas predicciones combinando los mejores (seleccionados)
    reproduction(numPop, selected) {
        let newPop = [];
        //en este caso siempre muta 1 de los individuos d la nueva pop

        //iteramos sobre la pop para generar todos los 'hijos' necesarios
        for(let i = 0; i < numPop; i++) {
            let probMuta = Math.random(); //genera num para mutar entre 0 y 1
            console.log('probMuta', probMuta);

            //mezclamos los individuos d manera aleatoria
            let shuffled = selected.sort(() => Math.random() - 0.5);
            //almacenamos y printeamos los papis
            let parent1 = selected[Math.floor(Math.random() * selected.length)];
            let parent2 = selected[Math.floor(Math.random() * selected.length)];

            //creamos el hijo con la mitad d un padre y la contraria del otro
            let children = parent1.pop.slice(0, this.crosspoint).concat(parent2.pop.slice(this.crosspoint));
            
            console.log(`Padre 1: ${parent1.pop} + Padre 2: ${parent2.pop}`);
            console.log('Combinación: ' + parent1.pop.slice(0, this.crosspoint) + '+' + parent2.pop.slice(this.crosspoint));
            console.log('Resultado hijo: ', children);

            //si el idx es igual al seleccionado para mutar
            if(probMuta >= .75) {
            //cambiamos uno d sus bits d manera aleatoria
            let bit = Math.floor(Math.random() * this.chrom); //generamos el idx del bit a modificar
            children[bit] = children[bit] === 0 ? 1 : 0;
            console.log(`---> Probabilidad de mutar alta ${probMuta} Hijo mutado: ${children}`);
            }
            console.log("-----------------------------");
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