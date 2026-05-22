
function showSection(id){
    document.querySelectorAll('.section').forEach(sec=>{
        sec.classList.remove('active')
    })
    document.getElementById(id).classList.add('active')
}

function unlock(){
    const pin = document.getElementById('pinInput').value
    if(pin === '1234'){
        document.getElementById('lockScreen').style.display='none'
    }else{
        alert('PIN incorrecto')
    }
}

document.getElementById('toggleTheme').addEventListener('click',()=>{
    document.body.classList.toggle('dark')
})

let clientes = JSON.parse(localStorage.getItem('clientes')) || []

function guardarCliente(){

    const cliente = {
        id: Date.now(),
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        referencia: document.getElementById('referencia').value,
        etiquetas: document.getElementById('etiquetas').value,
        activo: true,
        pedidos: [],
        medidas: {}
    }

    if(!cliente.nombre){
        alert('Debe ingresar nombre')
        return
    }

    clientes.push(cliente)

    localStorage.setItem('clientes', JSON.stringify(clientes))

    renderClientes()

    document.querySelectorAll('.form input').forEach(i=>i.value='')
}

function renderClientes(lista = clientes){

    const contenedor = document.getElementById('clientesLista')

    contenedor.innerHTML=''

    lista.forEach(c=>{

        contenedor.innerHTML += `
        <div class="cliente">
            <h3>${c.nombre}</h3>
            <p><b>Teléfono:</b> ${c.telefono}</p>
            <p><b>Dirección:</b> ${c.direccion}</p>
            <p><b>Referencia:</b> ${c.referencia}</p>
            <p><b>Etiquetas:</b> ${c.etiquetas}</p>
        </div>
        `
    })
}

function buscarCliente(){

    const texto = document.getElementById('buscarCliente').value.toLowerCase()

    const filtrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(texto)
    )

    renderClientes(filtrados)
}

renderClientes()


let pedidos = JSON.parse(localStorage.getItem('pedidos')) || []

function formatoCLP(valor){
    const numero = Number(valor || 0)
    return '$' + numero.toLocaleString('es-CL')
}

function obtenerNumeroPedido(){
    const ultimo = Number(localStorage.getItem('ultimoPedido') || 0) + 1
    return '#' + String(ultimo).padStart(4, '0')
}

function actualizarProximoPedido(){
    const texto = document.getElementById('proximoPedido')
    if(texto){
        texto.innerText = 'Próximo pedido: ' + obtenerNumeroPedido()
    }
}

function cargarClientesEnPedidos(){
    const select = document.getElementById('pedidoCliente')
    if(!select) return

    select.innerHTML = '<option value="">Seleccione cliente</option>'

    clientes
        .filter(c => c.activo !== false)
        .forEach(c=>{
            select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`
        })
}

function sanitizarTexto(texto){
    return String(texto || '')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
}

function guardarPedido(){

    const clienteId = document.getElementById('pedidoCliente').value
    const cliente = clientes.find(c => String(c.id) === String(clienteId))

    if(!cliente){
        alert('Debe seleccionar un cliente')
        return
    }

    const fechaEntrega = document.getElementById('fechaEntrega').value
    if(!fechaEntrega){
        alert('Debe ingresar fecha de entrega')
        return
    }

    const ultimo = Number(localStorage.getItem('ultimoPedido') || 0) + 1
    const numero = '#' + String(ultimo).padStart(4, '0')

    const abono = Number(document.getElementById('abonoMonto').value || 0)

    const pedido = {
        id: Date.now(),
        numero,
        fechaPedido: new Date().toISOString().slice(0,10),
        fechaEntrega,
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        tipoServicio: document.getElementById('tipoServicio').value,
        descripcion: sanitizarTexto(document.getElementById('descripcionServicio').value),
        tipoPrenda: document.getElementById('tipoPrenda').value,
        tallaReferencia: document.getElementById('tallaReferencia').value,
        materialOrigen: document.getElementById('materialOrigen').value,
        materialDetalle: sanitizarTexto(document.getElementById('materialDetalle').value),
        materialCosto: Number(document.getElementById('materialCosto').value || 0),
        estado: document.getElementById('estadoPedido').value,
        urgente: document.getElementById('pedidoUrgente').value === 'si',
        formaPago: sanitizarTexto(document.getElementById('formaPago').value),
        abonos: abono > 0 ? [{fecha: new Date().toISOString().slice(0,10), monto: abono}] : [],
        notas: sanitizarTexto(document.getElementById('notasPedido').value),
        fotoProducto: sanitizarTexto(document.getElementById('fotoProducto').value),
        telefonoWhatsapp: sanitizarTexto(document.getElementById('telefonoWhatsapp').value),
        diseno3D: null,
        recordatorioEntrega: true
    }

    pedidos.push(pedido)
    localStorage.setItem('pedidos', JSON.stringify(pedidos))
    localStorage.setItem('ultimoPedido', String(ultimo))

    if(!cliente.pedidos) cliente.pedidos = []
    cliente.pedidos.push(pedido.id)
    localStorage.setItem('clientes', JSON.stringify(clientes))

    renderPedidos()
    renderClientes()
    cargarClientesEnPedidos()
    actualizarProximoPedido()

    document.querySelectorAll('#pedidos .form input, #pedidos .form textarea').forEach(i=>i.value='')
}

function renderPedidos(lista = pedidos){

    const contenedor = document.getElementById('pedidosLista')
    if(!contenedor) return

    contenedor.innerHTML = ''

    lista.forEach(p=>{
        const totalAbonos = (p.abonos || []).reduce((s,a)=>s + Number(a.monto || 0),0)
        const mensaje = encodeURIComponent(`Hola, te escribo por el pedido ${p.numero} de ${p.tipoPrenda}. Fecha comprometida: ${p.fechaEntrega}. Estado: ${p.estado}.`)
        const telefono = String(p.telefonoWhatsapp || '').replace(/\D/g,'')
        const whatsapp = telefono ? `https://wa.me/${telefono}?text=${mensaje}` : '#'

        contenedor.innerHTML += `
        <div class="pedido">
            <h3>${p.numero} · ${p.clienteNombre}</h3>
            <p><span class="badge">${p.estado}</span> ${p.urgente ? '<span class="badge">Urgente</span>' : ''}</p>
            <p><b>Fecha pedido:</b> ${p.fechaPedido}</p>
            <p><b>Entrega:</b> ${p.fechaEntrega}</p>
            <p><b>Servicio:</b> ${p.tipoServicio}</p>
            <p><b>Prenda:</b> ${p.tipoPrenda} · Talla ${p.tallaReferencia}</p>
            <p><b>Material:</b> ${p.materialOrigen} · ${p.materialDetalle} · ${formatoCLP(p.materialCosto)}</p>
            <p><b>Abonos:</b> ${formatoCLP(totalAbonos)}</p>
            <p><b>Notas:</b> ${p.notas || 'Sin notas'}</p>
            <div class="pedido-actions">
                <button onclick="exportarPedidoPDF('${p.id}')">Exportar PDF</button>
                <a href="${whatsapp}" target="_blank">WhatsApp</a>
            </div>
        </div>
        `
    })
}

function buscarPedido(){
    const texto = document.getElementById('buscarPedido').value.toLowerCase()
    const filtrados = pedidos.filter(p =>
        p.numero.toLowerCase().includes(texto) ||
        p.clienteNombre.toLowerCase().includes(texto) ||
        p.tipoPrenda.toLowerCase().includes(texto)
    )
    renderPedidos(filtrados)
}

function exportarPedidoPDF(id){
    const pedido = pedidos.find(p => String(p.id) === String(id))
    if(!pedido) return

    const ventana = window.open('', '_blank')
    ventana.document.write(`
        <html>
        <head>
            <title>Pedido ${pedido.numero}</title>
            <style>
                body{font-family:Arial;padding:30px;color:#333}
                h1{color:#c95178}
                .box{border:1px solid #ddd;padding:15px;border-radius:12px;margin-bottom:12px}
            </style>
        </head>
        <body>
            <h1>El Taller de Trini</h1>
            <h2>Pedido ${pedido.numero}</h2>
            <div class="box">
                <p><b>Cliente:</b> ${pedido.clienteNombre}</p>
                <p><b>Fecha pedido:</b> ${pedido.fechaPedido}</p>
                <p><b>Fecha entrega:</b> ${pedido.fechaEntrega}</p>
                <p><b>Servicio:</b> ${pedido.tipoServicio}</p>
                <p><b>Prenda:</b> ${pedido.tipoPrenda}</p>
                <p><b>Talla:</b> ${pedido.tallaReferencia}</p>
                <p><b>Estado:</b> ${pedido.estado}</p>
                <p><b>Urgente:</b> ${pedido.urgente ? 'Sí' : 'No'}</p>
                <p><b>Material:</b> ${pedido.materialOrigen} - ${pedido.materialDetalle}</p>
                <p><b>Costo material:</b> ${formatoCLP(pedido.materialCosto)}</p>
                <p><b>Notas:</b> ${pedido.notas || 'Sin notas'}</p>
            </div>
            <script>window.print()</script>
        </body>
        </html>
    `)
    ventana.document.close()
}

const showSectionOriginal = showSection
showSection = function(id){
    showSectionOriginal(id)
    if(id === 'pedidos'){
        cargarClientesEnPedidos()
        actualizarProximoPedido()
        renderPedidos()
    }
}

cargarClientesEnPedidos()
actualizarProximoPedido()
renderPedidos()


let materiales = JSON.parse(localStorage.getItem('materiales')) || []

const telasPorPrenda = {
    "polera": {
        "verano": ["algodón pima", "popelina", "lino sintético", "viscosa", "modal"],
        "otoño": ["algodón pima", "viscosa", "modal"],
        "invierno": ["polar", "micropolar", "friza liviana"],
        "primavera": ["algodón pima", "lino sintético", "modal"]
    },
    "jeans": {
        "verano": ["mezclilla liviana", "lino", "gabardina liviana"],
        "otoño": ["mezclilla media", "gabardina", "pana liviana"],
        "invierno": ["mezclilla gruesa", "pana", "gabardina forrada"],
        "primavera": ["mezclilla liviana", "gabardina"]
    },
    "vestido": {
        "verano": ["popelina", "lino", "viscosa", "gasa", "modal"],
        "otoño": ["viscosa", "modal", "crepé", "gabardina liviana"],
        "invierno": ["polar", "friza", "paño", "terciopelo"],
        "primavera": ["popelina", "viscosa", "lino sintético", "chiffon"]
    },
    "cartera": {"todo": ["cuero sintético", "lona gruesa", "cordura", "mezclilla gruesa", "tapicería"]},
    "bolso": {"todo": ["lona", "cordura", "cuero sintético", "mezclilla gruesa", "impermeable"]},
    "mochila": {"todo": ["cordura", "lona impermeable", "polyester resistente", "nylon", "ripstop"]},
    "sábanas": {"verano": ["percal", "pima", "lino", "bambú"], "invierno": ["franela", "polar", "micropolar"], "otras": ["percal", "microfibra", "pima"]},
    "cortinas": {"verano": ["gasa", "voile", "lino sintético", "organza"], "invierno": ["terciopelo", "blackout", "paño grueso", "jacquard"], "otras": ["voile", "lino sintético"]},
    "trajes de baile": {"todo": ["lycra", "strech brillante", "malla", "raso", "tafetán", "organza", "encaje"]},
    "delantal": {"todo": ["algodón crea", "popelina", "drill", "gabardina", "lino sintético"]}
}

function cargarStockInicial(){
    if(materiales.length > 0) return

    materiales = [
        {
            id: Date.now() + 1,
            foto: '',
            nombre: 'algodón crea',
            descripcion: 'Tela inicial para delantales y trabajos generales.',
            unidad: 'metros',
            cantidad: 0,
            precioUnitario: 0,
            proveedor: '',
            contacto: '',
            umbral: 1,
            historialPrecios: []
        },
        {
            id: Date.now() + 2,
            foto: '',
            nombre: 'micropolar',
            descripcion: 'Tela inicial para invierno.',
            unidad: 'metros',
            cantidad: 0,
            precioUnitario: 0,
            proveedor: '',
            contacto: '',
            umbral: 1,
            historialPrecios: []
        },
        {
            id: Date.now() + 3,
            foto: '',
            nombre: 'strech',
            descripcion: 'Tela inicial para prendas flexibles.',
            unidad: 'metros',
            cantidad: 0,
            precioUnitario: 0,
            proveedor: '',
            contacto: '',
            umbral: 1,
            historialPrecios: []
        }
    ]

    localStorage.setItem('materiales', JSON.stringify(materiales))
}

function guardarMaterial(){
    const nombre = sanitizarTexto(document.getElementById('stockNombre').value).trim()

    if(!nombre){
        alert('Debe ingresar nombre del material')
        return
    }

    const precio = Number(document.getElementById('stockPrecio').value || 0)

    const material = {
        id: Date.now(),
        foto: sanitizarTexto(document.getElementById('stockFoto').value),
        nombre,
        descripcion: sanitizarTexto(document.getElementById('stockDescripcion').value),
        unidad: document.getElementById('stockUnidad').value,
        cantidad: Number(document.getElementById('stockCantidad').value || 0),
        precioUnitario: precio,
        proveedor: sanitizarTexto(document.getElementById('stockProveedor').value),
        contacto: sanitizarTexto(document.getElementById('stockContacto').value),
        umbral: Number(document.getElementById('stockUmbral').value || 0),
        historialPrecios: precio > 0 ? [{fecha: new Date().toISOString().slice(0,10), precio}] : []
    }

    materiales.push(material)
    localStorage.setItem('materiales', JSON.stringify(materiales))

    renderStock()
    document.querySelectorAll('#stock .form input, #stock .form textarea').forEach(i=>i.value='')
}

function agregarCompraMaterial(id){
    const material = materiales.find(m => String(m.id) === String(id))
    if(!material) return

    const cantidad = Number(prompt('Cantidad a sumar al stock:', '0') || 0)
    if(cantidad <= 0) return

    const precio = Number(prompt('Nuevo precio unitario CLP, dejar 0 para mantener:', '0') || 0)

    material.cantidad += cantidad

    if(precio > 0){
        material.precioUnitario = precio
        if(!material.historialPrecios) material.historialPrecios = []
        material.historialPrecios.push({fecha: new Date().toISOString().slice(0,10), precio})
    }

    localStorage.setItem('materiales', JSON.stringify(materiales))
    renderStock()
}

function descontarMaterialPorPedido(nombreMaterial, cantidad){
    const material = materiales.find(m => m.nombre.toLowerCase() === String(nombreMaterial).toLowerCase())
    if(!material) return false

    material.cantidad = Math.max(0, Number(material.cantidad) - Number(cantidad || 0))
    localStorage.setItem('materiales', JSON.stringify(materiales))
    renderStock()
    return true
}

function renderStock(lista = materiales){
    const contenedor = document.getElementById('stockLista')
    if(!contenedor) return

    const totalValor = materiales.reduce((s,m)=>s + (Number(m.cantidad || 0) * Number(m.precioUnitario || 0)), 0)
    const alertas = materiales.filter(m => Number(m.cantidad || 0) <= Number(m.umbral || 0)).length

    const totalItems = document.getElementById('stockTotalItems')
    const valorTotal = document.getElementById('stockValorTotal')
    const stockAlertas = document.getElementById('stockAlertas')

    if(totalItems) totalItems.innerText = materiales.length
    if(valorTotal) valorTotal.innerText = formatoCLP(totalValor)
    if(stockAlertas) stockAlertas.innerText = alertas

    contenedor.innerHTML = ''

    lista.forEach(m=>{
        const comprar = Number(m.cantidad || 0) <= Number(m.umbral || 0)
        const foto = m.foto || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="%23ffe1ea"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23c95178" font-size="22">Tela</text></svg>'

        contenedor.innerHTML += `
        <div class="material">
            <img src="${foto}" alt="${m.nombre}">
            <div class="material-info">
                <h3>${m.nombre}</h3>
                <p>${m.descripcion || 'Sin descripción'}</p>
                <p><b>Cantidad:</b> ${m.cantidad} ${m.unidad}</p>
                <p><b>Precio unitario:</b> ${formatoCLP(m.precioUnitario)}</p>
                <p><b>Proveedor:</b> ${m.proveedor || 'Sin proveedor'} · ${m.contacto || 'Sin contacto'}</p>
                <p><span class="badge ${comprar ? 'alerta-stock' : 'ok-stock'}">${comprar ? 'Comprar' : 'Stock OK'}</span></p>
                <div class="stock-actions">
                    <button onclick="agregarCompraMaterial('${m.id}')">Agregar compra</button>
                </div>
            </div>
        </div>
        `
    })
}

function buscarMaterial(){
    const texto = document.getElementById('buscarMaterial').value.toLowerCase()
    const filtro = document.getElementById('filtroComprar').value

    let lista = materiales.filter(m =>
        m.nombre.toLowerCase().includes(texto) ||
        String(m.descripcion || '').toLowerCase().includes(texto) ||
        String(m.proveedor || '').toLowerCase().includes(texto)
    )

    if(filtro === 'comprar'){
        lista = lista.filter(m => Number(m.cantidad || 0) <= Number(m.umbral || 0))
    }

    if(filtro === 'ok'){
        lista = lista.filter(m => Number(m.cantidad || 0) > Number(m.umbral || 0))
    }

    renderStock(lista)
}

function mostrarTelasSugeridas(){
    const prenda = document.getElementById('filtroPrendaSugerida').value
    const contenedor = document.getElementById('telasSugeridas')
    if(!contenedor) return

    contenedor.innerHTML = ''

    if(!prenda || !telasPorPrenda[prenda]) return

    let sugeridas = []
    Object.keys(telasPorPrenda[prenda]).forEach(estacion=>{
        telasPorPrenda[prenda][estacion].forEach(nombre=>{
            sugeridas.push({nombre, estacion})
        })
    })

    sugeridas.slice(0,5).forEach(t=>{
        contenedor.innerHTML += `
            <div class="sugerencia">
                <b>${t.nombre}</b>
                <p>Estación: ${t.estacion}</p>
            </div>
        `
    })
}

const showSectionAnteriorBloque4 = showSection
showSection = function(id){
    showSectionAnteriorBloque4(id)
    if(id === 'stock'){
        renderStock()
    }
}

cargarStockInicial()
renderStock()


let equipos = JSON.parse(localStorage.getItem('equipos')) || []

function cargarEquiposIniciales(){

    if(equipos.length > 0) return

    equipos = [
        {
            id: Date.now()+1,
            nombre:'Máquina de coser',
            marca:'Singer',
            modelo:'Classic',
            serie:'MC-001',
            fechaCompra:'',
            proveedor:'',
            valor:0,
            foto:'',
            manual:'',
            especificaciones:'Equipo inicial',
            estado:'operativa',
            ultimaMantencion:'',
            frecuencia:30,
            costoMantencion:0,
            tecnico:'',
            insumos:'agujas, hilo',
            historial:[]
        },
        {
            id: Date.now()+2,
            nombre:'Sublimadora',
            marca:'Genérica',
            modelo:'SUB-01',
            serie:'SUB-001',
            fechaCompra:'',
            proveedor:'',
            valor:0,
            foto:'',
            manual:'',
            especificaciones:'Equipo inicial',
            estado:'operativa',
            ultimaMantencion:'',
            frecuencia:60,
            costoMantencion:0,
            tecnico:'',
            insumos:'papel sublimación',
            historial:[]
        },
        {
            id: Date.now()+3,
            nombre:'Plastificadora',
            marca:'Genérica',
            modelo:'PL-01',
            serie:'PL-001',
            fechaCompra:'',
            proveedor:'',
            valor:0,
            foto:'',
            manual:'',
            especificaciones:'Equipo inicial',
            estado:'operativa',
            ultimaMantencion:'',
            frecuencia:90,
            costoMantencion:0,
            tecnico:'',
            insumos:'láminas',
            historial:[]
        }
    ]

    localStorage.setItem('equipos', JSON.stringify(equipos))
}

function calcularProximaMantencion(fecha, frecuencia){

    if(!fecha || !frecuencia) return 'Sin registro'

    const base = new Date(fecha)
    base.setDate(base.getDate() + Number(frecuencia))

    return base.toISOString().slice(0,10)
}

function diasRestantes(fecha){

    if(!fecha || fecha === 'Sin registro') return null

    const hoy = new Date()
    const futura = new Date(fecha)

    return Math.ceil((futura - hoy) / (1000*60*60*24))
}

function guardarEquipo(){

    const nombre = sanitizarTexto(document.getElementById('maqNombre').value)

    if(!nombre){
        alert('Debe ingresar nombre del equipo')
        return
    }

    const equipo = {
        id: Date.now(),
        nombre,
        marca: sanitizarTexto(document.getElementById('maqMarca').value),
        modelo: sanitizarTexto(document.getElementById('maqModelo').value),
        serie: sanitizarTexto(document.getElementById('maqSerie').value),
        fechaCompra: document.getElementById('maqFechaCompra').value,
        proveedor: sanitizarTexto(document.getElementById('maqProveedor').value),
        valor: Number(document.getElementById('maqValor').value || 0),
        foto: sanitizarTexto(document.getElementById('maqFoto').value),
        manual: sanitizarTexto(document.getElementById('maqManual').value),
        especificaciones: sanitizarTexto(document.getElementById('maqEspecificaciones').value),
        estado: document.getElementById('maqEstado').value,
        ultimaMantencion: document.getElementById('maqUltimaMantencion').value,
        frecuencia: Number(document.getElementById('maqFrecuencia').value || 0),
        costoMantencion: Number(document.getElementById('maqCostoMantencion').value || 0),
        tecnico: sanitizarTexto(document.getElementById('maqTecnico').value),
        insumos: sanitizarTexto(document.getElementById('maqInsumos').value),
        historial:[]
    }

    equipos.push(equipo)

    localStorage.setItem('equipos', JSON.stringify(equipos))

    renderEquipos()

    document.querySelectorAll('#maquinaria .form input, #maquinaria .form textarea').forEach(i=>i.value='')
}

function registrarMantencion(id){

    const equipo = equipos.find(e=>String(e.id)===String(id))

    if(!equipo) return

    const detalle = prompt('Detalle mantención:')
    if(!detalle) return

    const costo = Number(prompt('Costo mantención CLP:', '0') || 0)

    const hoy = new Date().toISOString().slice(0,10)

    equipo.ultimaMantencion = hoy

    if(!equipo.historial) equipo.historial=[]

    equipo.historial.push({
        fecha:hoy,
        detalle,
        costo
    })

    localStorage.setItem('equipos', JSON.stringify(equipos))

    renderEquipos()
}

function renderEquipos(lista = equipos){

    const contenedor = document.getElementById('maquinariaLista')

    if(!contenedor) return

    contenedor.innerHTML=''

    let alertas = 0
    let pendientes = 0

    lista.forEach(e=>{

        const proxima = calcularProximaMantencion(e.ultimaMantencion, e.frecuencia)

        const dias = diasRestantes(proxima)

        let alerta = 'Sin programación'
        let clase = 'ok-mantencion'

        if(dias !== null){

            if(dias <= 7){
                alerta = 'Mantención próxima'
                clase = 'alerta-mantencion'
                alertas++
            }

            if(dias <= 1){
                alerta = 'Mantención urgente'
                clase = 'alerta-mantencion'
                pendientes++
            }

            if(dias < 0){
                alerta = 'Mantención vencida'
                clase = 'alerta-mantencion'
                pendientes++
            }
        }

        const foto = e.foto || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="%23ffe1ea"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23c95178" font-size="18">Equipo</text></svg>'

        contenedor.innerHTML += `
        <div class="equipo">
            <img src="${foto}" alt="${e.nombre}">

            <div>
                <h3>${e.nombre}</h3>

                <p><b>Marca:</b> ${e.marca}</p>
                <p><b>Modelo:</b> ${e.modelo}</p>
                <p><b>Serie:</b> ${e.serie}</p>
                <p><b>Estado:</b> ${e.estado}</p>
                <p><b>Proveedor:</b> ${e.proveedor}</p>
                <p><b>Valor:</b> ${formatoCLP(e.valor)}</p>
                <p><b>Última mantención:</b> ${e.ultimaMantencion || 'Sin registro'}</p>
                <p><b>Próxima:</b> ${proxima}</p>

                <p>
                    <span class="badge ${clase}">
                        ${alerta}
                    </span>
                </p>

                <p><b>Insumos:</b> ${e.insumos || 'Sin insumos'}</p>

                <div class="equipo-actions">
                    <button onclick="registrarMantencion('${e.id}')">
                        Registrar mantención
                    </button>

                    ${
                        e.manual
                        ? `<a href="${e.manual}" target="_blank">Manual PDF</a>`
                        : ''
                    }
                </div>
            </div>
        </div>
        `
    })

    document.getElementById('totalEquipos').innerText = equipos.length
    document.getElementById('mantencionesPendientes').innerText = pendientes
    document.getElementById('alertasEquipos').innerText = alertas
}

function buscarEquipo(){

    const texto = document.getElementById('buscarEquipo').value.toLowerCase()

    const filtrados = equipos.filter(e=>
        e.nombre.toLowerCase().includes(texto) ||
        e.marca.toLowerCase().includes(texto) ||
        e.modelo.toLowerCase().includes(texto)
    )

    renderEquipos(filtrados)
}

const showSectionAnteriorBloque5 = showSection

showSection = function(id){

    showSectionAnteriorBloque5(id)

    if(id === 'maquinaria'){
        renderEquipos()
    }
}

cargarEquiposIniciales()
renderEquipos()


function cargarMaterialesCalculadora(){

    const select = document.getElementById('costMaterial')

    if(!select) return

    select.innerHTML = '<option value="">Seleccione material</option>'

    materiales.forEach(m=>{

        select.innerHTML += `
            <option value="${m.id}">
                ${m.nombre} · ${formatoCLP(m.precioUnitario)}
            </option>
        `
    })
}

function calcularCosto(){

    const materialId = document.getElementById('costMaterial').value

    const material = materiales.find(m=>String(m.id)===String(materialId))

    if(!material){
        alert('Debe seleccionar material')
        return
    }

    const cantidadMaterial = Number(document.getElementById('costCantidadMaterial').value || 0)

    const horas = Number(document.getElementById('costHoraTrabajo').value || 0)

    const valorHora = Number(document.getElementById('costValorHora').value || 0)

    const indirectos = Number(document.getElementById('costIndirectos').value || 0)

    const margen = Number(document.getElementById('costMargen').value || 30)

    const costoMaterial = cantidadMaterial * Number(material.precioUnitario || 0)

    const costoManoObra = horas * valorHora

    const subtotal = costoMaterial + costoManoObra

    const costoIndirecto = subtotal * (indirectos / 100)

    const costoTotal = subtotal + costoIndirecto

    const precioVenta = costoTotal + (costoTotal * (margen / 100))

    document.getElementById('precioSugerido').innerText = formatoCLP(precioVenta)

    document.getElementById('costoTotal').innerText = formatoCLP(costoTotal)

    document.getElementById('margenAplicado').innerText = margen + '%'

    document.getElementById('resultadoCostos').innerHTML = `
        <div class="resultado-costos">

            <h3>Resultado cálculo</h3>

            <p><b>Material:</b> ${material.nombre}</p>

            <p><b>Cantidad:</b> ${cantidadMaterial}</p>

            <p><b>Costo materiales:</b> ${formatoCLP(costoMaterial)}</p>

            <p><b>Mano de obra:</b> ${formatoCLP(costoManoObra)}</p>

            <p><b>Indirectos:</b> ${indirectos}% · ${formatoCLP(costoIndirecto)}</p>

            <p><b>Costo total:</b> ${formatoCLP(costoTotal)}</p>

            <p><b>Precio sugerido:</b> ${formatoCLP(precioVenta)}</p>

        </div>
    `

    guardarComparacionProducto({
        fecha:new Date().toISOString().slice(0,10),
        material:material.nombre,
        costoTotal,
        precioVenta
    })
}

let historialCostos = JSON.parse(localStorage.getItem('historialCostos')) || []

function guardarComparacionProducto(item){

    historialCostos.push(item)

    localStorage.setItem('historialCostos', JSON.stringify(historialCostos))

    renderComparaciones()
}

function renderComparaciones(){

    const contenedor = document.getElementById('comparacionProductos')

    if(!contenedor) return

    contenedor.innerHTML=''

    historialCostos.slice(-5).reverse().forEach(h=>{

        contenedor.innerHTML += `
            <div class="comparacion-item">

                <p><b>Fecha:</b> ${h.fecha}</p>

                <p><b>Material:</b> ${h.material}</p>

                <p><b>Costo total:</b> ${formatoCLP(h.costoTotal)}</p>

                <p><b>Precio venta:</b> ${formatoCLP(h.precioVenta)}</p>

            </div>
        `
    })
}

const showSectionAnteriorBloque6 = showSection

showSection = function(id){

    showSectionAnteriorBloque6(id)

    if(id === 'costos'){
        cargarMaterialesCalculadora()
        renderComparaciones()
    }
}

renderComparaciones()


let galeria = JSON.parse(localStorage.getItem('galeria')) || []

function cargarClientesGaleria(){

    const clienteSelect = document.getElementById('galeriaCliente')
    const filtroCliente = document.getElementById('filtroClienteGaleria')

    if(clienteSelect){

        clienteSelect.innerHTML = '<option value="">Seleccione cliente</option>'

        clientes.forEach(c=>{

            clienteSelect.innerHTML += `
                <option value="${c.nombre}">
                    ${c.nombre}
                </option>
            `
        })
    }

    if(filtroCliente){

        filtroCliente.innerHTML = '<option value="">Todos los clientes</option>'

        clientes.forEach(c=>{

            filtroCliente.innerHTML += `
                <option value="${c.nombre}">
                    ${c.nombre}
                </option>
            `
        })
    }
}

function cargarPedidosGaleria(){

    const pedidoSelect = document.getElementById('galeriaPedido')

    if(!pedidoSelect) return

    pedidoSelect.innerHTML = '<option value="">Sin pedido</option>'

    pedidos.forEach(p=>{

        pedidoSelect.innerHTML += `
            <option value="${p.numero}">
                ${p.numero} · ${p.clienteNombre}
            </option>
        `
    })
}

function guardarGaleria(){

    const titulo = sanitizarTexto(document.getElementById('galeriaTitulo').value)

    if(!titulo){
        alert('Debe ingresar nombre del producto')
        return
    }

    const item = {
        id: Date.now(),
        titulo,
        imagen: sanitizarTexto(document.getElementById('galeriaImagen').value),
        prenda: document.getElementById('galeriaPrenda').value,
        tela: sanitizarTexto(document.getElementById('galeriaTela').value),
        cliente: document.getElementById('galeriaCliente').value,
        pedido: document.getElementById('galeriaPedido').value,
        modeloBase: document.getElementById('galeriaModeloBase').value === 'true',
        descripcion: sanitizarTexto(document.getElementById('galeriaDescripcion').value)
    }

    galeria.push(item)

    localStorage.setItem('galeria', JSON.stringify(galeria))

    renderGaleria()

    document.querySelectorAll('#galeria .form input, #galeria .form textarea').forEach(i=>i.value='')
}

function renderGaleria(lista = galeria){

    const contenedor = document.getElementById('galeriaLista')

    if(!contenedor) return

    contenedor.innerHTML=''

    lista.forEach(g=>{

        const img = g.imagen || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="220"><rect width="100%" height="100%" fill="%23ffe1ea"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23c95178" font-size="22">Producto</text></svg>'

        contenedor.innerHTML += `
            <div class="galeria-item">

                <img src="${img}" alt="${g.titulo}">

                <div class="galeria-content">

                    <h3>${g.titulo}</h3>

                    <p>
                        ${
                            g.modeloBase
                            ? '<span class="badge modelo-base">Modelo base</span>'
                            : '<span class="badge">Producto</span>'
                        }
                    </p>

                    <p><b>Prenda:</b> ${g.prenda}</p>

                    <p><b>Tela:</b> ${g.tela || 'Sin tela'}</p>

                    <p><b>Cliente:</b> ${g.cliente || 'Sin cliente'}</p>

                    <p><b>Pedido:</b> ${g.pedido || 'Sin pedido asociado'}</p>

                    <p>${g.descripcion || 'Sin descripción'}</p>

                </div>

            </div>
        `
    })

    document.getElementById('galeriaTotal').innerText = galeria.length

    document.getElementById('galeriaModelos').innerText =
        galeria.filter(g=>g.modeloBase).length

    document.getElementById('galeriaPedidos').innerText =
        galeria.filter(g=>g.pedido).length
}

function buscarGaleria(){

    const texto = document.getElementById('buscarGaleria').value.toLowerCase()

    const prenda = document.getElementById('filtroPrendaGaleria').value

    const cliente = document.getElementById('filtroClienteGaleria').value

    let filtrados = galeria.filter(g=>

        g.titulo.toLowerCase().includes(texto) ||

        g.prenda.toLowerCase().includes(texto) ||

        g.tela.toLowerCase().includes(texto)
    )

    if(prenda){

        filtrados = filtrados.filter(g=>g.prenda === prenda)
    }

    if(cliente){

        filtrados = filtrados.filter(g=>g.cliente === cliente)
    }

    renderGaleria(filtrados)
}

const showSectionAnteriorBloque7 = showSection

showSection = function(id){

    showSectionAnteriorBloque7(id)

    if(id === 'galeria'){

        cargarClientesGaleria()

        cargarPedidosGaleria()

        renderGaleria()
    }
}

renderGaleria()


let disenos3D = JSON.parse(localStorage.getItem('disenos3D')) || []
let escena3D = null
let camara3D = null
let render3D = null
let objeto3D = null
let accesorios3D = []
let visorIniciado = false
let rotando3D = false
let mouseX3D = 0

function cargarTelasDisenador3D(){
    const select = document.getElementById('d3Tela')
    if(!select) return

    select.innerHTML = '<option value="">Seleccione tela</option>'

    materiales.forEach(m=>{
        select.innerHTML += `<option value="${m.nombre}">${m.nombre}</option>`
    })

    if(materiales.length === 0){
        select.innerHTML += '<option value="algodón crea">algodón crea</option>'
        select.innerHTML += '<option value="micropolar">micropolar</option>'
        select.innerHTML += '<option value="strech">strech</option>'
    }
}

function iniciarVisor3D(){
    const contenedor = document.getElementById('visor3D')
    if(!contenedor || visorIniciado) return

    escena3D = new THREE.Scene()
    escena3D.background = new THREE.Color(0xfff7f7)

    camara3D = new THREE.PerspectiveCamera(60, contenedor.clientWidth / contenedor.clientHeight, 0.1, 1000)
    camara3D.position.z = 5

    render3D = new THREE.WebGLRenderer({antialias:true})
    render3D.setSize(contenedor.clientWidth, contenedor.clientHeight)
    contenedor.innerHTML = ''
    contenedor.appendChild(render3D.domElement)

    const luz = new THREE.DirectionalLight(0xffffff, 1)
    luz.position.set(3,5,5)
    escena3D.add(luz)

    const ambiente = new THREE.AmbientLight(0xffffff, .7)
    escena3D.add(ambiente)

    contenedor.addEventListener('mousedown', e=>{
        rotando3D = true
        mouseX3D = e.clientX
    })

    window.addEventListener('mouseup', ()=>{
        rotando3D = false
    })

    contenedor.addEventListener('mousemove', e=>{
        if(!rotando3D || !objeto3D) return
        const delta = e.clientX - mouseX3D
        objeto3D.rotation.y += delta * 0.01
        accesorios3D.forEach(a=>a.rotation.y = objeto3D.rotation.y)
        mouseX3D = e.clientX
    })

    contenedor.addEventListener('wheel', e=>{
        e.preventDefault()
        camara3D.position.z += e.deltaY * 0.005
        camara3D.position.z = Math.max(2.5, Math.min(8, camara3D.position.z))
    })

    contenedor.addEventListener('touchmove', e=>{
        if(e.touches.length === 1 && objeto3D){
            objeto3D.rotation.y += 0.03
            accesorios3D.forEach(a=>a.rotation.y = objeto3D.rotation.y)
        }
    })

    visorIniciado = true

    actualizarDiseno3D()
    animar3D()
}

function limpiarObjeto3D(){
    if(objeto3D){
        escena3D.remove(objeto3D)
    }

    accesorios3D.forEach(a=>escena3D.remove(a))
    accesorios3D = []
}

function crearFormaProducto(tipo, color){
    let geometria

    if(tipo === 'polera'){
        geometria = new THREE.BoxGeometry(2.2, 2.7, .35)
    }else if(tipo === 'jeans'){
        geometria = new THREE.BoxGeometry(1.5, 3, .35)
    }else if(tipo === 'vestido'){
        geometria = new THREE.ConeGeometry(1.4, 3, 5)
    }else if(tipo === 'cartera' || tipo === 'bolso'){
        geometria = new THREE.BoxGeometry(2.2, 1.5, .55)
    }else if(tipo === 'mochila'){
        geometria = new THREE.BoxGeometry(1.7, 2.4, .65)
    }else if(tipo === 'sábana' || tipo === 'cortina'){
        geometria = new THREE.PlaneGeometry(3, 2.4)
    }else if(tipo === 'traje de baile'){
        geometria = new THREE.ConeGeometry(1.1, 2.7, 8)
    }else{
        geometria = new THREE.BoxGeometry(1.7, 2.5, .35)
    }

    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness:.7,
        metalness:.05
    })

    return new THREE.Mesh(geometria, material)
}

function agregarAccesorio3D(tipo){
    const materialOscuro = new THREE.MeshStandardMaterial({color:0xffffff})

    if(tipo === 'bolsillos'){
        const g = new THREE.BoxGeometry(.45,.35,.08)
        const b1 = new THREE.Mesh(g, materialOscuro)
        b1.position.set(-.45,-.25,.25)
        const b2 = new THREE.Mesh(g, materialOscuro)
        b2.position.set(.45,-.25,.25)
        escena3D.add(b1)
        escena3D.add(b2)
        accesorios3D.push(b1,b2)
    }

    if(tipo === 'estampados'){
        const g = new THREE.CircleGeometry(.38,32)
        const m = new THREE.MeshStandardMaterial({color:0xf2d7a2})
        const e = new THREE.Mesh(g,m)
        e.position.set(0,.35,.28)
        escena3D.add(e)
        accesorios3D.push(e)
    }

    if(tipo === 'costuras'){
        const g = new THREE.TorusGeometry(1.15,.015,8,80)
        const m = new THREE.MeshStandardMaterial({color:0xffffff})
        const c = new THREE.Mesh(g,m)
        c.scale.y = 1.35
        c.position.set(0,0,.3)
        escena3D.add(c)
        accesorios3D.push(c)
    }
}

function actualizarDiseno3D(){
    if(!escena3D) return

    limpiarObjeto3D()

    const tipo = document.getElementById('d3Producto')?.value || 'polera'
    const color = document.getElementById('d3Color')?.value || '#f3bfd1'

    objeto3D = crearFormaProducto(tipo, color)
    escena3D.add(objeto3D)

    if(document.getElementById('d3Bolsillos')?.checked) agregarAccesorio3D('bolsillos')
    if(document.getElementById('d3Estampados')?.checked) agregarAccesorio3D('estampados')
    if(document.getElementById('d3Costuras')?.checked) agregarAccesorio3D('costuras')
}

function animar3D(){
    requestAnimationFrame(animar3D)
    if(render3D && escena3D && camara3D){
        render3D.render(escena3D, camara3D)
    }
}

function validarMedidas3D(){
    const alto = Number(document.getElementById('d3Alto').value || 0)
    const ancho = Number(document.getElementById('d3Ancho').value || 0)
    const largo = Number(document.getElementById('d3Largo').value || 0)
    const alerta = document.getElementById('alertaMedidas3D')
    if(!alerta) return true

    let mensajes = []

    if(alto && (alto < 10 || alto > 250)) mensajes.push('Alto fuera de rango razonable.')
    if(ancho && (ancho < 5 || ancho > 200)) mensajes.push('Ancho fuera de rango razonable.')
    if(largo && (largo < 5 || largo > 300)) mensajes.push('Largo fuera de rango razonable.')

    if(mensajes.length){
        alerta.style.display = 'block'
        alerta.innerText = mensajes.join(' ') + ' Puedes continuar si es intencional.'
    }else{
        alerta.style.display = 'none'
        alerta.innerText = ''
    }

    return true
}

function guardarDiseno3D(estado){
    const titulo = sanitizarTexto(document.getElementById('d3Titulo').value)
    if(!titulo){
        alert('Debe ingresar nombre del diseño')
        return
    }

    validarMedidas3D()

    const diseno = {
        id: Date.now(),
        titulo,
        estado,
        producto: document.getElementById('d3Producto').value,
        alto: Number(document.getElementById('d3Alto').value || 0),
        ancho: Number(document.getElementById('d3Ancho').value || 0),
        largo: Number(document.getElementById('d3Largo').value || 0),
        tela: document.getElementById('d3Tela').value,
        color: document.getElementById('d3Color').value,
        bolsillos: document.getElementById('d3Bolsillos').checked,
        estampados: document.getElementById('d3Estampados').checked,
        costuras: document.getElementById('d3Costuras').checked,
        fecha: new Date().toISOString().slice(0,10),
        modoCliente: true
    }

    disenos3D.push(diseno)
    localStorage.setItem('disenos3D', JSON.stringify(disenos3D))

    renderDisenos3D()
}

function duplicarDiseno3D(id){
    const original = disenos3D.find(d=>String(d.id)===String(id))
    if(!original) return

    const copia = {
        ...original,
        id: Date.now(),
        titulo: original.titulo + ' copia',
        estado: 'borrador',
        fecha: new Date().toISOString().slice(0,10)
    }

    disenos3D.push(copia)
    localStorage.setItem('disenos3D', JSON.stringify(disenos3D))

    renderDisenos3D()
}

function cargarDiseno3D(id){
    const d = disenos3D.find(x=>String(x.id)===String(id))
    if(!d) return

    document.getElementById('d3Titulo').value = d.titulo
    document.getElementById('d3Producto').value = d.producto
    document.getElementById('d3Alto').value = d.alto
    document.getElementById('d3Ancho').value = d.ancho
    document.getElementById('d3Largo').value = d.largo
    document.getElementById('d3Tela').value = d.tela
    document.getElementById('d3Color').value = d.color
    document.getElementById('d3Bolsillos').checked = d.bolsillos
    document.getElementById('d3Estampados').checked = d.estampados
    document.getElementById('d3Costuras').checked = d.costuras

    actualizarDiseno3D()
}

function renderDisenos3D(){
    const contenedor = document.getElementById('listaDisenos3D')
    if(!contenedor) return

    contenedor.innerHTML = ''

    disenos3D.forEach(d=>{
        contenedor.innerHTML += `
            <div class="diseno-card">
                <h3>${d.titulo}</h3>
                <p><span class="badge">${d.estado}</span></p>
                <p><b>Producto:</b> ${d.producto}</p>
                <p><b>Medidas:</b> ${d.alto} x ${d.ancho} x ${d.largo} cm</p>
                <p><b>Tela:</b> ${d.tela || 'Sin tela'}</p>
                <p><b>Fecha:</b> ${d.fecha}</p>
                <button onclick="cargarDiseno3D('${d.id}')">Cargar</button>
                <button onclick="duplicarDiseno3D('${d.id}')">Duplicar</button>
            </div>
        `
    })

    document.getElementById('totalDisenos3D').innerText = disenos3D.length
    document.getElementById('totalBorradores3D').innerText = disenos3D.filter(d=>d.estado==='borrador').length
    document.getElementById('totalFinales3D').innerText = disenos3D.filter(d=>d.estado==='final').length
}

const showSectionAnteriorBloque8 = showSection

showSection = function(id){
    showSectionAnteriorBloque8(id)

    if(id === 'disenador3d'){
        cargarTelasDisenador3D()
        iniciarVisor3D()
        renderDisenos3D()

        setTimeout(()=>{
            if(render3D && camara3D){
                const contenedor = document.getElementById('visor3D')
                render3D.setSize(contenedor.clientWidth, contenedor.clientHeight)
                camara3D.aspect = contenedor.clientWidth / contenedor.clientHeight
                camara3D.updateProjectionMatrix()
            }
        },100)
    }
}

renderDisenos3D()


let moldesGenerados = JSON.parse(localStorage.getItem('moldesGenerados')) || []

function cargarDisenosParaMoldes(){
    const select = document.getElementById('moldeDiseno')
    if(!select) return

    select.innerHTML = '<option value="">Seleccione diseño 3D</option>'

    disenos3D.forEach(d=>{
        select.innerHTML += `
            <option value="${d.id}">
                ${d.titulo} · ${d.producto} · ${d.estado}
            </option>
        `
    })

    const total = document.getElementById('totalDisenosMoldes')
    if(total) total.innerText = disenos3D.length

    const generados = document.getElementById('totalMoldesGenerados')
    if(generados) generados.innerText = moldesGenerados.length
}

function actualizarResumenMolde(){
    const formato = document.getElementById('moldePapel')?.value || 'A4'
    const activo = document.getElementById('formatoMoldeActivo')
    if(activo) activo.innerText = formato
}

function obtenerMedidasBaseMolde(diseno){
    const alto = Number(diseno.alto || 60)
    const ancho = Number(diseno.ancho || 40)
    const largo = Number(diseno.largo || 30)

    return {alto, ancho, largo}
}

function generarPiezasMolde(diseno, margen){
    const m = obtenerMedidasBaseMolde(diseno)

    const piezas = [
        {
            nombre:'Pieza 1 · Frente',
            alto:m.alto,
            ancho:m.ancho,
            notas:'Línea hilo vertical · cortar 1 vez · agregar piquetes laterales.'
        },
        {
            nombre:'Pieza 2 · Espalda',
            alto:m.alto,
            ancho:m.ancho,
            notas:'Línea hilo vertical · cortar 1 vez · doblez si aplica.'
        },
        {
            nombre:'Pieza 3 · Terminación / complemento',
            alto:Math.max(10, Math.round(m.largo / 2)),
            ancho:Math.max(10, Math.round(m.ancho / 2)),
            notas:'Unir con pieza 1 y 2 usando puntos numerados.'
        }
    ]

    return piezas.map(p=>({
        ...p,
        margen,
        altoFinal:p.alto + (margen * 2),
        anchoFinal:p.ancho + (margen * 2)
    }))
}

function generarTileMap(){
    let html = '<div class="molde-grid">'
    for(let i=1;i<=25;i++){
        html += `<div class="molde-cell">${i}</div>`
    }
    html += '</div>'
    return html
}

function generarMoldePDF(){
    const id = document.getElementById('moldeDiseno').value
    const diseno = disenos3D.find(d=>String(d.id)===String(id))

    if(!diseno){
        alert('Debe seleccionar un diseño')
        return
    }

    const papel = document.getElementById('moldePapel').value
    const tallasTexto = sanitizarTexto(document.getElementById('moldeTallas').value)
    const tallas = tallasTexto ? tallasTexto.split(',').map(t=>t.trim()).filter(Boolean) : [diseno.producto]
    const margen = Number(document.getElementById('moldeMargen').value || 1)
    const instrucciones = sanitizarTexto(document.getElementById('moldeInstrucciones').value)
    const piezas = generarPiezasMolde(diseno, margen)

    const molde = {
        id:Date.now(),
        disenoId:diseno.id,
        titulo:diseno.titulo,
        papel,
        tallas,
        fecha:new Date().toISOString().slice(0,10)
    }

    moldesGenerados.push(molde)
    localStorage.setItem('moldesGenerados', JSON.stringify(moldesGenerados))

    let piezasHtml = ''
    piezas.forEach((p, index)=>{
        piezasHtml += `
            <div class="molde-piece">
                <h4>${p.nombre}</h4>
                <p><b>Medida base:</b> ${p.alto} x ${p.ancho} cm</p>
                <p><b>Con margen:</b> ${p.altoFinal} x ${p.anchoFinal} cm</p>
                <p><b>Margen costura:</b> ${p.margen} cm</p>
                <p><b>Notación:</b> ${p.notas}</p>
                <p><b>Puntos unión:</b> ${index+1}A ↔ ${index+1}B</p>
            </div>
        `
    })

    const pasos = instrucciones
        ? instrucciones.split('\n').map((p,i)=>`<li>${p}</li>`).join('')
        : `
            <li>Imprimir el molde al 100% sin ajustar escala.</li>
            <li>Verificar cuadro de control 5×5 cm.</li>
            <li>Unir hojas según tile map.</li>
            <li>Cortar piezas respetando línea de hilo, doblez, piquetes y márgenes.</li>
            <li>Unir piezas según numeración indicada.</li>
        `

    const htmlMolde = `
        <div class="print-only-title">
            <h1>El Taller de Trini</h1>
        </div>

        <h2>Molde PDF · ${diseno.titulo}</h2>

        <div class="molde-piece">
            <h3>Portada</h3>
            <p><b>Logo:</b> ✂ El Taller de Trini</p>
            <p><b>Diseño:</b> ${diseno.titulo}</p>
            <p><b>Producto:</b> ${diseno.producto}</p>
            <p><b>Fecha:</b> ${molde.fecha}</p>
            <p><b>Papel:</b> ${papel}</p>
            <p><b>Tallas:</b> ${tallas.join(', ')}</p>
        </div>

        <div class="molde-piece">
            <h3>Ficha técnica</h3>
            <p><b>Medidas:</b> alto ${diseno.alto || 0} cm · ancho ${diseno.ancho || 0} cm · largo ${diseno.largo || 0} cm</p>
            <p><b>Tela:</b> ${diseno.tela || 'No registrada'}</p>
            <p><b>Color:</b> ${diseno.color}</p>
            <p><b>Extras:</b>
                ${diseno.bolsillos ? 'bolsillos · ' : ''}
                ${diseno.estampados ? 'estampados · ' : ''}
                ${diseno.costuras ? 'costuras visibles' : ''}
            </p>
        </div>

        <div class="molde-piece">
            <h3>Plan de armado / Tile map</h3>
            <p>Orden sugerido de hojas para unir el molde.</p>
            ${generarTileMap()}
            <div class="check-5x5">5×5 cm</div>
        </div>

        <h3>Piezas del molde</h3>
        ${piezasHtml}

        <div class="molde-piece">
            <h3>Instrucciones paso a paso</h3>
            <ol>${pasos}</ol>
        </div>
    `

    document.getElementById('vistaMolde').innerHTML = htmlMolde

    cargarDisenosParaMoldes()
    actualizarResumenMolde()

    setTimeout(()=>window.print(), 300)
}

const showSectionAnteriorBloque9 = showSection

showSection = function(id){
    showSectionAnteriorBloque9(id)

    if(id === 'moldesPdf'){
        cargarDisenosParaMoldes()
        actualizarResumenMolde()
    }
}

cargarDisenosParaMoldes()
actualizarResumenMolde()


let colaSync = JSON.parse(localStorage.getItem('colaSyncFirebase')) || []
let logCritico = JSON.parse(localStorage.getItem('logCritico')) || []

function registrarLogCritico(accion, detalle){
    const item = {
        fecha:new Date().toLocaleString('es-CL'),
        accion,
        detalle
    }

    logCritico.unshift(item)

    localStorage.setItem('logCritico', JSON.stringify(logCritico))

    renderLogCritico()
}

function agregarPendienteSync(tipo, datos){
    colaSync.push({
        id:Date.now(),
        tipo,
        datos,
        fecha:new Date().toISOString()
    })

    localStorage.setItem('colaSyncFirebase', JSON.stringify(colaSync))

    actualizarEstadoFirebase()
}

function actualizarEstadoFirebase(){
    const conexion = document.getElementById('estadoConexionFirebase')
    const pendientes = document.getElementById('datosPendientesSync')
    const respaldo = document.getElementById('ultimoRespaldoFirebase')

    if(conexion){
        conexion.innerText = navigator.onLine ? 'Online / preparado' : 'Offline'
    }

    if(pendientes){
        pendientes.innerText = colaSync.length
    }

    if(respaldo){
        respaldo.innerText = localStorage.getItem('ultimoRespaldoFirebase') || 'Sin respaldo'
    }
}

function guardarManualFirebase(){
    const paquete = obtenerPaqueteDatosApp()

    agregarPendienteSync('sync_manual', paquete)

    registrarLogCritico('Sincronización manual', 'Se agregó paquete local a cola de sincronización.')

    if(navigator.onLine){
        colaSync = []
        localStorage.setItem('colaSyncFirebase', JSON.stringify(colaSync))
        registrarLogCritico('Sincronización completada', 'Modo demo: cola local marcada como sincronizada.')
    }

    actualizarEstadoFirebase()
    alert('Guardado local realizado. Firebase real queda preparado para conectar credenciales.')
}

function obtenerPaqueteDatosApp(){
    return {
        clientes,
        pedidos,
        materiales,
        equipos,
        galeria,
        disenos3D,
        moldesGenerados,
        historialCostos,
        fecha:new Date().toISOString()
    }
}

function generarRespaldoLocal(){
    const paquete = obtenerPaqueteDatosApp()
    const respaldo = JSON.stringify(paquete, null, 2)
    const blob = new Blob([respaldo], {type:'application/json'})
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'respaldo_el_taller_de_trini.json'
    a.click()

    URL.revokeObjectURL(url)

    const fecha = new Date().toLocaleString('es-CL')
    localStorage.setItem('ultimoRespaldoFirebase', fecha)

    registrarLogCritico('Respaldo local', 'Se generó archivo JSON de respaldo.')

    actualizarEstadoFirebase()
}

function restaurarRespaldoDemo(){
    alert('Restauración real requiere seleccionar archivo JSON. Esta versión deja preparada la función para Firebase/archivo.')
    registrarLogCritico('Restauración demo', 'Se revisó módulo de restauración.')
}

function programarRespaldoMedianoche(){
    setInterval(()=>{
        const ahora = new Date()
        if(ahora.getHours() === 0 && ahora.getMinutes() === 0){
            localStorage.setItem('ultimoRespaldoFirebase', ahora.toLocaleString('es-CL'))
            registrarLogCritico('Respaldo automático', 'Respaldo programado 00:00 ejecutado en modo local.')
            actualizarEstadoFirebase()
        }
    },60000)
}

function renderLogCritico(){
    const contenedor = document.getElementById('logAuditoria')
    if(!contenedor) return

    contenedor.innerHTML = ''

    logCritico.slice(0,20).forEach(l=>{
        contenedor.innerHTML += `
            <div class="log-item">
                <p><b>${l.accion}</b></p>
                <p>${l.detalle}</p>
                <p><small>${l.fecha}</small></p>
            </div>
        `
    })
}

window.addEventListener('online', ()=>{
    registrarLogCritico('Conexión recuperada', 'La app volvió a estar online.')
    actualizarEstadoFirebase()
})

window.addEventListener('offline', ()=>{
    registrarLogCritico('Modo offline', 'La app quedó trabajando sin conexión.')
    actualizarEstadoFirebase()
})

const showSectionAnteriorBloque10 = showSection

showSection = function(id){
    showSectionAnteriorBloque10(id)

    if(id === 'firebaseSync'){
        actualizarEstadoFirebase()
        renderLogCritico()
    }
}

programarRespaldoMedianoche()
actualizarEstadoFirebase()
renderLogCritico()


let chartVentasMes = null
let chartGastosMes = null
let chartBalanceMes = null

function cargarClientesDashboard(){
    const select = document.getElementById('dashCliente')
    if(!select) return

    const valorActual = select.value
    select.innerHTML = '<option value="">Todos los clientes</option>'

    clientes.forEach(c=>{
        select.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`
    })

    select.value = valorActual
}

function dentroRangoFecha(fecha, desde, hasta){
    if(!fecha) return true
    if(desde && fecha < desde) return false
    if(hasta && fecha > hasta) return false
    return true
}

function obtenerMesClave(fecha){
    if(!fecha) return 'Sin fecha'
    return fecha.slice(0,7)
}

function ultimos12Meses(){
    const meses = []
    const hoy = new Date()

    for(let i=11;i>=0;i--){
        const d = new Date(hoy.getFullYear(), hoy.getMonth()-i, 1)
        meses.push(d.toISOString().slice(0,7))
    }

    return meses
}

function sumarTop(lista, campo){
    const conteo = {}

    lista.forEach(item=>{
        const valor = item[campo] || 'Sin dato'
        conteo[valor] = (conteo[valor] || 0) + 1
    })

    return Object.entries(conteo)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,5)
}

function calcularDatosDashboard(){
    const desde = document.getElementById('dashFechaDesde')?.value || ''
    const hasta = document.getElementById('dashFechaHasta')?.value || ''
    const tipoProducto = document.getElementById('dashTipoProducto')?.value || ''
    const clienteFiltro = document.getElementById('dashCliente')?.value || ''

    const pedidosFiltrados = pedidos.filter(p=>{
        if(!dentroRangoFecha(p.fechaPedido, desde, hasta)) return false
        if(tipoProducto && p.tipoPrenda !== tipoProducto) return false
        if(clienteFiltro && p.clienteNombre !== clienteFiltro) return false
        return true
    })

    const pedidosPagados = pedidosFiltrados.filter(p=>p.estado === 'pagado')

    const ingresos = pedidosPagados.reduce((sum,p)=>{
        const abonos = (p.abonos || []).reduce((s,a)=>s + Number(a.monto || 0), 0)
        const material = Number(p.materialCosto || 0)
        return sum + Math.max(abonos, material)
    },0)

    const comprasMaterial = materiales.reduce((sum,m)=>{
        const historial = m.historialPrecios || []
        if(historial.length){
            return sum + historial.reduce((s,h)=>s + Number(h.precio || 0),0)
        }
        return sum + (Number(m.cantidad || 0) * Number(m.precioUnitario || 0))
    },0)

    const mantenciones = equipos.reduce((sum,e)=>{
        const historial = e.historial || []
        return sum + historial.reduce((s,h)=>s + Number(h.costo || 0),0)
    },0)

    const costosIndirectos = historialCostos.reduce((sum,h)=>{
        return sum + (Number(h.costoTotal || 0) * 0.05)
    },0)

    const egresos = comprasMaterial + mantenciones + costosIndirectos
    const balance = ingresos - egresos

    const meses = ultimos12Meses()
    const ventasMes = {}
    const gastosMes = {}

    meses.forEach(m=>{
        ventasMes[m] = 0
        gastosMes[m] = 0
    })

    pedidosPagados.forEach(p=>{
        const mes = obtenerMesClave(p.fechaPedido)
        if(ventasMes[mes] !== undefined){
            const abonos = (p.abonos || []).reduce((s,a)=>s + Number(a.monto || 0), 0)
            ventasMes[mes] += Math.max(abonos, Number(p.materialCosto || 0))
        }
    })

    materiales.forEach(m=>{
        const historial = m.historialPrecios || []
        historial.forEach(h=>{
            const mes = obtenerMesClave(h.fecha)
            if(gastosMes[mes] !== undefined){
                gastosMes[mes] += Number(h.precio || 0)
            }
        })
    })

    equipos.forEach(e=>{
        const historial = e.historial || []
        historial.forEach(h=>{
            const mes = obtenerMesClave(h.fecha)
            if(gastosMes[mes] !== undefined){
                gastosMes[mes] += Number(h.costo || 0)
            }
        })
    })

    const balanceMes = meses.map(m=>ventasMes[m] - gastosMes[m])

    const topProductos = sumarTop(pedidosFiltrados, 'tipoPrenda')
    const topClientes = sumarTop(pedidosFiltrados, 'clienteNombre')
    const topTelas = sumarTop(galeria, 'tela')
    const topColores = sumarTop(disenos3D, 'color')

    return {
        ingresos,
        egresos,
        balance,
        meses,
        ventas: meses.map(m=>ventasMes[m]),
        gastos: meses.map(m=>gastosMes[m]),
        balanceMes,
        topProductos,
        topClientes,
        topTelas,
        topColores
    }
}

function crearGraficoDashboard(canvasId, chartRef, tipo, labels, datos, label){
    const canvas = document.getElementById(canvasId)
    if(!canvas || typeof Chart === 'undefined') return null

    if(chartRef){
        chartRef.destroy()
    }

    return new Chart(canvas, {
        type: tipo,
        data: {
            labels,
            datasets: [{
                label,
                data: datos
            }]
        },
        options: {
            responsive:true,
            plugins:{
                legend:{display:true}
            },
            scales:{
                y:{beginAtZero:true}
            }
        }
    })
}

function renderTendenciasDashboard(datos){
    const contenedor = document.getElementById('dashTendencias')
    if(!contenedor) return

    function bloque(titulo, lista){
        if(!lista.length) return `<div class="tendencia-item"><b>${titulo}</b><p>Sin datos</p></div>`

        return `
            <div class="tendencia-item">
                <b>${titulo}</b>
                ${lista.map(x=>`<p>${x[0]}: ${x[1]}</p>`).join('')}
            </div>
        `
    }

    contenedor.innerHTML =
        bloque('Productos más vendidos', datos.topProductos) +
        bloque('Clientes más frecuentes', datos.topClientes) +
        bloque('Telas más usadas', datos.topTelas) +
        bloque('Colores más usados', datos.topColores)
}

function renderDashboardFinanzas(){
    cargarClientesDashboard()

    const datos = calcularDatosDashboard()

    document.getElementById('dashIngresos').innerText = formatoCLP(datos.ingresos)
    document.getElementById('dashEgresos').innerText = formatoCLP(datos.egresos)
    document.getElementById('dashBalance').innerText = formatoCLP(datos.balance)

    const resultado = document.getElementById('dashResultadoMes')
    if(resultado){
        resultado.innerHTML = datos.balance >= 0
            ? '<span class="resultado-positivo">Ganancia</span>'
            : '<span class="resultado-negativo">Pérdida</span>'
    }

    chartVentasMes = crearGraficoDashboard('chartVentasMes', chartVentasMes, 'bar', datos.meses, datos.ventas, 'Ventas CLP')
    chartGastosMes = crearGraficoDashboard('chartGastosMes', chartGastosMes, 'bar', datos.meses, datos.gastos, 'Gastos CLP')
    chartBalanceMes = crearGraficoDashboard('chartBalanceMes', chartBalanceMes, 'bar', datos.meses, datos.balanceMes, 'Balance CLP')

    renderTendenciasDashboard(datos)
}

const showSectionAnteriorBloque11 = showSection

showSection = function(id){
    showSectionAnteriorBloque11(id)

    if(id === 'dashboardFinanzas'){
        renderDashboardFinanzas()
    }
}


let productosTienda = JSON.parse(localStorage.getItem('productosTienda')) || []
let carrito = JSON.parse(localStorage.getItem('carritoTienda')) || []
let newsletter = JSON.parse(localStorage.getItem('newsletterTienda')) || []
let ventasAbu = JSON.parse(localStorage.getItem('ventasAbu')) || []

function guardarProductoTienda(){
    const nombre = sanitizarTexto(document.getElementById('tiendaNombre').value)

    if(!nombre){
        alert('Debe ingresar nombre del producto')
        return
    }

    const producto = {
        id:Date.now(),
        nombre,
        foto:sanitizarTexto(document.getElementById('tiendaFoto').value),
        descripcion:sanitizarTexto(document.getElementById('tiendaDescripcion').value),
        precio:Number(document.getElementById('tiendaPrecio').value || 0),
        color:sanitizarTexto(document.getElementById('tiendaColor').value),
        categoria:document.getElementById('tiendaCategoria').value,
        origen:document.getElementById('tiendaOrigen').value,
        destacado:document.getElementById('tiendaDestacado').value === 'true',
        fecha:new Date().toISOString().slice(0,10)
    }

    productosTienda.push(producto)
    localStorage.setItem('productosTienda', JSON.stringify(productosTienda))

    renderTiendaPublica()
    renderRinconAbu()

    document.querySelectorAll('#tiendaPublica .form input, #tiendaPublica .form textarea').forEach(i=>i.value='')
}

function productoCardHTML(p, abu=false){
    const img = p.foto || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%23ffe1ea"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23c95178" font-size="20">Producto</text></svg>'

    return `
        <div class="producto-card">
            <img src="${img}" alt="${p.nombre}">
            <div class="producto-card-content">
                <h3>${p.nombre}</h3>
                <p>${p.descripcion || 'Sin descripción'}</p>
                <p><b>Precio:</b> ${formatoCLP(p.precio)}</p>
                <p><b>Categoría:</b> ${p.categoria}</p>
                <p><b>Color:</b> ${p.color || 'Sin color'}</p>
                <p><span class="badge">${p.origen === 'rincon_abu' ? 'Rincón Abu' : 'Taller'}</span></p>
                ${
                    abu
                    ? `<button onclick="registrarVentaAbu('${p.id}')">Registrar venta Abu</button>`
                    : `<button onclick="agregarCarrito('${p.id}')">Agregar al carrito</button>`
                }
            </div>
        </div>
    `
}

function renderTiendaPublica(){
    const catalogo = document.getElementById('catalogoTienda')
    const destacados = document.getElementById('productosDestacados')
    if(!catalogo || !destacados) return

    const texto = (document.getElementById('buscarProductoTienda')?.value || '').toLowerCase()
    const categoria = document.getElementById('filtroCategoriaTienda')?.value || ''
    const color = (document.getElementById('filtroColorTienda')?.value || '').toLowerCase()

    let productos = productosTienda.filter(p=>p.origen === 'taller')

    productos = productos.filter(p=>{
        if(texto && !p.nombre.toLowerCase().includes(texto) && !p.descripcion.toLowerCase().includes(texto)) return false
        if(categoria && p.categoria !== categoria) return false
        if(color && !p.color.toLowerCase().includes(color)) return false
        return true
    })

    destacados.innerHTML = productos
        .filter(p=>p.destacado)
        .map(p=>productoCardHTML(p,false))
        .join('') || '<p>Sin productos destacados.</p>'

    catalogo.innerHTML = productos
        .map(p=>productoCardHTML(p,false))
        .join('') || '<p>Sin productos cargados.</p>'

    renderCarrito()
}

function agregarCarrito(id){
    const producto = productosTienda.find(p=>String(p.id)===String(id))
    if(!producto) return

    carrito.push(producto)
    localStorage.setItem('carritoTienda', JSON.stringify(carrito))

    renderCarrito()
}

function quitarCarrito(index){
    carrito.splice(index,1)
    localStorage.setItem('carritoTienda', JSON.stringify(carrito))
    renderCarrito()
}

function renderCarrito(){
    const contenedor = document.getElementById('carritoTienda')
    if(!contenedor) return

    const total = carrito.reduce((s,p)=>s + Number(p.precio || 0),0)

    if(carrito.length === 0){
        contenedor.innerHTML = '<p>Carrito vacío.</p>'
        return
    }

    const items = carrito.map((p,i)=>`
        <p>${p.nombre} · ${formatoCLP(p.precio)}
        <button onclick="quitarCarrito('${i}')">Quitar</button></p>
    `).join('')

    const mensaje = encodeURIComponent(
        'Hola, quiero consultar por estos productos: ' +
        carrito.map(p=>p.nombre).join(', ') +
        '. Total estimado: ' + formatoCLP(total)
    )

    contenedor.innerHTML = `
        ${items}
        <p><b>Total:</b> ${formatoCLP(total)}</p>
        <a class="pedido-actions" href="https://wa.me/56XXXXXXXXX?text=${mensaje}" target="_blank">
            Consultar por WhatsApp
        </a>
    `
}

function suscribirNewsletter(){
    const email = sanitizarTexto(document.getElementById('newsletterEmail').value)

    if(!email || !email.includes('@')){
        alert('Debe ingresar un correo válido')
        return
    }

    newsletter.push({
        email,
        fecha:new Date().toISOString().slice(0,10)
    })

    localStorage.setItem('newsletterTienda', JSON.stringify(newsletter))

    document.getElementById('newsletterEmail').value = ''
    alert('Suscripción guardada.')
}

function renderRinconAbu(){
    const contenedor = document.getElementById('catalogoAbu')
    const ventas = document.getElementById('ventasAbuLista')
    if(!contenedor || !ventas) return

    const productos = productosTienda.filter(p=>p.origen === 'rincon_abu')

    contenedor.innerHTML = productos
        .map(p=>productoCardHTML(p,true))
        .join('') || '<p>Sin productos del Rincón de la Abu.</p>'

    ventas.innerHTML = ventasAbu.map(v=>`
        <div class="venta-abu">
            <p><b>${v.producto}</b></p>
            <p>${formatoCLP(v.precio)} · ${v.fecha}</p>
        </div>
    `).join('') || '<p>Sin ventas registradas.</p>'
}

function registrarVentaAbu(id){
    const producto = productosTienda.find(p=>String(p.id)===String(id))
    if(!producto) return

    ventasAbu.unshift({
        id:Date.now(),
        producto:producto.nombre,
        precio:producto.precio,
        fecha:new Date().toLocaleString('es-CL')
    })

    localStorage.setItem('ventasAbu', JSON.stringify(ventasAbu))

    renderRinconAbu()
}

const showSectionAnteriorBloque12 = showSection

showSection = function(id){
    showSectionAnteriorBloque12(id)

    if(id === 'tiendaPublica'){
        renderTiendaPublica()
    }

    if(id === 'rinconAbu'){
        renderRinconAbu()
    }
}

renderTiendaPublica()
renderRinconAbu()
