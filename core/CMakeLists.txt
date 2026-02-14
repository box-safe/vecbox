cmake_minimum_required(VERSION 3.16)
project(llamacpp_core)

# C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include directories
include_directories(src)
include_directories(src/ggml)
include_directories(src/llama)
include_directories(src/ggml-cpu)
include_directories(models)

# Source files
file(GLOB_RECURSE GGML_SOURCES "src/ggml/*.cpp" "src/ggml/*.c")
file(GLOB_RECURSE LLAMA_SOURCES "src/llama/*.cpp" "src/llama/*.c")
file(GLOB_RECURSE GGML_CPU_SOURCES "src/ggml-cpu/*.cpp" "src/ggml-cpu/*.c")

# Create library
add_library(llamacpp_core STATIC
    ${GGML_SOURCES}
    ${LLAMA_SOURCES}
    ${GGML_CPU_SOURCES}
)

# Compiler flags
target_compile_definitions(llamacpp_core PRIVATE
    GGML_USE_CPU
    GGML_USE_OPENMP
)

# Link math library
target_link_libraries(llamacpp_core m)

# Platform-specific settings
if(APPLE)
    target_compile_definitions(llamacpp_core PRIVATE GGML_USE_ACCELERATE)
    find_library(ACCELERATE_FRAMEWORK Accelerate)
    target_link_libraries(llamacpp_core ${ACCELERATE_FRAMEWORK})
endif()

if(WIN32)
    target_compile_definitions(llamacpp_core PRIVATE GGML_USE_CPU_HBM)
endif()

# Output directory
set_target_properties(llamacpp_core PROPERTIES
    ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib
    LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib
)
