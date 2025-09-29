// Ejemplo simple de estudiante con necesidades especiales
// Este script solo crea el estudiante y su perspectiva docente

async function createStudentExample() {
  try {
    console.log('🎓 Creando estudiante con necesidades especiales...');
    
    // 1. Autenticar profesor
    console.log('🔑 Autenticando profesor...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'profesor@demo.com',
        password: 'demo123'
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Error en autenticación: ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const authToken = loginData.token;
    console.log('✅ Profesor autenticado correctamente');
    console.log('🔑 Token recibido:', authToken);
    
    // 2. Crear estudiante
    const studentData = {
      name: "Diego Martínez",
      age: 9,
      grade: "4° Primaria",
      mainSubjects: "Matemáticas, Lengua, Ciencias",
      specialNeeds: "Trastorno del Espectro Autista (TEA) - Grado 1, dificultades de comunicación social"
    };
    
    const studentResponse = await fetch('http://localhost:5000/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
      },
      body: JSON.stringify(studentData),
    });
    
    if (!studentResponse.ok) {
      throw new Error(`Error: ${studentResponse.statusText}`);
    }
    
    const student = await studentResponse.json();
    console.log('✅ Estudiante creado:', student.name);
    console.log('🆔 ID del estudiante:', student.id);
    
    // 2. Agregar perspectiva del docente
    const teacherPerspective = {
      attentionLevel: "Alta", // Muy concentrado en temas de su interés
      verbalParticipation: "Limitada", // Le cuesta participar oralmente
      socialInteraction: "Evita", // Prefiere trabajar solo
      preferredModality: "Visual", // Procesa mejor información visual
      concentrationTime: 45, // Puede concentrarse mucho tiempo si le interesa
      instructionNeeds: "Escritas", // Necesita instrucciones claras y escritas
      observedStrengths: "Excelente memoria, muy detallista, habilidad excepcional para patrones y secuencias",
      successfulActivities: "Rompecabezas, ejercicios de lógica, actividades con rutinas claras",
      effectiveStrategies: "Horarios visuales, instrucciones paso a paso, tiempo de procesamiento",
      mainDifficulties: "Comunicación con compañeros, cambios de rutina, ruidos fuertes",
      conflictiveSituations: "Cuando hay cambios inesperados o mucho ruido en el aula",
      previousAdaptations: "Asiento fijo, auriculares para ruidos, descansos sensoriales",
      preferredExpression: "Escritura, dibujos técnicos, presentaciones estructuradas",
      selfEsteemLevel: 6,
      mainMotivators: "Sistemas de reconocimiento visual, temas de su interés especial (trenes)",
      additionalComments: "Muy inteligente, necesita predictibilidad y estructura. Interés especial en trenes y transporte.",
      suspectedSpecialNeeds: "TEA confirmado, posible alta capacidad en áreas específicas",
      currentSupports: "Apoyo de maestra integradora, psicóloga educacional"
    };
    
    const perspectiveResponse = await fetch(`http://localhost:5000/api/students/${student.id}/perspective`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
      },
      body: JSON.stringify(teacherPerspective),
    });
    
    if (!perspectiveResponse.ok) {
      throw new Error(`Error: ${perspectiveResponse.statusText}`);
    }
    
    console.log('✅ Perspectiva docente agregada');
    
    console.log('\n🎉 ESTUDIANTE CREADO EXITOSAMENTE!');
    console.log(`👤 Nombre: Diego Martínez`);
    console.log(`🆔 ID: ${student.id}`);
    console.log(`🧩 Necesidad especial: TEA - Grado 1`);
    console.log(`📊 Fortalezas: Memoria excepcional, muy detallista`);
    console.log(`🎯 Desafíos: Comunicación social, cambios de rutina`);
    
    console.log('\n📋 AHORA PUEDES:');
    console.log('1. Ir al dashboard y ver el estudiante creado');
    console.log('2. Subir evidencias manualmente desde la interfaz');
    console.log('3. Hacer análisis de las evidencias');
    console.log('4. Usar "Generar Perfil IA" cuando tengas 2+ evidencias analizadas');
    console.log('5. Usar el chat para hacer preguntas sobre Diego');
    
    return student;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Ejecutar
createStudentExample()
  .then(() => {
    console.log('\n✨ ¡Listo para usar!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error:', error.message);
    process.exit(1);
  });
