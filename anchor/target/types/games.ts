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
      "name": "activateGame",
      "discriminator": [
        166,
        184,
        159,
        118,
        22,
        67,
        88,
        37
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
                  76,
                  85,
                  67,
                  75,
                  89,
                  95,
                  71,
                  65,
                  77,
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
      "name": "addGameMode",
      "discriminator": [
        237,
        39,
        123,
        180,
        37,
        214,
        32,
        156
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "game",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  76,
                  85,
                  67,
                  75,
                  89,
                  95,
                  71,
                  65,
                  77,
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
                "path": "game"
              },
              {
                "kind": "arg",
                "path": "modeSeed"
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
          "name": "modeSeed",
          "type": "string"
        },
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
                  76,
                  85,
                  67,
                  75,
                  89,
                  95,
                  71,
                  65,
                  77,
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
      "args": []
    },
    {
      "name": "closeGameMode",
      "discriminator": [
        3,
        76,
        123,
        99,
        249,
        219,
        30,
        46
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "game",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  76,
                  85,
                  67,
                  75,
                  89,
                  95,
                  71,
                  65,
                  77,
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
                "path": "game"
              },
              {
                "kind": "arg",
                "path": "modeSeed"
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
          "name": "modeSeed",
          "type": "string"
        }
      ]
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
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  76,
                  85,
                  67,
                  75,
                  89,
                  95,
                  71,
                  65,
                  77,
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
          "name": "name",
          "type": {
            "array": [
              "u8",
              33
            ]
          }
        }
      ]
    },
    {
      "name": "endGame",
      "discriminator": [
        224,
        135,
        245,
        99,
        67,
        175,
        121,
        252
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
                  76,
                  85,
                  67,
                  75,
                  89,
                  95,
                  71,
                  65,
                  77,
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
      "name": "pauseGame",
      "discriminator": [
        133,
        116,
        165,
        66,
        173,
        81,
        10,
        85
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
                  76,
                  85,
                  67,
                  75,
                  89,
                  95,
                  71,
                  65,
                  77,
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
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  76,
                  85,
                  67,
                  75,
                  89,
                  95,
                  71,
                  65,
                  77,
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
          "name": "name",
          "type": {
            "array": [
              "u8",
              33
            ]
          }
        }
      ]
    },
    {
      "name": "updateGameMode",
      "discriminator": [
        130,
        15,
        217,
        14,
        245,
        15,
        125,
        57
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "game",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  76,
                  85,
                  67,
                  75,
                  89,
                  95,
                  71,
                  65,
                  77,
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
                "path": "game"
              },
              {
                "kind": "arg",
                "path": "modeSeed"
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
          "name": "modeSeed",
          "type": "string"
        },
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
      "name": "game",
      "discriminator": [
        27,
        90,
        166,
        125,
        74,
        100,
        121,
        18
      ]
    },
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
      "name": "invalidSlots",
      "msg": "Slots must be between 1 and 16"
    },
    {
      "code": 6001,
      "name": "invalidDigits",
      "msg": "Digits must be between 1 and 8"
    },
    {
      "code": 6002,
      "name": "invalidChoices",
      "msg": "Choices must be between 2 and max value of digits"
    },
    {
      "code": 6003,
      "name": "invalidWinnerSingleChoice",
      "msg": "Winner choice must be between 1 and choices"
    },
    {
      "code": 6004,
      "name": "invalidWinnerChoice",
      "msg": "Winner choice must be between 0 and choices"
    },
    {
      "code": 6005,
      "name": "invalidPickWinner",
      "msg": "Pick winner is true but winner choice is 0"
    }
  ],
  "types": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                33
              ]
            }
          },
          {
            "name": "state",
            "type": {
              "defined": {
                "name": "gameStatus"
              }
            }
          },
          {
            "name": "mode",
            "type": {
              "defined": {
                "name": "gameType"
              }
            }
          },
          {
            "name": "round",
            "type": {
              "defined": {
                "name": "gameRound"
              }
            }
          },
          {
            "name": "choice",
            "type": {
              "defined": {
                "name": "gameChoice"
              }
            }
          },
          {
            "name": "algorithm",
            "type": {
              "defined": {
                "name": "gameAlgorithm"
              }
            }
          }
        ]
      }
    },
    {
      "name": "gameAlgorithm",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "random"
          },
          {
            "name": "deterministic"
          }
        ]
      }
    },
    {
      "name": "gameChoice",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "single"
          },
          {
            "name": "multiple"
          }
        ]
      }
    },
    {
      "name": "gameMode",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "game",
            "type": "pubkey"
          },
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
    },
    {
      "name": "gameRound",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "single"
          },
          {
            "name": "multiple"
          }
        ]
      }
    },
    {
      "name": "gameStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "created"
          },
          {
            "name": "active"
          },
          {
            "name": "paused"
          },
          {
            "name": "ended"
          }
        ]
      }
    },
    {
      "name": "gameType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "singlePlayer"
          },
          {
            "name": "multiPlayer"
          }
        ]
      }
    }
  ]
};
