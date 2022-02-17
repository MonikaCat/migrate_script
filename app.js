const Create = require("./utils/create")
const Drop = require("./utils/drop")
const Insert = require("./utils/insert")
const utils = require("./utils/utils")
const Alter = require("./utils/alter")
const settings = require("./settings")
const {query} = require("./utils/psql")

async function migrate() {

  // await Alter.oldTxTable()
  // await Alter.oldMsgTable()

  await Create.NewTxTable()
  await Create.NewMsgTable()

  const {rows} = await query("SELECT COUNT(*) FROM transaction")
  const totolRowCount = rows[0].count
 
  console.log(`Number of rows: ${totolRowCount}`);
  console.log(`Partition size set to ${settings.PARTITION_SIZE}`);

  let stop = false
  let offset = 0

  // Handle in batch
  while(stop != true) {
    // Select rows from original transaction table
    const txRows = await utils.selectFromOldTxTable(settings.LIMIT, offset)

    console.log(`\nhandling from height ${txRows[0]["height"]} to ${txRows[txRows.length-1]["height"]}`)

    // Insert into new tables
    await Insert.Transactions(txRows)
  
    offset += settings.LIMIT
    if (offset >= totolRowCount) {
      stop = true
    }
  }
  await Drop.DropMessageByAddressFunc()
  await Create.NewMessageByAddressFunc()

} 

return migrate()