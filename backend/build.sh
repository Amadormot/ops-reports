#!/usr/bin/env bash
# Sair em caso de erro
set -o errexit

# Instalação de dependências
pip install -r requirements.txt

# Coleta de arquivos estáticos para o WhiteNoise
python manage.py collectstatic --no-input
