{
  "targets": [
    {
      "target_name": "llama_embedding",
      "sources": [
        "llama_embedding_simple.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "../core/src",
        "../core/src/include",
        "../core/src/ggml",
        "../core/src/llama",
        "../core/src/ggml-cpu",
        "../core/src/ggml-cpu/ops"
      ],
      "defines": [
        "GGML_USE_CPU",
        "GGML_USE_OPENMP",
        "NAPI_DISABLE_CPP_EXCEPTIONS"
      ],
      "cflags_cc": [
        "-std=c++17",
        "-fexceptions",
        "-O3",
        "-fmax-include-depth=500"
      ],
      "cflags_c": [
        "-std=c11",
        "-O3"
      ],
      "libraries": [
        "-lm"
      ],
      "conditions": [
        ["OS=='mac'", {
          "defines": [
            "GGML_USE_ACCELERATE"
          ],
          "libraries": [
            "-framework Accelerate"
          ],
          "xcode_settings": {
            "OTHER_CPLUSPLUSFLAGS": ["-stdlib=libc++"]
          }
        }],
        ["OS=='win'", {
          "defines": [
            "GGML_USE_CPU_HBM",
            "_CRT_SECURE_NO_WARNINGS"
          ],
          "msvs_settings": {
            "ExceptionHandling": 1
          }
        }]
      ],
      "cflags!": [
        "-fno-exceptions"
      ],
      "cflags_cc!": [
        "-fno-exceptions"
      ]
    }
  ]
}
