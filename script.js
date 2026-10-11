// --- script.js ---

let restriccionesPersonalizadas = [];

// Cargar la vista al iniciar la página
window.onload = function() {
    gestionarModo();
};

function validarEntradas(prob) {
    const alertBox = document.getElementById('alertBox');
    alertBox.style.display = 'none';
    alertBox.innerHTML = '';
    let errores = [];

    // 1. Validar nombres de variables
    if (!prob.varX || prob.varX.trim() === '') {
        errores.push('Debes ingresar un nombre o etiqueta para la variable X1.');
    }
    if (!prob.varY || prob.varY.trim() === '') {
        errores.push('Debes ingresar un nombre o etiqueta para la variable X2.');
    }

    // 2. Validar coeficientes de la Función Objetivo
    if (isNaN(prob.c1) || isNaN(prob.c2)) {
        errores.push('Los coeficientes de la Función Objetivo (C1 y C2) deben ser números válidos.');
    }
    if (prob.c1 === 0 && prob.c2 === 0) {
        errores.push('Al menos uno de los coeficientes de la Función Objetivo (C1 o C2) debe ser distinto de cero.');
    }

    // 3. Validar cantidad de restricciones
    if (!prob.restricciones || prob.restricciones.length === 0) {
        errores.push('Debes agregar al menos una restricción para delimitar la región factible.');
    }

    // 4. Validar coeficientes de cada restricción
    prob.restricciones.forEach((r, idx) => {
        if (isNaN(r.a) || isNaN(r.b) || isNaN(r.c)) {
            errores.push(`La restricción #${idx + 1} tiene valores numéricos vacíos o no válidos.`);
        }
        if (r.a === 0 && r.b === 0) {
            errores.push(`La restricción #${idx + 1} no puede tener ambos coeficientes (A y B) en cero.`);
        }
    });

    // Mostrar errores si existen
    if (errores.length > 0) {
        alertBox.innerHTML = '<strong><i class="fas fa-exclamation-triangle"></i> Por favor corrige los siguientes puntos:</strong><br>• ' + errores.join('<br>• ');
        alertBox.style.display = 'block';
        return false;
    }

    return true;
}
function gestionarModo() {
    const modo = document.getElementById('problemSelect').value;
    const customForm = document.getElementById('customFormContainer');

    if (modo === 'custom') {
        customForm.style.display = 'block';
        if (restriccionesPersonalizadas.length === 0) {
            // Cargar restricciones por defecto para el modo libre
            restriccionesPersonalizadas = [
                { a: 6, b: 4, op: '<=', c: 24 },
                { a: 1, b: 2, op: '<=', c: 6 },
                { a: -1, b: 1, op: '<=', c: 1 }
            ];
            renderizarFilasRestricciones();
        }
    } else {
        customForm.style.display = 'none';
        ejecutarOptimizacion();
    }
}

function renderizarFilasRestricciones() {
    const container = document.getElementById('constraintsList');
    container.innerHTML = '';

    restriccionesPersonalizadas.forEach((r, index) => {
        const row = document.createElement('div');
        row.className = 'constraint-row';
        row.innerHTML = `
            <input type="number" value="${r.a}" step="any" onchange="actualizarRestriccion(${index}, 'a', this.value)"> X<sub>1</sub> +
            <input type="number" value="${r.b}" step="any" onchange="actualizarRestriccion(${index}, 'b', this.value)"> X<sub>2</sub>
            <select onchange="actualizarRestriccion(${index}, 'op', this.value)">
                <option value="<=" ${r.op === '<=' ? 'selected' : ''}>&le;</option>
                <option value=">=" ${r.op === '>=' ? 'selected' : ''}>&ge;</option>
                <option value="=" ${r.op === '=' ? 'selected' : ''}>=</option>
            </select>
            <input type="number" value="${r.c}" step="any" onchange="actualizarRestriccion(${index}, 'c', this.value)">
            <button type="button" class="btn-remove" onclick="eliminarRestriccion(${index})">X</button>
        `;
        container.appendChild(row);
    });
}

function agregarFilaRestriccion() {
    restriccionesPersonalizadas.push({ a: 1, b: 1, op: '<=', c: 10 });
    renderizarFilasRestricciones();
}

function eliminarRestriccion(index) {
    restriccionesPersonalizadas.splice(index, 1);
    renderizarFilasRestricciones();
}

function actualizarRestriccion(index, campo, valor) {
    if (campo === 'a' || campo === 'b' || campo === 'c') {
        restriccionesPersonalizadas[index][campo] = parseFloat(valor) || 0;
    } else {
        restriccionesPersonalizadas[index][campo] = valor;
    }
}

function obtenerDatosProblema() {
    const modo = document.getElementById('problemSelect').value;

    if (modo === '1') {
        // Problema 1: Pinturas (Maximización)
        return {
            tipo: 'MAX',
            varX: 'Pintura Ext. (x1)',
            varY: 'Pintura Int. (x2)',
            c1: 5,
            c2: 4,
            restricciones: [
                { a: 6, b: 4, op: '<=', c: 24, label: 'Materia M1 (6x1 + 4x2 <= 24)' },
                { a: 1, b: 2, op: '<=', c: 6, label: 'Materia M2 (x1 + 2x2 <= 6)' },
                { a: -1, b: 1, op: '<=', c: 1, label: 'Demanda relativa (x2 - x1 <= 1)' },
                { a: 0, b: 1, op: '<=', c: 2, label: 'Demanda máx interior (x2 <= 2)' }
            ]
        };
    } else if (modo === '2') {
        // Problema 2: Granja y Alimentos (Minimización)
        return {
            tipo: 'MIN',
            varX: 'Maíz en Lbs (x1)',
            varY: 'Soya en Lbs (x2)',
            c1: 0.30,
            c2: 0.90,
            restricciones: [
                { a: 1, b: 1, op: '>=', c: 800, label: 'Mezcla total (x1 + x2 >= 800)' },
                { a: -0.21, b: 0.30, op: '>=', c: 0, label: 'Mínimo Proteínas (-0.21x1 + 0.30x2 >= 0)' },
                { a: -0.03, b: 0.01, op: '<=', c: 0, label: 'Máximo Fibra (-0.03x1 + 0.01x2 <= 0)' }
            ]
        };
    } else {
        // Modo Libre
        return {
            tipo: document.getElementById('customType').value,
            varX: document.getElementById('customVarX').value || 'X1',
            varY: document.getElementById('customVarY').value || 'X2',
            c1: parseFloat(document.getElementById('customC1').value) || 0,
            c2: parseFloat(document.getElementById('customC2').value) || 0,
            restricciones: restriccionesPersonalizadas.map((r, i) => ({
                a: r.a,
                b: r.b,
                op: r.op,
                c: r.c,
                label: `R${i + 1}: ${r.a}X1 + ${r.b}X2 ${r.op} ${r.c}`
            }))
        };
    }
}

function ejecutarOptimizacion() {
    const prob = obtenerDatosProblema();

    // 1. Mostrar Variables
    document.getElementById('outVariables').innerHTML = `
        <strong>X<sub>1</sub>:</strong> ${prob.varX}<br>
        <strong>X<sub>2</sub>:</strong> ${prob.varY}
    `;

    // 2. Mostrar Función Objetivo
    document.getElementById('outObjetivo').innerHTML = `
        <strong>${prob.tipo === 'MAX' ? 'Maximizar' : 'Minimizar'} Z =</strong> ${prob.c1} X<sub>1</sub> + ${prob.c2} X<sub>2</sub>
    `;

    // 3. Mostrar Restricciones + No Negatividad
    let htmlRest = prob.restricciones.map(r => `• ${r.label}`).join('<br>');
    htmlRest += '<br>• No negatividad: X<sub>1</sub> &ge; 0, X<sub>2</sub> &ge; 0';
    document.getElementById('outRestricciones').innerHTML = htmlRest;

    // Agregar bordes de no negatividad para el cálculo geométrico
    const todasLasRestricciones = [
        ...prob.restricciones,
        { a: 1, b: 0, op: '>=', c: 0, label: 'x1 >= 0' },
        { a: 0, b: 1, op: '>=', c: 0, label: 'x2 >= 0' }
    ];

    // Obtener intersecciones (vértices candidatos)
    let puntos = calcularIntersecciones(todasLasRestricciones);

    // Filtrar puntos factibles (cumplen todas las restricciones)
    let verticesFactibles = puntos.filter(p => esPuntoFactible(p.x, p.y, todasLasRestricciones));

    // Eliminar duplicados
    verticesFactibles = eliminarPuntosDuplicados(verticesFactibles);

    if (verticesFactibles.length === 0) {
        document.getElementById('outVertices').innerHTML = 'No existe región factible (Solución no factible).';
        document.getElementById('outResultado').innerHTML = 'El problema no tiene solución factible con estas restricciones.';
        dibujarGrafico(todasLasRestricciones, [], null, prob);
        return;
    }

    // Ordenar los vértices alrededor de su centroide para formar el polígono de la Región Factible
    let centroide = calcularCentroide(verticesFactibles);
    verticesFactibles.sort((p1, p2) => Math.atan2(p1.y - centroide.y, p1.x - centroide.x) - Math.atan2(p2.y - centroide.y, p2.x - centroide.x));

    // 6. Evaluar la Función Objetivo en los Vértices
    let mejorValor = prob.tipo === 'MAX' ? -Infinity : Infinity;
    let mejorPunto = null;
    let htmlVertices = '<ul>';

    verticesFactibles.forEach(p => {
        let z = prob.c1 * p.x + prob.c2 * p.y;
        p.z = z;
        htmlVertices += `<li>Vértice (${p.x.toFixed(2)}, ${p.y.toFixed(2)}) &rarr; Z = ${z.toFixed(2)}</li>`;

        if (prob.tipo === 'MAX') {
            if (z > mejorValor) {
                mejorValor = z;
                mejorPunto = p;
            }
        } else {
            if (z < mejorValor) {
                mejorValor = z;
                mejorPunto = p;
            }
        }
    });

    htmlVertices += '</ul>';
    document.getElementById('outVertices').innerHTML = htmlVertices;

    // Mostrar el Resultado Final
    document.getElementById('outResultado').innerHTML = `
        Solución Óptima (${prob.tipo}):<br>
        X<sub>1</sub> = ${mejorPunto.x.toFixed(2)}, X<sub>2</sub> = ${mejorPunto.y.toFixed(2)}<br>
        Valor Óptimo Z = ${mejorValor.toFixed(2)}
    `;

    // 4 y 5. Dibujar la Gráfica y el Área Factible
    dibujarGrafico(todasLasRestricciones, verticesFactibles, mejorPunto, prob);
}

// --- FUNCIONES ÁLGEBRAICAS AUXILIARES ---

function calcularIntersecciones(restricciones) {
    let puntos = [];
    for (let i = 0; i < restricciones.length; i++) {
        for (let j = i + 1; j < restricciones.length; j++) {
            let r1 = restricciones[i];
            let r2 = restricciones[j];
            let det = r1.a * r2.b - r2.a * r1.b;

            if (Math.abs(det) > 1e-7) { // Si no son paralelas
                let x = (r1.c * r2.b - r2.c * r1.b) / det;
                let y = (r1.a * r2.c - r2.a * r1.c) / det;
                puntos.push({ x: x, y: y });
            }
        }
    }
    return puntos;
}

function esPuntoFactible(x, y, restricciones) {
    const tol = 1e-5;
    if (x < -tol || y < -tol) return false;

    for (let r of restricciones) {
        let val = r.a * x + r.b * y;
        if (r.op === '<=' && val > r.c + tol) return false;
        if (r.op === '>=' && val < r.c - tol) return false;
        if (r.op === '=' && Math.abs(val - r.c) > tol) return false;
    }
    return true;
}

function eliminarPuntosDuplicados(puntos) {
    let unicos = [];
    puntos.forEach(p => {
        if (!unicos.some(u => Math.abs(u.x - p.x) < 1e-4 && Math.abs(u.y - p.y) < 1e-4)) {
            unicos.push(p);
        }
    });
    return unicos;
}

function calcularCentroide(puntos) {
    let sumX = 0, sumY = 0;
    puntos.forEach(p => { sumX += p.x; sumY += p.y; });
    return { x: sumX / puntos.length, y: sumY / puntos.length };
}

// --- DIBUJO EN CANVAS ---

function dibujarGrafico(restricciones, verticesFactibles, mejorPunto, prob) {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calcular escala dinámica para la gráfica
    let maxValX = 10, maxValY = 10;
    verticesFactibles.forEach(p => {
        if (p.x > maxValX) maxValX = p.x;
        if (p.y > maxValY) maxValY = p.y;
    });

    restricciones.forEach(r => {
        if (r.a > 0) maxValX = Math.max(maxValX, r.c / r.a);
        if (r.b > 0) maxValY = Math.max(maxValY, r.c / r.b);
    });

    maxValX *= 1.25;
    maxValY *= 1.25;

    const margin = 45;
    const graphW = canvas.width - margin * 2;
    const graphH = canvas.height - margin * 2;

    function toCanvasX(x) { return margin + (x / maxValX) * graphW; }
    function toCanvasY(y) { return canvas.height - margin - (y / maxValY) * graphH; }

    // Dibujar Ejes Cartesianos
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin, margin / 2);
    ctx.lineTo(margin, canvas.height - margin);
    ctx.lineTo(canvas.width - margin / 2, canvas.height - margin);
    ctx.stroke();

    // Sombreado del Área Factible
    if (verticesFactibles.length > 0) {
        ctx.fillStyle = 'rgba(76, 175, 80, 0.35)'; // Verde claro traslúcido
        ctx.beginPath();
        ctx.moveTo(toCanvasX(verticesFactibles[0].x), toCanvasY(verticesFactibles[0].y));
        for (let i = 1; i < verticesFactibles.length; i++) {
            ctx.lineTo(toCanvasX(verticesFactibles[i].x), toCanvasY(verticesFactibles[i].y));
        }
        ctx.closePath();
        ctx.fill();
    }

    // Dibujar Líneas de Restricción
    const colores = ['#1e88e5', '#d81b60', '#8e24aa', '#fb8c00', '#00acc1'];
    restricciones.forEach((r, idx) => {
        if (r.a === 0 && r.b === 0) return;
        ctx.strokeStyle = colores[idx % colores.length];
        ctx.lineWidth = 2;

        let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
        if (r.b !== 0) {
            x1 = 0; y1 = r.c / r.b;
            x2 = maxValX; y2 = (r.c - r.a * maxValX) / r.b;
        } else {
            x1 = r.c / r.a; y1 = 0;
            x2 = r.c / r.a; y2 = maxValY;
        }

        ctx.beginPath();
        ctx.moveTo(toCanvasX(x1), toCanvasY(y1));
        ctx.lineTo(toCanvasX(x2), toCanvasY(y2));
        ctx.stroke();
    });

    // Dibujar Vértices y Solución Óptima
    verticesFactibles.forEach(p => {
        ctx.fillStyle = '#1b5e20';
        ctx.beginPath();
        ctx.arc(toCanvasX(p.x), toCanvasY(p.y), 5, 0, 2 * Math.PI);
        ctx.fill();
    });

    if (mejorPunto) {
        ctx.fillStyle = '#d32f2f'; // Punto rojo destacado para la solución
        ctx.beginPath();
        ctx.arc(toCanvasX(mejorPunto.x), toCanvasY(mejorPunto.y), 8, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`Óptimo (${mejorPunto.x.toFixed(2)}, ${mejorPunto.y.toFixed(2)})`, 
                    toCanvasX(mejorPunto.x) + 10, toCanvasY(mejorPunto.y) - 10);
    }

    // Etiquetas de los Ejes
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText('X1', canvas.width - margin + 5, canvas.height - margin + 15);
    ctx.fillText('X2', margin - 20, margin - 10);
}