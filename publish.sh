#!/bin/bash

set -e

PROJECT_NAME="hydro-flow-front"
IMAGE_NAME="hydro-flow-front"
VERSION=$(node -p "require('./package.json').version")

echo "=========================================="
echo "Iniciando publicação da versão: $VERSION"
echo "=========================================="

echo "-> Fazendo o build da imagem..."
docker build \
  --network=host \
  -t $IMAGE_NAME:$VERSION \
  -t $IMAGE_NAME:latest .