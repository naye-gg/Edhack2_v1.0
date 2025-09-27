#!/bin/bash

# FlexIAdapt Setup Script
echo "🎓 FlexIAdapt - Configuración Automática"
echo "======================================"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm no está instalado. Instalando..."
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    source ~/.bashrc
fi

# Install dependencies
echo "📦 Instalando dependencias..."
pnpm install

# Setup database
echo "🗄️  Configurando base de datos..."
if [ ! -f "database.sqlite" ]; then
    echo "Creando base de datos SQLite..."
    sqlite3 database.sqlite < migrations/0000_large_master_chief.sql
    echo "✅ Base de datos creada"
else
    echo "⚠️  La base de datos ya existe"
fi

# Seed database
echo "🌱 Poblando base de datos con datos de ejemplo..."
pnpm seed

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "✅ Archivo .env creado desde .env.example"
fi

echo ""
echo "🎉 ¡Configuración completa!"
echo ""
echo "Para iniciar la aplicación:"
echo "  pnpm dev"
echo ""
echo "La aplicación estará disponible en: http://localhost:5000"
echo ""
echo "Scripts útiles:"
echo "  pnpm dev      - Iniciar servidor de desarrollo"
echo "  pnpm build    - Construir para producción" 
echo "  pnpm seed     - Poblar con datos de ejemplo"
echo "  pnpm reset-db - Reiniciar base de datos"
echo ""
