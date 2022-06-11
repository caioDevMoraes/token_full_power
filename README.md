# Token Full Power
Projeto criado no curso [Cripto Dev](https://criptodev.corporate.gama.academy/).

Desenvolvimento de um smart contract para o token CryptoToken (CRY) com testes unitários. 

## 🚀 Instruções de Instalação e operação

Comandos para criar o projeto:

Iniciando o arquivo package.json:
```
npm init -y
```
Instalando a biblioteca hardhat:

```
npm install --save-dev hardhat
```
Iniciando as configurações do hardhat 
```
┏ npx hardhat
┣ What do you want to do?
┃ ┗ Create a basic sample project
┣ Hardhat project root
┃ ┗ Enter
┣ Do you want to add a .gitignore? 
┃ ┗ Y
┣ Help us improve Hardhat with anonymous crash reports & basic usage data?
┃ ┗ n
┣ Do you want to install this sample project's dependencies with npm (@nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers ethers)?
┗ ┗ Y
```
Comando para compilar os contratos
```
npx hardhat compile
```
Comando para executar os testes unitários
```
npx hardhat test
```
## 📝 Detalhamento das funcionalidades
Para implantar o contrato deve ser passado o valor total de tokens (`totalSupply`), o endereço que realizar a implantação será o proprietário do contrato.

Apenas o proprietário do contrato pode:
* Cunhar moedas;
* Queimar moedas (que estejam em sua posse);
* Mudar o estado do contrato;
* Finalizar o contrato (apenas se o contrato estiver com o estado cancelado);

As seguintes funçoes só pode ser executadas se o contrato estiver com o estado ativo:
* `transfer()`;
* `toMint()`;
* `toBurn()`;

O contrato pode realizar as seguintes operações:
* `totalSupply()`: Verifica a quantidade máxima de tokens;
* `balanceOf(address)`: Verifica saldo do endereço informado;
* `state()`: Verifica o estado do contrato que pode ser:
  * 0: Active
  * 1: Paused
  * 2: Cancelled
* `transfer(address, amount)`: Realiza uma transferência do endereço conectado para o endereço informado com a quantidade de tokens informada;
* `toMint(amount)`: Realiza a cunhagem da quantidade de tokens informada adicionando ao `totalsupply`;
* `toBurn(amount)`: Realiza a queima da quantidade de tokens informada diminuindo do `totalsupply`;
* `changeState(uint)`: Altera o estado de acordo com o número informado;
* `kill()`: Finaliza o contrato;

---

### 🛠 Tecnologias

As seguintes ferramentas foram usadas na construção do projeto:

- [Solidity](https://docs.soliditylang.org/en/v0.8.14/)
- [Node.js](https://nodejs.org/en/)
- [Hardhat](https://hardhat.org/)


## 👨‍💻 Membros envolvidos no projeto
* [Caio Moraes](https://github.com/caioDesenvMoraes)
* [Luis Henrique Santana](https://github.com/Henrikess)
* [Richard Ribeiro](https://github.com/RichSilva)
* [Vinicius Santana](https://github.com/viniblack)

