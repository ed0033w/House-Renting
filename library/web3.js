const Web3 = require('web3')
const {provider} = require('./setting')

const web3 = new Web3(new Web3.providers.HttpProvider(provider))

module.exports = web3