import { useEffect, useRef, useState } from 'react'
import { Save, RotateCcw, Camera, Trash2, ChevronDown } from 'lucide-react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useDisenoStore } from '../../store/disenoStore.js'
import { formatearFechaCorta } from '../../utils/formatters.js'
import styles from './Diseno3D.module.css'

// ──────────────────────────────────────────────────────────────────────────────
// Constantes de configuración
// ──────────────────────────────────────────────────────────────────────────────

const TIPOS_PRENDA = [
  { valor: 'vestido',     label: 'Vestido' },
  { valor: 'polera',      label: 'Polera' },
  { valor: 'jeans',       label: 'Jeans' },
  { valor: 'cartera',     label: 'Cartera' },
  { valor: 'bolso',       label: 'Bolso' },
  { valor: 'mochila',     label: 'Mochila' },
  { valor: 'traje-baile', label: 'Traje de baile' },
  { valor: 'sabanas',     label: 'Sábanas' },
  { valor: 'cortinas',    label: 'Cortinas' },
  { valor: 'delantal',    label: 'Delantal' },
]

const TEXTURAS = [
  { id: 'algodon',  label: 'Algodón',  roughness: 0.92, metalness: 0.00 },
  { id: 'lana',     label: 'Lana',     roughness: 1.00, metalness: 0.00 },
  { id: 'strech',   label: 'Strech',   roughness: 0.30, metalness: 0.05 },
  { id: 'seda',     label: 'Seda',     roughness: 0.15, metalness: 0.35 },
  { id: 'cuero',    label: 'Cuero',    roughness: 0.65, metalness: 0.10 },
]

const COLORES_RAPIDOS = [
  '#E53E3E', '#DD6B20', '#D69E2E', '#38A169',
  '#3182CE', '#805AD5', '#D53F8C', '#2D3748',
  '#718096', '#FFFFFF', '#F7FAFC', '#1A202C',
]

// ──────────────────────────────────────────────────────────────────────────────
// Creación de geometría por tipo de prenda
// ──────────────────────────────────────────────────────────────────────────────

function crearMallaPrenda(tipo, material) {
  const grupo = new THREE.Group()

  switch (tipo) {
    case 'vestido':
    case 'traje-baile': {
      // Silueta de vestido con LatheGeometry
      const puntos = [
        new THREE.Vector2(0.48, -1.50),
        new THREE.Vector2(0.52, -1.10),
        new THREE.Vector2(0.44, -0.80),
        new THREE.Vector2(0.32, -0.40),
        new THREE.Vector2(0.20, -0.05),
        new THREE.Vector2(0.28,  0.25),
        new THREE.Vector2(0.30,  0.45),
        new THREE.Vector2(0.22,  0.65),
        new THREE.Vector2(0.12,  0.80),
      ]
      const geo = new THREE.LatheGeometry(puntos, 40)
      const malla = new THREE.Mesh(geo, material.clone())
      malla.castShadow = true
      grupo.add(malla)

      // Tirantes
      if (tipo === 'traje-baile') {
        const tirGeo = new THREE.BoxGeometry(0.05, 0.4, 0.04)
        const tirI = new THREE.Mesh(tirGeo, material.clone())
        const tirD = new THREE.Mesh(tirGeo, material.clone())
        tirI.position.set(-0.14, 0.98, 0)
        tirD.position.set(0.14, 0.98, 0)
        grupo.add(tirI, tirD)
      }
      break
    }

    case 'polera':
    case 'delantal': {
      const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(0.90, 1.10, 0.28), material.clone())
      cuerpo.position.y = -0.05

      const mangaGeo = new THREE.BoxGeometry(0.44, 0.22, 0.24)
      const mangaI = new THREE.Mesh(mangaGeo, material.clone())
      const mangaD = new THREE.Mesh(mangaGeo, material.clone())
      mangaI.position.set(-0.67,  0.38, 0)
      mangaD.position.set( 0.67,  0.38, 0)

      const collarGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.08, 20)
      const collar = new THREE.Mesh(collarGeo, material.clone())
      collar.position.y = 0.59

      // Bolsillo para delantal
      if (tipo === 'delantal') {
        const bolsilloGeo = new THREE.BoxGeometry(0.22, 0.18, 0.04)
        const bolsillo = new THREE.Mesh(bolsilloGeo, material.clone())
        bolsillo.position.set(-0.18, -0.25, 0.16)
        grupo.add(bolsillo)
      }

      [cuerpo, mangaI, mangaD, collar].forEach(m => { m.castShadow = true; grupo.add(m) })
      break
    }

    case 'jeans': {
      const cintura = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.18, 0.24), material.clone())
      cintura.position.y = 0.54

      const piernaGeo = new THREE.CylinderGeometry(0.22, 0.19, 1.22, 20)
      const piernaI = new THREE.Mesh(piernaGeo, material.clone())
      const piernaD = new THREE.Mesh(piernaGeo, material.clone())
      piernaI.position.set(-0.24, -0.16, 0)
      piernaD.position.set( 0.24, -0.16, 0)

      const bodega = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.30, 0.24), material.clone())
      bodega.position.y = 0.23

      ;[cintura, bodega, piernaI, piernaD].forEach(m => { m.castShadow = true; grupo.add(m) })
      break
    }

    case 'cartera': {
      const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(1.30, 0.85, 0.22), material.clone())
      const asaGeo = new THREE.TorusGeometry(0.30, 0.04, 10, 24, Math.PI)
      const asa = new THREE.Mesh(asaGeo, material.clone())
      asa.position.y = 0.66
      asa.rotation.z = Math.PI

      const cierrGeo = new THREE.BoxGeometry(1.30, 0.04, 0.24)
      const cierre = new THREE.Mesh(cierrGeo, material.clone())
      cierre.position.y = 0.43

      ;[cuerpo, asa, cierre].forEach(m => { m.castShadow = true; grupo.add(m) })
      break
    }

    case 'bolso': {
      const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(1.00, 1.10, 0.34), material.clone())
      const asaGeo = new THREE.TorusGeometry(0.22, 0.04, 10, 24, Math.PI)
      const asa = new THREE.Mesh(asaGeo, material.clone())
      asa.position.y = 0.78
      asa.rotation.z = Math.PI

      ;[cuerpo, asa].forEach(m => { m.castShadow = true; grupo.add(m) })
      break
    }

    case 'mochila': {
      const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(0.88, 1.12, 0.42), material.clone())
      const correaGeo = new THREE.BoxGeometry(0.10, 1.0, 0.06)
      const correaI = new THREE.Mesh(correaGeo, material.clone())
      const correaD = new THREE.Mesh(correaGeo, material.clone())
      correaI.position.set(-0.26, -0.06, -0.24)
      correaD.position.set( 0.26, -0.06, -0.24)

      const bolsilloGeo = new THREE.BoxGeometry(0.68, 0.44, 0.08)
      const bolsillo = new THREE.Mesh(bolsilloGeo, material.clone())
      bolsillo.position.set(0, -0.28, 0.25)

      ;[cuerpo, correaI, correaD, bolsillo].forEach(m => { m.castShadow = true; grupo.add(m) })
      break
    }

    case 'sabanas': {
      const geo = new THREE.PlaneGeometry(2.0, 1.6, 24, 20)
      const pos = geo.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i); const y = pos.getY(i)
        pos.setZ(i, Math.sin(x * 2.5) * 0.06 + Math.sin(y * 3) * 0.04)
      }
      geo.computeVertexNormals()
      const malla = new THREE.Mesh(geo, material.clone())
      malla.rotation.x = -Math.PI / 5
      malla.castShadow = true
      grupo.add(malla)
      break
    }

    case 'cortinas': {
      const geo = new THREE.PlaneGeometry(1.4, 2.0, 12, 24)
      const pos = geo.attributes.position
      for (let i = 0; i < pos.count; i++) {
        pos.setZ(i, Math.sin(pos.getX(i) * 5) * 0.12)
      }
      geo.computeVertexNormals()
      const malla = new THREE.Mesh(geo, material.clone())
      malla.castShadow = true
      grupo.add(malla)
      break
    }

    default: {
      const malla = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), material.clone())
      malla.castShadow = true
      grupo.add(malla)
    }
  }

  return grupo
}

// ──────────────────────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────────────────────

function Diseno3D() {
  const { disenos, guardarDiseno, eliminar } = useDisenoStore()

  const [tipo,     setTipo]     = useState('vestido')
  const [color,    setColor]    = useState('#C084FC')
  const [textura,  setTextura]  = useState(TEXTURAS[0])
  const [titulo,   setTitulo]   = useState('')
  const [guardado, setGuardado] = useState(false)

  const containerRef  = useRef()
  const sceneRef      = useRef()
  const cameraRef     = useRef()
  const rendererRef   = useRef()
  const controlsRef   = useRef()
  const grupoRef      = useRef()
  const animIdRef     = useRef()

  // Inicializa la escena Three.js una sola vez
  useEffect(() => {
    const container = containerRef.current
    const w = container.clientWidth
    const h = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#1a1a2e')

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100)
    camera.position.set(0, 0.3, 4.5)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Iluminación
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dir = new THREE.DirectionalLight(0xffffff, 1.2)
    dir.position.set(4, 6, 3)
    dir.castShadow = true
    dir.shadow.mapSize.set(1024, 1024)
    scene.add(dir)
    const fill = new THREE.DirectionalLight(0x8888ff, 0.4)
    fill.position.set(-4, 2, -3)
    scene.add(fill)

    // Suelo con sombras
    const suelo = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    )
    suelo.rotation.x = -Math.PI / 2
    suelo.position.y = -1.7
    suelo.receiveShadow = true
    scene.add(suelo)

    sceneRef.current = scene

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 2
    controls.maxDistance = 9
    controls.maxPolarAngle = Math.PI / 1.7
    controlsRef.current = controls

    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const observer = new ResizeObserver(() => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (w === 0 || h === 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    observer.observe(container)

    return () => {
      cancelAnimationFrame(animIdRef.current)
      observer.disconnect()
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  // Recrea la malla cuando cambia el tipo de prenda
  useEffect(() => {
    if (!sceneRef.current) return
    if (grupoRef.current) {
      sceneRef.current.remove(grupoRef.current)
      grupoRef.current.traverse(c => { if (c.isMesh) { c.geometry.dispose(); c.material.dispose() } })
    }
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: textura.roughness,
      metalness: textura.metalness,
    })
    const grupo = crearMallaPrenda(tipo, mat)
    sceneRef.current.add(grupo)
    grupoRef.current = grupo
  }, [tipo]) // eslint-disable-line

  // Actualiza color y textura sin recrear la geometría
  useEffect(() => {
    if (!grupoRef.current) return
    grupoRef.current.traverse(child => {
      if (child.isMesh) {
        child.material.color.set(color)
        child.material.roughness = textura.roughness
        child.material.metalness = textura.metalness
        child.material.needsUpdate = true
      }
    })
  }, [color, textura])

  const resetearCamara = () => {
    if (!cameraRef.current || !controlsRef.current) return
    cameraRef.current.position.set(0, 0.3, 4.5)
    controlsRef.current.target.set(0, 0, 0)
    controlsRef.current.update()
  }

  const capturarPantalla = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return
    rendererRef.current.render(sceneRef.current, cameraRef.current)
    const url = rendererRef.current.domElement.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `diseno-${tipo}-${Date.now()}.png`
    a.click()
  }

  const handleGuardar = () => {
    const nombre = titulo.trim() || `${TIPOS_PRENDA.find(t => t.valor === tipo)?.label} — ${color}`
    guardarDiseno({ titulo: nombre, tipo, color, textura: textura.id })
    setTitulo('')
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  const cargarDiseno = (d) => {
    const tex = TEXTURAS.find(t => t.id === d.textura) || TEXTURAS[0]
    setTipo(d.tipo)
    setColor(d.color)
    setTextura(tex)
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Diseñador 3D</h1>
        <p className={styles.subtitulo}>Visualiza tus prendas antes de confeccionarlas</p>
      </div>

      <div className={styles.layout}>

        {/* ── Panel de controles ── */}
        <aside className={styles.panel}>

          <div className={styles.panelSeccion}>
            <span className={styles.panelLabel}>Prenda</span>
            <select
              className={styles.select}
              value={tipo}
              onChange={e => setTipo(e.target.value)}
            >
              {TIPOS_PRENDA.map(t => (
                <option key={t.valor} value={t.valor}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.panelSeccion}>
            <span className={styles.panelLabel}>Color</span>
            <div className={styles.colorGrid}>
              {COLORES_RAPIDOS.map(c => (
                <button
                  key={c}
                  className={`${styles.colorChip} ${color === c ? styles.colorActivo : ''}`}
                  style={{ background: c, borderColor: c === '#FFFFFF' || c === '#F7FAFC' ? '#ccc' : c }}
                  onClick={() => setColor(c)}
                  title={c}
                />
              ))}
            </div>
            <div className={styles.colorPersonalizado}>
              <label className={styles.colorLabel}>
                <span>Personalizado</span>
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className={styles.colorInput}
                />
              </label>
              <span className={styles.colorHex}>{color.toUpperCase()}</span>
            </div>
          </div>

          <div className={styles.panelSeccion}>
            <span className={styles.panelLabel}>Textura</span>
            <div className={styles.texturaList}>
              {TEXTURAS.map(t => (
                <button
                  key={t.id}
                  className={`${styles.texturaBtn} ${textura.id === t.id ? styles.texturaActiva : ''}`}
                  onClick={() => setTextura(t)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.panelSeccion}>
            <span className={styles.panelLabel}>Guardar diseño</span>
            <input
              type="text"
              className={styles.inputTitulo}
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Nombre del diseño (opcional)"
            />
            <button
              className={`${styles.btnGuardar} ${guardado ? styles.btnGuardado : ''}`}
              onClick={handleGuardar}
            >
              <Save size={15} /> {guardado ? '¡Guardado!' : 'Guardar diseño'}
            </button>
          </div>

        </aside>

        {/* ── Canvas 3D ── */}
        <div className={styles.canvasWrap}>
          <div ref={containerRef} className={styles.canvas} />
          <div className={styles.canvasAcciones}>
            <button className={styles.btnCanvas} onClick={resetearCamara} title="Resetear cámara">
              <RotateCcw size={16} />
            </button>
            <button className={styles.btnCanvas} onClick={capturarPantalla} title="Capturar imagen">
              <Camera size={16} />
            </button>
          </div>
          <p className={styles.canvasAyuda}>Arrastra para rotar · Scroll para zoom</p>
        </div>
      </div>

      {/* Historial de diseños guardados */}
      {disenos.length > 0 && (
        <div className={styles.historial}>
          <h2 className={styles.historialTitulo}>Diseños guardados</h2>
          <div className={styles.historialGrid}>
            {disenos.map(d => (
              <div key={d.id} className={styles.historialCard}>
                <div className={styles.historialMuestra} style={{ background: d.color }} />
                <div className={styles.historialInfo}>
                  <span className={styles.historialNombre}>{d.titulo}</span>
                  <span className={styles.historialMeta}>
                    {TIPOS_PRENDA.find(t => t.valor === d.tipo)?.label} · {formatearFechaCorta(d.fecha)}
                  </span>
                </div>
                <div className={styles.historialAcciones}>
                  <button className={styles.btnCargar} onClick={() => cargarDiseno(d)}>
                    <ChevronDown size={14} /> Cargar
                  </button>
                  <button className={styles.btnEliminar} onClick={() => eliminar(d.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Diseno3D
