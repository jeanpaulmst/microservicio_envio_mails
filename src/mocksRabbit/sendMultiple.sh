#!/bin/bash

for i in $(seq 1 10); do
    if (( i % 2 == 0 )); then
        echo "Enviando mensaje $i (fail)..."
        node senderMock.js fail
    else
        echo "Enviando mensaje $i (success)..."
        node senderMock.js
    fi
done
