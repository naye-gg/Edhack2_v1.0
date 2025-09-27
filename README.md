# 🎓 FlexIAdapt - Sistema de Evaluación Inclusiva

FlexIAdapt es una plataforma innovadora diseñada para la evaluación inclusiva y adaptada de estudiantes, utilizando inteligencia artificial para generar análisis personalizados de evidencias de aprendizaje.

## ✨ Características Principales

- **Dashboard Intuitivo**: Vista general de estudiantes, evidencias y análisis
- **Gestión de Estudiantes**: CRUD completo con perspectivas docentes
- **Subida de Evidencias**: Soporte para múltiples tipos de archivos (imagen, audio, video, documentos)
- **Análisis Automático**: IA que evalúa evidencias considerando necesidades especiales
- **Perfiles de Aprendizaje**: Generación automática de estrategias pedagógicas
- **Evaluación Adaptada**: Puntuaciones ajustadas según el perfil del estudiante

## 🚀 Tecnologías

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Base de Datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **ORM**: Drizzle ORM
- **Gestor de Paquetes**: pnpm
- **Build Tool**: Vite

## 📋 Requisitos

- Node.js 18+ 
- pnpm 8+

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd Edhack_Septiembre_2025
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Configurar variables de entorno
Copia `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

### 4. Configurar la base de datos
```bash
# Generar migraciones
pnpm db:generate

# Aplicar migraciones
pnpm db:push

# (Opcional) Poblar con datos de prueba
npx tsx seed_simple.ts
```

### 5. Iniciar el servidor de desarrollo
```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:5000`

## 📝 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Inicia el servidor de desarrollo |
| `pnpm build` | Construye la aplicación para producción |
| `pnpm start` | Inicia la aplicación en modo producción |
| `pnpm db:generate` | Genera las migraciones de la base de datos |
| `pnpm db:push` | Aplica las migraciones a la base de datos |
| `pnpm db:studio` | Abre Drizzle Studio para gestionar la BD |
| `pnpm setup` | Configuración completa del proyecto |

## 🗂️ Estructura del Proyecto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilidades y configuración
├── server/                # Backend Express
│   ├── config.ts          # Configuración del servidor
│   ├── db.ts              # Configuración de la base de datos
│   ├── routes.ts          # Rutas de la API
│   ├── storage.ts         # Capa de datos
│   └── fileService.ts     # Servicio de archivos
├── shared/                # Código compartido
│   └── schema.ts          # Esquemas de la base de datos
├── uploads/               # Archivos subidos
└── migrations/            # Migraciones de la base de datos
```

## 🔄 API Endpoints

### Estudiantes
- `GET /api/students` - Listar todos los estudiantes
- `GET /api/students/:id` - Obtener un estudiante específico
- `POST /api/students` - Crear un nuevo estudiante
- `PUT /api/students/:id` - Actualizar un estudiante
- `DELETE /api/students/:id` - Eliminar un estudiante

### Perspectivas Docentes
- `GET /api/students/:id/perspective` - Obtener perspectiva docente
- `POST /api/students/:id/perspective` - Crear perspectiva docente
- `PUT /api/students/:id/perspective` - Actualizar perspectiva docente

### Evidencias
- `GET /api/evidence` - Listar todas las evidencias
- `GET /api/students/:id/evidence` - Evidencias de un estudiante
- `POST /api/students/:id/evidence` - Subir nueva evidencia

### Análisis
- `POST /api/evidence/:id/analyze` - Analizar evidencia
- `GET /api/analysis-results/:evidenceId` - Obtener resultado de análisis

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas del dashboard

## 🧪 Datos de Prueba

El proyecto incluye un script para poblar la base de datos con datos de prueba:

```bash
npx tsx seed_simple.ts
```

Esto creará:
- 3 estudiantes de ejemplo
- 2 perspectivas docentes
- 2 evidencias de ejemplo

## 🔒 Seguridad

- Validación de archivos por tipo y tamaño
- Sanitización de nombres de archivo
- Límites de carga configurables
- Validación de datos con Zod

## 📈 Características del Análisis IA

El sistema incluye un motor de análisis que:

1. **Evalúa evidencias** considerando:
   - Tipo de evidencia vs modalidad preferida
   - Tiempo invertido vs capacidad de concentración
   - Dificultades reportadas

2. **Genera recomendaciones**:
   - Estrategias pedagógicas personalizadas
   - Adaptaciones curriculares
   - Instrumentos de evaluación sugeridos

3. **Calcula puntuaciones adaptadas**:
   - Ajustadas según el perfil del estudiante
   - Considerando necesidades especiales
   - Basadas en fortalezas identificadas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Verifica que todas las dependencias estén instaladas
2. Asegúrate de que las variables de entorno estén configuradas
3. Revisa los logs del servidor para errores específicos

### Problemas Comunes

**Error de base de datos**: Asegúrate de que las migraciones se hayan aplicado:
```bash
pnpm db:push
```

**Error de archivos**: Verifica que el directorio `uploads/` tenga permisos de escritura.

**Error de puerto**: El puerto 5000 debe estar disponible o cambia la variable `PORT` en `.env`.

---

Desarrollado con ❤️ para mejorar la educación inclusiva.
