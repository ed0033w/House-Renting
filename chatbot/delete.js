companyName="台北市"

var fs = require('fs');
//var a = JSON.stringify(fs.readFileSync('brandandCompanyNews.json'), 'utf8');
//allCompanyInf = JSON.parse(a)
//console.log(allCompanyInf)
var allCompanyInf = JSON.parse(fs.readFileSync('brandandCompanyNews.json'), 'utf8');

var parsedJSON = allCompanyInf.filter(function(value){ return value.name == companyName;})
var companyinformation = parsedJSON[0]
parsedJSON = companyinformation.companyNews

console.log(parsedJSON)
