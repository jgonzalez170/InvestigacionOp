let perimetroCirculo = 10.0;
let perimetroCuadrado = 0.0;

let resultados = [];
let datosGrafica = [];

while (perimetroCirculo >= 0) {
    // Redondeo de precisión flotante para evitar desfasamiento
    perimetroCirculo = Math.round(perimetroCirculo * 10000) / 10000;
    perimetroCuadrado = Math.round(perimetroCuadrado * 10000) / 10000;

    if (perimetroCirculo < 0) break;

    // Radio y lado correspondientes
    let radioCirculo = perimetroCirculo / (2 * Math.PI);
    let ladoCuadrado = perimetroCuadrado / 4;

    // Cálculo de áreas
    let areaCirculo = Math.PI * Math.pow(radioCirculo, 2);
    let areaCuadrado = Math.pow(ladoCuadrado, 2);
    let areaTotal = areaCirculo + areaCuadrado;

    // Formato de decimales según el rango
    let decimales = (perimetroCirculo <= 4.4 && perimetroCirculo >= 4.38) ? 4 : 2;

    // Objeto para la tabla
    let fila = {
        "Perímetro Círculo": perimetroCirculo.toFixed(decimales),
        "Perímetro Cuadrado": perimetroCuadrado.toFixed(decimales),
        "Área Círculo": areaCirculo.toFixed(decimales),
        "Área Cuadrado": areaCuadrado.toFixed(decimales),
        "Área Total": areaTotal.toFixed(decimales)
    };

    resultados.push(fila);

    // Punto para la gráfica
    datosGrafica.push({
        x: perimetroCirculo,
        y: areaTotal
    });

    // Ajuste dinámico del paso
    let paso;
    if (perimetroCirculo <= 4.4 && perimetroCirculo > 4.38) {
        paso = 0.0005;
    } else if (perimetroCirculo === 4.38) {
        paso = 0.03;
    } else {
        paso = 0.05;
    }

    perimetroCirculo -= paso;
    perimetroCuadrado += paso;
}

// Imprimir tabla en consola
console.table(resultados);

// Función para insertar la tabla dentro del documento HTML
function renderizarTablaHTML() {
    const cuerpoTabla = document.getElementById('cuerpoTabla');
    if (!cuerpoTabla) return;

    let contenidoHTML = '';

    resultados.forEach(row => {
        // Resaltar opcionalmente el punto mínimo exacto en 4.3990
        let esMinimo = row["Perímetro Círculo"] === "4.3990";
        let estiloFila = esMinimo ? 'style="background-color: #d4edda; font-weight: bold;"' : '';

        contenidoHTML += `
            <tr ${estiloFila}>
                <td>${row["Perímetro Círculo"]}</td>
                <td>${row["Perímetro Cuadrado"]}</td>
                <td>${row["Área Círculo"]}</td>
                <td>${row["Área Cuadrado"]}</td>
                <td>${row["Área Total"]}</td>
            </tr>
        `;
    });

    cuerpoTabla.innerHTML = contenidoHTML;
}

// Ejecutar el renderizado de la tabla cuando cargue la página
window.addEventListener('DOMContentLoaded', renderizarTablaHTML);