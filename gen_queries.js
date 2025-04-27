const {countries} = require("./countries.json");

const queries = [];
let idx = 0;

for (const country of countries) {
  queries.push(`insert into backend_location (id, name) values (${idx}, E'${country.country.replace(/\'/g, "\\'")}');`);
  queries.push(`insert into backend_areacode (id, code, country_id) values (${idx}, '${country.code}', ${idx++});`);
}

require("fs").writeFileSync("./queries.sql", queries.join("\n"));