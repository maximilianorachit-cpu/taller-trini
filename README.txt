
EL TALLER DE TRINI
BLOQUE 1 + BLOQUE 2

Incluye:
- Estructura base
- Layout responsive
- Tema oscuro/claro
- Bloqueo PIN
- Navegación
- Módulo clientes
- Guardado local
- Buscador clientes

PIN DEMO:
1234

Abrir:
index.html


BLOQUE 3 AGREGADO

Incluye:
- Módulo Toma de Pedidos.
- N° de pedido automático correlativo formato #0001.
- Fecha de pedido automática.
- Fecha de entrega comprometida.
- Cliente vinculado al módulo Clientes.
- Tipo de servicio.
- Descripción del servicio.
- Tipo de prenda.
- Talla referencia.
- Material cliente/comprado, detalle y costo.
- Estado del pedido.
- Urgente sí/no.
- Forma de pago.
- Abono inicial.
- Notas.
- URL foto producto terminado.
- Recordatorio de entrega registrado como dato.
- Exportación básica a PDF mediante impresión del navegador.
- Botón WhatsApp con mensaje prearmado.
- Buscador de pedidos.

No se modificó la lógica base del Bloque 1 ni Bloque 2.


BLOQUE 4 AGREGADO

Incluye:
- Módulo Stock de Materiales.
- Telas iniciales: algodón crea, micropolar, strech.
- Registro manual con foto, descripción, cantidad, unidad, precio, proveedor y contacto.
- Historial de precios al agregar material o compra.
- Alerta por bajo stock según umbral.
- Botón agregar compra para sumar stock.
- Indicador visual Comprar / Stock OK.
- Buscador de materiales.
- Filtro Comprar / Stock OK.
- Top 5 telas sugeridas según producto.
- JSON inicial en assets/data/telas_por_prenda.json.
- Función preparada para descuento automático por pedido.


BLOQUE 5 AGREGADO

Incluye:
- Módulo Maquinaria y Equipos.
- Equipos iniciales:
  * Máquina de coser
  * Sublimadora
  * Plastificadora
- Registro:
  nombre, marca, modelo, serie, fecha compra, proveedor,
  valor, foto, manual PDF, especificaciones y estado.
- Mantenciones:
  última, próxima, frecuencia automática, técnico y costo.
- Alertas:
  próxima, urgente y vencida.
- Historial mantenciones.
- Insumos asociados.
- Buscador de equipos.
- Indicadores resumen.


BLOQUE 6 AGREGADO

Incluye:
- Calculadora de costos.
- Selección materiales desde stock real.
- Cálculo materiales.
- Mano de obra.
- Costos indirectos configurables.
- Margen ganancia configurable.
- Precio venta sugerido.
- Historial comparativo últimos productos.
- Indicadores resumen.


BLOQUE 7 AGREGADO

Incluye:
- Galería productos terminados.
- Render 3D o imágenes reales.
- Filtros:
  * tipo prenda
  * cliente
  * texto
- Modelo base reutilizable.
- Vínculo cliente.
- Vínculo pedido original.
- Estadísticas rápidas.
- Diseño responsive tipo catálogo.


MÓDULO 8 AGREGADO

Incluye:
- Diseñador 3D básico con Three.js por CDN.
- Selección de tipo de producto.
- Ingreso de medidas.
- Selección de tela desde stock.
- Colores de tela.
- Agregar bolsillos, estampados y costuras visibles.
- Rotación con mouse/touch.
- Zoom con rueda del mouse.
- Guardar borrador.
- Guardar diseño final.
- Duplicar diseño.
- Validación de rangos razonables con aviso, permitiendo continuar.
- Base preparada para modo cliente visual.
- No descarga modelos externos todavía; usa figuras 3D livianas locales para mantener costo cero y compatibilidad.


MÓDULO 9 AGREGADO

Incluye:
- Generador de moldes desde diseños 3D guardados.
- Formatos A4, Carta y A3.
- Multi-talla por texto separado por coma.
- Portada con logo y datos.
- Ficha técnica con medidas.
- Plan de armado tile map 5x5.
- Cuadro de verificación 5×5 cm.
- Piezas con línea hilo, piquetes, doblez/márgenes y puntos de unión.
- Instrucciones paso a paso.
- Salida PDF mediante impresión del navegador.


MÓDULO 10 AGREGADO

Incluye:
- Panel Firebase y sincronización.
- Botón manual Guardar / Sincronizar.
- Respaldo local en JSON.
- Cola offline local.
- Detección online/offline.
- Log de acciones críticas.
- Respaldo automático programado a las 00:00 mientras app esté abierta.
- Archivo .env.example.
- Archivo .gitignore.
- Reglas Firestore solo usuarios autenticados.
- Reglas Storage solo usuarios autenticados.
- Configuración ejemplo para futura migración React/Vite.

Importante:
Esta versión sigue siendo HTML/CSS/JS local para revisión sin instalación.
Firebase real queda preparado, pero no conectado porque no se deben exponer claves ni credenciales en código fuente.


MÓDULO 11 AGREGADO

Incluye:
- Dashboard de tendencias y finanzas.
- Métricas:
  * colores más usados
  * telas más usadas
  * productos más vendidos
  * clientes más frecuentes
- Gráficos Chart.js:
  * ventas por mes
  * gastos por mes
  * balance mensual
- Filtros:
  * fecha desde
  * fecha hasta
  * tipo producto
  * cliente
- Cálculos:
  * ingresos desde pedidos pagados
  * egresos desde compras de material
  * egresos desde mantenciones
  * costos indirectos estimados
- Indicador ganancia / pérdida.
- Preparado para excluir Rincón de la Abu en el módulo 12 mediante campo origen.


MÓDULO 12 AGREGADO

Incluye:
- Tienda pública.
- Hero principal.
- Categorías de servicios/productos.
- Productos destacados.
- Catálogo con filtros por categoría, color y búsqueda.
- Ficha de producto con foto, descripción y precio.
- Carrito simple.
- Contacto por WhatsApp.
- Newsletter guardado localmente.
- Footer con enlaces legales básicos.
- Campo origen: taller / rincon_abu.
- Campo destacado.
- Rincón de la Abu visualmente separado.
- Productos exclusivos del Rincón de la Abu.
- Ventas separadas del Rincón de la Abu.
- Inventario/ventas de Abu no afectan dashboard del taller.

Proyecto completo hasta módulo 12 en versión HTML/CSS/JS local revisable sin instalación.
