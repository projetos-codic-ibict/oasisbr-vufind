# Rotina para apagar arquivos de sessões do Vufind

Recomendação do Autor do Vufind:
[https://sourceforge.net/p/vufind/mailman/message/34938018/](https://sourceforge.net/p/vufind/mailman/message/34938018/)

1. **Crie o script para apagar os diretórios:**

Crie um script chamado `delete_files.sh` para executar a tarefa de exclusão dos diretórios desejados.

```
#!/bin/bash

# Diretório a ser apagado
directory_to_delete="/caminho/do/seu/diretorio"

# Verifica se o diretório existe antes de apagá-lo
if [ -d "$directory_to_delete" ]; then
    rm -rf "$directory_to_delete"
    echo "Diretório apagado: $directory_to_delete"
else
    echo "Diretório não encontrado: $directory_to_delete"
fi

```

Certifique-se de substituir `/caminho/do/seu/diretorio` pelo caminho do diretório que você deseja apagar.

2. **Dê permissão de execução ao script:**

```
chmod +x delete_files.sh
```

3. **Crie um serviço systemd para o script:**

Crie um arquivo chamado `delete_files.service`:

```
[Unit]
Description=Apaga diretórios diariamente

[Service]
Type=oneshot
ExecStart=/caminho/do/seu/script/delete_files.sh

[Install]
WantedBy=multi-user.target
```

Substitua `/caminho/do/seu/script/delete_files.sh` pelo caminho completo para o seu script.

4. **Mova o arquivo do serviço para o diretório apropriado do **`systemd`:

```
sudo mv delete_files.service /etc/systemd/system/
```

5. **Configurar o cron para iniciar o serviço diariamente:**

Adicione uma linha no arquivo `/etc/crontab` para iniciar o serviço todos os dias às 9h (09:00):

```
0 9 * * * root systemctl start delete_files.service
```

6. **Habilitar e iniciar o serviço **`systemd`:

```shell
sudo systemctl daemon-reload
sudo systemctl enable delete_files.service
```

Isso criará um serviço `systemd` que executa o script para apagar os diretórios diariamente, agendado através do `cron`. Ajuste os caminhos e detalhes conforme necessário para o seu caso específico.

7. **Acessar o log do servuço **

```shell
sudo journalctl -u delete_files.service
```
