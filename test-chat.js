#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testChat() {
  console.log('🚀 Iniciando prueba del chat...');

  // Iniciar servidor
  const serverProcess = exec('cd "/home/nayeliguerrero/Descargas/VSCODE projects/Edhack_Septiembre_2025" && pnpm exec tsx server/index.ts');
  
  // Esperar a que el servidor inicie
  await new Promise(resolve => setTimeout(resolve, 4000));

  try {
    console.log('📝 Creando chat para Nayeli...');
    
    // Crear chat
    const createResult = await execAsync(`curl -X POST "http://localhost:5000/api/students/1rjKTgD1TxxoSgIxcmpLF/chats" -H "Content-Type: application/json" -d '{"title": "Chat sobre Nayeli"}'`);
    console.log('Resultado de crear chat:', createResult.stdout);
    
    // Extraer chatId de la respuesta
    const chatData = JSON.parse(createResult.stdout);
    const chatId = chatData.chat.id;
    console.log('Chat ID:', chatId);
    
    console.log('💬 Enviando mensaje al chat...');
    
    // Enviar mensaje
    const messageResult = await execAsync(`curl -X POST "http://localhost:5000/api/chats/${chatId}/messages" -H "Content-Type: application/json" -d '{"content": "¿Cómo está el progreso de Nayeli en lenguaje?"}'`);
    console.log('Resultado del mensaje:', messageResult.stdout);

    console.log('✅ ¡Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.stdout) console.log('STDOUT:', error.stdout);
    if (error.stderr) console.log('STDERR:', error.stderr);
  } finally {
    // Cerrar servidor
    serverProcess.kill();
    console.log('🔌 Servidor cerrado.');
  }
}

testChat();
