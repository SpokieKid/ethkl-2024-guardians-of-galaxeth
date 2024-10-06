
pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom";

template MineralCollection() {
    signal input mineralCount;
    signal input playerSecret;
    signal output out;

    component greaterThan = GreaterThan(32);
    greaterThan.in[0] <== mineralCount;
    greaterThan.in[1] <== 0;

    out <== greaterThan.out * (1 - (playerSecret - playerSecret));
}

component main = MineralCollection();