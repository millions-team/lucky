export type Dealer = {
  "version": "0.1.0",
  "name": "dealer",
  "instructions": [
    {
      "name": "close",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dealer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dealer",
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
          "name": "strategy",
          "type": {
            "defined": "Strategy"
          }
        }
      ]
    },
    {
      "name": "get",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dealer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "dealer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u8"
          },
          {
            "name": "lastValue",
            "type": "u128"
          },
          {
            "name": "strategy",
            "type": {
              "defined": "Strategy"
            }
          },
          {
            "name": "min",
            "type": "u128"
          },
          {
            "name": "max",
            "type": "u128"
          }
        ]
      }
    }
  ],
  "types": [
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
      "name": "DealerError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidSeed"
          },
          {
            "name": "TwoEqualConsecutiveValues"
          }
        ]
      }
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

export const IDL: Dealer = {
  "version": "0.1.0",
  "name": "dealer",
  "instructions": [
    {
      "name": "close",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dealer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dealer",
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
          "name": "strategy",
          "type": {
            "defined": "Strategy"
          }
        }
      ]
    },
    {
      "name": "get",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dealer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "dealer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u8"
          },
          {
            "name": "lastValue",
            "type": "u128"
          },
          {
            "name": "strategy",
            "type": {
              "defined": "Strategy"
            }
          },
          {
            "name": "min",
            "type": "u128"
          },
          {
            "name": "max",
            "type": "u128"
          }
        ]
      }
    }
  ],
  "types": [
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
      "name": "DealerError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidSeed"
          },
          {
            "name": "TwoEqualConsecutiveValues"
          }
        ]
      }
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
