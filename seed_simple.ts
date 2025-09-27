import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from "./shared/schema";

// Simple database setup for seeding
const client = createClient({
  url: 'file:./database.sqlite',
});

const db = drizzle(client, { schema });

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    // Create sample students
    const sampleStudents = await db
      .insert(schema.students)
      .values([
        {
          name: "Ana García",
          age: 12,
          grade: "6to Grado",
          mainSubjects: "Matemáticas, Ciencias, Lenguaje",
          specialNeeds: "Dificultades de atención"
        },
        {
          name: "Carlos Rodríguez",
          age: 13,
          grade: "7mo Grado", 
          mainSubjects: "Historia, Matemáticas, Arte",
          specialNeeds: null
        },
        {
          name: "María López",
          age: 11,
          grade: "5to Grado",
          mainSubjects: "Ciencias, Matemáticas, Educación Física",
          specialNeeds: "Altas capacidades en matemáticas"
        }
      ])
      .returning();

    console.log(`✅ Created ${sampleStudents.length} students`);

    // Create teacher perspectives
    if (sampleStudents.length > 0) {
      const perspectives = await db
        .insert(schema.teacherPerspectives)
        .values([
          {
            studentId: sampleStudents[0].id,
            attentionLevel: "Variable",
            verbalParticipation: "Moderada",
            socialInteraction: "Selectivo",
            preferredModality: "Visual",
            concentrationTime: 15,
            instructionNeeds: "Repetidas y visuales",
            observedStrengths: "Excelente comprensión matemática, creativo en resolución de problemas",
            effectiveStrategies: "Uso de material visual, descansos frecuentes",
            mainDifficulties: "Mantener atención en explicaciones largas",
            mainMotivators: "Retos matemáticos, trabajo en equipo"
          },
          {
            studentId: sampleStudents[1].id,
            attentionLevel: "Alta",
            verbalParticipation: "Activa",
            socialInteraction: "Sociable",
            preferredModality: "Auditiva",
            concentrationTime: 35,
            instructionNeeds: "Una vez",
            observedStrengths: "Excelente memoria, liderazgo natural",
            effectiveStrategies: "Debates, presentaciones orales",
            mainDifficulties: "Impaciencia con ritmos lentos",
            mainMotivators: "Reconocimiento público, responsabilidades"
          }
        ])
        .returning();

      console.log(`✅ Created ${perspectives.length} teacher perspectives`);

      // Create sample evidence
      const evidenceData = await db
        .insert(schema.evidence)
        .values([
          {
            studentId: sampleStudents[0].id,
            taskTitle: "Resolución de problemas matemáticos",
            subject: "Matemáticas",
            evidenceType: "imagen",
            timeSpent: 25,
            standardRubric: "Rúbrica de resolución de problemas nivel básico",
            evaluatedCompetencies: "Pensamiento lógico, resolución de problemas",
            reportedDifficulties: "Dificultad para mantener concentración al final"
          },
          {
            studentId: sampleStudents[1].id,
            taskTitle: "Presentación sobre la Revolución Mexicana",
            subject: "Historia",
            evidenceType: "video",
            timeSpent: 45,
            standardRubric: "Rúbrica de presentaciones orales",
            evaluatedCompetencies: "Comunicación oral, investigación histórica",
            reportedDifficulties: null
          }
        ])
        .returning();

      console.log(`✅ Created ${evidenceData.length} evidence records`);
    }

    console.log("🎉 Database seeded successfully!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase().then(() => {
  console.log("✨ Seeding completed");
  process.exit(0);
});
