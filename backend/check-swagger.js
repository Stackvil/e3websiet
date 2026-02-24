const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('backend/swagger.json', 'utf8'));

console.log('E3 Rides GET:', swagger.paths['/api/e3/rides'].get.parameters);
console.log('E3 Rides PUT:', swagger.paths['/api/e3/rides/{id}'].put.responses);
console.log('E4 Dine GET:', swagger.paths['/api/e4/dine'].get.parameters);
console.log('E4 Dine PUT:', swagger.paths['/api/e4/dine/{id}'].put.responses);
