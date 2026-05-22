import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, Printer, FileText } from 'lucide-react'
import { useMoldesStore } from '../../store/moldesStore.js'
import { formatearFechaCorta } from '../../utils/formatters.js'
import styles from './MoldesDetalle.module.css'

const ETIQUETAS_PRENDA = {
  polera: 'Polera', jeans: 'Jeans', vestido: 'Vestido',
  cartera: 'Cartera', bolso: 'Bolso', mochila: 'Mochila',
  sabanas: 'Sábanas', cortinas: 'Cortinas',
  'traje-baile': 'Traje de baile', delantal: 'Delantal',
}

const MEDIDAS_LABELS = {
  pecho: 'Pecho', cintura: 'Cintura', cadera: 'Cadera',
  largo: 'Largo total', hombros: 'Hombros', manga: 'Manga',
}

function MoldesDetalle() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { obtenerPorId, eliminar } = useMoldesStore()
  const [confirmando, setConfirmando] = useState(false)

  const molde = obtenerPorId(id)

  if (!molde) {
    return (
      <div className={styles.noEncontrado}>
        <FileText size={40} />
        <p>Molde no encontrado.</p>
        <button className={styles.btnVolverSimple} onClick={() => navigate('/moldes')}>
          <ArrowLeft size={16} /> Volver
        </button>
      </div>
    )
  }

  const medidasPrincipales = Object.entries(MEDIDAS_LABELS)
    .filter(([campo]) => molde[campo])
    .map(([campo, label]) => ({ label, valor: molde[campo] }))

  const handleEliminar = () => { eliminar(id); navigate('/moldes') }

  // Genera el PDF en una nueva ventana usando window.open + window.print()
  const imprimirPDF = () => {
    const prenda    = ETIQUETAS_PRENDA[molde.prenda] || molde.prenda || ''
    const tallaText = molde.talla ? `Talla ${molde.talla}` : ''
    const fecha     = formatearFechaCorta(molde.fecha)

    const htmlMedidas = medidasPrincipales.length > 0
      ? `<section>
          <h2>Medidas principales</h2>
          <div class="grid">
            ${medidasPrincipales.map(m =>
              `<div class="item"><div class="etiq">${m.label}</div><div class="val">${m.valor} cm</div></div>`
            ).join('')}
          </div>
        </section>` : ''

    const htmlMedidasExtra = molde.medidasExtra?.length > 0
      ? `<section>
          <h2>Medidas adicionales</h2>
          <ul class="extra">
            ${molde.medidasExtra.map(m =>
              `<li><span>${m.clave}</span><strong>${m.valor}</strong></li>`
            ).join('')}
          </ul>
        </section>` : ''

    const bloque = (titulo, texto) =>
      texto ? `<section><h2>${titulo}</h2><div class="bloque">${texto}</div></section>` : ''

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${molde.nombre}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; line-height: 1.5; font-size: 13px; }
    header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #7c3aed; padding-bottom: 1rem; margin-bottom: 1.5rem; }
    .marca { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #7c3aed; }
    h1 { font-size: 20px; margin: 0.3rem 0 0.4rem; }
    .meta { display: flex; align-items: center; gap: 0.5rem; font-size: 11px; color: #555; }
    .badge { background: #ede9fe; color: #7c3aed; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 10px; font-weight: 700; }
    .fecha { font-size: 11px; color: #777; }
    img { max-width: 100%; max-height: 180px; object-fit: contain; border-radius: 6px; margin-bottom: 1.25rem; display: block; }
    section { margin-bottom: 1.25rem; }
    h2 { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #7c3aed; margin-bottom: 0.6rem; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }
    .item { background: #f5f3ff; border-radius: 5px; padding: 0.45rem 0.6rem; }
    .etiq { font-size: 9px; color: #666; text-transform: uppercase; }
    .val { font-size: 13px; font-weight: 700; }
    .extra { list-style: none; }
    .extra li { display: flex; justify-content: space-between; padding: 0.3rem 0; border-bottom: 1px solid #eee; }
    .bloque { background: #f9fafb; border-left: 3px solid #7c3aed; padding: 0.6rem 0.875rem; border-radius: 0 5px 5px 0; white-space: pre-wrap; }
    footer { margin-top: 1.5rem; padding-top: 0.75rem; border-top: 1px solid #ddd; font-size: 10px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <header>
    <div>
      <div class="marca">El Taller de Trini — Moldes</div>
      <h1>${molde.nombre}</h1>
      <div class="meta">
        ${prenda ? `<span class="badge">${prenda}</span>` : ''}
        ${tallaText}
      </div>
    </div>
    <div class="fecha">${fecha}</div>
  </header>
  ${molde.imagen ? `<img src="${molde.imagen}" alt="${molde.nombre}" />` : ''}
  ${htmlMedidas}
  ${htmlMedidasExtra}
  ${bloque('Materiales recomendados', molde.materiales)}
  ${bloque('Instrucciones de armado', molde.instrucciones)}
  ${bloque('Notas', molde.descripcion)}
  <footer>El Taller de Trini · Generado el ${new Date().toLocaleDateString('es-CL')}</footer>
  <script>window.onload = () => { window.print() }</script>
</body>
</html>`

    const ventana = window.open('', '_blank', 'width=820,height=680')
    ventana.document.write(html)
    ventana.document.close()
  }

  return (
    <div className={styles.pagina}>

      {/* Encabezado */}
      <div className={styles.encabezado}>
        <button className={styles.btnVolver} onClick={() => navigate('/moldes')}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.acciones}>
          <button className={styles.btnAccion} onClick={imprimirPDF}>
            <Printer size={15} /><span>Imprimir PDF</span>
          </button>
          <button className={styles.btnAccion} onClick={() => navigate(`/moldes/${id}/editar`)}>
            <Edit2 size={15} /><span>Editar</span>
          </button>
          <button className={`${styles.btnAccion} ${styles.btnEliminar}`} onClick={() => setConfirmando(true)}>
            <Trash2 size={15} /><span>Eliminar</span>
          </button>
        </div>
      </div>

      {/* Perfil */}
      <div className={styles.perfil}>
        <div className={styles.perfilFoto}>
          {molde.imagen
            ? <img src={molde.imagen} alt={molde.nombre} className={styles.fotoImg} />
            : <FileText size={32} className={styles.fotoIcono} />
          }
        </div>
        <div className={styles.perfilInfo}>
          <h1 className={styles.nombre}>{molde.nombre}</h1>
          <div className={styles.perfilMeta}>
            {molde.prenda && (
              <span className={styles.badge}>{ETIQUETAS_PRENDA[molde.prenda] || molde.prenda}</span>
            )}
            {molde.talla && <span className={styles.talla}>Talla {molde.talla}</span>}
            {molde.fecha && <span className={styles.fecha}>{formatearFechaCorta(molde.fecha)}</span>}
          </div>
          {molde.descripcion && <p className={styles.desc}>{molde.descripcion}</p>}
        </div>
      </div>

      {/* Medidas principales */}
      {medidasPrincipales.length > 0 && (
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Medidas principales (cm)</h2>
          <div className={styles.medidasGrid}>
            {medidasPrincipales.map(({ label, valor }) => (
              <div key={label} className={styles.medidaItem}>
                <span className={styles.medidaLabel}>{label}</span>
                <span className={styles.medidaValor}>{valor} <small>cm</small></span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Medidas adicionales */}
      {molde.medidasExtra?.length > 0 && (
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Medidas adicionales</h2>
          <ul className={styles.extraLista}>
            {molde.medidasExtra.map((m, i) => (
              <li key={i} className={styles.extraItem}>
                <span className={styles.extraClave}>{m.clave}</span>
                <span className={styles.extraValor}>{m.valor}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Materiales */}
      {molde.materiales && (
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Materiales recomendados</h2>
          <p className={styles.notas}>{molde.materiales}</p>
        </section>
      )}

      {/* Instrucciones */}
      {molde.instrucciones && (
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Instrucciones de armado</h2>
          <p className={styles.notas}>{molde.instrucciones}</p>
        </section>
      )}

      {/* Botón imprimir inferior */}
      <button className={styles.btnPrintBottom} onClick={imprimirPDF}>
        <Printer size={16} /> Generar PDF
      </button>

      {/* Modal confirmar eliminar */}
      {confirmando && (
        <div className={styles.overlay} onClick={() => setConfirmando(false)}>
          <div className={styles.dialogo} onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar "{molde.nombre}"?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className={styles.dialogoAcciones}>
              <button className={styles.btnCancelarDialog} onClick={() => setConfirmando(false)}>Cancelar</button>
              <button className={styles.btnConfirmarEliminar} onClick={handleEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MoldesDetalle
