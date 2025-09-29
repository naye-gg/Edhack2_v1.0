const sqlite3 = require('sqlite3').verbose();
const { nanoid } = require('nanoid');

// Conectar a la base de datos
const db = new sqlite3.Database('./server/database.sqlite');

// Ejemplo de tarea completa para un estudiante
const taskExample = {
  // Información básica de la tarea
  taskTitle: "Cuento ilustrado sobre mi familia",
  subject: "Lenguaje y Comunicación",
  evidenceType: "texto", // puede ser: texto, imagen, video, audio
  
  // Instrucciones originales de la tarea
  originalInstructions: `
Actividad: Creación de un cuento familiar ilustrado

OBJETIVOS:
- Desarrollar habilidades narrativas y de expresión escrita
- Fortalecer vínculos familiares a través de la escritura creativa
- Practicar la estructura básica del cuento (inicio, desarrollo, final)

INSTRUCCIONES:
1. Escribe un cuento corto (mínimo 150 palabras) sobre una aventura real o imaginaria con tu familia
2. Tu cuento debe tener:
   - Un personaje principal (puede ser tú o un miembro de la familia)
   - Un problema o situación interesante
   - Una solución o final
3. Incluye al menos 3 dibujos simples que ilustren partes importantes del cuento
4. Usa un lenguaje descriptivo para que el lector pueda imaginar la historia

CRITERIOS DE EVALUACIÓN:
- Creatividad e imaginación (25%)
- Estructura narrativa clara (25%) 
- Uso correcto del lenguaje (25%)
- Presentación e ilustraciones (25%)

ADAPTACIONES DISPONIBLES:
- Para estudiantes con dificultades de escritura: pueden grabar la historia en audio
- Para estudiantes con TEA: estructura visual con plantilla de organizador gráfico
- Tiempo extendido disponible según necesidades individuales
  `,
  
  // Rúbrica estándar
  standardRubric: `
RÚBRICA DE EVALUACIÓN - CUENTO FAMILIAR

EXCELENTE (4 puntos):
- Historia muy creativa con personajes bien desarrollados
- Estructura narrativa clara y completa (inicio, desarrollo, final)
- Vocabulario variado y uso correcto de la gramática
- Ilustraciones detalladas que complementan perfectamente el texto

BUENO (3 puntos):  
- Historia creativa con personajes definidos
- Estructura narrativa presente con pequeños detalles faltantes
- Buen uso del vocabulario con errores menores de gramática
- Ilustraciones claras que apoyan el texto

SATISFACTORIO (2 puntos):
- Historia básica pero comprensible
- Estructura narrativa simple pero identificable
- Vocabulario adecuado con algunos errores de gramática
- Ilustraciones simples pero relacionadas con el texto

NECESITA MEJORAR (1 punto):
- Historia muy básica o difícil de seguir
- Estructura narrativa incompleta o confusa
- Vocabulario limitado con errores frecuentes
- Ilustraciones poco claras o no relacionadas con el texto
  `,
  
  // Competencias evaluadas
  evaluatedCompetencies: `
COMPETENCIAS CURRICULARES EVALUADAS:

1. COMUNICACIÓN ESCRITA:
   - Produce textos narrativos con estructura básica
   - Utiliza vocabulario apropiado para su edad
   - Aplica reglas ortográficas y gramaticales básicas

2. EXPRESIÓN CREATIVA:
   - Desarrolla ideas originales y creativas
   - Integra elementos visuales con texto escrito
   - Expresa experiencias personales a través de la narrativa

3. COMPETENCIAS SOCIOEMOCIONALES:
   - Reconoce y valora vínculos familiares
   - Expresa emociones y experiencias personales
   - Desarrolla autoconfianza en la expresión personal

4. HABILIDADES DE PRESENTACIÓN:
   - Organiza información de manera coherente
   - Combina diferentes formas de expresión (texto e imagen)
   - Cuida la presentación y limpieza de su trabajo
  `,
  
  // Tiempo estimado y dificultades reportadas
  timeSpent: 120, // 2 horas
  reportedDifficulties: `
DIFICULTADES IDENTIFICADAS DURANTE LA ACTIVIDAD:

1. DESAFÍOS OBSERVADOS:
   - Estudiante inicialmente bloqueado para elegir tema específico
   - Dificultad para mantener secuencia temporal en la narrativa
   - Tendencia a escribir oraciones muy cortas sin conectores

2. ESTRATEGIAS DE APOYO UTILIZADAS:
   - Se proporcionó lista de preguntas guía para generar ideas
   - Uso de organizador gráfico para planificar la historia
   - Apoyo individual para expandir oraciones simples

3. ADAPTACIONES APLICADAS:
   - Tiempo adicional de 30 minutos
   - Posibilidad de trabajar en parejas durante la fase de lluvia de ideas
   - Uso de banco de palabras para vocabulario descriptivo

4. OBSERVACIONES DEL PROCESO:
   - Mayor fluidez después del primer borrador
   - Entusiasmo creciente al hablar de su familia
   - Buena integración de ilustraciones con el texto
  `,
  
  // Información del archivo (si fuera una evidencia física)
  fileName: "cuento_familia_maria_3b.pdf",
  filePath: "/uploads/evidence/2024/09/cuento_familia_maria_3b.pdf",
  
  // Fecha de completación
  completionDate: new Date().toISOString()
};

// Función para insertar la tarea de ejemplo
function insertTaskExample(studentId) {
  const evidenceId = nanoid();
  
  const query = `
    INSERT INTO evidence (
      id, student_id, task_title, subject, completion_date, 
      evidence_type, file_name, file_path, standard_rubric, 
      evaluated_competencies, original_instructions, time_spent, 
      reported_difficulties, is_analyzed, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    evidenceId,
    studentId,
    taskExample.taskTitle,
    taskExample.subject,
    taskExample.completionDate,
    taskExample.evidenceType,
    taskExample.fileName,
    taskExample.filePath,
    taskExample.standardRubric,
    taskExample.evaluatedCompetencies,
    taskExample.originalInstructions,
    taskExample.timeSpent,
    taskExample.reportedDifficulties,
    0, // is_analyzed = false
    new Date().toISOString()
  ];
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('Error al insertar la tarea:', err);
    } else {
      console.log(`✅ Tarea de ejemplo creada exitosamente!`);
      console.log(`   ID de evidencia: ${evidenceId}`);
      console.log(`   Título: ${taskExample.taskTitle}`);
      console.log(`   Materia: ${taskExample.subject}`);
      console.log(`   Tipo: ${taskExample.evidenceType}`);
      console.log(`   Tiempo gastado: ${taskExample.timeSpent} minutos`);
      console.log(`   Archivo: ${taskExample.fileName}`);
    }
    
    db.close();
  });
}

// Primero obtener un estudiante existente
db.get("SELECT id, name FROM students LIMIT 1", (err, student) => {
  if (err) {
    console.error('Error al buscar estudiante:', err);
    db.close();
    return;
  }
  
  if (!student) {
    console.log('❌ No se encontraron estudiantes. Primero crea un estudiante usando create-simple-student.js');
    db.close();
    return;
  }
  
  console.log(`🎯 Creando tarea de ejemplo para: ${student.name}`);
  console.log(`📝 Tarea: "${taskExample.taskTitle}"`);
  console.log(`📚 Materia: ${taskExample.subject}`);
  console.log('');
  
  insertTaskExample(student.id);
});
