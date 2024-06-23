/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/games.json`.
 */
export type Games = {
  "address": "74arRDDazQJzSQRhm7VonhyhRnNrwBGZE4dyhNva5z8p",
  "metadata": {
    "name": "games",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "closeGame",
      "discriminator": [
        237,
        236,
        157,
        201,
        253,
        20,
        248,
        67
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  71,
                  65,
                  77,
                  69,
                  95,
                  77,
                  79,
                  68,
                  69
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "secret"
              }
            ]
          }
        },
        {
          "name": "secret"
        }
      ],
      "args": []
    },
    {
      "name": "createGame",
      "discriminator": [
        124,
        69,
        75,
        66,
        184,
        220,
        72,
        206
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "mode",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  71,
                  65,
                  77,
                  69,
                  95,
                  77,
                  79,
                  68,
                  69
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "secret"
              }
            ]
          }
        },
        {
          "name": "secret"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "settings",
          "type": {
            "defined": {
              "name": "gameMode"
            }
          }
        }
      ]
    },
    {
      "name": "forgeStronghold",
      "discriminator": [
        125,
        248,
        245,
        212,
        231,
        38,
        125,
        34
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
                  84,
                  82,
                  69,
                  65,
                  83,
                  85,
                  82,
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
          "name": "stronghold",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  82,
                  69,
                  65,
                  83,
                  85,
                  82,
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
                "path": "gem"
              }
            ]
          }
        },
        {
          "name": "gem"
        },
        {
          "name": "supplier",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "retrieveGems",
      "discriminator": [
        204,
        176,
        171,
        176,
        184,
        12,
        181,
        84
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
                  84,
                  82,
                  69,
                  65,
                  83,
                  85,
                  82,
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
          "name": "stronghold",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  82,
                  69,
                  65,
                  83,
                  85,
                  82,
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
                "path": "gem"
              }
            ]
          }
        },
        {
          "name": "reserve",
          "writable": true
        },
        {
          "name": "gem"
        },
        {
          "name": "supplier",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "stockpileGems",
      "discriminator": [
        242,
        63,
        114,
        233,
        21,
        55,
        29,
        185
      ],
      "accounts": [
        {
          "name": "keeper",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  82,
                  69,
                  65,
                  83,
                  85,
                  82,
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
          "name": "stronghold",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  82,
                  69,
                  65,
                  83,
                  85,
                  82,
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
                "path": "gem"
              }
            ]
          }
        },
        {
          "name": "reserve",
          "writable": true
        },
        {
          "name": "gem"
        },
        {
          "name": "supplier",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateGame",
      "discriminator": [
        159,
        61,
        132,
        131,
        3,
        234,
        209,
        220
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "mode",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  71,
                  65,
                  77,
                  69,
                  95,
                  77,
                  79,
                  68,
                  69
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "secret"
              }
            ]
          }
        },
        {
          "name": "secret"
        }
      ],
      "args": [
        {
          "name": "settings",
          "type": {
            "defined": {
              "name": "gameMode"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "gameMode",
      "discriminator": [
        2,
        175,
        72,
        45,
        105,
        253,
        104,
        137
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidName",
      "msg": "Name must be between 3 and 32 characters"
    },
    {
      "code": 6001,
      "name": "invalidSlots",
      "msg": "Slots must be between 1 and 16"
    },
    {
      "code": 6002,
      "name": "invalidDigits",
      "msg": "Digits must be between 1 and 8"
    },
    {
      "code": 6003,
      "name": "invalidChoices",
      "msg": "Choices must be between 2 and max value of digits"
    },
    {
      "code": 6004,
      "name": "invalidWinnerSingleChoice",
      "msg": "Winner choice must be between 1 and choices"
    },
    {
      "code": 6005,
      "name": "invalidWinnerChoice",
      "msg": "Winner choice must be between 0 and choices"
    },
    {
      "code": 6006,
      "name": "invalidPickWinner",
      "msg": "Pick winner is true but winner choice is 0"
    }
  ],
  "types": [
    {
      "name": "gameMode",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "slots",
            "type": "u8"
          },
          {
            "name": "digits",
            "type": "u8"
          },
          {
            "name": "choices",
            "type": "u32"
          },
          {
            "name": "winnerChoice",
            "type": "u32"
          },
          {
            "name": "pickWinner",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
