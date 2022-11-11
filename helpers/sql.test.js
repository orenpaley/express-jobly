const {sqlForPartialUpdate} = require("./sql.js")

describe("test partial updater", function() {
  test("data in data out", function() {
    const data = {firstName: "Max", lastName: "Henry"}
    const jsToSql = {firstName:"first_name", lastName:"last_name"}
    const result = sqlForPartialUpdate(data, jsToSql)
    const setCols = result.setCols
    const values = result.values

    expect(setCols).toBeTruthy()
    expect(setCols).toEqual(`"first_name"=$1, "last_name"=$2`)
    expect(values).toBeTruthy()
    expect(values).toEqual(["Max", "Henry"])
})})