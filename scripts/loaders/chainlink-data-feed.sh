# Token Metadata program
export CHAINLINK_STORE_PROGRAM_ID="HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny"
export CHAINLINK_AGGREGATOR_PROGRAM_ID="cjg3oHmg9uuPsP8D6g29NWvhySJkdYdAo9D25PRbKXJ"

solana program dump -u m ${CHAINLINK_STORE_PROGRAM_ID} ../../anchor/bpf-programs/chainlink_store.so
solana program dump -u m ${CHAINLINK_AGGREGATOR_PROGRAM_ID} ../../anchor/bpf-programs/chainlink_aggregator.so
