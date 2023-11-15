#!/bin/bash

# Diretório a ser apagado
directory_to_clean="/tmp/systemd-private-31136522356147c890039218b2187b7a-apache2.service-3D22Bu/tmp/vufind_sessions"

# Verifica se o diretório existe antes de apagá-lo
if [ -d "$directory_to_clean" ]; then
    # Remove todos os arquivos dentro do diretório, mantendo o diretório intacto
    find "$directory_to_clean" -mindepth 1 -delete
    echo "Todos os arquivos dentro de $directory_to_clean foram removidos."
else
    echo "Diretório não encontrado: $directory_to_clean"
fi
