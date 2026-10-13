let gastoCount = 0;
let totalReembolso = 0;

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    agregarGasto();
    cargarAprobaciones();
});

// Lógica de pestañas
function switchTab(role) {
    const tabSol = document.getElementById('tab-solicitante');
    const tabApr = document.getElementById('tab-aprobador');
    const viewSol = document.getElementById('view-solicitante');
    const viewApr = document.getElementById('view-aprobador');

    if (role === 'solicitante') {
        tabSol.className = "tab-active px-6 py-2 border border-b-0 rounded-t-lg transition-colors";
        tabApr.className = "tab-inactive px-6 py-2 border border-b-0 rounded-t-lg transition-colors";
        viewSol.style.display = 'block';
        viewApr.style.display = 'none';
    } else {
        tabApr.className = "tab-active px-6 py-2 border border-b-0 rounded-t-lg transition-colors";
        tabSol.className = "tab-inactive px-6 py-2 border border-b-0 rounded-t-lg transition-colors";
        viewSol.style.display = 'none';
        viewApr.style.display = 'block';
        cargarAprobaciones();
    }
}

// Lógica para agregar campos de gastos (Basado en el diseño del PDF)
function agregarGasto() {
    gastoCount++;
    const container = document.getElementById('gastos-container');
    const gastoHTML = `
        <div class="border border-gray-300 rounded p-4 relative" id="gasto-${gastoCount}">
            <h4 class="text-sm font-semibold text-gray-600 mb-3">Gasto ${gastoCount}[cite: 1]</h4>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Fecha del gasto[cite: 1]</label>
                    <input type="date" class="w-full border rounded p-2 text-sm" required>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Tipo de gasto[cite: 1]</label>
                    <select class="w-full border rounded p-2 text-sm">
                        <option>Viáticos[cite: 1]</option>
                        <option>Alimentos[cite: 2]</option>
                        <option>Transporte[cite: 2]</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Importe del gasto[cite: 1]</label>
                    <input type="number" step="0.01" min="0" class="importe-input w-full border rounded p-2 text-sm" onchange="calcularTotal()" required placeholder="0.00">
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Concepto[cite: 1]</label>
                    <input type="text" class="w-full border rounded p-2 text-sm" placeholder="Qué compraste y para qué[cite: 1]" required>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">¿Tiene factura?[cite: 1]</label>
                    <select class="w-full border rounded p-2 text-sm">
                        <option>Sí[cite: 1]</option>
                        <option>No</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Adjuntos[cite: 1]</label>
                    <input type="file" class="w-full border rounded p-1 text-sm bg-gray-50" multiple>
                    <p class="text-[10px] text-gray-400 mt-1">Adjunta PDF y XML de la factura.[cite: 1]</p>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', gastoHTML);
}

// Calcular el total de todos los gastos dinámicamente
function calcularTotal() {
    const importes = document.querySelectorAll('.importe-input');
    totalReembolso = 0;
    importes.forEach(input => {
        totalReembolso += parseFloat(input.value || 0);
    });
    document.getElementById('total-display').innerText = `Total: $${totalReembolso.toFixed(2)}[cite: 1]`;
}

// Manejar el envío del formulario
document.getElementById('reembolso-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const area = document.getElementById('area').value;
    const folio = `RB-000${Math.floor(Math.random() * 900) + 100}`; // Simular folio RB-000X[cite: 2]
    
    const nuevaSolicitud = {
        folio: folio,
        nombre: nombre,
        area: area,
        total: totalReembolso.toFixed(2),
        estatus: 'En aprobación[cite: 2]',
        fecha: new Date().toLocaleDateString()
    };

    // Guardar en LocalStorage para persistencia local
    let solicitudes = JSON.parse(localStorage.getItem('reembolsos')) || [];
    solicitudes.push(nuevaSolicitud);
    localStorage.setItem('reembolsos', JSON.stringify(solicitudes));

    // Generar correo al superior
    enviarCorreoSuperior(nuevaSolicitud);

    // Limpiar y cambiar de vista
    alert('Reembolso guardado y preparado para enviar. Revisa tu cliente de correo.');
    this.reset();
    document.getElementById('gastos-container').innerHTML = '';
    gastoCount = 0;
    agregarGasto();
    calcularTotal();
    switchTab('aprobador');
});

// Simulación de envío por correo vía "mailto"
function enviarCorreoSuperior(solicitud) {
    const destinatario = "superior@ferbera.com";
    const asunto = `Aprobación Requerida: Reembolso ${solicitud.folio} - ${solicitud.nombre}`;
    const cuerpo = `Hola,%0D%0A%0D%0AEl colaborador ${solicitud.nombre} (${solicitud.area}) ha solicitado un reembolso por un total de $${solicitud.total} MXN.%0D%0A%0D%0APor favor ingresa al sistema para revisar los comprobantes y aprobar el pago.%0D%0A%0D%0AFolio: ${solicitud.folio}%0D%0A%0D%0ASaludos,%0D%0ASistema de Reembolsos Ferbera`;
    
    window.location.href = `mailto:${destinatario}?subject=${asunto}&body=${cuerpo}`;
}

// Renderizar la lista para el rol de Aprobador
function cargarAprobaciones() {
    const lista = document.getElementById('lista-aprobaciones');
    const solicitudes = JSON.parse(localStorage.getItem('reembolsos')) || [];
    
    if (solicitudes.length === 0) {
        lista.innerHTML = '<p class="text-sm text-gray-500">No hay reembolsos pendientes.</p>';
        return;
    }

    lista.innerHTML = '';
    solicitudes.reverse().forEach((sol, index) => {
        lista.innerHTML += `
            <div class="border border-gray-200 rounded p-4 bg-gray-50">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-gray-800">${sol.folio} - $${sol.total} MXN[cite: 2]</h3>
                    <span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded border border-yellow-200">${sol.estatus}</span>
                </div>
                <p class="text-sm text-gray-600">${sol.nombre} · ${sol.area} · Pago: Transferencia[cite: 2]</p>
                <div class="mt-3 space-x-2">
                    <button onclick="aprobar(${index})" class="bg-emerald-600 text-white text-xs px-3 py-1 rounded hover:bg-emerald-700">Aprobar</button>
                    <button class="border border-red-500 text-red-500 text-xs px-3 py-1 rounded hover:bg-red-50">Rechazar</button>
                </div>
            </div>
        `;
    });
}

function aprobar(index) {
    let solicitudes = JSON.parse(localStorage.getItem('reembolsos'));
    // Invertimos el index porque la lista se renderiza al revés (reverse)
    const realIndex = solicitudes.length - 1 - index; 
    solicitudes[realIndex].estatus = 'Aprobada[cite: 2]';
    localStorage.setItem('reembolsos', JSON.stringify(solicitudes));
    cargarAprobaciones();
}