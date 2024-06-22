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
                  67,
                  79,
                  78,
                  70,
                  73,
                  71
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
                  67,
                  79,
                  78,
                  70,
                  73,
                  71
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
              "name": "game"
            }
          }
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
                  71,
                  65,
                  77,
                  69,
                  95,
                  67,
                  79,
                  78,
                  70,
                  73,
                  71
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
              "name": "game"
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
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
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
    }
  ]
};
