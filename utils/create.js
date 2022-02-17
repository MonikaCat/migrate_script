const {query} = require("./psql")

async function NewTxTable() {
  console.log("Create new transaction_new table");
  await query(`CREATE TABLE transaction_new
      (
          hash         TEXT    NOT NULL,
          height       BIGINT  NOT NULL REFERENCES block (height),
          success      BOOLEAN NOT NULL,
  
          /* Body */
          messages     JSONB   NOT NULL DEFAULT '[]'::JSONB,
          memo         TEXT,
          signatures   TEXT[]  NOT NULL,
  
          /* AuthInfo */
          signer_infos JSONB   NOT NULL DEFAULT '[]'::JSONB,
          fee          JSONB   NOT NULL DEFAULT '{}'::JSONB,
  
          /* Tx response */
          gas_wanted   BIGINT           DEFAULT 0,
          gas_used     BIGINT           DEFAULT 0,
          raw_log      TEXT,
          logs         JSONB,
  
          /* Psql partition */
          partition_id BIGINT NOT NULL,
          UNIQUE (hash, partition_id)
      )PARTITION BY LIST(partition_id);
      CREATE INDEX transaction_new_hash_index ON transaction_new (hash);
      CREATE INDEX transaction_new_height_index ON transaction_new (height);
      CREATE INDEX transaction_new_partition_id_index ON transaction_new (partition_id);
      GRANT ALL PRIVILEGES ON transaction_new TO forbole;`)
}
  
async function NewMsgTable() {
  console.log("Create new message_new table");

  await query(`CREATE TABLE message_new
    (
          transaction_hash            TEXT   NOT NULL,
          index                       BIGINT NOT NULL,
          type                        TEXT   NOT NULL,
          value                       JSONB  NOT NULL,
          involved_accounts_addresses TEXT[] NOT NULL,
  
          /* Psql partition */
          partition_id                BIGINT NOT NULL,
          height                      BIGINT NOT NULL,
          FOREIGN KEY (transaction_hash, partition_id) REFERENCES transaction_new (hash, partition_id)
      )PARTITION BY LIST(partition_id);
      CREATE INDEX message_new_transaction_hash_index ON message_new (transaction_hash);
      CREATE INDEX message_new_type_index ON message_new (type);
      CREATE INDEX message_new_involved_accounts_index ON message_new (involved_accounts_addresses);
      GRANT ALL PRIVILEGES ON message_new TO forbole;`)
}

async function NewMessageByAddressFunc() {
  console.log("Create new messages_by_address_new function");

  await query(`CREATE FUNCTION messages_by_address_new(
    addresses TEXT [],
    types TEXT [],
    "limit" BIGINT = 100,
    "offset" BIGINT = 0
  ) RETURNS SETOF message_new AS $$
  SELECT
      message_new.transaction_hash,
      message_new.index,
      message_new.type,
      message_new.value,
      message_new.involved_accounts_addresses,
      message_new.partition_id,
      message_new.height
  FROM
      message_new
  WHERE
      ( cardinality(types) = 0  OR type = ANY (types))
      AND involved_accounts_addresses && addresses
  ORDER BY
      height DESC,
      involved_accounts_addresses
  LIMIT
      "limit" OFFSET "offset" $$ LANGUAGE sql STABLE;
`)
  
}
  
module.exports = {
  NewTxTable,
  NewMsgTable,
  NewMessageByAddressFunc,
}