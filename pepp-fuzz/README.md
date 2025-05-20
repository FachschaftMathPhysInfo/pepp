# pepp-fuzz

## Overview
The `pepp-fuzz` module is designed to perform fuzz testing on the backend of the application. 

## Fuzzing Strategy
The fuzzing strategy involves creating various fuzzing functions that target different parts of the backend. These functions will generate random inputs and monitor the application's behavior to identify any crashes or unexpected behavior.

## Setup Requirements
1. Ensure you have Go installed on your machine. You can download it from [golang.org](https://golang.org/dl/).
2. Install the necessary dependencies:
   ```
   go mod tidy
   ```

## Running Fuzz Tests
To compile the fuzz.go execute the command below in the dir you want to fuzz:
```bash
go-fuzz-build
```
To run the fuzz test for the api, use the following command:
```bash
go-fuzz fuzz_api-fuzz.zip
```


## Contribution
Contributions to enhance the fuzzing tests or improve the project are welcome. Please submit a pull request or open an issue for discussion.