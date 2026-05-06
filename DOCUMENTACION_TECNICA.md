# 📋 Documentación Técnica — Médico en tu Territorio

**Proyecto:** Micrositio de Salud — Gobernación de Cundinamarca  
**Nombre de la Aplicación:** Médico en tu Territorio  
**URL de Producción:** `https://medicocundinamarca.creatisoftcolombia.lat`  
**Última actualización:** 25 de febrero de 2026

---

## 📑 Tabla de Contenido

1. [Descripción General](#1-descripción-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Estructura de Carpetas](#3-estructura-de-carpetas)
4. [Backend — API REST](#4-backend--api-rest)
5. [Base de Datos — PostgreSQL](#5-base-de-datos--postgresql)
6. [Frontend — Panel de Administración (Angular)](#6-frontend--panel-de-administración-angular)
7. [AppMapas — Mapa Interactivo (Vite + OpenLayers)](#7-appmapas--mapa-interactivo-vite--openlayers)
8. [Endpoints de la API](#8-endpoints-de-la-api)
9. [Modelo de Datos](#9-modelo-de-datos)
10. [Flujo de la Aplicación](#10-flujo-de-la-aplicación)
11. [Despliegue y Configuración](#11-despliegue-y-configuración)
12. [Variables de Entorno](#12-variables-de-entorno)
13. [Dependencias del Proyecto](#13-dependencias-del-proyecto)
14. [Guía de Desarrollo Local](#14-guía-de-desarrollo-local)

---

## 1. Descripción General

**Médico en tu Territorio** es un micrositio web desarrollado para la Gobernación de Cundinamarca que permite visualizar la ubicación y disponibilidad de médicos en los 116 municipios del departamento.

El sistema consta de tres componentes principales:

| Componente | Tecnología | Descripción |
|---|---|---|
| **Backend** | Node.js + Express 5 | API REST para gestión CRUD de doctores |
| **Frontend** | Angular 19 + Angular Material | Panel de administración para gestionar doctores |
| **AppMapas** | Vite + OpenLayers + Bootstrap 5 | Mapa interactivo público para ciudadanos |

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        SERVIDOR EXPRESS                         │
│                        (Puerto 3001)                            │
│                                                                 │
│  ┌───────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   API REST    │  │  Static Files    │  │  Static Files    │  │
│  │ /api/doctores │  │ /admin (Angular) │  │ /mapa (Vite/OL)  │  │
│  └───────┬───────┘  └──────────────────┘  └──────────────────┘  │
│          │                                                      │
│          ▼                                                      │
│  ┌───────────────┐                                              │
│  │  PostgreSQL   │                                              │
│  │ micrositio_   │                                              │
│  │ salud         │                                              │
│  └───────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
```

**Flujo de datos:**

1. El servidor Express sirve los archivos estáticos del **frontend Angular** (panel admin) y del **mapa interactivo** (Vite/OpenLayers).
2. Ambas aplicaciones consumen la misma **API REST** (`/api/doctores`).
3. La API se conecta a una base de datos **PostgreSQL** llamada `micrositio_salud`.

---

## 3. Estructura de Carpetas

```
medicos/
├── .gitignore
├── Create Table.sql              # Script SQL de referencia
├── backend/                      # Servidor Node.js + Express
│   ├── .env                      # Variables de entorno (BD)
│   ├── server.js                 # Punto de entrada del servidor
│   ├── package.json
│   ├── postgresql.conf           # Configuración de PostgreSQL
│   ├── controllers/
│   │   └── doctorController.js   # Lógica CRUD de doctores
│   ├── models/
│   │   └── db.js                 # Pool de conexión a PostgreSQL
│   └── routes/
│       └── doctorRoutes.js       # Definición de rutas API
├── frontend/                     # Panel de administración Angular
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.html
│       ├── main.ts
│       ├── styles.scss
│       └── app/
│           ├── app.component.ts
│           ├── app.config.ts
│           ├── app.routes.ts
│           ├── components/
│           │   ├── admin-doctores/   # Tabla de doctores (CRUD)
│           │   ├── doctorform/       # Formulario modal crear/editar
│           │   └── login/            # Pantalla de login
│           └── services/
│               └── doctorservice.service.ts  # Servicio HTTP
└── appMapas/                     # Mapa interactivo público
    ├── index.html                # HTML con selector y modal
    ├── main.js                   # Lógica del mapa (OpenLayers)
    ├── style.css
    ├── medico.png                # Ícono de marcador en el mapa
    ├── vite.config.js
    ├── package.json
    └── capas/
        └── Municipios_DANE.geojson  # GeoJSON de municipios (5 MB)
```

---

## 4. Backend — API REST

### Tecnologías

| Dependencia | Versión | Uso |
|---|---|---|
| `express` | 5.1.0 | Framework HTTP |
| `pg` | 8.16.0 | Cliente PostgreSQL |
| `cors` | 2.8.5 | Habilitar CORS |
| `dotenv` | 16.5.0 | Carga de variables de entorno |

### Punto de Entrada — `server.js`

El servidor realiza cinco funciones:

1. **Middleware**: CORS habilitado y parsing JSON.
2. **Archivos estáticos del frontend Angular**: servidos desde `../frontend/dist/frontend/browser`.
3. **Archivos estáticos del mapa**: servidos desde `../appMapas/dist`.
4. **Rutas API**: montadas bajo `/api/doctores`.
5. **Rutas SPA**: 
   - `/admin` → `index.html` del frontend Angular.
   - `/mapa` → `index.html` del mapa interactivo.

```javascript
// Resumen de rutas en server.js
app.use('/api/doctores', doctorRoutes);    // API REST
app.get('/admin', (req, res) => { ... });  // SPA Admin
app.get('/mapa', (req, res) => { ... });   // SPA Mapa
```

### Controlador — `doctorController.js`

Contiene 5 funciones exportadas:

| Función | Método | Ruta | Descripción |
|---|---|---|---|
| `getAllDoctors` | `GET` | `/api/doctores` | Obtiene todos los doctores |
| `getDoctorsByMunicipio` | `GET` | `/api/doctores/municipio/:codigo` | Obtiene doctores por código de municipio |
| `createDoctor` | `POST` | `/api/doctores` | Crea un nuevo doctor |
| `updateDoctor` | `PUT` | `/api/doctores/:id` | Actualiza un doctor existente |
| `deleteDoctor` | `DELETE` | `/api/doctores/:id` | Elimina un doctor por ID |

### Modelo — `db.js`

Utiliza `pg.Pool` para gestionar el pool de conexiones a PostgreSQL. La configuración se toma automáticamente de las variables de entorno `PG*`.

---

## 5. Base de Datos — PostgreSQL

### Conexión

- **Host:** `localhost`
- **Puerto:** `5432`
- **Base de datos:** `micrositio_salud`
- **Usuario:** `postgres`

### Tabla: `doctores`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | Identificador único autoincremental |
| `codigo_municipio` | `VARCHAR` | Código DANE del municipio |
| `nombre_municipio` | `VARCHAR` | Nombre del municipio |
| `general_medico` | `VARCHAR` | Nombre/info del médico general 24h |
| `especialidad_medico` | `VARCHAR` | Especialidades disponibles |
| `numero_consultas` | `INTEGER` | Número de consultas generales |
| `numero_consultas_especialidad` | `INTEGER` | Número de consultas de especialidad |
| `direccion` | `VARCHAR` | Dirección del consultorio |
| `puesto_atencion` | `VARCHAR` | Nombre del puesto de atención |

> **Nota:** La estructura de la tabla se infiere del controlador y el formulario. No existe un archivo de migración formal.

---

## 6. Frontend — Panel de Administración (Angular)

### Tecnologías

| Dependencia | Versión | Uso |
|---|---|---|
| `@angular/core` | 19.2.0 | Framework frontend |
| `@angular/material` | 19.2.16 | Componentes UI (Material Design) |
| `@angular/cdk` | 19.2.16 | Component Dev Kit |
| `rxjs` | 7.8.x | Observables reactivos |
| `typescript` | 5.7.2 | Lenguaje de tipado estático |

### Estilo Precompilado

- Tema: `@angular/material/prebuilt-themes/azure-blue.css`
- Preprocesador: `SCSS`

### Rutas de la Aplicación (`app.routes.ts`)

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `LoginComponent` | Pantalla de inicio de sesión |
| `/login` | `LoginComponent` | Pantalla de inicio de sesión |
| `/adminDoctores` | `AdminDoctoresComponent` | Panel CRUD de doctores |

### Componentes

#### `LoginComponent`
- **Ubicación:** `src/app/components/login/`
- **Descripción:** Formulario de autenticación con Reactive Forms.
- **Credenciales hardcodeadas:** `admin` / `adminSalud`
- **Flujo:** Si las credenciales coinciden, redirige a `/adminDoctores`.
- **Módulos importados:** `FormsModule`, `ReactiveFormsModule`

#### `AdminDoctoresComponent`
- **Ubicación:** `src/app/components/admin-doctores/`
- **Descripción:** Tabla paginada de doctores con acciones de crear, editar y eliminar.
- **UI:** Tabla `mat-table` con paginador `mat-paginator` (5, 10 o 20 registros por página).
- **Columnas mostradas:** Nombre municipio, Médico general, Especialidad, Consultas, Consultas especialidad, Dirección, Puesto de atención, Acciones.
- **Acciones:**
  - **Crear:** Abre el modal `DoctorformComponent` vacío.
  - **Editar:** Abre el modal con los datos precargados del doctor.
  - **Eliminar:** Elimina el registro y recarga la tabla.

#### `DoctorformComponent`
- **Ubicación:** `src/app/components/doctorform/`
- **Descripción:** Formulario modal reutilizable para crear y editar doctores.
- **Implementación:** Usa `MatDialog` con inyección de datos vía `MAT_DIALOG_DATA`.
- **Campos del formulario:**
  - Código del Municipio
  - Nombre del Municipio
  - Médico General 24 Horas
  - Especialidades
  - Consultas (numérico)
  - Consultas Especialidades (numérico)
  - Dirección
  - Puesto de Atención
- **Módulos importados:** `MatDialogModule`, `MatFormFieldModule`, `MatInputModule`, `MatButtonModule`, `FormsModule`, `CommonModule`

### Servicio — `DoctorserviceService`

- **Ubicación:** `src/app/services/doctorservice.service.ts`
- **Base URL:** `https://medicocundinamarca.creatisoftcolombia.lat`

| Método | HTTP | Endpoint | Descripción |
|---|---|---|---|
| `getDoctores()` | `GET` | `/api/doctores` | Obtiene todos los doctores |
| `crearDoctor(form)` | `POST` | `/api/doctores` | Crea un nuevo doctor |
| `editarDoctor(form)` | `PUT` | `/api/doctores/:id` | Actualiza un doctor |
| `deleteDoctor(id)` | `DELETE` | `/api/doctores/:id` | Elimina un doctor |

---

## 7. AppMapas — Mapa Interactivo (Vite + OpenLayers)

### Tecnologías

| Dependencia | Versión | Uso |
|---|---|---|
| `ol` (OpenLayers) | `latest` | Renderizado de mapas interactivos |
| `vite` | 6.3.3 | Bundler y dev server |
| Bootstrap | 5.3.6 (CDN) | Estilos y modal |

### Funcionalidad

1. **Mapa base:** OpenStreetMap (OSM) como capa de tiles.
2. **Capa GeoJSON:** Carga `capas/Municipios_DANE.geojson` (polígonos de municipios DANE).
3. **Selector de municipios:** Un `<select>` con los 116 municipios. Al seleccionar uno, el mapa hace zoom animado al municipio correspondiente.
4. **Marcadores de doctores:**
   - Consume la API `GET /api/doctores` para obtener todos los doctores.
   - Agrupa los doctores por `codigo_municipio`.
   - Cruza con el GeoJSON para calcular el centroide de cada municipio con doctores.
   - Coloca un ícono (`medico.png`) en cada centroide.
5. **Modal Bootstrap:** Al hacer clic en un marcador, se abre un modal mostrando:
   - Nombre del municipio
   - Medicina General 24 Horas
   - Especialidades
   - Puesto de atención y dirección
   - Número de consultas generales y de especialidad

### Configuración del Mapa

```javascript
view: new View({
  center: fromLonLat([-74, 5]),  // Centro de Cundinamarca
  zoom: 9,
  minZoom: 8,
  maxZoom: 18
})
```

---

## 8. Endpoints de la API

### Base URL: `/api/doctores`

| Método | Endpoint | Body (JSON) | Respuesta | Código |
|---|---|---|---|---|
| `GET` | `/api/doctores` | — | `Doctor[]` | 200 |
| `GET` | `/api/doctores/municipio/:codigo` | — | `Doctor[]` | 200 |
| `POST` | `/api/doctores` | `{ codigo_municipio, nombre_municipio, general_medico, especialidad_medico, numero_consultas, numero_consultas_especialidad, direccion, puesto_atencion }` | `Doctor` | 201 |
| `PUT` | `/api/doctores/:id` | `{ general_medico, especialidad_medico, numero_consultas, numero_consultas_especialidad, direccion, puesto_atencion }` | `Doctor` | 200 |
| `DELETE` | `/api/doctores/:id` | — | `{ message: "..." }` | 200 |

### Ejemplo de respuesta — `GET /api/doctores`

```json
[
  {
    "id": 1,
    "codigo_municipio": "25269",
    "nombre_municipio": "FACATATIVÁ",
    "general_medico": "Dr. Juan Pérez",
    "especialidad_medico": "Pediatría, Cardiología",
    "numero_consultas": 150,
    "numero_consultas_especialidad": 45,
    "direccion": "Cra 5 #10-20",
    "puesto_atencion": "Hospital Municipal"
  }
]
```

---

## 9. Modelo de Datos

```
┌──────────────────────────────────────────────────────────────┐
│                         doctores                             │
├──────────────────────────────┬───────────────────────────────┤
│ id                           │ SERIAL PRIMARY KEY            │
│ codigo_municipio             │ VARCHAR                       │
│ nombre_municipio             │ VARCHAR                       │
│ general_medico               │ VARCHAR                       │
│ especialidad_medico          │ VARCHAR                       │
│ numero_consultas             │ INTEGER                       │
│ numero_consultas_especialidad│ INTEGER                       │
│ direccion                    │ VARCHAR                       │
│ puesto_atencion              │ VARCHAR                       │
└──────────────────────────────┴───────────────────────────────┘
```

---

## 10. Flujo de la Aplicación

### Flujo Público (Ciudadano)

```
1. Usuario accede a /mapa
2. Se carga el mapa de Cundinamarca (OpenLayers + OSM)
3. Se carga el GeoJSON de municipios (polígonos)
4. Se consulta GET /api/doctores
5. Se agrupan doctores por código de municipio
6. Se colocan íconos en los centroides de municipios con doctores
7. Usuario hace clic en un ícono → Modal con información médica
8. Usuario puede buscar municipio en el selector → Zoom animado
```

### Flujo Administrativo

```
1. Administrador accede a /admin
2. Se muestra formulario de login
3. Ingresa credenciales (admin / adminSalud)
4. Se redirige a /adminDoctores
5. Se carga tabla paginada con todos los doctores
6. Acciones disponibles:
   - Crear doctor → Modal con formulario vacío → POST /api/doctores
   - Editar doctor → Modal con datos precargados → PUT /api/doctores/:id
   - Eliminar doctor → DELETE /api/doctores/:id
7. La tabla se recarga automáticamente después de cada acción
```

---

## 11. Despliegue y Configuración

### Prerrequisitos

- **Node.js** v18+
- **PostgreSQL** v14+
- **npm** v9+

### Compilación

```bash
# 1. Compilar frontend Angular
cd frontend
npm install
npm run build
# Output: frontend/dist/frontend/browser/

# 2. Compilar mapa
cd ../appMapas
npm install
npm run build
# Output: appMapas/dist/

# 3. Iniciar servidor
cd ../backend
npm install
npm start
# Servidor en http://localhost:3001
```

### URLs de Acceso

| Ruta | Descripción |
|---|---|
| `http://localhost:3001/mapa` | Mapa interactivo público |
| `http://localhost:3001/admin` | Panel de administración |
| `http://localhost:3001/api/doctores` | API REST |

---

## 12. Variables de Entorno

Archivo: `backend/.env`

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PGHOST` | Host del servidor PostgreSQL | `localhost` |
| `PGUSER` | Usuario de PostgreSQL | `postgres` |
| `PGPASSWORD` | Contraseña de PostgreSQL | *(configurar)* |
| `PGDATABASE` | Nombre de la base de datos | `micrositio_salud` |
| `PGPORT` | Puerto de PostgreSQL | `5432` |
| `PORT` | Puerto del servidor Express | `3001` |

---

## 13. Dependencias del Proyecto

### Backend (`backend/package.json`)

```json
{
  "type": "module",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "pg": "^8.16.0"
  }
}
```

### Frontend (`frontend/package.json`)

```json
{
  "dependencies": {
    "@angular/core": "^19.2.0",
    "@angular/material": "^19.2.16",
    "@angular/cdk": "^19.2.16",
    "@angular/router": "^19.2.0",
    "@angular/forms": "^19.2.0",
    "rxjs": "~7.8.0",
    "zone.js": "~0.15.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^19.2.8",
    "@angular/cli": "^19.2.8",
    "typescript": "~5.7.2"
  }
}
```

### AppMapas (`appMapas/package.json`)

```json
{
  "dependencies": {
    "ol": "latest"
  },
  "devDependencies": {
    "vite": "^6.3.3"
  }
}
```

---

## 14. Guía de Desarrollo Local

### Desarrollo del Backend

```bash
cd backend
npm install
npm start
# El servidor se inicia en http://localhost:3001
```

### Desarrollo del Frontend Angular

```bash
cd frontend
npm install
ng serve
# Acceder a http://localhost:4200
```

### Desarrollo del Mapa

```bash
cd appMapas
npm install
npm start
# Vite dev server en http://localhost:5173
```

> **Nota:** En desarrollo, el frontend y el mapa se ejecutan en puertos diferentes al backend. Los servicios Angular apuntan a la URL de producción. Para desarrollo local, se recomienda configurar un proxy o actualizar la `api_url` en `doctorservice.service.ts` y `main.js`.

---

> **Documento generado automáticamente.** Para actualizaciones, consultar el código fuente en el repositorio del proyecto.
