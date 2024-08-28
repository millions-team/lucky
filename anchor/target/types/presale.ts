/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/presale.json`.
 */
export type Presale = {
  "address": "uXyqdxGC3btcfYEUt8j4Z7g65jKdxiGKiYjjB5eLand",
  "metadata": {
    "name": "presale",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "init",
      "discriminator": [
        220,
        59,
        207,
        236,
        108,
        250,
        47,
        100
      ],
      "accounts": [
        {
          "name": "keeper",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  65,
                  76,
                  69,
                  95,
                  75,
                  69,
                  69,
                  80,
                  69,
                  82
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initSale",
      "discriminator": [
        41,
        197,
        251,
        217,
        167,
        153,
        95,
        49
      ],
      "accounts": [
        {
          "name": "sale",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  65,
                  76,
                  69
                ]
              },
              {
                "kind": "account",
                "path": "token"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  65,
                  76,
                  69,
                  95,
                  86,
                  65,
                  85,
                  76,
                  84
                ]
              },
              {
                "kind": "account",
                "path": "token"
              }
            ]
          }
        },
        {
          "name": "keeper",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  65,
                  76,
                  69,
                  95,
                  75,
                  69,
                  69,
                  80,
                  69,
                  82
                ]
              }
            ]
          }
        },
        {
          "name": "reserve",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "token"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "settings",
          "type": {
            "defined": {
              "name": "settings"
            }
          }
        }
      ]
    },
    {
      "name": "purchase",
      "discriminator": [
        21,
        93,
        113,
        154,
        193,
        160,
        242,
        168
      ],
      "accounts": [
        {
          "name": "sale",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  65,
                  76,
                  69
                ]
              },
              {
                "kind": "account",
                "path": "token"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  65,
                  76,
                  69,
                  95,
                  86,
                  65,
                  85,
                  76,
                  84
                ]
              },
              {
                "kind": "account",
                "path": "token"
              }
            ]
          }
        },
        {
          "name": "keeper",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  65,
                  76,
                  69,
                  95,
                  75,
                  69,
                  69,
                  80,
                  69,
                  82
                ]
              }
            ]
          }
        },
        {
          "name": "receiver",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  65,
                  76,
                  69,
                  95,
                  86,
                  65,
                  85,
                  76,
                  84
                ]
              },
              {
                "kind": "account",
                "path": "token"
              },
              {
                "kind": "account",
                "path": "buyer"
              }
            ]
          }
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "token"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "sale",
      "discriminator": [
        202,
        64,
        232,
        171,
        178,
        172,
        34,
        183
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "saleClosed",
      "msg": "Sale is closed."
    },
    {
      "code": 6001,
      "name": "saleNotOpen",
      "msg": "Sale is not open."
    },
    {
      "code": 6002,
      "name": "allStagesCompleted",
      "msg": "All stages completed."
    },
    {
      "code": 6003,
      "name": "insufficientAmount",
      "msg": "Insufficient amount."
    },
    {
      "code": 6004,
      "name": "minAmountNotMet",
      "msg": "Minimum amount not met."
    },
    {
      "code": 6005,
      "name": "maxAmountExceeded",
      "msg": "Maximum amount exceeded."
    },
    {
      "code": 6006,
      "name": "settingsLengthMismatch",
      "msg": "Prices and amounts must be the same length."
    },
    {
      "code": 6007,
      "name": "pricesEmpty",
      "msg": "Prices must not be empty."
    },
    {
      "code": 6008,
      "name": "amountsOutOfRange",
      "msg": "Amounts out of range."
    },
    {
      "code": 6009,
      "name": "minAmountZero",
      "msg": "Min amount must be greater than 0."
    },
    {
      "code": 6010,
      "name": "minAmountGreaterThanMax",
      "msg": "Min amount must be less than max amount."
    },
    {
      "code": 6011,
      "name": "invalidDate",
      "msg": "Invalid date."
    },
    {
      "code": 6012,
      "name": "datesTooClose",
      "msg": "Dates are too close."
    }
  ],
  "types": [
    {
      "name": "sale",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "token",
            "type": "pubkey"
          },
          {
            "name": "prices",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "amounts",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "start",
            "type": "i64"
          },
          {
            "name": "end",
            "type": "i64"
          },
          {
            "name": "sold",
            "type": "u64"
          },
          {
            "name": "min",
            "type": "u64"
          },
          {
            "name": "max",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "settings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "prices",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "amounts",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "start",
            "type": "i64"
          },
          {
            "name": "end",
            "type": "i64"
          },
          {
            "name": "min",
            "type": "u64"
          },
          {
            "name": "max",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
