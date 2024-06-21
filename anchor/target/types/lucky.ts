/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/lucky.json`.
 */
export type Lucky = {
  "address": "6VCjdiYiU9rAWo7TptZMa423j44GSnyzWMG2KbCCdUz8",
  "metadata": {
    "name": "lucky",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "close",
      "discriminator": [
        98,
        165,
        201,
        177,
        108,
        65,
        206,
        96
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
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
                  71,
                  65,
                  77,
                  69
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
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
                  71,
                  65,
                  77,
                  69
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "play",
      "discriminator": [
        213,
        157,
        193,
        142,
        228,
        56,
        248,
        150
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
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
                  71,
                  65,
                  77,
                  69
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "bounty",
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
                  66,
                  79,
                  85,
                  78,
                  84,
                  89
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
                  76,
                  85,
                  67,
                  75,
                  89,
                  95,
                  86,
                  65,
                  85,
                  76,
                  84
                ]
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
          "name": "options",
          "type": {
            "defined": {
              "name": "dealerOptions"
            }
          }
        }
      ],
      "returns": "u32"
    }
  ],
  "accounts": [
    {
      "name": "lucky",
      "discriminator": [
        87,
        59,
        220,
        142,
        18,
        5,
        15,
        33
      ]
    }
  ],
  "events": [
    {
      "name": "luckyGameEvent",
      "discriminator": [
        184,
        179,
        87,
        102,
        8,
        140,
        72,
        0
      ]
    },
    {
      "name": "luckyWinnerEvent",
      "discriminator": [
        95,
        168,
        148,
        37,
        153,
        88,
        114,
        234
      ]
    },
    {
      "name": "signupEvent",
      "discriminator": [
        145,
        41,
        68,
        121,
        154,
        168,
        28,
        204
      ]
    }
  ],
  "errors": [
    {
      "code": 6100,
      "name": "pseudoRandomError",
      "msg": "PseudoRandom error"
    },
    {
      "code": 6200,
      "name": "vrfError",
      "msg": "Vrf error"
    }
  ],
  "types": [
    {
      "name": "dealerOptions",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "slots",
            "type": "u32"
          },
          {
            "name": "choices",
            "type": "u8"
          },
          {
            "name": "luckyShoot",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "lucky",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u32"
          },
          {
            "name": "lastValue",
            "type": "u32"
          },
          {
            "name": "winningCount",
            "type": "u32"
          },
          {
            "name": "winner",
            "type": "bool"
          },
          {
            "name": "strategy",
            "type": {
              "defined": {
                "name": "strategy"
              }
            }
          }
        ]
      }
    },
    {
      "name": "luckyGameEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "slots",
            "type": "u32"
          },
          {
            "name": "choices",
            "type": "u8"
          },
          {
            "name": "luckyShoot",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "luckyWinnerEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "value",
            "type": "u64"
          },
          {
            "name": "winningCount",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "signupEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "player",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "strategy",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pseudoRandom"
          },
          {
            "name": "vrf"
          }
        ]
      }
    }
  ]
};
