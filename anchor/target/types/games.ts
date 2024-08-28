/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/games.json`.
 */
export type Games = {
  "address": "Luck4nbs8aCxxJE9uDuiNq28UVc4SKJDCnKgWMWZdmJ",
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
              "name": "gameModeSettings"
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
          "type": "string"
        }
      ]
    },
    {
      "name": "createTreasure",
      "discriminator": [
        181,
        23,
        158,
        25,
        74,
        94,
        113,
        141
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
          "name": "escrow",
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
                  69,
                  83,
                  67,
                  82,
                  79,
                  87
                ]
              }
            ]
          }
        },
        {
          "name": "tollkeeper",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  79,
                  76,
                  76,
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
          "name": "treasure",
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
                  69
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
          "name": "treasure",
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
                  69
                ]
              }
            ]
          }
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
      "name": "fundBounty",
      "discriminator": [
        36,
        148,
        139,
        239,
        172,
        37,
        58,
        255
      ],
      "accounts": [
        {
          "name": "supplier",
          "writable": true,
          "signer": true
        },
        {
          "name": "reserve",
          "writable": true
        },
        {
          "name": "bounty",
          "writable": true
        },
        {
          "name": "escrow",
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
                  69,
                  83,
                  67,
                  82,
                  79,
                  87
                ]
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
                "path": "bounty"
              }
            ]
          }
        },
        {
          "name": "gem"
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
      "name": "issueBounty",
      "discriminator": [
        188,
        205,
        76,
        253,
        211,
        189,
        235,
        161
      ],
      "accounts": [
        {
          "name": "supplier",
          "writable": true,
          "signer": true
        },
        {
          "name": "bounty",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  66,
                  79,
                  85,
                  78,
                  84,
                  89
                ]
              },
              {
                "kind": "account",
                "path": "task"
              },
              {
                "kind": "account",
                "path": "gem"
              },
              {
                "kind": "account",
                "path": "trader"
              }
            ]
          }
        },
        {
          "name": "task"
        },
        {
          "name": "gem"
        },
        {
          "name": "trader"
        },
        {
          "name": "stronghold",
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
          "name": "collector",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  79,
                  76,
                  76,
                  75,
                  69,
                  69,
                  80,
                  69,
                  82
                ]
              },
              {
                "kind": "account",
                "path": "trader"
              }
            ]
          }
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
              "name": "bountySettings"
            }
          }
        }
      ]
    },
    {
      "name": "launchEscrow",
      "discriminator": [
        161,
        135,
        44,
        107,
        109,
        7,
        163,
        113
      ],
      "accounts": [
        {
          "name": "tollkeeper",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  79,
                  76,
                  76,
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
          "name": "collector",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  79,
                  76,
                  76,
                  75,
                  69,
                  69,
                  80,
                  69,
                  82
                ]
              },
              {
                "kind": "account",
                "path": "trader"
              }
            ]
          }
        },
        {
          "name": "trader"
        },
        {
          "name": "treasure",
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
                  69
                ]
              }
            ]
          }
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
      "name": "launchStore",
      "discriminator": [
        98,
        90,
        49,
        144,
        191,
        89,
        172,
        234
      ],
      "accounts": [
        {
          "name": "trader"
        },
        {
          "name": "feed"
        },
        {
          "name": "store",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  84,
                  79,
                  82,
                  69
                ]
              },
              {
                "kind": "account",
                "path": "trader"
              },
              {
                "kind": "account",
                "path": "feed"
              }
            ]
          }
        },
        {
          "name": "collector",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  79,
                  76,
                  76,
                  75,
                  69,
                  69,
                  80,
                  69,
                  82
                ]
              },
              {
                "kind": "account",
                "path": "trader"
              }
            ]
          }
        },
        {
          "name": "treasure",
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
                  69
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "treasure"
          ]
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
              "name": "storeSettings"
            }
          }
        }
      ]
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
      "name": "playRound",
      "discriminator": [
        38,
        35,
        89,
        4,
        59,
        139,
        225,
        250
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "game"
        },
        {
          "name": "mode"
        },
        {
          "name": "bounty"
        },
        {
          "name": "player",
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
                  80,
                  76,
                  65,
                  89,
                  69,
                  82
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "mode"
              }
            ]
          }
        },
        {
          "name": "ammo",
          "writable": true
        },
        {
          "name": "bag",
          "writable": true
        },
        {
          "name": "escrow",
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
                  69,
                  83,
                  67,
                  82,
                  79,
                  87
                ]
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
                "path": "bounty"
              }
            ]
          }
        },
        {
          "name": "collector",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  79,
                  76,
                  76,
                  75,
                  69,
                  69,
                  80,
                  69,
                  82
                ]
              },
              {
                "kind": "account",
                "path": "bounty.trader",
                "account": "bounty"
              }
            ]
          }
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
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "Luck4nbs8aCxxJE9uDuiNq28UVc4SKJDCnKgWMWZdmJ"
        }
      ],
      "args": [
        {
          "name": "round",
          "type": {
            "defined": {
              "name": "round"
            }
          }
        }
      ]
    },
    {
      "name": "renewBounty",
      "discriminator": [
        152,
        166,
        165,
        182,
        73,
        154,
        157,
        13
      ],
      "accounts": [
        {
          "name": "supplier",
          "writable": true,
          "signer": true
        },
        {
          "name": "bounty",
          "writable": true
        },
        {
          "name": "vault",
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
                "path": "bounty"
              }
            ]
          }
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
              "name": "bountySettings"
            }
          }
        }
      ]
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
          "name": "treasure",
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
                  69
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "treasure"
          ]
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
      "name": "storeFill",
      "discriminator": [
        243,
        168,
        93,
        10,
        206,
        99,
        57,
        186
      ],
      "accounts": [
        {
          "name": "collector",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  79,
                  76,
                  76,
                  75,
                  69,
                  69,
                  80,
                  69,
                  82
                ]
              },
              {
                "kind": "account",
                "path": "trader"
              }
            ]
          }
        },
        {
          "name": "reserve",
          "writable": true
        },
        {
          "name": "trader"
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
      "name": "storePackage",
      "discriminator": [
        111,
        110,
        5,
        70,
        30,
        22,
        120,
        11
      ],
      "accounts": [
        {
          "name": "store",
          "writable": true
        },
        {
          "name": "package",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  84,
                  79,
                  82,
                  69
                ]
              },
              {
                "kind": "account",
                "path": "store"
              },
              {
                "kind": "arg",
                "path": "amount"
              }
            ]
          }
        },
        {
          "name": "treasure",
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
                  69
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "treasure"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "string"
        },
        {
          "name": "settings",
          "type": {
            "defined": {
              "name": "storePackageSettings"
            }
          }
        }
      ]
    },
    {
      "name": "storeSale",
      "discriminator": [
        96,
        132,
        96,
        126,
        57,
        227,
        31,
        116
      ],
      "accounts": [
        {
          "name": "tollkeeper",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  79,
                  76,
                  76,
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
          "name": "collector",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  79,
                  76,
                  76,
                  75,
                  69,
                  69,
                  80,
                  69,
                  82
                ]
              },
              {
                "kind": "account",
                "path": "trader"
              }
            ]
          }
        },
        {
          "name": "receiver",
          "writable": true
        },
        {
          "name": "feed"
        },
        {
          "name": "chainlinkProgram"
        },
        {
          "name": "trader"
        },
        {
          "name": "store",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  84,
                  79,
                  82,
                  69
                ]
              },
              {
                "kind": "account",
                "path": "trader"
              },
              {
                "kind": "account",
                "path": "feed"
              }
            ]
          }
        },
        {
          "name": "package",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  84,
                  79,
                  82,
                  69
                ]
              },
              {
                "kind": "account",
                "path": "store"
              },
              {
                "kind": "arg",
                "path": "amount"
              }
            ]
          }
        },
        {
          "name": "payer",
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
          "type": "string"
        }
      ]
    },
    {
      "name": "storeWithdraw",
      "discriminator": [
        130,
        100,
        51,
        177,
        247,
        26,
        178,
        151
      ],
      "accounts": [
        {
          "name": "store",
          "writable": true
        },
        {
          "name": "treasure",
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
                  69
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "treasure"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
          "type": "string"
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
              "name": "gameModeSettings"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bounty",
      "discriminator": [
        237,
        16,
        105,
        198,
        19,
        69,
        242,
        234
      ]
    },
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
    },
    {
      "name": "player",
      "discriminator": [
        205,
        222,
        112,
        7,
        165,
        155,
        206,
        218
      ]
    },
    {
      "name": "store",
      "discriminator": [
        130,
        48,
        247,
        244,
        182,
        191,
        30,
        26
      ]
    },
    {
      "name": "storePackage",
      "discriminator": [
        197,
        43,
        47,
        75,
        115,
        107,
        207,
        11
      ]
    },
    {
      "name": "treasure",
      "discriminator": [
        98,
        92,
        220,
        45,
        191,
        149,
        105,
        178
      ]
    }
  ],
  "events": [
    {
      "name": "winnerEvent",
      "discriminator": [
        80,
        230,
        123,
        48,
        43,
        207,
        255,
        183
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidSeed",
      "msg": "Invalid seed"
    },
    {
      "code": 6001,
      "name": "invalidPlayerChoice",
      "msg": "Invalid choice"
    }
  ],
  "types": [
    {
      "name": "bounty",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "task",
            "type": "pubkey"
          },
          {
            "name": "gem",
            "type": "pubkey"
          },
          {
            "name": "reward",
            "type": "u64"
          },
          {
            "name": "trader",
            "type": "pubkey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "currentlyIssued",
            "type": "u64"
          },
          {
            "name": "winners",
            "type": "u32"
          },
          {
            "name": "totalClaimed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "bountySettings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "reward",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
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
      "name": "gameModeSettings",
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
    },
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "game",
            "type": "pubkey"
          },
          {
            "name": "rounds",
            "type": "u32"
          },
          {
            "name": "lastRound",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "winningCount",
            "type": "u32"
          },
          {
            "name": "winner",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "round",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seed",
            "type": "u64"
          },
          {
            "name": "choices",
            "type": {
              "vec": "u32"
            }
          }
        ]
      }
    },
    {
      "name": "store",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "trader",
            "type": "pubkey"
          },
          {
            "name": "feed",
            "type": "pubkey"
          },
          {
            "name": "price",
            "type": "i128"
          }
        ]
      }
    },
    {
      "name": "storePackage",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": "i128"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "sales",
            "type": "u32"
          },
          {
            "name": "max",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "storePackageSettings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": "i128"
          },
          {
            "name": "sales",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "storeSettings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": "i128"
          }
        ]
      }
    },
    {
      "name": "treasure",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "winnerEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "realm",
            "type": "pubkey"
          },
          {
            "name": "game",
            "type": "pubkey"
          },
          {
            "name": "gem",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
