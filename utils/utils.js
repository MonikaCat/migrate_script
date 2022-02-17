const {query} = require("./psql")

async function selectFromOldTxTable(limit, offset) {
  const result = await query(`SELECT * FROM transaction ORDER BY height LIMIT ${limit} OFFSET ${offset}`)
  return result.rows
}
  
function messageParser(msg) {
  let involvedAddresses = "{"
  
  if(msg.signer != undefined) involvedAddresses += msg.signer + ","
  if(msg.sender != undefined) involvedAddresses += msg.sender + ","
  if(msg.to_address != undefined) involvedAddresses += msg.to_address + ","
  if(msg.from_address != undefined) involvedAddresses += msg.from_address + ","
  if(msg.delegator_address != undefined) involvedAddresses += msg.delegator_address + ","
  if(msg.validator_address != undefined) involvedAddresses += msg.validator_address + ","
  if(msg.submitter != undefined) involvedAddresses += msg.submitter + ","
  if(msg.proposer != undefined) involvedAddresses += msg.proposer + ","
  if(msg.depositor != undefined) involvedAddresses += msg.depositor + ","
  if(msg.voter != undefined) involvedAddresses += msg.voter + ","
  if(msg.validator_dst_address != undefined) involvedAddresses += msg.validator_dst_address + ","
  if(msg.validator_src_address != undefined) involvedAddresses += msg.validator_src_address + ","
  if (msg.input != undefined) msg.input.forEach(i => {involvedAddresses += i.address  + ","})
  if (msg.output != undefined) msg.output.forEach(o => {involvedAddresses += o.address  + ","})
  
  involvedAddresses = involvedAddresses.slice(0 , -1) + "}"
  
  if (involvedAddresses.length == 1) {
    // involvedAddresses == "{"
    return "{}"
  }
  
  return involvedAddresses
}

module.exports = {
  selectFromOldTxTable,
  messageParser,
}