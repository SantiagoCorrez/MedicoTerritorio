import '/style.css';
import { Feature, Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { bbox as bboxStrategy } from 'https://cdn.jsdelivr.net/npm/ol@latest/loadingstrategy.js';
import GeoJSON from 'https://cdn.jsdelivr.net/npm/ol@latest/format/GeoJSON.js';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Overlay from 'https://cdn.jsdelivr.net/npm/ol@latest/Overlay.js';
import Draw from 'ol/interaction/Draw'
import { Circle } from 'ol/geom';
import Icon from 'ol/style/Icon';
const API_URL = 'http://localhost:3001/api/doctores';
const GEOJSON_MUNICIPIOS = 'capas/Municipios_DANE.geojson';

const layerDepartamento = new VectorLayer({
  source: new VectorSource({
    url: 'capas/Municipios_DANE.geojson',
    format: new GeoJSON()
  }),
  visible: true, // inicialmente oculta
});
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }), layerDepartamento
  ],
  // Capa vectorial que solo aparecerá con zoom >= 10

  view: new View({
    center: fromLonLat([-74, 5]),
    zoom: 9,
    minZoom: 8,
    maxZoom: 18
  })
});


document.getElementById('municipios_cundinamarca').addEventListener('change', function () {
  const valor = this.value;
  if (!valor) return;

  const nombre = valor.replace(/_/g, ' '); // convertir Bogotá_D.C. → Bogotá D.C.

  // Buscar el feature del municipio en la capa
  const feature = layerDepartamento.getSource().getFeatures().find(f => f.get('munnombre').toUpperCase() === nombre);
  if (feature) {
    const geometry = feature.getGeometry();
    const extent = geometry.getExtent();

    map.getView().fit(extent, {
      duration: 1000,
      padding: [50, 50, 50, 50],
      maxZoom: 12 // puedes ajustar esto
    });
  }
});



// 1. Agrupar médicos por código de municipio
function agruparMedicosPorMunicipio(data) {
  const agrupado = {};
  data.forEach(medico => {
    const codigo = medico.codigo_municipio;
    if (!agrupado[codigo]) agrupado[codigo] = [];
    agrupado[codigo].push(medico);
  });
  return agrupado;
}

// 2. Cargar ambos recursos (API y GeoJSON)
Promise.all([
  fetch(API_URL).then(res => res.json()),
  fetch(GEOJSON_MUNICIPIOS).then(res => res.json())
]).then(([medicos, geojson]) => {
  const medicosPorMunicipio = agruparMedicosPorMunicipio(medicos);
  const features = [];

  geojson.features.forEach(f => {
    const codigo = f.properties.CODIGO || f.properties.codigo || f.properties.muncodigo;

    if (medicosPorMunicipio[codigo]) {
      const geometry = new GeoJSON().readGeometry(f.geometry, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });

      // 3. Calcular centroide del municipio

      const centroide = f.geometry.type == "Polygon" ? geometry.getInteriorPoint() : geometry.getInteriorPoints();

      // 4. Crear punto
      const punto = new Feature({
        geometry: centroide,
        municipio: f.properties.NOMBRE || f.properties.nombre,
        medicos: medicosPorMunicipio[codigo]
      });

      features.push(punto);
    }
  });

  // 5. Mostrar puntos en el mapa
  const vectorLayer = new VectorLayer({
    source: new VectorSource({ features }),
    style: new Style({
      image: new Icon({
        anchor: [0.5, 1], // centra la base de la imagen en el punto
        src: 'medico.png', // tu imagen personalizada
        scale: 0.1
      })
    })
  });

  map.addLayer(vectorLayer);

  // 6. Evento de clic para mostrar modal
  map.on('singleclick', function (evt) {
    map.forEachFeatureAtPixel(evt.pixel, function (feature) {
      const medicos = feature.get('medicos');
      const container = document.getElementById('modal-body');
      document.getElementById("nombreMunicipio").innerHTML=(feature.getProperties().munnombre)
      container.innerHTML = medicos.map(m => `
        <div style="display:flex; margin-bottom:10px;">
          <div>
            <strong>Medicina General 24 Horas</strong>: ${m.general_medico}<br/>
            <strong>Especialidades</strong>: ${m.especialidad_medico}<br/>
            <small>${m.puesto_atencion} - ${m.direccion}</small><br/>
            <small>Consultas: ${m.numero_consultas}</small><br/>
            <small>Consultas de especialidad: ${m.numero_consultas_especialidad}</small>
          </div>
        </div>
      `).join('');
      const myModal = new bootstrap.Modal(document.getElementById('exampleModal'))
      myModal.show()
    });
  });

}).catch(err => {
  console.error("Error cargando datos:", err);
});