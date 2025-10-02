# WPlace - Guia de Contribuição para Pintura Colaborativa

## 📍 Localização das Imagens

Acesse a área onde estamos pintando:
**[Clique aqui para ir direto ao local](https://wplace.live/?lat=-21.078513184666043&lng=-46.62747103447267&zoom=11.561630025395072)**

---

## 🚀 Como Começar a Ajudar

### Passo 1: Instale o Tampermonkey

O Tampermonkey é uma extensão de navegador necessária para executar o script automatizado.

**Escolha seu navegador:**

- **Chrome/Edge/Brave**: [Baixar Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Baixar Tampermonkey](https://addons.mozilla.org/pt-BR/firefox/addon/tampermonkey/)
- **Safari**: [Baixar Tampermonkey](https://apps.apple.com/us/app/tampermonkey/id1482490089)
- **Opera**: [Baixar Tampermonkey](https://addons.opera.com/pt-br/extensions/details/tampermonkey-beta/)

### Passo 2: Instale o Script

Após instalar o Tampermonkey, escolha e instale um dos scripts disponíveis:

1. **Acesse a pasta de scripts**: [Ver Scripts Disponíveis](https://github.com/rafaelwdornelas/wplace/tree/main/scripts)
2. **Clique no script** que deseja usar (geralmente tem extensão `.user.js`)
3. **Clique no botão "Raw"** no GitHub
4. O Tampermonkey detectará automaticamente e **perguntará se deseja instalar**
5. Clique em **"Instalar"**

### Passo 3: Acesse o WPlace

1. Abra o site: **[https://wplace.live/](https://wplace.live/)**
2. O script começará a funcionar automaticamente
3. Navegue até a área de pintura usando o link fornecido acima

---

## ⚙️ Configuração do Script

Após instalar, você pode precisar configurar:

### Opções Comuns:

- **Imagem de Referência**: O script geralmente carrega automaticamente a imagem que deve ser pintada
- **Coordenadas**: Já configuradas para a área correta (veja link acima)
- **Intervalo de Pintura**: Respeita o cooldown do site automaticamente
- **Modo Manual/Automático**: Verifique as configurações do script instalado

### Como Editar Configurações:

1. Clique no **ícone do Tampermonkey** no navegador
2. Clique em **"Dashboard"**
3. Encontre o script da WPlace
4. Clique no **ícone de editar** (lápis)
5. Modifique as variáveis no início do script conforme necessário

---

## 🎨 Como Funciona

1. O script monitora o canvas do WPlace
2. Compara os pixels atuais com a imagem de referência
3. Coloca pixels automaticamente nas coordenadas corretas
4. Respeita o tempo de espera (cooldown) entre cada pixel

---

## 📋 Requisitos

- ✅ Navegador moderno (Chrome, Firefox, Edge, etc.)
- ✅ Extensão Tampermonkey instalada
- ✅ Script do projeto instalado
- ✅ Conta no WPlace (se necessário)
- ✅ Conexão com internet estável

---

## 🐛 Problemas Comuns

### O script não está funcionando:

1. **Verifique se o Tampermonkey está ativado**
   - Clique no ícone do Tampermonkey
   - Certifique-se de que está "Ativado"

2. **Atualize a página**
   - Pressione `F5` ou `Ctrl+R`

3. **Verifique o console do navegador**
   - Pressione `F12` para abrir as ferramentas de desenvolvedor
   - Vá na aba "Console"
   - Procure por erros em vermelho

4. **Reinstale o script**
   - Remova o script atual do Tampermonkey
   - Instale novamente seguindo o Passo 2

### Pixels não estão sendo colocados:

- Verifique se você está na **área correta** (use o link fornecido)
- Certifique-se de que **não está em cooldown**
- Verifique se a **imagem de referência está carregada** no script

---

## 🤝 Como Contribuir

1. **Fork este repositório**
2. **Crie uma branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit suas mudanças** (`git commit -m 'Adiciona nova feature'`)
4. **Push para a branch** (`git push origin feature/MinhaFeature`)
5. **Abra um Pull Request**

---

## 📞 Suporte

- **Issues**: [Abrir Issue no GitHub](https://github.com/rafaelwdornelas/wplace/issues)
- **Discussões**: Use a aba "Discussions" do repositório
- **Documentação Adicional**: Verifique a [Wiki do Projeto](https://github.com/rafaelwdornelas/wplace/wiki) (se disponível)

---

## 📄 Licença

Verifique o arquivo [LICENSE](LICENSE) no repositório para mais informações.

---

## ⚠️ Aviso Legal

- Use os scripts de forma **responsável**
- Respeite as **regras do WPlace**
- Não abuse de múltiplas contas ou bots excessivos
- Este projeto é para **fins educacionais e colaborativos**

---

## 🎯 Vamos Pintar Juntos!

Obrigado por contribuir com o projeto! Cada pixel conta! 🎨✨

**Link Rápido**: [Ir para a Área de Pintura](https://wplace.live/?lat=-21.078513184666043&lng=-46.62747103447267&zoom=11.561630025395072)
