export type Lucky = {
  "version": "0.1.0",
  "name": "lucky",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "play",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bounty",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "options",
          "type": {
            "defined": "DealerOptions"
          }
        }
      ],
      "returns": "u32"
    },
    {
      "name": "close",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
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
              "defined": "Strategy"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "DealerOptions",
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
      "name": "Strategy",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "PseudoRandom"
          },
          {
            "name": "Vrf"
          }
        ]
      }
    },
    {
      "name": "LuckyError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidSeed"
          },
          {
            "name": "TwoEqualConsecutiveValues"
          },
          {
            "name": "InvalidRoll"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "SignupEvent",
      "fields": [
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "LuckyWinnerEvent",
      "fields": [
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "value",
          "type": "u64",
          "index": false
        },
        {
          "name": "winningCount",
          "type": "u32",
          "index": false
        }
      ]
    },
    {
      "name": "LuckyGameEvent",
      "fields": [
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "slots",
          "type": "u32",
          "index": false
        },
        {
          "name": "choices",
          "type": "u8",
          "index": false
        },
        {
          "name": "luckyShoot",
          "type": "bool",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6100,
      "name": "PseudoRandomError",
      "msg": "PseudoRandom error"
    },
    {
      "code": 6200,
      "name": "VrfError",
      "msg": "Vrf error"
    }
  ]
};

export const IDL: Lucky = {
  "version": "0.1.0",
  "name": "lucky",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "play",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bounty",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "options",
          "type": {
            "defined": "DealerOptions"
          }
        }
      ],
      "returns": "u32"
    },
    {
      "name": "close",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
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
              "defined": "Strategy"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "DealerOptions",
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
      "name": "Strategy",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "PseudoRandom"
          },
          {
            "name": "Vrf"
          }
        ]
      }
    },
    {
      "name": "LuckyError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidSeed"
          },
          {
            "name": "TwoEqualConsecutiveValues"
          },
          {
            "name": "InvalidRoll"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "SignupEvent",
      "fields": [
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "LuckyWinnerEvent",
      "fields": [
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "value",
          "type": "u64",
          "index": false
        },
        {
          "name": "winningCount",
          "type": "u32",
          "index": false
        }
      ]
    },
    {
      "name": "LuckyGameEvent",
      "fields": [
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "slots",
          "type": "u32",
          "index": false
        },
        {
          "name": "choices",
          "type": "u8",
          "index": false
        },
        {
          "name": "luckyShoot",
          "type": "bool",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6100,
      "name": "PseudoRandomError",
      "msg": "PseudoRandom error"
    },
    {
      "code": 6200,
      "name": "VrfError",
      "msg": "Vrf error"
    }
  ]
};
