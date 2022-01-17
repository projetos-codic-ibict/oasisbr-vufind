## Roteiro de Instalação e Configuração do novo Oasisbr

Fork from VuFind 7.1.1 -> [https://github.com/vufind-org/vufind](https://github.com/vufind-org/vufind)


### Requisitos

- Debian 10 ou superior
- Apache 2.4 ou superior
- PHP 7.4.22 ou superior
- OpenJDK 11 ou superior
- Node.js 14 ou superior
- MongoDB 4.4.8 ou superior
- PostgreSQL 11 ou superior

### Instalação do Vufind

1. `cd /usr/local/`
2. `git clone https://github.com/oasisbr-ibict/oasisbr-vufind.git`
3. `cd oasisbr-vufind`
4. `php install.php`

- Irá aparecer algumas perguntas no console/terminal, responda conforme abaixo:
- **Where would you like to store your local settings?** apenas aperte enter
- **What module name would you like to use?** digite **Oasisbr**
- **What base path should be used in VuFind's URL?** apenas aperte enter

5. `sudo chown -R www-data:www-data /usr/local/oasisbr/local/cache`
6. `sudo chown -R www-data:www-data /usr/local/oasisbr/local/config`
7. `sudo mkdir /usr/local/oasisbr/local/cache/cli`
8. `sudo chmod 777 /usr/local/oasisbr/local/cache/cli`
9. `sudo ln -s /usr/local/oasisbr/local/httpd-vufind.conf /etc/apache2/conf-enabled/vufind.conf`
10. `sudo service apache2 restart`

### Configuração inicial do Vufind

11. `http://<host>/vufind/Install`
12. Caso não consiga configurar via interface gráfica, acesse o arquivo `oasisbr/local/config/vufind/config.ini` e adicione as configurações para as seguintes propriedades:
  - `database` -> link de acesso ao banco de dados Postgres
  - `url` -> link do Solr

> Para verificar se a instalação do Vufind está correta, acesse: a página inicial do Oasisbr e clique no botão de busca, se a busca retornar resultados está ok.

### Instalação e configuração do oasisbr-api

13. `cd /usr/local/`
14. `git clone https://github.com/ibict-br/oasisbr-api.git`
15. `cd oasisbr-api`
16. fazer uma cópia do arquivo `.env` e nomear como `.env.local`
17. Adicionar as respectivas configurações (o nome das propriedades são auto explicativas) do ambiente de produção no arquivo `.env.local`⁠
18. executar os seguintes comandos:  `npm install`
19. `npm run deploy:prod`
20. Verificar se API está online, acesse: `http://<host>:3000/api/v1`

> Para verificar se a instalação da API está correta, acesse: as páginas de “fontes coletadas” e “indicadores” na aba de indicadores de evolução, se essas duas páginas contiver dados está ok.

### Instalação e configuração do oasisbr-vufind-bulk-downloader

21. `cd /usr/local/`
22. `git clone https://github.com/ibict-br/oasisbr-vufind-bulk-downloader.git`
23. `cd oasisbr-vufind-bulk-downloader`
24. `./build.sh`
25. `sudo ln -s /usr/local/oasisbr-vufind-bulk-downloader /etc/init.d/bulk-downloader`
26. `sudo /etc/init.d/bulk-downloader start`

> Para verificar se a instalação do serviço de exportação está correta, faça uma busca e clique em exportar para csv se a exportação funcionar está ok.
