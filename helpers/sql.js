const { BadRequestError } = require("../expressError");


//dataToUpdate => {key:val, key:val...}
// injects SQL to thwart security issues with db.query
//
  // {data_1:value_1, data_2: value2} =>
  // {
    // {setCols: data1 = "$1", data2 = "$2"}
    // {Values: [data1,data2]}
  // }
//2nd param jsToSQL used for renaming col's with camel case to underscore
// numEmployees => num_employees
// pass in obj {numEmployees: "num_employees", logoUrl: "logo_url"} 
//to indicate changes

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };


